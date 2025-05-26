(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * Parsed property data.
 */
class PropItem {
	/**
	 * @param {string} id - The Wikidata Property ID (e.g. P123).
	 * @param {string} label - The human-readable label (HTML safe value).
	 * @param {string} img - Optional image HTML.
	 * @param {string} imgFile - Optional file name (without namespace).
	 * @param {string} val - Semicolon-separated string of values (might be HTML).
	 */
	constructor(id, label, img, imgFile, val) {
		this.id = id;
		this.label = label;
		this.img = img;
		this.imgFile = imgFile;
		this.val = val;
	}

	/**
	 * Parses a single property element to extract its data.
	 * 
	 * @param {Element} item - DOM element with property id attribute.
	 * @returns {PropItem|null} Parsed object.
	 */
	static parse(item) {
		let labelEl = item.querySelector('.wikibase-statementgroupview-property-label');
		if (!labelEl) return null;

		let label = labelEl.textContent.trim();
		let values = [];
		let img = '';
		let imgFile = '';

		for (const valEl of item.querySelectorAll('.wikibase-statementview-mainsnak .wikibase-snakview-value')) {
			if (valEl.querySelector('.commons-media-caption')) {
				// text
				let captionEl = valEl.querySelector('.commons-media-caption');
				let text = captionEl.querySelector('a') ? captionEl.querySelector('a').textContent : captionEl.textContent;
				values.push(mw.html.escape(text.trim()));
				// image
				if (!img.length) {
					img = valEl.querySelector('img').outerHTML;
					imgFile = captionEl.querySelector('a')?.textContent;
				}
			} else if (valEl.querySelector('.wikibase-kartographer-caption')) {
				values.push(valEl.querySelector('.wikibase-kartographer-caption').innerHTML.trim());
			} else if (
				valEl.querySelector('.wb-calendar-name') // date
				|| valEl.querySelector('.wb-external-id') // link to external ID
			) {
				values.push(valEl.innerHTML.trim());
			} else {
				values.push(mw.html.escape(valEl.textContent.trim()));
			}
		}

		return new PropItem(
			item.id,
			label,
			img,
			imgFile,
			values.join('; ')
		);
	}
}

module.exports = { PropItem };

},{}],2:[function(require,module,exports){
let { PropItem } = require("./PropItem");

/**
 * ShortWdSummary gadget.
 * 
 * Description and installation:
 * https://www.wikidata.org/wiki/Wikidata:Tools/Enhance_user_interface#ShortWdSummary
 * 
 * History and docs:
 * https://github.com/Eccenux/wiki-shortwdsummary
 * 
 * Deployed using: [[Wikipedia:Wikiploy]]
 */
class ShortWdSummary {
	constructor() {
	}

	init() {
		this.renderAllSummaries();
	}

	/**
	 * Collects summary data from a given list view.
	 * 
	 * @param {Element} listView - DOM element containing property groups.
	 * @returns {Map} P123 => Array of parsed property data.
	 */
	collectPropsData(listView) {
		const propsData = new Map();
		const propertyGroups = listView.querySelectorAll('[data-property-id]');
		if (propertyGroups)  {
			propertyGroups.forEach((item) => {
				const propItem = PropItem.parse(item);
				if (propItem) propsData.set(propItem.id, propItem);
			});
		} else {
			console.warn('[SwdS]', 'collectPropsData: no props');
		}
		return propsData;
	}

	/**
	 * Creates and inserts a collapsible summary before the given list view.
	 * 
	 * @param {Element} group - Target list view element.
	 * @param {Map<PropItem>} propsData - Parsed property data for that list.
	 */
	renderSummary(group, propsData) {
		if (!group || !propsData || !propsData.size) {
			console.warn('[SwdS]', 'renderSummary: invalid data', {group, propsData});
			return;
		}

		// find header of the group
		let heading = group.previousElementSibling;

		const wrapper = document.createElement('div');
		wrapper.className = 'short-wd-summary';
		wrapper.className += ' ' + (heading?.id ? 'g-'+heading.id : 'g-nn');

		const details = document.createElement('details');
		if (heading?.id == 'claims') {
			details.setAttribute('open', '');
		}

		// render summary
		let headerText = 'Short summary of properties';
		if (heading?.tagName === 'H2') {
			headerText = heading.textContent;
		}
		const summary = document.createElement('summary');
		summary.textContent = `📄 ${headerText}`;
		if (heading?.id) {
			summary.insertAdjacentHTML('beforeend', `<a href="#${heading.id}">⬇️</a>`);
		}
		details.appendChild(summary);

		// image?
		if (propsData.has('P18')) {
			let imgProp = propsData.get('P18');
			details.insertAdjacentHTML('afterbegin', `<div class="sum-img" title="File:${mw.html.escape(imgProp.imgFile)}">${imgProp.img}</div>`);
		}

		// render property items
		const list = document.createElement('ul');
		propsData.forEach((entry) => {
			const li = document.createElement('li');
			li.innerHTML = `<strong><a href="#${entry.id}">${entry.label}</a>:</strong> ${entry.val}`;
			list.appendChild(li);
		});
		details.appendChild(list);
		wrapper.appendChild(details);

		let container = document.querySelector([
			'.wikibase-entitytermsview-heading',
			'.wb-lexeme-header',
			'.short-wd-summary--container',
		].join());
		if (container) {
			container.append(wrapper);
		} else {
			console.warn('[SwdS]', 'render: header not found; create backup container ');
			container = document.createElement('div');
			container.className = 'short-wd-summary--container';
			container.append(wrapper);
			document.querySelector('#mw-content-text,.mw-body-content')?.prepend(container);
		}
	}

	/**
	 * Renders summaries for all .wikibase-listview elements on the page.
	 */
	renderAllSummaries() {
		// this would include IDs.... probably not that usefull
		const allGroups = document.querySelectorAll('.wikibase-statementgrouplistview');
		if (!allGroups) return false;
		allGroups.forEach((group) => {
			const listView = group.querySelector('.wikibase-listview');
			if (listView) {
				const propsData = this.collectPropsData(listView);
				if (propsData.size > 0) {
					this.renderSummary(group, propsData);
				}
			} else {
				console.warn('[SwdS]', 'renderAllSummaries: listview not found', {group});
			}
		});
		return true;
	}
}

module.exports = { ShortWdSummary };

},{"./PropItem":1}],3:[function(require,module,exports){
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

},{"./ShortWdSummary":2}]},{},[3]);
