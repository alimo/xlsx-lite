const base64 = true;
const array = true;
const string = true;
const arraybuffer =
  typeof ArrayBuffer !== 'undefined' && typeof Uint8Array !== 'undefined';
const nodebuffer = typeof Buffer !== 'undefined';
// contains true if JSZip can read/generate Uint8Array, false otherwise.
const uint8array = typeof Uint8Array !== 'undefined';

let blob: boolean;
if (typeof ArrayBuffer === 'undefined') {
  blob = false;
} else {
  try {
    const buffer = new ArrayBuffer(0);
    blob =
      new Blob([buffer], {
        type: 'application/zip',
      }).size === 0;
  } catch (e) {
    blob = false;
  }
}

export default {
  base64,
  array,
  string,
  arraybuffer,
  nodebuffer,
  uint8array,
  blob,
};
