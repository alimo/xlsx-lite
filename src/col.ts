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

  /**
   * Column width measured as the number of characters of the maximum digit width of the
   * numbers 0, 1, 2, ..., 9 as rendered in the normal style's font. There are 4 pixels of margin
   * padding (two on each side), plus 1 pixel padding for the gridlines.
   */
  width(value?: number): number | void {
    if (value) {
      this.data.width = value;
    } else {
      return this.data.width;
    }
  }
}
