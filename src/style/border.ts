import { XMLObject } from '../utils';
import { resolveColor } from '../utils/resolve-color';

type BorderStyle =
  | 'thin'
  | 'medium'
  | 'thick'
  | 'dashed'
  | 'dotted'
  | 'double'
  | 'none';

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

  constructor(config: BorderConfig) {
    this.config = config;
  }

  export(): XMLObject {
    const {
      borderStyle,
      borderColor,
      borderVerticalStyle,
      borderVerticalColor,
      borderHorizontalStyle,
      borderHorizontalColor,
      borderTopStyle,
      borderTopColor,
      borderBottomStyle,
      borderBottomColor,
      borderStartStyle,
      borderStartColor,
      borderEndStyle,
      borderEndColor,
    } = this.config;

    const topBorder = {
      style: borderTopStyle || borderVerticalStyle || borderStyle,
      color: borderTopColor || borderVerticalColor || borderColor,
    };
    const bottomBorder = {
      style: borderBottomStyle || borderVerticalStyle || borderStyle,
      color: borderBottomColor || borderVerticalColor || borderColor,
    };
    const startBorder = {
      style: borderStartStyle || borderHorizontalStyle || borderStyle,
      color: borderStartColor || borderHorizontalColor || borderColor,
    };
    const endBorder = {
      style: borderEndStyle || borderHorizontalStyle || borderStyle,
      color: borderEndColor || borderHorizontalColor || borderColor,
    };

    return {
      _t: 'border',
      _c: [
        {
          _t: 'top',
          style: topBorder.style,
          _c: topBorder.color && [
            { _t: 'color', rgb: resolveColor(topBorder.color) },
          ],
        },
        {
          _t: 'bottom',
          style: bottomBorder.style,
          _c: bottomBorder.color && [
            { _t: 'color', rgb: resolveColor(bottomBorder.color) },
          ],
        },
        {
          _t: 'start',
          style: startBorder.style,
          _c: startBorder.color && [
            { _t: 'color', rgb: resolveColor(startBorder.color) },
          ],
        },
        {
          _t: 'end',
          style: endBorder.style,
          _c: endBorder.color && [
            { _t: 'color', rgb: resolveColor(endBorder.color) },
          ],
        },
      ],
    };
  }
}
