import Sheet from './sheet';
import Cell from './cell';

export default class Row {
  sheet: Sheet;
  index: number;

  constructor(sheet: Sheet, index: number) {
    this.sheet = sheet;
    this.index = index;
  }

  col(index: number): Cell {
    return new Cell(this.sheet, this.index, index);
  }
}
