import support from './support';
import { decode } from './base64';
import setImmediate from 'set-immediate-shim';

/**
 * Fill in an array with a string.
 * @param {String} str the string to use.
 * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to fill in (will be mutated).
 * @return {Array|ArrayBuffer|Uint8Array|Buffer} the updated array.
 */
function stringToArrayLike(str: string, array) {
  for (let i = 0; i < str.length; ++i) {
    array[i] = str.charCodeAt(i) & 0xff;
  }
  return array;
}

/**
 * Convert a string that pass as a "binary string": it should represent a byte
 * array but may have > 255 char codes. Be sure to take only the first byte
 * and returns the byte array.
 * @param {String} str the string to transform.
 * @return {Array|Uint8Array} the string in a binary format.
 */
function string2binary(str) {
  let result = null;
  if (support.uint8array) {
    result = new Uint8Array(str.length);
  } else {
    result = new Array(str.length);
  }
  return stringToArrayLike(str, result);
}

/**
 * Throw an exception if the type is not supported.
 * @param {String} type the type to check.
 * @throws {Error} an Error if the browser doesn't support the requested type.
 */
export function checkSupport(type: string): void {
  if (!support[type.toLowerCase()]) {
    throw new Error(type + ' is not supported by this platform');
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
  stringifyByChunk: function(array, type, chunk) {
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
  stringifyByChar: function(array) {
    let resultStr = '';
    for (let i = 0; i < array.length; i++) {
      resultStr += String.fromCharCode(array[i]);
    }
    return resultStr;
  },
  applyCanBeUsed: {
    /**
     * true if the browser accepts to use String.fromCharCode on Uint8Array
     */
    uint8array: (function() {
      try {
        return (
          support.uint8array &&
          String.fromCharCode.apply(null, new Uint8Array(1)).length === 1
        );
      } catch (e) {
        return false;
      }
    })(),
  },
};

/**
 * Return the type of the input.
 * The type will be in a format valid for JSZip.utils.transformTo : string, array, uint8array, arraybuffer.
 */
export function getTypeOf(input): string {
  if (typeof input === 'string') {
    return 'string';
  }
  if (Array.isArray(input)) {
    return 'array';
  }
  if (support.uint8array && input instanceof Uint8Array) {
    return 'uint8array';
  }
  if (support.arraybuffer && input instanceof ArrayBuffer) {
    return 'arraybuffer';
  }
}

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
  const type = getTypeOf(array);
  let canUseApply = true;
  if (type === 'uint8array') {
    canUseApply = arrayToStringHelper.applyCanBeUsed.uint8array;
  }

  if (canUseApply) {
    while (chunk > 1) {
      try {
        return arrayToStringHelper.stringifyByChunk(array, type, chunk);
      } catch (e) {
        chunk = Math.floor(chunk / 2);
      }
    }
  }

  // no apply or chunk error : slow and painful algorithm
  // default browser on android 4.*
  return arrayToStringHelper.stringifyByChar(array);
}

export const applyFromCharCode = arrayLikeToString;

/**
 * Copy the data from an array-like to an other array-like.
 * @param {Array|ArrayBuffer|Uint8Array|Buffer} arrayFrom the origin array.
 * @param {Array|ArrayBuffer|Uint8Array|Buffer} arrayTo the destination array which will be mutated.
 * @return {Array|ArrayBuffer|Uint8Array|Buffer} the updated destination array.
 */
function arrayLikeToArrayLike(arrayFrom, arrayTo) {
  for (let i = 0; i < arrayFrom.length; i++) {
    arrayTo[i] = arrayFrom[i];
  }
  return arrayTo;
}

// a matrix containing functions to transform everything into everything.
const transform = {};

// string to ?
transform['string'] = {
  string: identity,
  array(input) {
    return stringToArrayLike(input, new Array(input.length));
  },
  arraybuffer(input) {
    return transform['string']['uint8array'](input).buffer;
  },
  uint8array(input) {
    return stringToArrayLike(input, new Uint8Array(input.length));
  },
};

// array to ?
transform['array'] = {
  string: arrayLikeToString,
  array: identity,
  arraybuffer(input) {
    return new Uint8Array(input).buffer;
  },
  uint8array(input) {
    return new Uint8Array(input);
  },
};

// arraybuffer to ?
transform['arraybuffer'] = {
  string(input) {
    return arrayLikeToString(new Uint8Array(input));
  },
  array(input) {
    return arrayLikeToArrayLike(
      new Uint8Array(input),
      new Array(input.byteLength)
    );
  },
  arraybuffer: identity,
  uint8array(input) {
    return new Uint8Array(input);
  },
};

// uint8array to ?
transform['uint8array'] = {
  string: arrayLikeToString,
  array(input) {
    return arrayLikeToArrayLike(input, new Array(input.length));
  },
  arraybuffer(input) {
    return input.buffer;
  },
  uint8array: identity,
};

// nodebuffer to ?
transform['nodebuffer'] = {
  string: arrayLikeToString,
  array(input) {
    return arrayLikeToArrayLike(input, new Array(input.length));
  },
  arraybuffer(input) {
    return transform['nodebuffer']['uint8array'](input).buffer;
  },
  uint8array(input) {
    return arrayLikeToArrayLike(input, new Uint8Array(input.length));
  },
  nodebuffer: identity,
};

/**
 * Transform an input into any type.
 * The supported output type are : string, array, uint8array, arraybuffer, nodebuffer.
 * If no output type is specified, the unmodified input will be returned.
 * @param {String} outputType the output type.
 * @param {String|Array|ArrayBuffer|Uint8Array|Buffer} input the input to convert.
 * @throws {Error} an Error if the browser doesn't support the requested output type.
 */
export function transformTo(outputType: string, input) {
  if (!input) {
    // undefined, null, etc
    // an empty string won't harm.
    input = '';
  }
  if (!outputType) {
    return input;
  }
  checkSupport(outputType);
  const inputType = getTypeOf(input);
  const result = transform[inputType][outputType](input);
  return result;
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

/**
 * Transform arbitrary content into a Promise.
 */
export function prepareContent(
  data: string,
  isBase64: boolean
): Promise<string> {
  return Promise.resolve(data).then(data => {
    if (isBase64) {
      data = decode(data);
    }
    return data;
  });
}
