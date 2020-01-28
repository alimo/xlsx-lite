import Sheet from './sheet';
import Cell from './cell';

export interface ColData {
  width?: number;
}

export default class Col {
  sheet: Sheet;
  index: number;
  data: ColData;

  constructor(sheet: Sheet, index: number, data: ColData) {
    this.sheet = sheet;
    this.index = index;

    data.width = data.width || null;
    this.data = data;
  }

  row(index: number): Cell {
    return new Cell(this.sheet, index, this.index);
  }

  width(value?: number): number | void {
    if (value) {
      this.data.width = value;
    } else {
      return this.data.width;
    }
  }
}
