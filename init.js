var BAS = require("bas"),
	Fetcher = require("./fetcher");

Hooks.addMenuItem("Actions/Run Sheet With Bas", "cmd-b", function() {
	console.log("Bas main window requested!");
	loadSettingsWindow();
});

function loadSettingsWindow() {
	
	var storage		= Storage.persistent(),
		options		= {},
		initWindow	= new Window();
	
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
	
	if (storage.get("urls"))
		initWindow.evalExpr("$('#urls')[0].value = " +
			JSON.stringify(storage.get("urls")));
	
	if (storage.get("crawl"))
		initWindow.evalExpr("$('#crawl')[0].checked = true");
	
	if (storage.get("limitcrawl"))
		initWindow.evalExpr("$('#limitcrawl')[0].checked = true");
	
	if (storage.get("crawlthreshhold"))
		initWindow.evalExpr("$('#crawlthreshhold')[0].value = " +
			parseInt(storage.get("crawlthreshhold"),10));
	
	if (storage.get("dieonfirst"))
		initWindow.evalExpr("$('#dieonfirst')[0].checked = true");
	
	initWindow.onButtonClick = function(name) {
		
		if (name === "Cancel")
			return initWindow.close();
		
		options = initWindow.evalExpr("enumerateOptions()");
		
		for (var option in options) {
			if (options.hasOwnProperty(option)) {
				storage.set(option,options[option]);
			}
		}
		
		if (!options.urls || !options.urls.replace(/\s/ig,"").length)
			return Alert.show(
					"You must specify at least one URL to request.",
					"And they should be valid URLs, but I won't hold your hand.",
					["Well, OK then."]);
		
		initWindow.close();
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
	
	var fetcher = runBasSheet(options,basText);
	
	Alert.notify({
		title:		"Commencing tests",
		subtitle:	"Bas will now request the specified URLs.",
		body:		"Results will appear soon.",
		button:		"Stop",
		callback: function () {
			fetcher.stop();
		}
	});
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
	
	testSuite.on("start",function(url) {
		Alert.notify({
			title:		"Testing resource",
			body:		url,
			button:		"Stop",
			callback: function () {
				fetcher.stop();
			}
		});
	});
	
	testSuite.on("assertionfailed",function(errors,assertion) {
		Alert.notify({
			title:		"Assertion failed",
			subtitle:	String(assertion),
			body:		String(errors),
			button:		"Stop",
			callback: function () {
				fetcher.stop();
			}
		});
	});
	
	testSuite.on("end",function() {
		Alert.notify({
			title:		"Completed Test Suite",
			subtitle:	"Completed testing resource.",
			body:		url,
			button:		"Stop",
			callback: function () {
				fetcher.stop();
			}
		});
	});
	
	return fetcher;
}