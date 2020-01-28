import GenericWorker from './stream/GenericWorker';
/**
 * Represent a compressed object, with everything needed to decompress it.
 * @constructor
 * @param {number} compressedSize the size of the data compressed.
 * @param {number} uncompressedSize the size of the data after decompression.
 * @param {number} crc32 the crc32 of the decompressed file.
 * @param {object} compression the type of compression, see lib/compressions.js.
 * @param {String|ArrayBuffer|Uint8Array|Buffer} data the compressed data.
 */
export default class CompressedObject {
    /**
     * Chain the given worker with other workers to compress the content with the
     * given compression.
     * @param {GenericWorker} uncompressedWorker the worker to pipe.
     * @param {Object} compression the compression object.
     * @param {Object} compressionOptions the options to use when compressing.
     * @return {GenericWorker} the new worker compressing the content.
     */
    static createWorkerFrom(uncompressedWorker: GenericWorker, compression: any, compressionOptions: any): GenericWorker;
}
