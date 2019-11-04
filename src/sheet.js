function colIndexToLabel(index){
	let label = '';
	while (index > 0) {
		const t = (index - 1) % 26;
		label = String.fromCharCode(65 + t) + label;
		index = (index - t) / 26 | 0;
	}
	return label;
}

class Sheet {
	constructor(name) {
		this.name = name;
		this.data = {};
		this.filters = [];
	}

	set(value, options={}) {
		let {
			type,
			row,
			col,
			style,
		} = options;

		if (!type) {
			if (typeof value === 'string') {
				type = 'string';
			}
			if (typeof value === 'number') {
				type = 'number';
			}
		}

		if (!this.data[row]) {
			this.data[row] = {};
		}
		if (!this.data[row][col]) {
			this.data[row][col] = {};
		}
		const cell = this.data[row][col];

		if (style) {
			cell.s = style.index;
		}

		if (type === 'string') {
			cell.t = 'inlineStr';
		}
		if (type === 'number') {
			cell.t = 'n';
		}

		cell.v = value;
	}

	addFilter(range) {
		this.filters.push(
			colIndexToLabel(range.from.col) + range.from.row + ':' +
			colIndexToLabel(range.to.col) + range.to.row
		);
	}

	sheetContent() {
		const content = [];
		for (const row in this.data) {
			const rowContent = [];
			for (const col in this.data[row]) {
				const cell = this.data[row][col];
				const colContent = [];
				if (cell.t === 'inlineStr') {
					colContent.push({
						_t: 'is', _c: [
							{ _t: 't', _c: [cell.v] },
						],
					});
				}
				else {
					colContent.push({ _t: 'v', _c: [cell.v] });
				}
				rowContent.push({ _t: 'c', t: cell.t, s: cell.s, r: colIndexToLabel(col)+row, _c: colContent });
			}
			content.push({ _t: 'row', r: row, _c: rowContent });
		}
		return content;
	}

	filterTags() {
		return this.filters.map(filter => (
			{_t: 'autoFilter', ref: filter}
		));
	}
}

module.exports = Sheet;
