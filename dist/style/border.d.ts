import { XMLObject } from '../utils';
declare type BorderStyle = 'thin' | 'medium' | 'thick' | 'dashed' | 'dotted' | 'double' | 'none';
export interface BorderConfig {
    borderStyle?: BorderStyle;
    borderColor?: string;
    borderVerticalStyle?: BorderStyle;
    borderVerticalColor?: string;
    borderHorizontalStyle?: BorderStyle;
    borderHorizontalColor?: string;
    borderTopStyle?: BorderStyle;
    borderTopColor?: string;
    borderBottomStyle?: BorderStyle;
    borderBottomColor?: string;
    borderStartStyle?: BorderStyle;
    borderStartColor?: string;
    borderEndStyle?: BorderStyle;
    borderEndColor?: string;
}
export default class Border {
    config: BorderConfig;
    constructor(config: BorderConfig);
    export(): XMLObject;
}
export {};
