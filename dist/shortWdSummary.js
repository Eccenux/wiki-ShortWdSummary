(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * ShortWdSummary gadget.
 * 
 * History and docs:
 * https://github.com/Eccenux/wiki-shortwdsummary
 * 
 * Deployed using: [[Wikipedia:Wikiploy]]
 */
class ShortWdSummary {
	constructor() {
		this.summaryData = [];
		/**
		 * If true will rednder all groups of preprties.
		 * 
		 * This would include IDs.... probably not that usefull.
		 */
		this.renderAllLists = false;
	}
	init() {
		this.renderAllSummaries();
	}

	/**
	 * Parses a single statement group element to extract its property label and values.
	 * 
	 * @param {Element} item - DOM element with data-property-id attribute.
	 * @returns {{ id: string, label: string, val: string }} Parsed summary object.
	 */
	parsePropertyGroup(item) {
		const labelEl = item.querySelector('.wikibase-statementgroupview-property-label');
		if (!labelEl) return null;

		const label = labelEl.textContent.trim();
		const values = [];

		item.querySelectorAll('.wikibase-statementview-mainsnak .wikibase-snakview-value')
			.forEach((valEl) => {
				values.push(valEl.textContent.trim());
			});

		return {
			id: item.id,
			label: label,
			val: values.join('; ')
		};
	}

	/**
	 * Collects summary data from a given list view.
	 * 
	 * @param {Element} listView - DOM element containing property groups.
	 * @returns {Array} Array of parsed property data.
	 */
	collectData(listView) {
		const data = [];
		const propertyGroups = listView.querySelectorAll('[data-property-id]');
		propertyGroups.forEach((item) => {
			const parsed = this.parsePropertyGroup(item);
			if (parsed) data.push(parsed);
		});
		return data;
	}

	/**
	 * Creates and inserts a collapsible summary before the given list view.
	 * 
	 * @param {Element} group - Target list view element.
	 * @param {Array} data - Parsed property data for that list.
	 */
	renderSummary(group, data) {
		// find header of the group
		let heading = group.previousElementSibling;

		const wrapper = document.createElement('div');
		wrapper.className = 'short-wd-summary';
		wrapper.className += ' ' + (heading?.id ? 'g-'+heading.id : 'g-nn');

		const details = document.createElement('details');

		// render summary
		let headerText = 'Short summary of properties';
		if (heading?.tagName === 'H2') {
			headerText = heading.textContent;
		}
		const summary = document.createElement('summary');
		summary.textContent = `📄 ${headerText}`;
		details.appendChild(summary);

		// render property items
		const list = document.createElement('ul');
		data.forEach((entry) => {
			const li = document.createElement('li');
			li.innerHTML = `<strong><a href="#${entry.id}">${entry.label}</a>:</strong> ${entry.val}`;
			list.appendChild(li);
		});
		details.appendChild(list);
		wrapper.appendChild(details);

		document.querySelector('.wikibase-entitytermsview-heading').append(wrapper);
	}

	/**
	 * Renders summaries for all .wikibase-listview elements on the page.
	 */
	renderAllSummaries() {
		// this would include IDs.... probably not that usefull
		const allGroups = document.querySelectorAll('.wikibase-statementgrouplistview');
		allGroups.forEach((group) => {
			const listView = group.querySelector('.wikibase-listview');
			const data = this.collectData(listView);
			if (data.length > 0) {
				this.renderSummary(group, data);
			}
		});
	}
}

module.exports = { ShortWdSummary };

},{}],2:[function(require,module,exports){
var { ShortWdSummary } = require("./ShortWdSummary");

// instance
var gadget = new ShortWdSummary();

// hook when object is ready
mw.hook('userjs.shortWdSummaryExample.loaded').fire(gadget);

$(function(){
	// load Mediwiki core dependency
	// (in this case util is loaded to be able to use `mw.util.addPortletLink`)
	mw.loader.using(["mediawiki.util"]).then( function() {
		gadget.init();

		// hook when initial elements are ready 
		mw.hook('userjs.shortWdSummaryExample.ready').fire(gadget);
	});
});

},{"./ShortWdSummary":1}]},{},[2]);
