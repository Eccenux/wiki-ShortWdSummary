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
		if (heading?.id) {
			summary.insertAdjacentHTML('beforeend', `<a href="#${heading.id}">⬇️</a>`);
		}
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
