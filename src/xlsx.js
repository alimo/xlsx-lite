const JSZip = require('jszip');

const Sheet = require('./sheet');
const Style = require('./style');
const jsonToXml = require('./utils/json-to-xml');

class XLSX {
	constructor() {
		this.sheets = [];
		this.styles = [];
		this.styleElements = {
			fonts: [],
			fills: [],
			borders: [],
			colors: [],
		};

		this.style({ fontFamily: 'Arial' });
	}

	sheet(name) {
		const sheet = new Sheet(name);
		this.sheets.push(sheet);
		return sheet;
	}

	style(config) {
		const style = new Style(config, this.styles.length, this.styleElements);
		this.styles.push(style);
		return style;
	}

	save(filename, node=false) {
		console.log(`Writing to "${filename}"`);
		const zip = new JSZip();
		const _rels = zip.folder('_rels');
		const xl = zip.folder('xl');
		const xl__rels = xl.folder('_rels');
		const xl_worksheets = xl.folder('worksheets');

		zip.file('[Content_Types].xml', jsonToXml({
			_t: 'Types', xmlns: 'http://schemas.openxmlformats.org/package/2006/content-types', _c: [
				{_t: 'Default', Extension: 'rels', ContentType: 'application/vnd.openxmlformats-package.relationships+xml'},
				{_t: 'Override', PartName: '/xl/workbook.xml', ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml'},
				{_t: 'Override', PartName: '/xl/styles.xml', ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml'},
				...this.sheets.map((sheet, index) => (
					{_t: 'Override', PartName: `/xl/worksheets/sheet${index+1}.xml`, ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml'}
				)),
			],
		}));
		_rels.file('.rels', jsonToXml({
			_t: 'Relationships', xmlns: 'http://schemas.openxmlformats.org/package/2006/relationships', _c: [
				{_t: 'Relationship', Id: 'rId1', Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument', Target: 'xl/workbook.xml'},
			],
		}));
		xl.file('workbook.xml', jsonToXml({
			_t: 'workbook', xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main', 'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships', _c: [
				{_t: 'sheets', _c: this.sheets.map((sheet, index) => (
					{_t: 'sheet', name: sheet.name, sheetId: (index+1).toString(), 'r:id': `rId${index+2}`}
				))},
			],
		}));
		xl__rels.file('workbook.xml.rels', jsonToXml({
			_t: 'Relationships', xmlns: 'http://schemas.openxmlformats.org/package/2006/relationships', _c: [
				{_t: 'Relationship', Id: 'rId1', Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles', Target: 'styles.xml'},
				...this.sheets.map((sheet, index) => (
					{_t: 'Relationship', Id: `rId${index+2}`, Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet', Target: `worksheets/sheet${index+1}.xml`}
				)),
			],
		}));
		for (let i = 0; i < this.sheets.length; i++) {
			xl_worksheets.file(`sheet${i+1}.xml`, jsonToXml({
				_t: 'worksheet', xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main', 'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships', _c: [
					{_t: 'sheetData', _c: this.sheets[i].sheetContent()},
					...this.sheets[i].filterTags(),
				],
			}));
		}
		xl.file('styles.xml', jsonToXml({
			_t: 'styleSheet', xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main', 'xmlns:x14ac': 'http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac', 'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006', _c: [
				{ _t: 'fonts', count: this.styleElements.fonts.length, _c: this.styleElements.fonts.map(font => font.export()) },
				{ _t: 'cellXfs', count: this.styles.length, _c: this.styles.map(style => style.export()) },
			],
		}));

		if (node) {
			zip
				.generateNodeStream({ type:'nodebuffer', streamFiles:true })
				.pipe(require('fs').createWriteStream(filename))
				.on('finish', () => {
					console.log('File saved.');
				});
		}
		else {
			zip
				.generateAsync({ type: 'blob' })
				.then(blob => {
					saveAs(blob, filename);
				});
		}
	}
}

module.exports = XLSX;
