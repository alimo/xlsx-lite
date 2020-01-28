import { XMLObject } from './utils';
import Col from './col';
import Row from './row';
import Cell, { CellPosition, CellOptions, CellValue } from './cell';

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

export default class Sheet {
  name: string;
  data: SheetData = {};
  filters = [];

  constructor(name: string) {
    this.name = name;
  }

  col(index: number): Col {
    return new Col(this, index);
  }

  row(index: number): Row {
    return new Row(this, index);
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
      cell.s = style.index;
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

  addFilter(range): void {
    this.filters.push(
      colIndexToLabel(range.from.col) +
        range.from.row +
        ':' +
        colIndexToLabel(range.to.col) +
        range.to.row
    );
  }

  sheetContent(): XMLObject[] {
    const content = [];
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
      content.push({ _t: 'row', r: row, _c: rowContent });
    }
    return content;
  }

  filterTags(): XMLObject[] {
    return this.filters.map(filter => ({ _t: 'autoFilter', ref: filter }));
  }
}
