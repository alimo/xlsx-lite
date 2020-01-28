import { XMLObject } from '../utils';
import { resolveColor } from '../utils/resolve-color';

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

  constructor(config: FontConfig) {
    this.config = config;
  }

  export(): XMLObject {
    const {
      fontFamily,
      fontSize,
      fontWeight,
      textDecoration,
      fontStyle,
      color,
    } = this.config;

    const content: XMLObject[] = [];

    content.push({ _t: 'name', val: fontFamily });
    if (fontSize) {
      content.push({ _t: 'sz', val: fontSize.toString().replace('px', '') });
    }
    if (fontWeight === 'bold') {
      content.push({ _t: 'b' });
    }
    if (textDecoration) {
      content.push({
        _t: {
          'line-through': 'strike',
          underline: 'u',
        }[textDecoration],
      });
    }
    if (fontStyle === 'italic') {
      content.push({ _t: 'i' });
    }
    if (color) {
      content.push({ _t: 'color', rgb: resolveColor(color) });
    }

    return { _t: 'font', _c: content };
  }
}
