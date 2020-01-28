# XLSX Lite ![minzip](https://badgen.net/bundlephobia/minzip/xlsx-lite)

A lightweight XLSX spreadsheet creator for browser.

## WORK IN PROGRESS

:warning: **Do NOT use this package in development nor production.**

## Notes

- A simple version of [JSZip](https://stuk.github.io/jszip/) is used for zipping.
- [FileSaver.js](https://github.com/eligrey/FileSaver.js/) is used for downloading the result.
- Row and column indexes **start at 1**.

## Install

```bash
yarn add xlsx-lite
```

## Usage Example

```js
import XLSX from 'xlsx-lite';

// Create a workbook
const xlsx = new XLSX();

// Add a sheet to workbook
const sheet = xlsx.sheet('Sheet Name');

// Set values
sheet.row(1).col(1).set('foo');
sheet.cell(1, 2).set('bar');
sheet.set('baz', { row: 1, col: 3 });

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

## Todos

- [x] Cell border
- [x] Column width and row height
- [ ] Accept array, array of arrays, and JSON to set values.
