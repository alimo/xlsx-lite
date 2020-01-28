import { XMLObject } from '../utils';
export interface FillConfig {
    backgroundColor?: string;
}
export default class Fill {
    config: FillConfig;
    constructor(config: FillConfig);
    export(): XMLObject;
}
