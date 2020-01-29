import Sheet from './sheet';
import Cell from './cell';

export interface RowData {
  height?: number;
}

export default class Row {
  sheet: Sheet;
  index: number;
  data: RowData;

  constructor(sheet: Sheet, index: number, data: RowData) {
    this.sheet = sheet;
    this.index = index;

    data.height = data.height || null;
    this.data = data;
  }

  col(index: number): Cell {
    return new Cell(this.sheet, this.index, index);
  }

  /**
   * Row height measured in point size. There is no margin padding on row height.
   */
  height(value?: number): number | void {
    if (value) {
      this.data.height = value;
    } else {
      return this.data.height;
    }
  }
}
