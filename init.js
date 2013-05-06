var BAS = require("bas");

Hooks.addMenuItem("Actions/Run Sheet With Bas", "cmd-b", function() {
	
	console.log("Bas main window requested!");
	loadSettingsWindow();
});

function loadSettingsWindow() {
	
	var initWindow	= new Window(),
		options		= {};
	
	initWindow.title = "Initialise Bas Scan";
	initWindow.htmlPath = "window.html";
	
	initWindow.setFrame({x:0, y:0, width:490, height:350});
	initWindow.center();
	
	var okText = [
		"Initialise That Scan!",
		"Go F'uhrit",
		"Drop the Bas!",
		"Now You're Talking",
		"Now You're Cooking With Bas"][(Math.random()*5)|0];
	
	initWindow.buttons = [okText,"Cancel"];
	initWindow.onButtonClick = function(name) {
		initWindow.hide();
		
		if (name !== "Cancel")
			runBasSheet();
	}
	
	initWindow.run();
	initWindow.show();
	
	initWindow.onMessage = function(name,args) {
		console.log(name,args);
		if (name === "options") return options = args[0];
		
	};
	
	console.log("STUFF");
	console.log(initWindow.evalExpr("JSON.stringify(enumerateOptions())"));
}

function runBasSheet() {
	var testSuite = new BAS();
	
	
}