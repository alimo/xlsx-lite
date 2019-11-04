const Font = require('./font');

class Style {
	constructor(config, index, elements) {
		this.index = index;

		if (config.fontFamily || config.fontSize || config.fontWeight || config.color) {
			config.fontFamily = config.fontFamily || 'Arial';

			this.fontIndex = elements.fonts.length;
			elements.fonts.push(new Font(config));
		}
	}

	export() {
		return { _t: 'xf', fontId: this.fontIndex, applyFont: typeof this.fontIndex === 'number' ? '1' : undefined };
	}
}

module.exports = Style;
