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
          patternType: backgroundColor !== 'none' ? 'solid' : 'none',
          _c: backgroundColor !== 'none' && [
            { _t: 'fgColor', rgb: resolveColor(backgroundColor) },
          ],
        },
      ],
    };
  }
}
