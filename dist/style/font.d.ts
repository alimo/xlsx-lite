import { XMLObject } from '../utils';
export interface FontConfig {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: 'bold';
    textDecoration?: 'line-through' | 'underline';
    fontStyle?: 'italic';
    color?: string;
}
export default class Font {
    config: FontConfig;
    constructor(config: FontConfig);
    export(): XMLObject;
}
