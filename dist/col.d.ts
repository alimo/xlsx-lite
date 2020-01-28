import Sheet from './sheet';
import Cell from './cell';
export interface ColData {
    width?: number;
}
export default class Col {
    sheet: Sheet;
    index: number;
    data: ColData;
    constructor(sheet: Sheet, index: number, data: ColData);
    row(index: number): Cell;
    width(value?: number): number | void;
}
