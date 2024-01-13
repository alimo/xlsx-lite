# XLSX Lite

A lightweight XLSX spreadsheet creator for browser.

:warning: This is an experimental project. **Use at your own risk.**

## Notes

- Row and column indexes **start at 1**.
- A simple version of [JSZip](https://stuk.github.io/jszip/) is used for zipping.
- [FileSaver.js](https://github.com/eligrey/FileSaver.js/) is used for downloading the result.

## Install

```bash
npm install xlsx-lite
```

## Usage Example

```js
import XLSX from 'xlsx-lite';

// Create a workbook
const xlsx = new XLSX();

// Add a sheet to workbook
const sheet = xlsx.sheet('Sheet Name');

// Change sheet styles
sheet.style({
  rtl: true,
});

// Set values
sheet.row(1).col(1).set('foo');
sheet.cell(1, 2).set('bar');
sheet.set('baz', { row: 1, col: 3 });
sheet.cell(1, 4).set([
  'r1',
  ['r2,c4', 'r2,c5', 'r2,c6'],
  'r3',
])

// Get values
console.log(sheet.row(1).col(1).get()); // foo
console.log(sheet.get({ row: 1, col: 2 })); // bar

// Add styles
const someStyles = xlsx.style({
  color: '#f00',
  fontFamily: 'Baloo Bhaijaan',
  fontWeight: 'bold',
  fontSize: 14,
  textDecoration: 'line-through',
  fontStyle: 'italic',
  backgroundColor: '#ff0',
  textAlign: 'center',
  verticalAlign: 'middle',
  borderStyle: 'double',
  borderColor: '#00f',
});
sheet.set('styled', {
  row: 2,
  col: 1,
  style: someStyles,
});

// Set and get row height
sheet.row(2).height(100);
console.log(sheet.row(2).height()); // 100

// Set and get column width
sheet.col(1).width(20);
console.log(sheet.col(1).width()); // 20

// Add filters
sheet.addFilter({
  from: { row: 1, col: 1 },
  to: { row: 7, col: 1 },
});

// Download the result
xlsx.save('test.xlsx');
```

## Limitations

- It only works in browser
- Compatibility is quite poor
- It can't read excel files

## Todos

- [x] Cell border
- [x] Column width and row height
- [x] Righ-to-left
- [x] Accept array and array of arrays to set values
- [ ] Accept JSON to set values
- [ ] Fixed rows and columns
- [ ] Formulas
