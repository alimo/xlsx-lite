const xmlMetadata = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

function objectToTag(obj) {
	if (typeof obj !== 'object') {
		return obj.toString();
	}
	const raw = [`<${obj._t}`];
	for (const key in obj) {
		if (!key.startsWith('_') && obj[key] !== undefined) {
			raw.push(` ${key}="${obj[key]}"`);
		}
	}
	if (obj._c && obj._c.length > 0) {
		raw.push('>');
		for (const content of obj._c) {
			raw.push(objectToTag(content));
		}
		raw.push(`</${obj._t}>`);
	}
	else {
		raw.push('/>');
	}
	return raw.join('');
}

function jsonToXml(obj) {
	return xmlMetadata + objectToTag(obj);
}

module.exports = jsonToXml;
