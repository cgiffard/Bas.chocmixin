var BAS = require("bas"),
	Fetcher = require("./fetcher");

Hooks.addMenuItem("Actions/Run Sheet With Bas", "cmd-b", function() {
	console.log("Bas main window requested!");
	loadSettingsWindow();
});

function loadSettingsWindow() {
	
	var options	= {},
		initWindow = new Window();
	
	initWindow.title = "Initialise Bas Scan";
	initWindow.useDefaultCSS = false;
	initWindow.htmlPath = "window.html";
	
	var okText = [
		"Initialise That Scan!",
		"Go F'uhrit",
		"Drop the Bas!",
		"Now You're Talking",
		"Now You're Cooking With Bas"][(Math.random()*5)|0];
	
	initWindow.buttons = [okText,"Cancel"];
	
	initWindow.setFrame({x:0, y:0, width:490, height:380});
	initWindow.center();
	initWindow.run();
	initWindow.show();
	
	initWindow.onButtonClick = function(name) {
		
		if (name === "Cancel")
			return initWindow.close();
		
		options = initWindow.evalExpr("enumerateOptions()");
		
		if (!options.urls || !options.urls.replace(/\s/ig,"").length)
			return Alert.show(
						"You must specify at least one URL to request.",
						"And they should be valid URLs, but I won't hold your hand.",
						["Well, OK then."]);
		
		getBasDocument(options);
	}
}

function getBasDocument(options) {
	var currentDocument = Document.current(),
		basText = currentDocument.text;
	
	if (!basText.match(/\@page/) || !basText.match(/\@all/))
		return Alert.show(
			"This doesn't look like a Bas sheet.",
			"You need to open a valid Bas sheet before running a test.",
			["Well, OK then."]);
	
	Alert.notify({
		title: "Commencing tests...",
		subtitle: "Bas will now test your requested URLs.",
		body: "Use the goto keyword 10 times in the same file",
		button: "Stop",
		callback: function () {
			// Do something when the "Revert" button is clicked
		}
	});
	
	runBasSheet(options,basText);
}

function runBasSheet(options,text) {
	var urlList	 =
			options.urls
				.split(/\s+/ig)
				.filter(function(item) { return !!item.length; });
	
	var limit =
			options.crawl && options.crawlthreshhold ?
				options.crawlthreshhold : Infinity;
	
	var testSuite	= new BAS(),
		fetcher		= new Fetcher(testSuite,urlList,options.crawl,limit);
	
	testSuite.loadSheet(new Buffer(text))
		.yep(fetcher.go);
		
	fetcher.on("complete",function() {
		
	});
}