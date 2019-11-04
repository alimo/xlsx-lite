class Font {
	constructor(config) {
		this.config = config;
	}

	export() {
		const {
			fontFamily,
			fontSize,
			fontWeight,
			textDecoration,
			fontStyle,
			color,
		} = this.config;

		const content = [];

		content.push({ _t: 'name', val: fontFamily });
		if (fontSize) {
			content.push({ _t: 'sz', val: fontSize.toString().replace('px', '') });
		}
		if (fontWeight === 'bold') {
			content.push({ _t: 'b' });
		}
		if (textDecoration === 'line-through') {
			content.push({ _t: 'strike' });
		}
		if (fontStyle === 'italic') {
			content.push({ _t: 'i' });
		}
		if (color) {
			let c = color;
			if (c.length === 3) {
				c = c[0]+c[0] + c[1]+c[1] + c[2]+c[2];
			}
			content.push({ _t: 'color', rgb: c });
		}

		return { _t: 'font', _c: content };
	}
}

module.exports = Font;
