import Sheet from './sheet';
import Cell from './cell';
export default class Row {
    sheet: Sheet;
    index: number;
    constructor(sheet: Sheet, index: number);
    col(index: number): Cell;
}
