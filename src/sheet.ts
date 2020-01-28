import { XMLObject, jsonToXml } from './utils';
import XLSX from '.';
import Col, { ColData } from './col';
import Row, { RowData } from './row';
import Cell, { CellPosition, CellOptions, CellValue } from './cell';
import Style from './style';

function colIndexToLabel(index: number): string {
  let label = '';
  while (index > 0) {
    const t = (index - 1) % 26;
    label = String.fromCharCode(65 + t) + label;
    index = ((index - t) / 26) | 0;
  }
  return label;
}

interface CellProps {
  s?: number;
  t: 'inlineStr' | 'n';
  v: CellValue;
}

interface SheetData {
  [key: string]: {
    [key: string]: CellProps;
  };
}

interface SheetStyles {
  rtl?: boolean;
}

export default class Sheet {
  book: XLSX;
  name: string;
  data: SheetData = {};
  rowsData: { [key: string]: RowData } = {};
  colsData: { [key: string]: ColData } = {};
  styles: SheetStyles = {
    rtl: false,
  };
  filters = [];

  constructor(book: XLSX, name: string) {
    this.book = book;
    this.name = name;
  }

  col(index: number): Col {
    this.colsData[index] = this.colsData[index] || {};
    return new Col(this, index, this.colsData[index]);
  }

  row(index: number): Row {
    this.rowsData[index] = this.rowsData[index] || {};
    return new Row(this, index, this.rowsData[index]);
  }

  cell(row: number, col: number): Cell {
    return new Cell(this, row, col);
  }

  set(value: CellValue, options: CellPosition & CellOptions): void {
    let { type } = options;
    const { row, col, style } = options;

    if (!type) {
      if (typeof value === 'string') {
        type = 'string';
      } else if (typeof value === 'number') {
        type = 'number';
      } else {
        throw new Error(
          'Invalid cell value type. Only numbers and strings are allowed.'
        );
      }
    }

    if (!this.data[row]) {
      this.data[row] = {};
    }
    if (!this.data[row][col]) {
      this.data[row][col] = {} as CellProps;
    }
    const cell = this.data[row][col];

    if (style) {
      if (style instanceof Style) {
        cell.s = style.index;
      } else {
        cell.s = this.book.style(style).index;
      }
    }

    if (type === 'string') {
      cell.t = 'inlineStr';
    } else if (type === 'number') {
      cell.t = 'n';
    } else {
      throw new Error(`Invalid cell type provided: ${type}`);
    }

    cell.v = value;
  }

  get(position: CellPosition): CellValue {
    const { row, col } = position;

    if (!this.data[row] || !this.data[row][col]) {
      return null;
    }
    return this.data[row][col].v;
  }

  style(styles: SheetStyles): void {
    this.styles = {
      ...this.styles,
      ...styles,
    };
  }

  addFilter(range): void {
    this.filters.push(
      colIndexToLabel(range.from.col) +
        range.from.row +
        ':' +
        colIndexToLabel(range.to.col) +
        range.to.row
    );
  }

  export(): string {
    return jsonToXml({
      _t: 'worksheet',
      xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
      'xmlns:r':
        'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
      _c: [
        this.exportStyles(),
        this.exportColumns(),
        this.exportData(),
        ...this.exportFilters(),
      ].filter(Boolean),
    });
  }

  exportStyles(): XMLObject {
    return {
      _t: 'sheetViews',
      _c: [
        {
          _t: 'sheetView',
          rightToLeft: this.styles.rtl ? 'true' : 'false',
          workbookViewId: '0',
        },
      ],
    };
  }

  exportData(): XMLObject {
    const content: XMLObject[] = [];
    for (const row in this.data) {
      const rowContent = [];
      for (const col in this.data[row]) {
        const cell = this.data[row][col];
        const colContent = [];
        if (cell.t === 'inlineStr') {
          colContent.push({
            _t: 'is',
            _c: [{ _t: 't', _c: [cell.v] }],
          });
        } else {
          colContent.push({ _t: 'v', _c: [cell.v] });
        }
        rowContent.push({
          _t: 'c',
          t: cell.t,
          s: cell.s,
          r: colIndexToLabel((col as unknown) as number) + row,
          _c: colContent,
        });
      }
      const rowData = this.rowsData[row] || {};
      content.push({
        _t: 'row',
        customHeight: typeof rowData.height === 'number' ? 'true' : 'false',
        ht: typeof rowData.height === 'number' ? rowData.height : undefined,
        r: row,
        _c: rowContent,
      });
    }
    return { _t: 'sheetData', _c: content };
  }

  exportFilters(): XMLObject[] {
    return this.filters.map(filter => ({ _t: 'autoFilter', ref: filter }));
  }

  exportColumns(): XMLObject | null {
    if (!Object.keys(this.colsData).length) {
      return null;
    }
    return {
      _t: 'cols',
      _c: Object.keys(this.colsData).map(columnIndex => ({
        _t: 'col',
        min: columnIndex,
        max: columnIndex,
        customWidth:
          typeof this.colsData[columnIndex].width === 'number'
            ? 'true'
            : 'false',
        width:
          typeof this.colsData[columnIndex].width === 'number'
            ? this.colsData[columnIndex].width
            : undefined,
      })),
    };
  }
}
