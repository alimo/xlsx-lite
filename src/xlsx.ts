import JSZip from './jszip';
import { saveAs } from 'file-saver';

import Sheet from './sheet';
import Style, { StyleConfig } from './style';
import Font from './style/font';
import Fill from './style/fill';
import Border from './style/border';
import { jsonToXml } from './utils';

export interface StyleElements {
  fonts: Font[];
  fills: Fill[];
  borders: Border[];
}

export default class XLSX {
  sheets: Sheet[] = [];
  styles: Style[] = [];
  styleElements: StyleElements = {
    fonts: [],
    fills: [],
    borders: [],
  };

  constructor() {
    this.style({ fontFamily: 'Arial' });
  }

  sheet(name: string): Sheet {
    const sheet = new Sheet(this, name);
    this.sheets.push(sheet);
    return sheet;
  }

  style(config: StyleConfig): Style {
    const style = new Style(config, this.styles.length, this.styleElements);
    this.styles.push(style);
    return style;
  }

  save(filename: string): void {
    const zip = new JSZip();
    const rels = zip.folder('_rels');
    const xl = zip.folder('xl');
    const xlRels = xl.folder('_rels');
    const xlWorksheets = xl.folder('worksheets');

    zip.file(
      '[Content_Types].xml',
      jsonToXml({
        _t: 'Types',
        xmlns: 'http://schemas.openxmlformats.org/package/2006/content-types',
        _c: [
          {
            _t: 'Default',
            Extension: 'rels',
            ContentType:
              'application/vnd.openxmlformats-package.relationships+xml',
          },
          {
            _t: 'Override',
            PartName: '/xl/workbook.xml',
            ContentType:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml',
          },
          {
            _t: 'Override',
            PartName: '/xl/styles.xml',
            ContentType:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml',
          },
          ...this.sheets.map((sheet, index) => ({
            _t: 'Override',
            PartName: `/xl/worksheets/sheet${index + 1}.xml`,
            ContentType:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml',
          })),
        ],
      })
    );
    rels.file(
      '.rels',
      jsonToXml({
        _t: 'Relationships',
        xmlns: 'http://schemas.openxmlformats.org/package/2006/relationships',
        _c: [
          {
            _t: 'Relationship',
            Id: 'rId1',
            Type:
              'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
            Target: 'xl/workbook.xml',
          },
        ],
      })
    );
    xl.file(
      'workbook.xml',
      jsonToXml({
        _t: 'workbook',
        xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
        'xmlns:r':
          'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
        _c: [
          {
            _t: 'sheets',
            _c: this.sheets.map((sheet, index) => ({
              _t: 'sheet',
              name: sheet.name,
              sheetId: (index + 1).toString(),
              'r:id': `rId${index + 2}`,
            })),
          },
        ],
      })
    );
    xlRels.file(
      'workbook.xml.rels',
      jsonToXml({
        _t: 'Relationships',
        xmlns: 'http://schemas.openxmlformats.org/package/2006/relationships',
        _c: [
          {
            _t: 'Relationship',
            Id: 'rId1',
            Type:
              'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
            Target: 'styles.xml',
          },
          ...this.sheets.map((sheet, index) => ({
            _t: 'Relationship',
            Id: `rId${index + 2}`,
            Type:
              'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet',
            Target: `worksheets/sheet${index + 1}.xml`,
          })),
        ],
      })
    );
    for (let i = 0; i < this.sheets.length; i++) {
      xlWorksheets.file(
        `sheet${i + 1}.xml`,
        jsonToXml({
          _t: 'worksheet',
          xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
          'xmlns:r':
            'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
          _c: [
            { _t: 'sheetData', _c: this.sheets[i].sheetContent() },
            ...this.sheets[i].filterTags(),
            this.sheets[i].exportColumns(),
          ].filter(Boolean),
        })
      );
    }
    xl.file(
      'styles.xml',
      jsonToXml({
        _t: 'styleSheet',
        xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
        'xmlns:x14ac':
          'http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac',
        'xmlns:mc':
          'http://schemas.openxmlformats.org/markup-compatibility/2006',
        _c: [
          {
            _t: 'fonts',
            count: this.styleElements.fonts.length,
            _c: this.styleElements.fonts.map(font => font.export()),
          },
          {
            _t: 'fills',
            count: this.styleElements.fills.length,
            _c: this.styleElements.fills.map(fill => fill.export()),
          },
          {
            _t: 'borders',
            count: this.styleElements.borders.length,
            _c: this.styleElements.borders.map(border => border.export()),
          },
          {
            _t: 'cellXfs',
            count: this.styles.length,
            _c: this.styles.map(style => style.export()),
          },
        ],
      })
    );

    zip.generateAsync().then(blob => {
      saveAs(blob, filename);
    });
  }
}
