import { StyleElements } from '../xlsx';
import { XMLObject } from '../utils';
import { FontConfig } from './font';
import { FillConfig } from './fill';
interface AlignmentConfig {
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    verticalAlign?: 'top' | 'middle' | 'bottom';
}
export declare type StyleConfig = FontConfig & FillConfig & AlignmentConfig;
export default class Style {
    index: number;
    fontIndex: number;
    fillIndex: number;
    alignment: AlignmentConfig;
    constructor(config: StyleConfig, index: number, elements: StyleElements);
    export(): XMLObject;
}
export {};
