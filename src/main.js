let { ShortWdSummary } = require("./ShortWdSummary");

// instance
let gadget = new ShortWdSummary();

// hook when object is ready
mw.hook('userjs.shortWdSummaryExample.loaded').fire(gadget);

let doInit = function(){
	// Note! mw.loader makes debugging harder.
	// Add the to loader instead:
	// https://www.wikidata.org/wiki/User:Nux/shortWdSummary-loader.js
	// mw.loader.using(["mediawiki.util"]).then( function() {});

	// init
	gadget.init();

	// hook when initial elements are ready 
	mw.hook('userjs.shortWdSummaryExample.ready').fire(gadget);
};

// Plain JS on-ready
if (document.readyState === "loading") {
	// Loading hasn't finished yet
	document.addEventListener("DOMContentLoaded", doInit);
} else {
	// `DOMContentLoaded` has already fired
	doInit();
}
