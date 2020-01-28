/**
 * Transform a javascript string into an array (typed if possible) of bytes,
 * UTF-8 encoded.
 * @return {Array|Uint8Array|Buffer} the UTF-8 encoded string.
 */
export declare function utf8encode(str: string): Uint8Array | number[];
