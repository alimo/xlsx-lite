import { XMLObject } from '../utils';
import { resolveColor } from '../utils/resolve-color';

export interface FillConfig {
  backgroundColor?: string;
}

export default class Fill {
  config: FillConfig;

  constructor(config: FillConfig) {
    this.config = config;
  }

  export(): XMLObject {
    const { backgroundColor } = this.config;

    return {
      _t: 'fill',
      _c: [
        {
          _t: 'patternFill',
          patternType: 'solid',
          _c: [
            { _t: 'bgColor', rgb: resolveColor(backgroundColor) },
            { _t: 'fgColor', rgb: resolveColor(backgroundColor) },
          ],
        },
      ],
    };
  }
}
