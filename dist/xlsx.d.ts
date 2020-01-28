import Sheet from './sheet';
import Style, { StyleConfig } from './style';
import Font from './style/font';
import Fill from './style/fill';
import Border from './style/border';
export interface StyleElements {
    fonts: Font[];
    fills: Fill[];
    borders: Border[];
}
export default class XLSX {
    sheets: Sheet[];
    styles: Style[];
    styleElements: StyleElements;
    constructor();
    sheet(name: string): Sheet;
    style(config: StyleConfig): Style;
    save(filename: string): void;
}
