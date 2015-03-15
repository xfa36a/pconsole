/**
* pconsole
* JavaScript 埋め込みコンソール
*/

/* コンソール コア構築 */
$(document).ready(
	function() {
		__.make_me();
		__.init_console();
	}
);

(function(window) {

	__ = pconsole = function() {};
	__.log = log;
	__.help = "\n";

	__.rootElem;
	__.ptermElem;
	var indirectEval = eval;
	var comElem;
	var commandLog = [];
	var commandLogIndex = 0;
	var document = window.document;
	
	// 自身をbodyの最後に挿入する。
	__.make_me = make_me;
	function make_me() {
		$("body").append("<div id='__'></div>");
	}

	__.init_console = init_console;
	function init_console() {
		// コンソールコアを設置
		
		__.rootElem = $("#__");
		
		__.rootElem.append('<input type="button" value="[x]" onClick="__.__Kill()" />');
		__.rootElem.append('<table style="width: 90%"><tbody> <tr> <td colspan="2"><textarea id="__pterminal" style="width: 100%" rows="20" value="" readonly="readonly" ></textarea></td></tr><tr><td style="width: 90%">　> <input type="text" style="width: 95%" id="__command" onkeydown="__.commandKeyDown(event)" /></td><td style="width: 10%"><input type="button"	style="width: 100%" onclick="__.exec_command(__.comElem.val())" value="exec"></td></tr></tbody></table>');

		// コンソールの設定
		__.ptermElem = document.getElementById("__pterminal");
		__.comElem = comElem = $("#__command");
	}

	/* コンソール コア機能 */

	// 自身を削除する
	__.__Kill = __Kill;
	function __Kill() {
		__.rootElem.remove();
	}

	// コマンドを実行する
	__.exec_command = exec_command;
	function exec_command(com_str) {
		// コマンドを表示する
		log("> " + com_str);

		// コマンド実行結果を表示する
		try {
			log("  " + eval(com_str));
		} catch (e) {
			log("  error : " + e);
		}

		// 履歴に保存する
		commandLogIndex = commandLog.length + 1;
		commandLog.push(com_str);

		// コマンドをクリアする。
		__.comElem.val("");
	}

	// ターミナルに文字列を表示する
	function log(str) {
		// 表示する
		__.ptermElem.value = __.ptermElem.value + str + "\n";

		// 最下部にスクロール
		__.ptermElem.scrollTop = __.ptermElem.scrollHeight;

		return "";
	}

	// コマンド行のキー操作
	__.commandKeyDown = commandKeyDown;
	function commandKeyDown(event) {
		// リターン：コマンド実行
		if (event.keyCode == 13) {
			__.exec_command(__.comElem.val());
		}

		// ↑：一つ前の履歴を参照する
		if (event.keyCode == 38) {
			getCommandLog(commandLogIndex - 1);
		}

		// ↓：一つ後の履歴を参照する
		if (event.keyCode == 40) {
			getCommandLog(commandLogIndex + 1);
		}
	}

	// コマンドのログを取得する。
	function getCommandLog(i) {
		if (i < 0) {
			return;
		}
		if (i > commandLog.length) {
			__.comElem.val("");
			commandLogIndex = commandLog.length;
			return;
		}
		__.comElem.val(commandLog[i]);
		commandLogIndex = i;
	}

	/* アドオン：domtree */

	__.showdom = showdom;
	__.help += "showdom() : show DOMTree \n";

	// DOMツリーの表示
	function showdom() {
		if (!isElementExist("__viewDom")) return "already Exist";
		__.rootElem.append("<div id='__viewDom'><textarea id='__domtext' style='width:90%' rows='50' value='' /></div>");
		$("#__viewDom").prepend('<span> Domtree </span> <input type="button" value="閉じる[x]" onClick="__.killViewdom()" /> <input type="button" value="reload" onClick="__.domUpdate()" /> <br />');
		$("#__domtext").val($("html").html());
		return "done";
	}

	// DOMツリーの更新
	__.domUpdate = domUpdate;
	function domUpdate() {
		$("#__domtext").val("").val($("html").html());
	}

	// DOMツリーの非表示
	__.killViewdom = killViewdom;
	function killViewdom() {
		$("#__viewDom").remove();
	}

	/* アドオン：functionControler */

	__.fc = __.usefcon = usefcon;
	__.help += "usefcom(string function_name) : functionControler startup \n";

	// fcon startup
	function usefcon(func_str) {
		// 起動済みの場合、既存の物を削除する。
		if (!isElementExist("__fcon")) killFC();
		
		// 関数名の指定は必須
		if (typeof func_str === "undefined") return "needs a argument, arg[0] (function call string)";
		
		// 指定されたプロパティが存在しない場合、無名関数とする。
		if (indirectEval("typeof " + func_str) === "undefined") indirectEval( func_str + " = __.funcBackup = function(){}");
				
		// 関数をバックアップに取得する
		eval("__.funcBackup = " + func_str);
		__.funcString = func_str;

		// 指定されたプロパティが関数でない場合、エラーを返す。
		if (typeof __.funcBackup !== "function") return "arg[0] (function call string)";

		__.rootElem.append('<div id="__fcon"></div>');
		$__fcon = $("#__fcon");
		$__fcon.append('<span> FunctionControler function: <b>' + func_str + '</b> </span><input type="button" value="[x]" onClick="__.killFC()" /><input type="button" value="apply" onClick="__.functionApply(__.funcString)" /><input type="button" value="restore" onClick="__.functionRestore(__.funcString)" /><br />');
		$__fcon.append('<textarea id="__fconText" style="width:90%" rows="20" value="" /></div>');

		$__fconText = $("#__fconText");
		$__fconText.val(__.funcBackup.toString());
		return "";
	}

	// functionAtache
	__.functionApply = functionApply;
	function functionApply(func_str) {
		try {
			eval(func_str + " = " + $__fconText.val());
			__.log("function [" + func_str + "] pached.");
		} catch (e) {
			__.log("【functionApply】 : " + e);
		}
	}

	// functionRestore
	__.functionRestore = functionRestore;
	function functionRestore(func_str) {
		try {
			eval(func_str + " = " + __.funcBackup.toString());
			__.log("function [" + func_str + "] restore done.");
		} catch (e) {
			__.log("【functionRestore】 : " + e);
		}
		return;
	}

	__.killFC = killFC;
	function killFC() {
		$__fcon.remove();
	}
	
	/* QUnit連携 アドオン */
	
	// qunit本体を読込み起動する
	__.usequnit = usequnit;
	function usequnit() {
		if (!isElementExist("__Qunit")) return "existed";

		try {
			__.rootElem.append('<div id="__QUnit"></div>');
			$__QUnit = $("#__QUnit");
			$__QUnit.append('<link rel="stylesheet" href="__qunit/qunit.css">');
			$__QUnit.append('<div id="qunit"></div>');
			$__QUnit.append('<div id="qunit-fixture"></div>');
			
			
			loadJSFile("__qunit/qunit.js", function(){
				loadJSFile("__qunit/defaultTestCase.js", function() {
					QUnit.load();
				});
			});
		
		} catch (e) {
			$__QUnit.remove();
			__.log("【runQUnit】 Failed: " + e);
		}
		return "";
	}
	
	// テストケースを追記、実行するwindowを作成する
	__.maketest = maketest;
	function maketest(){
		if (!isElementExist("__Qunit")) return "unstarted qunit : please do usequnit()";
		if (!isElementExist("__maketest")) return "exists";
		
		__.rootElem.append('<div id="__maketest"></div>');
		$__maketest = $("#__maketest");
		$__maketest.append('<span> makeTestcase for QUnit </span><input type="button" value="[x]" onClick="__.killMaketest()" /><input type="button" value="dotest" onClick="__.dotest()" /><br />');
		$__maketest.append('<textarea id="__maketestText" style="width:90%" rows="20" value="" /></div>');
		
		$__maketestText = $("#__maketestText");
		return "done";
	}
	
	// テストケースを追加、実行する。
	__.dotest = dotest;
	function dotest(){
		try {
			eval($__maketestText.val());
			__.log("testCate Added.");
		} catch (e) {
			__.log("【addtest】 : " + e);
		}
	}
	
	// テストケースウィンドウを閉じる
	__.killMaketest = killMaketest;
	function killMaketest() {
		$__maketest.remove();
	}
	
	/* 汎用関数群 */

	// id要素の存在チェック
	function isElementExist(id) {
		if (document.getElementById(id) == null) {
			return true;
		} else {
			return false;
		}
	}
	
	// 指定のidの要素を取得
	// from: QUnit
	__.id = id;
	function id( name ) {
		return document.getElementById && document.getElementById( name );
	}
	
	// 指定のJavaScriptファイルを新規に読み込む
	function loadJSFile(file_path, next_function){
		var ga = document.createElement( 'script' );
		ga.type = 'text/javascript';
		ga.src = file_path;

		var s = document.getElementsByTagName( 'script' )[ 0 ];
		s.parentNode.insertBefore( ga, s );
		
		if (next_function != undefined){
			ga.onload = next_function;
		}
		
		return "";
	}
	
}( (function() { return this;})() )
);
