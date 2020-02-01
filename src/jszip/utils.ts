import support from './support';
import setImmediate from 'set-immediate-shim';

/**
 * Fill in an array with a string.
 */
function stringToArrayLike(str: string, array: Uint8Array): Uint8Array {
  for (let i = 0; i < str.length; ++i) {
    array[i] = str.charCodeAt(i) & 0xff;
  }
  return array;
}

/**
 * Throw an exception if the type is not supported.
 */
export function checkSupport(type: string): void {
  if (!support[type.toLowerCase()]) {
    throw new Error(`${type} is not supported by this platform`);
  }
}

/**
 * Create a new blob with the given content and the given type.
 * @param {String|ArrayBuffer} part the content to put in the blob. DO NOT use
 * an Uint8Array because the stock browser of android 4 won't accept it (it
 * will be silently converted to a string, "[object Uint8Array]").
 *
 * Use only ONE part to build the blob to avoid a memory leak in IE11 / Edge:
 * when a large amount of Array is used to create the Blob, the amount of
 * memory consumed is nearly 100 times the original data amount.
 *
 * @param {String} type the mime type of the blob.
 * @return {Blob} the created blob.
 */
export function newBlob(part: BlobPart): Blob {
  checkSupport('blob');

  return new Blob([part], {
    type: 'application/zip',
  });
}

function identity<T>(input: T): T {
  return input;
}

/**
 * An helper for the function arrayLikeToString.
 * This contains static information and functions that
 * can be optimized by the browser JIT compiler.
 */
const arrayToStringHelper = {
  /**
   * Transform an array of int into a string, chunk by chunk.
   * See the performances notes on arrayLikeToString.
   * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
   * @param {String} type the type of the array.
   * @param {Integer} chunk the chunk size.
   * @return {String} the resulting string.
   * @throws Error if the chunk is too big for the stack.
   */
  stringifyByChunk(array, type, chunk) {
    const result = [];
    let k = 0;
    const len = array.length;
    // shortcut
    if (len <= chunk) {
      return String.fromCharCode.apply(null, array);
    }
    while (k < len) {
      if (type === 'array' || type === 'nodebuffer') {
        result.push(
          String.fromCharCode.apply(
            null,
            array.slice(k, Math.min(k + chunk, len))
          )
        );
      } else {
        result.push(
          String.fromCharCode.apply(
            null,
            array.subarray(k, Math.min(k + chunk, len))
          )
        );
      }
      k += chunk;
    }
    return result.join('');
  },

  /**
   * Call String.fromCharCode on every item in the array.
   * This is the naive implementation, which generate A LOT of intermediate string.
   * This should be used when everything else fail.
   * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
   * @return {String} the result.
   */
  stringifyByChar(array) {
    let resultStr = '';
    for (let i = 0; i < array.length; i++) {
      resultStr += String.fromCharCode(array[i]);
    }
    return resultStr;
  },
};

/**
 * Transform an array-like object to a string.
 * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
 * @return {String} the result.
 */
function arrayLikeToString(array): string {
  // Performances notes :
  // --------------------
  // String.fromCharCode.apply(null, array) is the fastest, see
  // see http://jsperf.com/converting-a-uint8array-to-a-string/2
  // but the stack is limited (and we can get huge arrays !).
  //
  // result += String.fromCharCode(array[i]); generate too many strings !
  //
  // This code is inspired by http://jsperf.com/arraybuffer-to-string-apply-performance/2
  // TODO : we now have workers that split the work. Do we still need that ?
  let chunk = 65536;
  while (chunk > 1) {
    try {
      return arrayToStringHelper.stringifyByChunk(array, 'uint8array', chunk);
    } catch (e) {
      chunk = Math.floor(chunk / 2);
    }
  }

  // no apply or chunk error : slow and painful algorithm
  // default browser on android 4.*
  return arrayToStringHelper.stringifyByChar(array);
}

export const applyFromCharCode = arrayLikeToString;

// a matrix containing functions to transform everything into everything.
const transforms = {
  // string to ?
  string: {
    uint8array(input: string): Uint8Array {
      return stringToArrayLike(input, new Uint8Array(input.length));
    },
  },

  // uint8array to ?
  uint8array: {
    string: arrayLikeToString,
    arraybuffer(input: Uint8Array): ArrayBuffer | SharedArrayBuffer {
      return input.buffer;
    },
    uint8array: identity,
  },
};

/**
 * Transform an input into any type.
 * The supported output type are : string, array, uint8array, arraybuffer, nodebuffer.
 * If no output type is specified, the unmodified input will be returned.
 */
export function transformTo(
  outputType: string,
  input: string | Uint8Array
): string | Uint8Array | ArrayBuffer | SharedArrayBuffer {
  checkSupport(outputType);

  let inputType: string;
  if (typeof input === 'string') {
    inputType = 'string';
  }
  if (support.uint8array && input instanceof Uint8Array) {
    inputType = 'uint8array';
  }

  return transforms[inputType][outputType](input);
}

export const MAX_VALUE_16BITS = 65535;
export const MAX_VALUE_32BITS = -1; // well, "\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF" is parsed as -1

/**
 * Defer the call of a function.
 * @param {Function} callback the function to call asynchronously.
 * @param {Array} args the arguments to give to the callback.
 */
export function delay(callback, args, self) {
  setImmediate(() => {
    callback.apply(self || null, args || []);
  });
}
