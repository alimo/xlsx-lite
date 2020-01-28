import Sheet from './sheet';
import Cell from './cell';
export default class Col {
    sheet: Sheet;
    index: number;
    constructor(sheet: Sheet, index: number);
    row(index: number): Cell;
}
