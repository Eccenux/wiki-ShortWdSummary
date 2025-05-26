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
		propertyGroups.forEach((item) => {
			const propItem = PropItem.parse(item);
			if (propItem) propsData.set(propItem.id, propItem);
		});
		return propsData;
	}

	/**
	 * Creates and inserts a collapsible summary before the given list view.
	 * 
	 * @param {Element} group - Target list view element.
	 * @param {Map<PropItem>} propsData - Parsed property data for that list.
	 */
	renderSummary(group, propsData) {
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
			const propsData = this.collectPropsData(listView);
			if (propsData.size > 0) {
				this.renderSummary(group, propsData);
			}
		});
	}
}

module.exports = { ShortWdSummary };
