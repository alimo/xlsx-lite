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

  borderLeftStyle?: BorderStyle;
  borderLeftColor?: string;

  borderRightStyle?: BorderStyle;
  borderRightColor?: string;
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
      borderLeftStyle,
      borderLeftColor,
      borderRightStyle,
      borderRightColor,
    } = this.config;

    const topBorder = {
      style: borderTopStyle || borderVerticalStyle || borderStyle,
      color: borderTopColor || borderVerticalColor || borderColor,
    };
    const bottomBorder = {
      style: borderBottomStyle || borderVerticalStyle || borderStyle,
      color: borderBottomColor || borderVerticalColor || borderColor,
    };
    const leftBorder = {
      style: borderLeftStyle || borderHorizontalStyle || borderStyle,
      color: borderLeftColor || borderHorizontalColor || borderColor,
    };
    const rightBorder = {
      style: borderRightStyle || borderHorizontalStyle || borderStyle,
      color: borderRightColor || borderHorizontalColor || borderColor,
    };

    return {
      _t: 'border',
      _c: [
        leftBorder.style && {
          _t: 'left',
          style: leftBorder.style,
          _c: leftBorder.color && [
            { _t: 'color', rgb: resolveColor(leftBorder.color) },
          ],
        },
        rightBorder.style && {
          _t: 'right',
          style: rightBorder.style,
          _c: rightBorder.color && [
            { _t: 'color', rgb: resolveColor(rightBorder.color) },
          ],
        },
        topBorder.style && {
          _t: 'top',
          style: topBorder.style,
          _c: topBorder.color && [
            { _t: 'color', rgb: resolveColor(topBorder.color) },
          ],
        },
        bottomBorder.style && {
          _t: 'bottom',
          style: bottomBorder.style,
          _c: bottomBorder.color && [
            { _t: 'color', rgb: resolveColor(bottomBorder.color) },
          ],
        },
      ].filter(Boolean),
    };
  }
}
