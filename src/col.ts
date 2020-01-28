import Sheet from './sheet';
import Cell from './cell';

export default class Col {
  sheet: Sheet;
  index: number;

  constructor(sheet: Sheet, index: number) {
    this.sheet = sheet;
    this.index = index;
  }

  row(index: number): Cell {
    return new Cell(this.sheet, index, this.index);
  }
}
