import GenericWorker from './stream/GenericWorker';

/**
 * The following functions come from pako, from pako/lib/utils/strings
 * released under the MIT license, see pako https://github.com/nodeca/pako/
 */

// convert string to array (typed, when possible)
function string2buf(str: string): Uint8Array {
  // count binary size
  let bufLen = 0;
  for (let mPos = 0; mPos < str.length; mPos++) {
    let c = str.charCodeAt(mPos);
    if ((c & 0xfc00) === 0xd800 && mPos + 1 < str.length) {
      const c2 = str.charCodeAt(mPos + 1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        mPos++;
      }
    }
    bufLen += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
  }

  // allocate buffer
  const buf = new Uint8Array(bufLen);

  // convert
  for (let i = 0, mPos = 0; i < bufLen; mPos++) {
    let c = str.charCodeAt(mPos);
    if ((c & 0xfc00) === 0xd800 && mPos + 1 < str.length) {
      const c2 = str.charCodeAt(mPos + 1);
      if ((c2 & 0xfc00) === 0xdc00) {
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        mPos++;
      }
    }
    if (c < 0x80) {
      /* one byte */
      buf[i++] = c;
    } else if (c < 0x800) {
      /* two bytes */
      buf[i++] = 0xc0 | (c >>> 6);
      buf[i++] = 0x80 | (c & 0x3f);
    } else if (c < 0x10000) {
      /* three bytes */
      buf[i++] = 0xe0 | (c >>> 12);
      buf[i++] = 0x80 | ((c >>> 6) & 0x3f);
      buf[i++] = 0x80 | (c & 0x3f);
    } else {
      /* four bytes */
      buf[i++] = 0xf0 | (c >>> 18);
      buf[i++] = 0x80 | ((c >>> 12) & 0x3f);
      buf[i++] = 0x80 | ((c >>> 6) & 0x3f);
      buf[i++] = 0x80 | (c & 0x3f);
    }
  }

  return buf;
}

// That's all for the pako functions.

/**
 * Transform a javascript string into an array (typed if possible) of bytes,
 * UTF-8 encoded.
 */
export function utf8encode(str: string): Uint8Array {
  return string2buf(str);
}

/**
 * A worker to endcode string chunks into utf8 encoded binary chunks.
 */
export class Utf8EncodeWorker extends GenericWorker {
  constructor() {
    super('utf-8 encode');
  }

  processChunk(chunk): void {
    this.push({
      data: utf8encode(chunk.data),
      meta: chunk.meta,
    });
  }
}
