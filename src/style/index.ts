import { StyleElements } from '../xlsx';
import { XMLObject } from '../utils';
import Font, { FontConfig } from './font';
import Fill, { FillConfig } from './fill';
import Border, { BorderConfig } from './border';

interface AlignmentConfig {
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

export type StyleConfig = FontConfig &
  FillConfig &
  BorderConfig &
  AlignmentConfig;

export default class Style {
  index: number;
  fontIndex: number;
  fillIndex: number;
  borderIndex = 0;
  alignment: AlignmentConfig = null;

  constructor(config: StyleConfig, index: number, elements: StyleElements) {
    this.index = index;

    if (
      config.fontFamily ||
      config.fontSize ||
      config.fontWeight ||
      config.textDecoration ||
      config.fontStyle ||
      config.color
    ) {
      config.fontFamily = config.fontFamily || 'Arial';

      this.fontIndex = elements.fonts.length;
      elements.fonts.push(new Font(config));
    }

    if (config.backgroundColor) {
      this.fillIndex = elements.fills.length;
      elements.fills.push(new Fill(config));
    }

    if (
      config.borderStyle ||
      config.borderColor ||
      config.borderVerticalStyle ||
      config.borderVerticalColor ||
      config.borderHorizontalStyle ||
      config.borderHorizontalColor ||
      config.borderTopStyle ||
      config.borderTopColor ||
      config.borderBottomStyle ||
      config.borderBottomColor ||
      config.borderStartStyle ||
      config.borderStartColor ||
      config.borderEndStyle ||
      config.borderEndColor
    ) {
      this.borderIndex = elements.borders.length;
      elements.borders.push(new Border(config));
    }

    if (config.textAlign || config.verticalAlign) {
      this.alignment = {
        textAlign: config.textAlign,
        verticalAlign: config.verticalAlign,
      };
    }
  }

  export(): XMLObject {
    return {
      _t: 'xf',
      fontId: this.fontIndex,
      applyFont: typeof this.fontIndex === 'number' ? 'true' : undefined,
      fillId: this.fillIndex,
      applyFill: typeof this.fillIndex === 'number' ? 'true' : undefined,
      borderId: this.borderIndex,
      applyBorder: 'true',
      applyAlignment: this.alignment ? 'true' : undefined,
      _c: [
        this.alignment && {
          _t: 'alignment',
          horizontal: this.alignment.textAlign,
          vertical:
            this.alignment.verticalAlign === 'middle'
              ? 'center'
              : this.alignment.verticalAlign,
        },
      ].filter(Boolean),
    };
  }
}
