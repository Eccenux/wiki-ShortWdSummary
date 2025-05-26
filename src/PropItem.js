/**
 * Parsed property data.
 */
class PropItem {
	/**
	 * @param {string} id - The Wikidata Property ID (e.g. P123).
	 * @param {string} label - The human-readable label.
	 * @param {string} img - Optional image HTML.
	 * @param {string} imgFile - Optional file name (without namespace).
	 * @param {string} val - Semicolon-separated string of values.
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
				values.push(text.trim());
				// image
				if (!img.length) {
					img = valEl.querySelector('img').outerHTML;
					imgFile = captionEl.querySelector('a')?.textContent;
				}
			} else {
				values.push(valEl.textContent.trim());
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
