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
	 * @param {Element} listView - Target list view element.
	 * @param {Array} data - Parsed property data for that list.
	 */
	renderSummary(listView, data) {
		const wrapper = document.createElement('div');
		wrapper.className = 'short-wd-summary';

		const details = document.createElement('details');
		const summary = document.createElement('summary');
		summary.textContent = '📄 Short summary of properties';
		details.appendChild(summary);

		const list = document.createElement('ul');
		data.forEach((entry) => {
			const li = document.createElement('li');
			li.innerHTML = `<strong>${entry.label}:</strong> ${entry.val}`;
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
		if (this.renderAllLists) {
			const allListViews = document.querySelectorAll('.wikibase-listview');
			allListViews.forEach((listView) => {
				const data = this.collectData(listView);
				if (data.length > 0) {
					this.renderSummary(listView, data);
				}
			});
		} else {
			const listView = document.querySelector('.wikibase-listview');
			const data = this.collectData(listView);
			if (data.length > 0) {
				this.renderSummary(listView, data);
			}
		}
	}
}

module.exports = { ShortWdSummary };
