/**
 * The following functions come from pako, from pako/lib/zlib/crc32.js
 * released under the MIT license, see pako https://github.com/nodeca/pako/
 */

// Use ordinary array, since untyped makes no boost here
function makeTable(): number[] {
  const table: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

// Create table on load. Just 255 signed longs. Not a problem.
const crcTable = makeTable();

function crc32(crc, buf) {
  crc = crc ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return crc ^ -1; // >>> 0;
}

// That's all for the pako functions.

export default function crc32wrapper(input, crc = 0) {
  if (!input || !input.length) {
    return 0;
  }
  return crc32(crc, input);
}
