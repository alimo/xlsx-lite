/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

var base64 = true;
var array = true;
var string = true;
var arraybuffer = typeof ArrayBuffer !== 'undefined' && typeof Uint8Array !== 'undefined';
var nodebuffer = typeof Buffer !== 'undefined';
// contains true if JSZip can read/generate Uint8Array, false otherwise.
var uint8array = typeof Uint8Array !== 'undefined';
var blob;
if (typeof ArrayBuffer === 'undefined') {
    blob = false;
}
else {
    try {
        var buffer = new ArrayBuffer(0);
        blob =
            new Blob([buffer], {
                type: 'application/zip',
            }).size === 0;
    }
    catch (e) {
        blob = false;
    }
}
var support = {
    base64: base64,
    array: array,
    string: string,
    arraybuffer: arraybuffer,
    nodebuffer: nodebuffer,
    uint8array: uint8array,
    blob: blob,
};

var _keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
function decode(input) {
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0, resultIndex = 0;
    var dataUrlPrefix = 'data:';
    if (input.substr(0, dataUrlPrefix.length) === dataUrlPrefix) {
        // This is a common error: people give a data url
        // (data:image/png;base64,iVBOR...) with a {base64: true} and
        // wonders why things don't work.
        // We can detect that the string input looks like a data url but we
        // *can't* be sure it is one: removing everything up to the comma would
        // be too dangerous.
        throw new Error('Invalid base64 input, it looks like a data url.');
    }
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
    var totalLength = (input.length * 3) / 4;
    if (input.charAt(input.length - 1) === _keyStr.charAt(64)) {
        totalLength--;
    }
    if (input.charAt(input.length - 2) === _keyStr.charAt(64)) {
        totalLength--;
    }
    if (totalLength % 1 !== 0) {
        // totalLength is not an integer, the length does not match a valid
        // base64 content. That can happen if:
        // - the input is not a base64 content
        // - the input is *almost* a base64 content, with a extra chars at the
        //   beginning or at the end
        // - the input uses a base64 variant (base64url for example)
        throw new Error('Invalid base64 input, bad content length.');
    }
    var output;
    if (support.uint8array) {
        output = new Uint8Array(totalLength | 0);
    }
    else {
        output = new Array(totalLength | 0);
    }
    while (i < input.length) {
        enc1 = _keyStr.indexOf(input.charAt(i++));
        enc2 = _keyStr.indexOf(input.charAt(i++));
        enc3 = _keyStr.indexOf(input.charAt(i++));
        enc4 = _keyStr.indexOf(input.charAt(i++));
        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;
        output[resultIndex++] = chr1;
        if (enc3 !== 64) {
            output[resultIndex++] = chr2;
        }
        if (enc4 !== 64) {
            output[resultIndex++] = chr3;
        }
    }
    return output;
}

var setImmediateShim = typeof setImmediate === 'function' ? setImmediate : (...args) => {
	args.splice(1, 0, 0);
	setTimeout(...args);
};

/**
 * Fill in an array with a string.
 * @param {String} str the string to use.
 * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to fill in (will be mutated).
 * @return {Array|ArrayBuffer|Uint8Array|Buffer} the updated array.
 */
function stringToArrayLike(str, array) {
    for (var i = 0; i < str.length; ++i) {
        array[i] = str.charCodeAt(i) & 0xff;
    }
    return array;
}
/**
 * Throw an exception if the type is not supported.
 * @param {String} type the type to check.
 * @throws {Error} an Error if the browser doesn't support the requested type.
 */
function checkSupport(type) {
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
function newBlob(part) {
    checkSupport('blob');
    return new Blob([part], {
        type: 'application/zip',
    });
}
function identity(input) {
    return input;
}
/**
 * An helper for the function arrayLikeToString.
 * This contains static information and functions that
 * can be optimized by the browser JIT compiler.
 */
var arrayToStringHelper = {
    /**
     * Transform an array of int into a string, chunk by chunk.
     * See the performances notes on arrayLikeToString.
     * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
     * @param {String} type the type of the array.
     * @param {Integer} chunk the chunk size.
     * @return {String} the resulting string.
     * @throws Error if the chunk is too big for the stack.
     */
    stringifyByChunk: function (array, type, chunk) {
        var result = [];
        var k = 0;
        var len = array.length;
        // shortcut
        if (len <= chunk) {
            return String.fromCharCode.apply(null, array);
        }
        while (k < len) {
            if (type === 'array' || type === 'nodebuffer') {
                result.push(String.fromCharCode.apply(null, array.slice(k, Math.min(k + chunk, len))));
            }
            else {
                result.push(String.fromCharCode.apply(null, array.subarray(k, Math.min(k + chunk, len))));
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
    stringifyByChar: function (array) {
        var resultStr = '';
        for (var i = 0; i < array.length; i++) {
            resultStr += String.fromCharCode(array[i]);
        }
        return resultStr;
    },
    applyCanBeUsed: {
        /**
         * true if the browser accepts to use String.fromCharCode on Uint8Array
         */
        uint8array: (function () {
            try {
                return (support.uint8array &&
                    String.fromCharCode.apply(null, new Uint8Array(1)).length === 1);
            }
            catch (e) {
                return false;
            }
        })(),
    },
};
/**
 * Return the type of the input.
 * The type will be in a format valid for JSZip.utils.transformTo : string, array, uint8array, arraybuffer.
 */
function getTypeOf(input) {
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
function arrayLikeToString(array) {
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
    var chunk = 65536;
    var type = getTypeOf(array);
    var canUseApply = true;
    if (type === 'uint8array') {
        canUseApply = arrayToStringHelper.applyCanBeUsed.uint8array;
    }
    if (canUseApply) {
        while (chunk > 1) {
            try {
                return arrayToStringHelper.stringifyByChunk(array, type, chunk);
            }
            catch (e) {
                chunk = Math.floor(chunk / 2);
            }
        }
    }
    // no apply or chunk error : slow and painful algorithm
    // default browser on android 4.*
    return arrayToStringHelper.stringifyByChar(array);
}
/**
 * Copy the data from an array-like to an other array-like.
 * @param {Array|ArrayBuffer|Uint8Array|Buffer} arrayFrom the origin array.
 * @param {Array|ArrayBuffer|Uint8Array|Buffer} arrayTo the destination array which will be mutated.
 * @return {Array|ArrayBuffer|Uint8Array|Buffer} the updated destination array.
 */
function arrayLikeToArrayLike(arrayFrom, arrayTo) {
    for (var i = 0; i < arrayFrom.length; i++) {
        arrayTo[i] = arrayFrom[i];
    }
    return arrayTo;
}
// a matrix containing functions to transform everything into everything.
var transform = {};
// string to ?
transform['string'] = {
    string: identity,
    array: function (input) {
        return stringToArrayLike(input, new Array(input.length));
    },
    arraybuffer: function (input) {
        return transform['string']['uint8array'](input).buffer;
    },
    uint8array: function (input) {
        return stringToArrayLike(input, new Uint8Array(input.length));
    },
};
// array to ?
transform['array'] = {
    string: arrayLikeToString,
    array: identity,
    arraybuffer: function (input) {
        return new Uint8Array(input).buffer;
    },
    uint8array: function (input) {
        return new Uint8Array(input);
    },
};
// arraybuffer to ?
transform['arraybuffer'] = {
    string: function (input) {
        return arrayLikeToString(new Uint8Array(input));
    },
    array: function (input) {
        return arrayLikeToArrayLike(new Uint8Array(input), new Array(input.byteLength));
    },
    arraybuffer: identity,
    uint8array: function (input) {
        return new Uint8Array(input);
    },
};
// uint8array to ?
transform['uint8array'] = {
    string: arrayLikeToString,
    array: function (input) {
        return arrayLikeToArrayLike(input, new Array(input.length));
    },
    arraybuffer: function (input) {
        return input.buffer;
    },
    uint8array: identity,
};
// nodebuffer to ?
transform['nodebuffer'] = {
    string: arrayLikeToString,
    array: function (input) {
        return arrayLikeToArrayLike(input, new Array(input.length));
    },
    arraybuffer: function (input) {
        return transform['nodebuffer']['uint8array'](input).buffer;
    },
    uint8array: function (input) {
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
function transformTo(outputType, input) {
    if (!input) {
        // undefined, null, etc
        // an empty string won't harm.
        input = '';
    }
    if (!outputType) {
        return input;
    }
    checkSupport(outputType);
    var inputType = getTypeOf(input);
    var result = transform[inputType][outputType](input);
    return result;
}
/**
 * Defer the call of a function.
 * @param {Function} callback the function to call asynchronously.
 * @param {Array} args the arguments to give to the callback.
 */
function delay(callback, args, self) {
    setImmediateShim(function () {
        callback.apply(self || null, args || []);
    });
}
/**
 * Transform arbitrary content into a Promise.
 */
function prepareContent(data, isBase64) {
    return Promise.resolve(data).then(function (data) {
        if (isBase64) {
            data = decode(data);
        }
        return data;
    });
}

/**
 * The following functions come from pako, from pako/lib/utils/strings
 * released under the MIT license, see pako https://github.com/nodeca/pako/
 */
// convert string to array (typed, when possible)
function string2buf(str) {
    var c;
    var c2;
    var mPos;
    var strLen = str.length;
    var bufLen = 0;
    // count binary size
    for (mPos = 0; mPos < strLen; mPos++) {
        c = str.charCodeAt(mPos);
        if ((c & 0xfc00) === 0xd800 && mPos + 1 < strLen) {
            c2 = str.charCodeAt(mPos + 1);
            if ((c2 & 0xfc00) === 0xdc00) {
                c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
                mPos++;
            }
        }
        bufLen += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
    }
    // allocate buffer
    var buf;
    if (support.uint8array) {
        buf = new Uint8Array(bufLen);
    }
    else {
        buf = new Array(bufLen);
    }
    // convert
    for (var i = 0, mPos_1 = 0; i < bufLen; mPos_1++) {
        c = str.charCodeAt(mPos_1);
        if ((c & 0xfc00) === 0xd800 && mPos_1 + 1 < strLen) {
            c2 = str.charCodeAt(mPos_1 + 1);
            if ((c2 & 0xfc00) === 0xdc00) {
                c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
                mPos_1++;
            }
        }
        if (c < 0x80) {
            /* one byte */
            buf[i++] = c;
        }
        else if (c < 0x800) {
            /* two bytes */
            buf[i++] = 0xc0 | (c >>> 6);
            buf[i++] = 0x80 | (c & 0x3f);
        }
        else if (c < 0x10000) {
            /* three bytes */
            buf[i++] = 0xe0 | (c >>> 12);
            buf[i++] = 0x80 | ((c >>> 6) & 0x3f);
            buf[i++] = 0x80 | (c & 0x3f);
        }
        else {
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
 * @return {Array|Uint8Array|Buffer} the UTF-8 encoded string.
 */
function utf8encode(str) {
    return string2buf(str);
}

var defaults = {
    base64: false,
    binary: false,
    dir: false,
    createFolders: true,
    date: null,
    compression: null,
    compressionOptions: null,
    unixPermissions: null,
    dosPermissions: null,
};

/**
 * A worker that does nothing but passing chunks to the next one. This is like
 * a nodejs stream but with some differences. On the good side :
 * - it works on IE 6-9 without any issue / polyfill
 * - it weights less than the full dependencies bundled with browserify
 * - it forwards errors (no need to declare an error handler EVERYWHERE)
 *
 * A chunk is an object with 2 attributes : `meta` and `data`. The former is an
 * object containing anything (`percent` for example), see each worker for more
 * details. The latter is the real data (String, Uint8Array, etc).
 *
 * @constructor
 * @param {String} name the name of the stream (mainly used for debugging purposes)
 */
var GenericWorker = /** @class */ (function () {
    function GenericWorker(name) {
        if (name === void 0) { name = 'default'; }
        // an object containing metadata about the workers chain
        this.streamInfo = {};
        // an error which happened when the worker was paused
        this.generatedError = null;
        // an object containing metadata to be merged by this worker into the general metadata
        this.extraStreamInfo = {};
        // true if the stream is paused (and should not do anything), false otherwise
        this.isPaused = true;
        // true if the stream is finished (and should not do anything), false otherwise
        this.isFinished = false;
        // true if the stream is locked to prevent further structure updates (pipe), false otherwise
        this.isLocked = false;
        // the event listeners
        this._listeners = {
            data: [],
            end: [],
            error: [],
        };
        // the previous worker, if any
        this.previous = null;
        this.name = name;
    }
    /**
     * Push a chunk to the next workers.
     */
    GenericWorker.prototype.push = function (chunk) {
        this.emit('data', chunk);
    };
    /**
     * End the stream.
     */
    GenericWorker.prototype.end = function () {
        if (this.isFinished) {
            return false;
        }
        this.flush();
        try {
            this.emit('end');
            this.cleanUp();
            this.isFinished = true;
        }
        catch (e) {
            this.emit('error', e);
        }
        return true;
    };
    /**
     * End the stream with an error.
     * @param {Error} e the error which caused the premature end.
     * @return {Boolean} true if this call ended the worker with an error, false otherwise.
     */
    GenericWorker.prototype.error = function (e) {
        if (this.isFinished) {
            return false;
        }
        if (this.isPaused) {
            this.generatedError = e;
        }
        else {
            this.isFinished = true;
            this.emit('error', e);
            // in the workers chain exploded in the middle of the chain,
            // the error event will go downward but we also need to notify
            // workers upward that there has been an error.
            if (this.previous) {
                this.previous.error(e);
            }
            this.cleanUp();
        }
        return true;
    };
    /**
     * Add a callback on an event.
     */
    GenericWorker.prototype.on = function (name, listener) {
        this._listeners[name].push(listener);
        return this;
    };
    /**
     * Clean any references when a worker is ending.
     */
    GenericWorker.prototype.cleanUp = function () {
        this.streamInfo = this.generatedError = this.extraStreamInfo = null;
        this._listeners = {
            data: [],
            end: [],
            error: [],
        };
    };
    /**
     * Trigger an event. This will call registered callback with the provided arg.
     */
    GenericWorker.prototype.emit = function (name, arg) {
        if (this._listeners[name]) {
            for (var i = 0; i < this._listeners[name].length; i++) {
                this._listeners[name][i].call(this, arg);
            }
        }
    };
    /**
     * Chain a worker with an other.
     */
    GenericWorker.prototype.pipe = function (next) {
        return next.registerPrevious(this);
    };
    /**
     * Same as `pipe` in the other direction.
     * Using an API with `pipe(next)` is very easy.
     * Implementing the API with the point of view of the next one registering
     * a source is easier, see the ZipFileWorker.
     */
    GenericWorker.prototype.registerPrevious = function (previous) {
        var _this = this;
        if (this.isLocked) {
            throw new Error("The stream '" + this + "' has already been used.");
        }
        // sharing the streamInfo...
        this.streamInfo = previous.streamInfo;
        // ... and adding our own bits
        this.mergeStreamInfo();
        this.previous = previous;
        previous.on('data', function (chunk) {
            _this.processChunk(chunk);
        });
        previous.on('end', function () {
            _this.end();
        });
        previous.on('error', function (e) {
            _this.error(e);
        });
        return this;
    };
    /**
     * Pause the stream so it doesn't send events anymore.
     */
    GenericWorker.prototype.pause = function () {
        if (this.isPaused || this.isFinished) {
            return false;
        }
        this.isPaused = true;
        if (this.previous) {
            this.previous.pause();
        }
        return true;
    };
    /**
     * Resume a paused stream.
     */
    GenericWorker.prototype.resume = function () {
        if (!this.isPaused || this.isFinished) {
            return false;
        }
        this.isPaused = false;
        // if true, the worker tried to resume but failed
        var withError = false;
        if (this.generatedError) {
            this.error(this.generatedError);
            withError = true;
        }
        if (this.previous) {
            this.previous.resume();
        }
        return !withError;
    };
    /**
     * Flush any remaining bytes as the stream is ending.
     */
    GenericWorker.prototype.flush = function () {
        return;
    };
    /**
     * Process a chunk. This is usually the method overridden.
     * @param {Object} chunk the chunk to process.
     */
    GenericWorker.prototype.processChunk = function (chunk) {
        this.push(chunk);
    };
    /**
     * Add a key/value to be added in the workers chain streamInfo once activated.
     */
    GenericWorker.prototype.withStreamInfo = function (key, value) {
        this.extraStreamInfo[key] = value;
        this.mergeStreamInfo();
        return this;
    };
    /**
     * Merge this worker's streamInfo into the chain's streamInfo.
     */
    GenericWorker.prototype.mergeStreamInfo = function () {
        for (var key in this.extraStreamInfo) {
            if (!Object.prototype.hasOwnProperty.call(this.extraStreamInfo, key)) {
                continue;
            }
            this.streamInfo[key] = this.extraStreamInfo[key];
        }
    };
    /**
     * Lock the stream to prevent further updates on the workers chain.
     * After calling this method, all calls to pipe will fail.
     */
    GenericWorker.prototype.lock = function () {
        if (this.isLocked) {
            throw new Error("The stream '" + this + "' has already been used.");
        }
        this.isLocked = true;
        if (this.previous) {
            this.previous.lock();
        }
    };
    /**
     * Pretty print the workers chain.
     */
    GenericWorker.prototype.toString = function () {
        var me = 'Worker ' + this.name;
        if (this.previous) {
            return this.previous + ' -> ' + me;
        }
        else {
            return me;
        }
    };
    return GenericWorker;
}());

// the size of the generated chunks
// TODO expose this as a public variable
var DEFAULT_BLOCK_SIZE = 16 * 1024;
/**
 * A worker that reads a content and emits chunks.
 * @constructor
 * @param {Promise} dataP the promise of the data to split
 */
var DataWorker = /** @class */ (function (_super) {
    __extends(DataWorker, _super);
    function DataWorker(dataP) {
        var _this = _super.call(this, 'DataWorker') || this;
        _this.dataIsReady = false;
        _this.index = 0;
        _this.max = 0;
        _this.data = null;
        _this.type = '';
        _this._tickScheduled = false;
        dataP.then(function (data) {
            _this.dataIsReady = true;
            _this.data = data;
            _this.max = (data && data.length) || 0;
            _this.type = getTypeOf(data);
            if (!_this.isPaused) {
                _this._tickAndRepeat();
            }
        }, function (e) {
            _this.error(e);
        });
        return _this;
    }
    /**
     * @see GenericWorker.cleanUp
     */
    DataWorker.prototype.cleanUp = function () {
        GenericWorker.prototype.cleanUp.call(this);
        this.data = null;
    };
    /**
     * @see GenericWorker.resume
     */
    DataWorker.prototype.resume = function () {
        if (!GenericWorker.prototype.resume.call(this)) {
            return false;
        }
        if (!this._tickScheduled && this.dataIsReady) {
            this._tickScheduled = true;
            delay(this._tickAndRepeat, [], this);
        }
        return true;
    };
    /**
     * Trigger a tick a schedule an other call to this function.
     */
    DataWorker.prototype._tickAndRepeat = function () {
        this._tickScheduled = false;
        if (this.isPaused || this.isFinished) {
            return;
        }
        this._tick();
        if (!this.isFinished) {
            delay(this._tickAndRepeat, [], this);
            this._tickScheduled = true;
        }
    };
    /**
     * Read and push a chunk.
     */
    DataWorker.prototype._tick = function () {
        if (this.isPaused || this.isFinished) {
            return false;
        }
        var size = DEFAULT_BLOCK_SIZE;
        var data = null;
        var nextIndex = Math.min(this.max, this.index + size);
        if (this.index >= this.max) {
            // EOF
            return this.end();
        }
        else {
            switch (this.type) {
                case 'string':
                    data = this.data.substring(this.index, nextIndex);
                    break;
                case 'uint8array':
                    data = this.data.subarray(this.index, nextIndex);
                    break;
                case 'array':
                case 'nodebuffer':
                    data = this.data.slice(this.index, nextIndex);
                    break;
            }
            this.index = nextIndex;
            return this.push({
                data: data,
                meta: {
                    percent: this.max ? (this.index / this.max) * 100 : 0,
                },
            });
        }
    };
    return DataWorker;
}(GenericWorker));

/**
 * A worker which calculate the total length of the data flowing through.
 */
var DataLengthProbe = /** @class */ (function (_super) {
    __extends(DataLengthProbe, _super);
    function DataLengthProbe(propName) {
        var _this = _super.call(this, 'DataLengthProbe for ' + propName) || this;
        _this.propName = propName;
        _this.withStreamInfo(propName, 0);
        return _this;
    }
    /**
     * @see GenericWorker.processChunk
     */
    DataLengthProbe.prototype.processChunk = function (chunk) {
        if (chunk) {
            var length = this.streamInfo[this.propName] || 0;
            this.streamInfo[this.propName] = length + chunk.data.length;
        }
        GenericWorker.prototype.processChunk.call(this, chunk);
    };
    return DataLengthProbe;
}(GenericWorker));

/**
 * The following functions come from pako, from pako/lib/zlib/crc32.js
 * released under the MIT license, see pako https://github.com/nodeca/pako/
 */
// Use ordinary array, since untyped makes no boost here
function makeTable() {
    var table = [];
    for (var n = 0; n < 256; n++) {
        var c = n;
        for (var k = 0; k < 8; k++) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        table[n] = c;
    }
    return table;
}
// Create table on load. Just 255 signed longs. Not a problem.
var crcTable = makeTable();
function crc32(crc, buf, len, pos) {
    var t = crcTable;
    var end = pos + len;
    crc = crc ^ -1;
    for (var i = pos; i < end; i++) {
        crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xff];
    }
    return crc ^ -1; // >>> 0;
}
// That's all for the pako functions.
/**
 * Compute the crc32 of a string.
 * This is almost the same as the function crc32, but for strings. Using the
 * same function for the two use cases leads to horrible performances.
 * @param {Number} crc the starting value of the crc.
 * @param {String} str the string to use.
 * @param {Number} len the length of the string.
 * @param {Number} pos the starting position for the crc32 computation.
 * @return {Number} the computed crc32.
 */
function crc32str(crc, str, len, pos) {
    var t = crcTable;
    var end = pos + len;
    crc = crc ^ -1;
    for (var i = pos; i < end; i++) {
        crc = (crc >>> 8) ^ t[(crc ^ str.charCodeAt(i)) & 0xff];
    }
    return crc ^ -1; // >>> 0;
}
function crc32wrapper(input, crc) {
    if (crc === void 0) { crc = 0; }
    if (typeof input === 'undefined' || !input.length) {
        return 0;
    }
    var isArray = getTypeOf(input) !== 'string';
    if (isArray) {
        return crc32(crc | 0, input, input.length, 0);
    }
    else {
        return crc32str(crc | 0, input, input.length, 0);
    }
}

/**
 * A worker which calculates the crc32 of the data flowing through.
 */
var Crc32Probe = /** @class */ (function (_super) {
    __extends(Crc32Probe, _super);
    function Crc32Probe() {
        var _this = _super.call(this, 'Crc32Probe') || this;
        _this.withStreamInfo('crc32', 0);
        return _this;
    }
    Crc32Probe.prototype.processChunk = function (chunk) {
        this.streamInfo.crc32 = crc32wrapper(chunk.data, this.streamInfo.crc32 || 0);
        this.push(chunk);
    };
    return Crc32Probe;
}(GenericWorker));

/**
 * Represent a compressed object, with everything needed to decompress it.
 * @constructor
 * @param {number} compressedSize the size of the data compressed.
 * @param {number} uncompressedSize the size of the data after decompression.
 * @param {number} crc32 the crc32 of the decompressed file.
 * @param {object} compression the type of compression, see lib/compressions.js.
 * @param {String|ArrayBuffer|Uint8Array|Buffer} data the compressed data.
 */
var CompressedObject = /** @class */ (function () {
    function CompressedObject() {
    }
    /**
     * Chain the given worker with other workers to compress the content with the
     * given compression.
     * @param {GenericWorker} uncompressedWorker the worker to pipe.
     * @param {Object} compression the compression object.
     * @param {Object} compressionOptions the options to use when compressing.
     * @return {GenericWorker} the new worker compressing the content.
     */
    CompressedObject.createWorkerFrom = function (uncompressedWorker, compression, compressionOptions) {
        return uncompressedWorker
            .pipe(new Crc32Probe())
            .pipe(new DataLengthProbe('uncompressedSize'))
            .pipe(compression.compressWorker(compressionOptions))
            .pipe(new DataLengthProbe('compressedSize'))
            .withStreamInfo('compression', compression);
    };
    return CompressedObject;
}());

/**
 * A simple object representing a file in the zip file.
 * @constructor
 * @param {String|ArrayBuffer|Uint8Array|Buffer} data the data
 * @param {Object} options the options of the file
 */
var ZipObject = /** @class */ (function () {
    function ZipObject(name, data, options) {
        this.name = name;
        this.dir = options.dir;
        this.date = options.date;
        this.comment = options.comment;
        this.unixPermissions = options.unixPermissions;
        this.dosPermissions = options.dosPermissions;
        this.data = data;
        // keep only the compression
        this.options = {
            compression: options.compression,
            compressionOptions: options.compressionOptions,
        };
    }
    /**
     * Return a worker for the compressed content.
     * @private
     * @param {Object} compression the compression object to use.
     * @param {Object} compressionOptions the options to use when compressing.
     * @return Worker the worker.
     */
    ZipObject.prototype._compressWorker = function (compression, compressionOptions) {
        var result = new DataWorker(this.data);
        return CompressedObject.createWorkerFrom(result, compression, compressionOptions);
    };
    return ZipObject;
}());

/**
 * A worker which convert chunks to a specified type.
 */
var ConvertWorker = /** @class */ (function (_super) {
    __extends(ConvertWorker, _super);
    function ConvertWorker(destType) {
        var _this = _super.call(this, 'ConvertWorker to ' + destType) || this;
        _this.destType = destType;
        return _this;
    }
    ConvertWorker.prototype.processChunk = function (chunk) {
        this.push({
            data: transformTo(this.destType, chunk.data),
            meta: chunk.meta,
        });
    };
    return ConvertWorker;
}(GenericWorker));

/**
 * Apply the final transformation of the data. If the user wants a Blob for
 * example, it's easier to work with an U8intArray and finally do the
 * ArrayBuffer/Blob conversion.
 * @return {String|Uint8Array|ArrayBuffer|Buffer|Blob} the content in the right format.
 */
function transformZipOutput(content) {
    return newBlob(transformTo('arraybuffer', content));
}
/**
 * Concatenate an array of data of the given type.
 * @param {Array} dataArray the array containing the data chunks to concatenate
 * @throws Error if the asked type is unsupported
 */
function concat(dataArray) {
    var index = 0;
    var totalLength = 0;
    for (var i = 0; i < dataArray.length; i++) {
        totalLength += dataArray[i].length;
    }
    var res = new Uint8Array(totalLength);
    for (var i = 0; i < dataArray.length; i++) {
        res.set(dataArray[i], index);
        index += dataArray[i].length;
    }
    return res;
}
/**
 * An helper to easily use workers outside of JSZip.
 * @constructor
 * @param {Worker} worker the worker to wrap
 */
var StreamHelper = /** @class */ (function () {
    function StreamHelper(worker) {
        try {
            checkSupport('uint8array');
            this.worker = worker.pipe(new ConvertWorker('uint8array'));
            // the last workers can be rewired without issues but we need to
            // prevent any updates on previous workers.
            worker.lock();
        }
        catch (e) {
            this.worker = new GenericWorker('error');
            this.worker.error(e);
        }
    }
    /**
     * Listen a StreamHelper, accumulate its content and concatenate it into a
     * complete block.
     */
    StreamHelper.prototype.accumulate = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var dataArray = [];
            _this.on('data', function (data) {
                dataArray.push(data);
            })
                .on('error', function (err) {
                dataArray = [];
                reject(err);
            })
                .on('end', function () {
                try {
                    var result = transformZipOutput(concat(dataArray));
                    resolve(result);
                }
                catch (e) {
                    reject(e);
                }
                dataArray = [];
            })
                .resume();
        });
    };
    /**
     * Add a listener on an event triggered on a stream.
     */
    StreamHelper.prototype.on = function (event, fn) {
        var _this = this;
        if (event === 'data') {
            this.worker.on(event, function (chunk) {
                fn.call(_this, chunk.data, chunk.meta);
            });
        }
        else {
            this.worker.on(event, function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                delay(fn, args, _this);
            });
        }
        return this;
    };
    /**
     * Resume the flow of chunks.
     */
    StreamHelper.prototype.resume = function () {
        delay(this.worker.resume, [], this.worker);
        return this;
    };
    /**
     * Pause the flow of chunks.
     */
    StreamHelper.prototype.pause = function () {
        this.worker.pause();
        return this;
    };
    return StreamHelper;
}());

var STORE = {
    magic: '\x00\x00',
    compressWorker: function () {
        return new GenericWorker('STORE compression');
    },
    uncompressWorker: function () {
        return new GenericWorker('STORE decompression');
    },
};

var compressions = /*#__PURE__*/Object.freeze({
    __proto__: null,
    STORE: STORE
});

var signature = {
    LOCAL_FILE_HEADER: 'PK\x03\x04',
    CENTRAL_FILE_HEADER: 'PK\x01\x02',
    CENTRAL_DIRECTORY_END: 'PK\x05\x06',
    ZIP64_CENTRAL_DIRECTORY_LOCATOR: 'PK\x06\x07',
    ZIP64_CENTRAL_DIRECTORY_END: 'PK\x06\x06',
    DATA_DESCRIPTOR: 'PK\x07\x08',
};

/**
 * Transform an integer into a string in hexadecimal.
 * @private
 * @param {number} dec the number to convert.
 * @param {number} bytes the number of bytes to generate.
 * @returns {string} the result.
 */
function decToHex(dec, bytes) {
    var hex = '', i;
    for (i = 0; i < bytes; i++) {
        hex += String.fromCharCode(dec & 0xff);
        dec = dec >>> 8;
    }
    return hex;
}
/**
 * Generate the UNIX part of the external file attributes.
 * @param {Object} unixPermissions the unix permissions or null.
 * @param {Boolean} isDir true if the entry is a directory, false otherwise.
 * @return {Number} a 32 bit integer.
 *
 * adapted from http://unix.stackexchange.com/questions/14705/the-zip-formats-external-file-attribute :
 *
 * TTTTsstrwxrwxrwx0000000000ADVSHR
 * ^^^^____________________________ file type, see zipinfo.c (UNX_*)
 *     ^^^_________________________ setuid, setgid, sticky
 *        ^^^^^^^^^________________ permissions
 *                 ^^^^^^^^^^______ not used ?
 *                           ^^^^^^ DOS attribute bits : Archive, Directory, Volume label, System file, Hidden, Read only
 */
function generateUnixExternalFileAttr(unixPermissions, isDir) {
    var result = unixPermissions;
    if (!unixPermissions) {
        // I can't use octal values in strict mode, hence the hexa.
        //  040775 => 0x41fd
        // 0100664 => 0x81b4
        result = isDir ? 0x41fd : 0x81b4;
    }
    return (result & 0xffff) << 16;
}
/**
 * Generate the DOS part of the external file attributes.
 * @param {Object} dosPermissions the dos permissions or null.
 * @param {Boolean} isDir true if the entry is a directory, false otherwise.
 * @return {Number} a 32 bit integer.
 *
 * Bit 0     Read-Only
 * Bit 1     Hidden
 * Bit 2     System
 * Bit 3     Volume Label
 * Bit 4     Directory
 * Bit 5     Archive
 */
function generateDosExternalFileAttr(dosPermissions, isDir) {
    // the dir flag is already set for compatibility
    return (dosPermissions || 0) & 0x3f;
}
/**
 * Generate the various parts used in the construction of the final zip file.
 * @param {Object} streamInfo the hash with information about the compressed file.
 * @param {Boolean} streamedContent is the content streamed ?
 * @param {Boolean} streamingEnded is the stream finished ?
 * @param {number} offset the current offset from the start of the zip file.
 * @param {String} platform let's pretend we are this platform (change platform dependents fields)
 * @param {Function} encodeFileName the function to encode the file name / comment.
 * @return {Object} the zip parts.
 */
function generateZipParts(streamInfo, streamedContent, streamingEnded, offset, platform, encodeFileName) {
    var file = streamInfo['file'];
    var compression = streamInfo['compression'];
    var useCustomEncoding = encodeFileName !== utf8encode;
    var encodedFileName = transformTo('string', encodeFileName(file.name));
    var utfEncodedFileName = transformTo('string', utf8encode(file.name));
    var comment = file.comment;
    var encodedComment = transformTo('string', encodeFileName(comment));
    var utfEncodedComment = transformTo('string', utf8encode(comment));
    var useUTF8ForFileName = utfEncodedFileName.length !== file.name.length;
    var useUTF8ForComment = utfEncodedComment.length !== comment.length;
    var dosTime;
    var dosDate;
    var extraFields = '';
    var unicodePathExtraField = '';
    var unicodeCommentExtraField = '';
    var dir = file.dir;
    var date = file.date;
    var dataInfo = {
        crc32: 0,
        compressedSize: 0,
        uncompressedSize: 0,
    };
    // if the content is streamed, the sizes/crc32 are only available AFTER
    // the end of the stream.
    if (!streamedContent || streamingEnded) {
        dataInfo.crc32 = streamInfo['crc32'];
        dataInfo.compressedSize = streamInfo['compressedSize'];
        dataInfo.uncompressedSize = streamInfo['uncompressedSize'];
    }
    var bitflag = 0;
    if (streamedContent) {
        // Bit 3: the sizes/crc32 are set to zero in the local header.
        // The correct values are put in the data descriptor immediately
        // following the compressed data.
        bitflag |= 0x0008;
    }
    if (!useCustomEncoding && (useUTF8ForFileName || useUTF8ForComment)) {
        // Bit 11: Language encoding flag (EFS).
        bitflag |= 0x0800;
    }
    var extFileAttr = 0;
    var versionMadeBy = 0;
    if (dir) {
        // dos or unix, we set the dos dir flag
        extFileAttr |= 0x00010;
    }
    if (platform === 'UNIX') {
        versionMadeBy = 0x031e; // UNIX, version 3.0
        extFileAttr |= generateUnixExternalFileAttr(file.unixPermissions, dir);
    }
    else {
        // DOS or other, fallback to DOS
        versionMadeBy = 0x0014; // DOS, version 2.0
        extFileAttr |= generateDosExternalFileAttr(file.dosPermissions);
    }
    // date
    // @see http://www.delorie.com/djgpp/doc/rbinter/it/52/13.html
    // @see http://www.delorie.com/djgpp/doc/rbinter/it/65/16.html
    // @see http://www.delorie.com/djgpp/doc/rbinter/it/66/16.html
    dosTime = date.getUTCHours();
    dosTime = dosTime << 6;
    dosTime = dosTime | date.getUTCMinutes();
    dosTime = dosTime << 5;
    dosTime = dosTime | (date.getUTCSeconds() / 2);
    dosDate = date.getUTCFullYear() - 1980;
    dosDate = dosDate << 4;
    dosDate = dosDate | (date.getUTCMonth() + 1);
    dosDate = dosDate << 5;
    dosDate = dosDate | date.getUTCDate();
    if (useUTF8ForFileName) {
        // set the unicode path extra field. unzip needs at least one extra
        // field to correctly handle unicode path, so using the path is as good
        // as any other information. This could improve the situation with
        // other archive managers too.
        // This field is usually used without the utf8 flag, with a non
        // unicode path in the header (winrar, winzip). This helps (a bit)
        // with the messy Windows' default compressed folders feature but
        // breaks on p7zip which doesn't seek the unicode path extra field.
        // So for now, UTF-8 everywhere !
        unicodePathExtraField =
            // Version
            decToHex(1, 1) +
                // NameCRC32
                decToHex(crc32wrapper(encodedFileName), 4) +
                // UnicodeName
                utfEncodedFileName;
        extraFields +=
            // Info-ZIP Unicode Path Extra Field
            '\x75\x70' +
                // size
                decToHex(unicodePathExtraField.length, 2) +
                // content
                unicodePathExtraField;
    }
    if (useUTF8ForComment) {
        unicodeCommentExtraField =
            // Version
            decToHex(1, 1) +
                // CommentCRC32
                decToHex(crc32wrapper(encodedComment), 4) +
                // UnicodeName
                utfEncodedComment;
        extraFields +=
            // Info-ZIP Unicode Path Extra Field
            '\x75\x63' +
                // size
                decToHex(unicodeCommentExtraField.length, 2) +
                // content
                unicodeCommentExtraField;
    }
    var header = '';
    // version needed to extract
    header += '\x0A\x00';
    // general purpose bit flag
    header += decToHex(bitflag, 2);
    // compression method
    header += compression.magic;
    // last mod file time
    header += decToHex(dosTime, 2);
    // last mod file date
    header += decToHex(dosDate, 2);
    // crc-32
    header += decToHex(dataInfo.crc32, 4);
    // compressed size
    header += decToHex(dataInfo.compressedSize, 4);
    // uncompressed size
    header += decToHex(dataInfo.uncompressedSize, 4);
    // file name length
    header += decToHex(encodedFileName.length, 2);
    // extra field length
    header += decToHex(extraFields.length, 2);
    var fileRecord = signature.LOCAL_FILE_HEADER + header + encodedFileName + extraFields;
    var dirRecord = signature.CENTRAL_FILE_HEADER +
        // version made by (00: DOS)
        decToHex(versionMadeBy, 2) +
        // file header (common to file and central directory)
        header +
        // file comment length
        decToHex(encodedComment.length, 2) +
        // disk number start
        '\x00\x00' +
        // internal file attributes TODO
        '\x00\x00' +
        // external file attributes
        decToHex(extFileAttr, 4) +
        // relative offset of local header
        decToHex(offset, 4) +
        // file name
        encodedFileName +
        // extra field
        extraFields +
        // file comment
        encodedComment;
    return {
        fileRecord: fileRecord,
        dirRecord: dirRecord,
    };
}
/**
 * Generate the EOCD record.
 * @param {Number} entriesCount the number of entries in the zip file.
 * @param {Number} centralDirLength the length (in bytes) of the central dir.
 * @param {Number} localDirLength the length (in bytes) of the local dir.
 * @param {String} comment the zip file comment as a binary string.
 * @param {Function} encodeFileName the function to encode the comment.
 * @return {String} the EOCD record.
 */
function generateCentralDirectoryEnd(entriesCount, centralDirLength, localDirLength, comment, encodeFileName) {
    var dirEnd = '';
    var encodedComment = transformTo('string', encodeFileName(comment));
    // end of central dir signature
    dirEnd =
        signature.CENTRAL_DIRECTORY_END +
            // number of this disk
            '\x00\x00' +
            // number of the disk with the start of the central directory
            '\x00\x00' +
            // total number of entries in the central directory on this disk
            decToHex(entriesCount, 2) +
            // total number of entries in the central directory
            decToHex(entriesCount, 2) +
            // size of the central directory   4 bytes
            decToHex(centralDirLength, 4) +
            // offset of start of central directory with respect to the starting disk number
            decToHex(localDirLength, 4) +
            // .ZIP file comment length
            decToHex(encodedComment.length, 2) +
            // .ZIP file comment
            encodedComment;
    return dirEnd;
}
/**
 * Generate data descriptors for a file entry.
 * @param {Object} streamInfo the hash generated by a worker, containing information
 * on the file entry.
 * @return {String} the data descriptors.
 */
function generateDataDescriptors(streamInfo) {
    var descriptor = '';
    descriptor =
        signature.DATA_DESCRIPTOR +
            // crc-32                          4 bytes
            decToHex(streamInfo['crc32'], 4) +
            // compressed size                 4 bytes
            decToHex(streamInfo['compressedSize'], 4) +
            // uncompressed size               4 bytes
            decToHex(streamInfo['uncompressedSize'], 4);
    return descriptor;
}
/**
 * A worker to concatenate other workers to create a zip file.
 * @param {Boolean} streamFiles `true` to stream the content of the files,
 * `false` to accumulate it.
 * @param {String} comment the comment to use.
 * @param {String} platform the platform to use, "UNIX" or "DOS".
 * @param {Function} encodeFileName the function to encode file names and comments.
 */
var ZipFileWorker = /** @class */ (function (_super) {
    __extends(ZipFileWorker, _super);
    function ZipFileWorker(streamFiles, platform, encodeFileName) {
        var _this = _super.call(this, 'ZipFileWorker') || this;
        // The number of bytes written so far. This doesn't count accumulated chunks.
        _this.bytesWritten = 0;
        // The platform "generating" the zip file.
        _this.zipPlatform = platform;
        // the function to encode file names and comments.
        _this.encodeFileName = encodeFileName;
        // Should we stream the content of the files ?
        _this.streamFiles = streamFiles;
        // If `streamFiles` is false, we will need to accumulate the content of the
        // files to calculate sizes / crc32 (and write them *before* the content).
        // This boolean indicates if we are accumulating chunks (it will change a lot
        // during the lifetime of this worker).
        _this.accumulate = false;
        // The buffer receiving chunks when accumulating content.
        _this.contentBuffer = [];
        // The list of generated directory records.
        _this.dirRecords = [];
        // The offset (in bytes) from the beginning of the zip file for the current source.
        _this.currentSourceOffset = 0;
        // The total number of entries in this zip file.
        _this.entriesCount = 0;
        // the name of the file currently being added, null when handling the end of the zip file.
        // Used for the emitted metadata.
        _this.currentFile = null;
        _this._sources = [];
        return _this;
    }
    /**
     * @see GenericWorker.push
     */
    ZipFileWorker.prototype.push = function (chunk) {
        var currentFilePercent = chunk.meta.percent || 0;
        var entriesCount = this.entriesCount;
        var remainingFiles = this._sources.length;
        if (this.accumulate) {
            this.contentBuffer.push(chunk);
        }
        else {
            this.bytesWritten += chunk.data.length;
            GenericWorker.prototype.push.call(this, {
                data: chunk.data,
                meta: {
                    currentFile: this.currentFile,
                    percent: entriesCount
                        ? (currentFilePercent + 100 * (entriesCount - remainingFiles - 1)) /
                            entriesCount
                        : 100,
                },
            });
        }
    };
    /**
     * The worker started a new source (an other worker).
     * @param {Object} streamInfo the streamInfo object from the new source.
     */
    ZipFileWorker.prototype.openedSource = function (streamInfo) {
        this.currentSourceOffset = this.bytesWritten;
        this.currentFile = streamInfo['file'].name;
        var streamedContent = this.streamFiles && !streamInfo['file'].dir;
        // don't stream folders (because they don't have any content)
        if (streamedContent) {
            var record = generateZipParts(streamInfo, streamedContent, false, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
            this.push({
                data: record.fileRecord,
                meta: { percent: 0 },
            });
        }
        else {
            // we need to wait for the whole file before pushing anything
            this.accumulate = true;
        }
    };
    /**
     * The worker finished a source (an other worker).
     * @param {Object} streamInfo the streamInfo object from the finished source.
     */
    ZipFileWorker.prototype.closedSource = function (streamInfo) {
        this.accumulate = false;
        var streamedContent = this.streamFiles && !streamInfo['file'].dir;
        var record = generateZipParts(streamInfo, streamedContent, true, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
        this.dirRecords.push(record.dirRecord);
        if (streamedContent) {
            // after the streamed file, we put data descriptors
            this.push({
                data: generateDataDescriptors(streamInfo),
                meta: { percent: 100 },
            });
        }
        else {
            // the content wasn't streamed, we need to push everything now
            // first the file record, then the content
            this.push({
                data: record.fileRecord,
                meta: { percent: 0 },
            });
            while (this.contentBuffer.length) {
                this.push(this.contentBuffer.shift());
            }
        }
        this.currentFile = null;
    };
    /**
     * @see GenericWorker.flush
     */
    ZipFileWorker.prototype.flush = function () {
        var localDirLength = this.bytesWritten;
        for (var i = 0; i < this.dirRecords.length; i++) {
            this.push({
                data: this.dirRecords[i],
                meta: { percent: 100 },
            });
        }
        var centralDirLength = this.bytesWritten - localDirLength;
        var dirEnd = generateCentralDirectoryEnd(this.dirRecords.length, centralDirLength, localDirLength, '', this.encodeFileName);
        this.push({
            data: dirEnd,
            meta: { percent: 100 },
        });
    };
    /**
     * Prepare the next source to be read.
     */
    ZipFileWorker.prototype.prepareNextSource = function () {
        this.previous = this._sources.shift();
        this.openedSource(this.previous.streamInfo);
        if (this.isPaused) {
            this.previous.pause();
        }
        else {
            this.previous.resume();
        }
    };
    /**
     * @see GenericWorker.registerPrevious
     */
    ZipFileWorker.prototype.registerPrevious = function (previous) {
        this._sources.push(previous);
        var self = this;
        previous.on('data', function (chunk) {
            self.processChunk(chunk);
        });
        previous.on('end', function () {
            self.closedSource(self.previous.streamInfo);
            if (self._sources.length) {
                self.prepareNextSource();
            }
            else {
                self.end();
            }
        });
        previous.on('error', function (e) {
            self.error(e);
        });
        return this;
    };
    /**
     * @see GenericWorker.resume
     */
    ZipFileWorker.prototype.resume = function () {
        if (!GenericWorker.prototype.resume.call(this)) {
            return false;
        }
        if (!this.previous && this._sources.length) {
            this.prepareNextSource();
            return true;
        }
        if (!this.previous && !this._sources.length && !this.generatedError) {
            this.end();
            return true;
        }
    };
    /**
     * @see GenericWorker.error
     */
    ZipFileWorker.prototype.error = function (e) {
        var sources = this._sources;
        if (!GenericWorker.prototype.error.call(this, e)) {
            return false;
        }
        for (var i = 0; i < sources.length; i++) {
            try {
                sources[i].error(e);
            }
            catch (e) {
                // the `error` exploded, nothing to do
            }
        }
        return true;
    };
    /**
     * @see GenericWorker.lock
     */
    ZipFileWorker.prototype.lock = function () {
        GenericWorker.prototype.lock.call(this);
        var sources = this._sources;
        for (var i = 0; i < sources.length; i++) {
            sources[i].lock();
        }
    };
    return ZipFileWorker;
}(GenericWorker));

/**
 * Find the compression to use.
 * @param {String} fileCompression the compression defined at the file level, if any.
 * @param {String} zipCompression the compression defined at the load() level.
 * @return {Object} the compression object to use.
 */
function getCompression(fileCompression, zipCompression) {
    var compressionName = fileCompression || zipCompression;
    var compression = compressions[compressionName];
    if (!compression) {
        throw new Error(compressionName + ' is not a valid compression method !');
    }
    return compression;
}
/**
 * Create a worker to generate a zip file.
 * @param {JSZip} zip the JSZip instance at the right root level.
 * @param {Object} options to generate the zip file.
 */
function generateWorker(zip, options) {
    var zipFileWorker = new ZipFileWorker(options.streamFiles, options.platform, options.encodeFileName);
    var entriesCount = 0;
    try {
        zip.forEach(function (relativePath, file) {
            entriesCount++;
            var compression = getCompression(file.options.compression, options.compression);
            var compressionOptions = file.options.compressionOptions || options.compressionOptions || {};
            var dir = file.dir, date = file.date;
            file
                ._compressWorker(compression, compressionOptions)
                .withStreamInfo('file', {
                name: relativePath,
                dir: dir,
                date: date,
                comment: file.comment || '',
                unixPermissions: file.unixPermissions,
                dosPermissions: file.dosPermissions,
            })
                .pipe(zipFileWorker);
        });
        zipFileWorker.entriesCount = entriesCount;
    }
    catch (e) {
        zipFileWorker.error(e);
    }
    return zipFileWorker;
}

function forceTrailingSlash(path) {
    if (path.slice(-1) !== '/') {
        return path + "/";
    }
    return path;
}
function removeTrailingSlash(path) {
    if (path.slice(-1) === '/') {
        return path.substr(0, path.length - 1);
    }
    return path;
}
function parentFolder(path) {
    var lastSlash = removeTrailingSlash(path).lastIndexOf('/');
    return lastSlash > 0 ? path.substring(0, lastSlash) : '';
}
var JSZip = /** @class */ (function () {
    function JSZip() {
        // object containing the files :
        // {
        //   "folder/" : {...},
        //   "folder/data.txt" : {...}
        // }
        this.files = {};
        this.comment = null;
        // Where we are in the hierarchy
        this.root = '';
        this.support = support;
        this.defaults = defaults;
        this.version = '3.2.0';
    }
    JSZip.prototype.clone = function () {
        var newObj = new JSZip();
        for (var i in this) {
            if (typeof this[i] !== 'function') {
                newObj[i] = this[i];
            }
        }
        return newObj;
    };
    /**
     * Call a callback function for each entry at this folder level.
     */
    JSZip.prototype.forEach = function (cb) {
        for (var filename in this.files) {
            if (!Object.prototype.hasOwnProperty.call(this.files, filename)) {
                continue;
            }
            var file = this.files[filename];
            var relativePath = filename.slice(this.root.length, filename.length);
            if (relativePath && filename.slice(0, this.root.length) === this.root) {
                // the file is in the current root
                cb(relativePath, file); // TODO reverse the parameters ? need to be clean AND consistent with the filter search fn...
            }
        }
    };
    /**
     * Add a (sub) folder in the current folder.
     */
    JSZip.prototype.folderAdd = function (name, createFolders) {
        if (createFolders === void 0) { createFolders = defaults.createFolders; }
        name = forceTrailingSlash(name);
        // Does this folder already exist?
        if (!this.files[name]) {
            this.fileAdd(name, null, {
                dir: true,
                createFolders: createFolders,
            });
        }
        return this.files[name];
    };
    /**
     * Add a file in the current folder.
     */
    JSZip.prototype.fileAdd = function (name, data, originalOptions) {
        var o = __assign(__assign({}, defaults), originalOptions);
        o.date = o.date || new Date();
        if (o.compression !== null) {
            o.compression = o.compression.toUpperCase();
        }
        if (typeof o.unixPermissions === 'string') {
            o.unixPermissions = parseInt(o.unixPermissions, 8);
        }
        // UNX_IFDIR  0040000 see zipinfo.c
        if (o.unixPermissions && o.unixPermissions & 0x4000) {
            o.dir = true;
        }
        // Bit 4    Directory
        if (o.dosPermissions && o.dosPermissions & 0x0010) {
            o.dir = true;
        }
        if (o.dir) {
            name = forceTrailingSlash(name);
        }
        // be sure sub folders exist
        var parent;
        if (o.createFolders && (parent = parentFolder(name))) {
            this.folderAdd(parent, true);
        }
        o.binary = o.binary || o.base64;
        if (o.dir || !data || data.length === 0) {
            o.base64 = false;
            o.binary = true;
            data = '';
            o.compression = 'STORE';
        }
        var zipObjectContent = prepareContent(data, o.base64);
        var object = new ZipObject(name, zipObjectContent, o);
        this.files[name] = object;
    };
    JSZip.prototype.file = function (name, data) {
        this.fileAdd(this.root + name, data);
        return this;
    };
    JSZip.prototype.folder = function (name) {
        name = this.root + name;
        var newFolder = this.folderAdd(name);
        // Allow chaining by returning a new object with this folder as the root
        var ret = this.clone();
        ret.root = newFolder.name;
        return ret;
    };
    /**
     * Generate the complete zip file as an internal stream.
     * @return {StreamHelper} the streamed zip file.
     */
    JSZip.prototype.generateAsync = function () {
        var options = {
            streamFiles: false,
            compression: 'STORE',
            compressionOptions: null,
            type: 'blob',
            platform: 'DOS',
            comment: null,
            mimeType: 'application/zip',
            encodeFileName: utf8encode,
        };
        var worker;
        try {
            checkSupport('blob');
            worker = generateWorker(this, options);
        }
        catch (e) {
            worker = new GenericWorker('error');
            worker.error(e);
        }
        return new StreamHelper(worker).accumulate();
    };
    return JSZip;
}());

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var FileSaver_min = createCommonjsModule(function (module, exports) {
(function(a,b){b();})(commonjsGlobal,function(){function b(a,b){return "undefined"==typeof b?b={autoBom:!1}:"object"!=typeof b&&(console.warn("Deprecated: Expected third argument to be a object"),b={autoBom:!b}),b.autoBom&&/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(a.type)?new Blob(["\uFEFF",a],{type:a.type}):a}function c(b,c,d){var e=new XMLHttpRequest;e.open("GET",b),e.responseType="blob",e.onload=function(){a(e.response,c,d);},e.onerror=function(){console.error("could not download file");},e.send();}function d(a){var b=new XMLHttpRequest;b.open("HEAD",a,!1);try{b.send();}catch(a){}return 200<=b.status&&299>=b.status}function e(a){try{a.dispatchEvent(new MouseEvent("click"));}catch(c){var b=document.createEvent("MouseEvents");b.initMouseEvent("click",!0,!0,window,0,0,0,80,20,!1,!1,!1,!1,0,null),a.dispatchEvent(b);}}var f="object"==typeof window&&window.window===window?window:"object"==typeof self&&self.self===self?self:"object"==typeof commonjsGlobal&&commonjsGlobal.global===commonjsGlobal?commonjsGlobal:void 0,a=f.saveAs||("object"!=typeof window||window!==f?function(){}:"download"in HTMLAnchorElement.prototype?function(b,g,h){var i=f.URL||f.webkitURL,j=document.createElement("a");g=g||b.name||"download",j.download=g,j.rel="noopener","string"==typeof b?(j.href=b,j.origin===location.origin?e(j):d(j.href)?c(b,g,h):e(j,j.target="_blank")):(j.href=i.createObjectURL(b),setTimeout(function(){i.revokeObjectURL(j.href);},4E4),setTimeout(function(){e(j);},0));}:"msSaveOrOpenBlob"in navigator?function(f,g,h){if(g=g||f.name||"download","string"!=typeof f)navigator.msSaveOrOpenBlob(b(f,h),g);else if(d(f))c(f,g,h);else{var i=document.createElement("a");i.href=f,i.target="_blank",setTimeout(function(){e(i);});}}:function(a,b,d,e){if(e=e||open("","_blank"),e&&(e.document.title=e.document.body.innerText="downloading..."),"string"==typeof a)return c(a,b,d);var g="application/octet-stream"===a.type,h=/constructor/i.test(f.HTMLElement)||f.safari,i=/CriOS\/[\d]+/.test(navigator.userAgent);if((i||g&&h)&&"object"==typeof FileReader){var j=new FileReader;j.onloadend=function(){var a=j.result;a=i?a:a.replace(/^data:[^;]*;/,"data:attachment/file;"),e?e.location.href=a:location=a,e=null;},j.readAsDataURL(a);}else{var k=f.URL||f.webkitURL,l=k.createObjectURL(a);e?e.location=l:location.href=l,e=null,setTimeout(function(){k.revokeObjectURL(l);},4E4);}});f.saveAs=a.saveAs=a,(module.exports=a);});


});
var FileSaver_min_1 = FileSaver_min.saveAs;

var xmlMetadata = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
function objectToTag(obj) {
    if (typeof obj !== 'object') {
        return obj.toString();
    }
    var raw = ["<" + obj._t];
    for (var key in obj) {
        if (!key.startsWith('_') && obj[key] !== undefined) {
            raw.push(" " + key + "=\"" + obj[key] + "\"");
        }
    }
    if (obj._c && obj._c.length > 0) {
        raw.push('>');
        for (var _i = 0, _a = obj._c; _i < _a.length; _i++) {
            var content = _a[_i];
            raw.push(objectToTag(content));
        }
        raw.push("</" + obj._t + ">");
    }
    else {
        raw.push('/>');
    }
    return raw.join('');
}
function jsonToXml(obj) {
    return xmlMetadata + objectToTag(obj);
}

function resolveColor(color) {
    var c = color[0] === '#' ? color.substr(1) : color;
    c = c.toUpperCase();
    if (c.length === 3) {
        return "FF" + (c[0] + c[0] + c[1] + c[1] + c[2] + c[2]);
    }
    else if (c.length === 6) {
        return "FF" + c;
    }
    else if (c.length === 8) {
        return c.substring(6, 8) + c.substring(0, 6);
    }
    else {
        throw new Error("Invalid color provided: " + color);
    }
}

var Cell = /** @class */ (function () {
    function Cell(sheet, row, col) {
        this.sheet = sheet;
        this.row = row;
        this.col = col;
    }
    Cell.prototype.set = function (value, options) {
        this.sheet.set(value, __assign({ row: this.row, col: this.col }, options));
    };
    Cell.prototype.get = function () {
        return this.sheet.get({
            row: this.row,
            col: this.col,
        });
    };
    return Cell;
}());

var Col = /** @class */ (function () {
    function Col(sheet, index, data) {
        this.sheet = sheet;
        this.index = index;
        data.width = data.width || null;
        this.data = data;
    }
    Col.prototype.row = function (index) {
        return new Cell(this.sheet, index, this.index);
    };
    Col.prototype.width = function (value) {
        if (value) {
            this.data.width = value;
        }
        else {
            return this.data.width;
        }
    };
    return Col;
}());

var Row = /** @class */ (function () {
    function Row(sheet, index, data) {
        this.sheet = sheet;
        this.index = index;
        data.height = data.height || null;
        this.data = data;
    }
    Row.prototype.col = function (index) {
        return new Cell(this.sheet, this.index, index);
    };
    Row.prototype.height = function (value) {
        if (value) {
            this.data.height = value;
        }
        else {
            return this.data.height;
        }
    };
    return Row;
}());

var Font = /** @class */ (function () {
    function Font(config) {
        this.config = config;
    }
    Font.prototype.export = function () {
        var _a = this.config, fontFamily = _a.fontFamily, fontSize = _a.fontSize, fontWeight = _a.fontWeight, textDecoration = _a.textDecoration, fontStyle = _a.fontStyle, color = _a.color;
        var content = [];
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
    };
    return Font;
}());

var Fill = /** @class */ (function () {
    function Fill(config) {
        this.config = config;
    }
    Fill.prototype.export = function () {
        var backgroundColor = this.config.backgroundColor;
        return {
            _t: 'fill',
            _c: [
                {
                    _t: 'patternFill',
                    patternType: 'solid',
                    _c: [
                        { _t: 'bgColor', rgb: resolveColor(backgroundColor) },
                        { _t: 'fgColor', rgb: resolveColor(backgroundColor) },
                    ],
                },
            ],
        };
    };
    return Fill;
}());

var Border = /** @class */ (function () {
    function Border(config) {
        this.config = config;
    }
    Border.prototype.export = function () {
        var _a = this.config, borderStyle = _a.borderStyle, borderColor = _a.borderColor, borderVerticalStyle = _a.borderVerticalStyle, borderVerticalColor = _a.borderVerticalColor, borderHorizontalStyle = _a.borderHorizontalStyle, borderHorizontalColor = _a.borderHorizontalColor, borderTopStyle = _a.borderTopStyle, borderTopColor = _a.borderTopColor, borderBottomStyle = _a.borderBottomStyle, borderBottomColor = _a.borderBottomColor, borderStartStyle = _a.borderStartStyle, borderStartColor = _a.borderStartColor, borderEndStyle = _a.borderEndStyle, borderEndColor = _a.borderEndColor;
        var topBorder = {
            style: borderTopStyle || borderVerticalStyle || borderStyle,
            color: borderTopColor || borderVerticalColor || borderColor,
        };
        var bottomBorder = {
            style: borderBottomStyle || borderVerticalStyle || borderStyle,
            color: borderBottomColor || borderVerticalColor || borderColor,
        };
        var startBorder = {
            style: borderStartStyle || borderHorizontalStyle || borderStyle,
            color: borderStartColor || borderHorizontalColor || borderColor,
        };
        var endBorder = {
            style: borderEndStyle || borderHorizontalStyle || borderStyle,
            color: borderEndColor || borderHorizontalColor || borderColor,
        };
        return {
            _t: 'border',
            _c: [
                {
                    _t: 'top',
                    style: topBorder.style,
                    _c: topBorder.color && [
                        { _t: 'color', rgb: resolveColor(topBorder.color) },
                    ],
                },
                {
                    _t: 'bottom',
                    style: bottomBorder.style,
                    _c: bottomBorder.color && [
                        { _t: 'color', rgb: resolveColor(bottomBorder.color) },
                    ],
                },
                {
                    _t: 'start',
                    style: startBorder.style,
                    _c: startBorder.color && [
                        { _t: 'color', rgb: resolveColor(startBorder.color) },
                    ],
                },
                {
                    _t: 'end',
                    style: endBorder.style,
                    _c: endBorder.color && [
                        { _t: 'color', rgb: resolveColor(endBorder.color) },
                    ],
                },
            ],
        };
    };
    return Border;
}());

var Style = /** @class */ (function () {
    function Style(config, index, elements) {
        this.alignment = null;
        this.index = index;
        if (config.fontFamily ||
            config.fontSize ||
            config.fontWeight ||
            config.textDecoration ||
            config.fontStyle ||
            config.color) {
            config.fontFamily = config.fontFamily || 'Arial';
            this.fontIndex = elements.fonts.length;
            elements.fonts.push(new Font(config));
        }
        if (config.backgroundColor) {
            this.fillIndex = elements.fills.length;
            elements.fills.push(new Fill(config));
        }
        if (config.borderStyle ||
            config.borderColor ||
            config.borderVerticalStyle ||
            config.borderVerticalColor ||
            config.borderHorizontalStyle ||
            config.borderHorizontalColor ||
            config.borderTopStyle ||
            config.borderTopColor ||
            config.borderBottomStyle ||
            config.borderBottomColor ||
            config.borderStartStyle ||
            config.borderStartColor ||
            config.borderEndStyle ||
            config.borderEndColor) {
            this.borderIndex = elements.borders.length;
            elements.borders.push(new Border(config));
        }
        if (config.textAlign || config.verticalAlign) {
            this.alignment = {
                textAlign: config.textAlign,
                verticalAlign: config.verticalAlign,
            };
        }
    }
    Style.prototype.export = function () {
        return {
            _t: 'xf',
            fontId: this.fontIndex,
            applyFont: typeof this.fontIndex === 'number' ? 'true' : undefined,
            fillId: this.fillIndex,
            applyFill: typeof this.fillIndex === 'number' ? 'true' : undefined,
            borderId: this.borderIndex,
            applyBorder: typeof this.borderIndex === 'number' ? 'true' : undefined,
            applyAlignment: this.alignment ? 'true' : undefined,
            _c: [
                this.alignment && {
                    _t: 'alignment',
                    horizontal: this.alignment.textAlign,
                    vertical: this.alignment.verticalAlign === 'middle'
                        ? 'center'
                        : this.alignment.verticalAlign,
                },
            ].filter(Boolean),
        };
    };
    return Style;
}());

function colIndexToLabel(index) {
    var label = '';
    while (index > 0) {
        var t = (index - 1) % 26;
        label = String.fromCharCode(65 + t) + label;
        index = ((index - t) / 26) | 0;
    }
    return label;
}
var Sheet = /** @class */ (function () {
    function Sheet(book, name) {
        this.data = {};
        this.rowsData = {};
        this.colsData = {};
        this.styles = {
            rtl: false,
        };
        this.filters = [];
        this.book = book;
        this.name = name;
    }
    Sheet.prototype.col = function (index) {
        this.colsData[index] = this.colsData[index] || {};
        return new Col(this, index, this.colsData[index]);
    };
    Sheet.prototype.row = function (index) {
        this.rowsData[index] = this.rowsData[index] || {};
        return new Row(this, index, this.rowsData[index]);
    };
    Sheet.prototype.cell = function (row, col) {
        return new Cell(this, row, col);
    };
    Sheet.prototype.set = function (value, options) {
        var type = options.type;
        var row = options.row, col = options.col, style = options.style;
        if (!type) {
            if (typeof value === 'string') {
                type = 'string';
            }
            else if (typeof value === 'number') {
                type = 'number';
            }
            else {
                throw new Error('Invalid cell value type. Only numbers and strings are allowed.');
            }
        }
        if (!this.data[row]) {
            this.data[row] = {};
        }
        if (!this.data[row][col]) {
            this.data[row][col] = {};
        }
        var cell = this.data[row][col];
        if (style) {
            if (style instanceof Style) {
                cell.s = style.index;
            }
            else {
                cell.s = this.book.style(style).index;
            }
        }
        if (type === 'string') {
            cell.t = 'inlineStr';
        }
        else if (type === 'number') {
            cell.t = 'n';
        }
        else {
            throw new Error("Invalid cell type provided: " + type);
        }
        cell.v = value;
    };
    Sheet.prototype.get = function (position) {
        var row = position.row, col = position.col;
        if (!this.data[row] || !this.data[row][col]) {
            return null;
        }
        return this.data[row][col].v;
    };
    Sheet.prototype.style = function (styles) {
        this.styles = __assign(__assign({}, this.styles), styles);
    };
    Sheet.prototype.addFilter = function (range) {
        this.filters.push(colIndexToLabel(range.from.col) +
            range.from.row +
            ':' +
            colIndexToLabel(range.to.col) +
            range.to.row);
    };
    Sheet.prototype.export = function () {
        return jsonToXml({
            _t: 'worksheet',
            xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
            'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
            _c: __spreadArrays([
                this.exportStyles(),
                this.exportColumns(),
                this.exportData()
            ], this.exportFilters()).filter(Boolean),
        });
    };
    Sheet.prototype.exportStyles = function () {
        return {
            _t: 'sheetViews',
            _c: [
                {
                    _t: 'sheetView',
                    rightToLeft: this.styles.rtl ? 'true' : 'false',
                    workbookViewId: '0',
                },
            ],
        };
    };
    Sheet.prototype.exportData = function () {
        var content = [];
        for (var row in this.data) {
            var rowContent = [];
            for (var col in this.data[row]) {
                var cell = this.data[row][col];
                var colContent = [];
                if (cell.t === 'inlineStr') {
                    colContent.push({
                        _t: 'is',
                        _c: [{ _t: 't', _c: [cell.v] }],
                    });
                }
                else {
                    colContent.push({ _t: 'v', _c: [cell.v] });
                }
                rowContent.push({
                    _t: 'c',
                    t: cell.t,
                    s: cell.s,
                    r: colIndexToLabel(col) + row,
                    _c: colContent,
                });
            }
            var rowData = this.rowsData[row] || {};
            content.push({
                _t: 'row',
                customHeight: typeof rowData.height === 'number' ? 'true' : 'false',
                ht: typeof rowData.height === 'number' ? rowData.height : undefined,
                r: row,
                _c: rowContent,
            });
        }
        return { _t: 'sheetData', _c: content };
    };
    Sheet.prototype.exportFilters = function () {
        return this.filters.map(function (filter) { return ({ _t: 'autoFilter', ref: filter }); });
    };
    Sheet.prototype.exportColumns = function () {
        var _this = this;
        if (!Object.keys(this.colsData).length) {
            return null;
        }
        return {
            _t: 'cols',
            _c: Object.keys(this.colsData).map(function (columnIndex) { return ({
                _t: 'col',
                min: columnIndex,
                max: columnIndex,
                customWidth: typeof _this.colsData[columnIndex].width === 'number'
                    ? 'true'
                    : 'false',
                width: typeof _this.colsData[columnIndex].width === 'number'
                    ? _this.colsData[columnIndex].width
                    : undefined,
            }); }),
        };
    };
    return Sheet;
}());

var XLSX = /** @class */ (function () {
    function XLSX() {
        this.sheets = [];
        this.styles = [];
        this.styleElements = {
            fonts: [],
            fills: [],
            borders: [],
        };
        this.style({ fontFamily: 'Arial' });
    }
    XLSX.prototype.sheet = function (name) {
        var sheet = new Sheet(this, name);
        this.sheets.push(sheet);
        return sheet;
    };
    XLSX.prototype.style = function (config) {
        var style = new Style(config, this.styles.length, this.styleElements);
        this.styles.push(style);
        return style;
    };
    XLSX.prototype.save = function (filename) {
        var zip = new JSZip();
        var rels = zip.folder('_rels');
        var xl = zip.folder('xl');
        var xlRels = xl.folder('_rels');
        var xlWorksheets = xl.folder('worksheets');
        zip.file('[Content_Types].xml', jsonToXml({
            _t: 'Types',
            xmlns: 'http://schemas.openxmlformats.org/package/2006/content-types',
            _c: __spreadArrays([
                {
                    _t: 'Default',
                    Extension: 'rels',
                    ContentType: 'application/vnd.openxmlformats-package.relationships+xml',
                },
                {
                    _t: 'Override',
                    PartName: '/xl/workbook.xml',
                    ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml',
                },
                {
                    _t: 'Override',
                    PartName: '/xl/styles.xml',
                    ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml',
                }
            ], this.sheets.map(function (sheet, index) { return ({
                _t: 'Override',
                PartName: "/xl/worksheets/sheet" + (index + 1) + ".xml",
                ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml',
            }); })),
        }));
        rels.file('.rels', jsonToXml({
            _t: 'Relationships',
            xmlns: 'http://schemas.openxmlformats.org/package/2006/relationships',
            _c: [
                {
                    _t: 'Relationship',
                    Id: 'rId1',
                    Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
                    Target: 'xl/workbook.xml',
                },
            ],
        }));
        xl.file('workbook.xml', jsonToXml({
            _t: 'workbook',
            xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
            'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
            _c: [
                {
                    _t: 'sheets',
                    _c: this.sheets.map(function (sheet, index) { return ({
                        _t: 'sheet',
                        name: sheet.name,
                        sheetId: (index + 1).toString(),
                        'r:id': "rId" + (index + 2),
                    }); }),
                },
            ],
        }));
        xlRels.file('workbook.xml.rels', jsonToXml({
            _t: 'Relationships',
            xmlns: 'http://schemas.openxmlformats.org/package/2006/relationships',
            _c: __spreadArrays([
                {
                    _t: 'Relationship',
                    Id: 'rId1',
                    Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
                    Target: 'styles.xml',
                }
            ], this.sheets.map(function (sheet, index) { return ({
                _t: 'Relationship',
                Id: "rId" + (index + 2),
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet',
                Target: "worksheets/sheet" + (index + 1) + ".xml",
            }); })),
        }));
        for (var i = 0; i < this.sheets.length; i++) {
            xlWorksheets.file("sheet" + (i + 1) + ".xml", this.sheets[i].export());
        }
        xl.file('styles.xml', jsonToXml({
            _t: 'styleSheet',
            xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
            'xmlns:x14ac': 'http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac',
            'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
            _c: [
                {
                    _t: 'fonts',
                    count: this.styleElements.fonts.length,
                    _c: this.styleElements.fonts.map(function (font) { return font.export(); }),
                },
                {
                    _t: 'fills',
                    count: this.styleElements.fills.length,
                    _c: this.styleElements.fills.map(function (fill) { return fill.export(); }),
                },
                {
                    _t: 'borders',
                    count: this.styleElements.borders.length,
                    _c: this.styleElements.borders.map(function (border) { return border.export(); }),
                },
                {
                    _t: 'cellXfs',
                    count: this.styles.length,
                    _c: this.styles.map(function (style) { return style.export(); }),
                },
            ],
        }));
        zip.generateAsync().then(function (blob) {
            FileSaver_min_1(blob, filename);
        });
    };
    return XLSX;
}());

export default XLSX;
