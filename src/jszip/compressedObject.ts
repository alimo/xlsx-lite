import DataLengthProbe from './stream/DataLengthProbe';
import Crc32Probe from './stream/Crc32Probe';
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
  compressedSize;
  uncompressedSize;
  crc32;
  compression;
  compressedContent;

  constructor(compressedSize, uncompressedSize, crc32, compression, data) {
    this.compressedSize = compressedSize;
    this.uncompressedSize = uncompressedSize;
    this.crc32 = crc32;
    this.compression = compression;
    this.compressedContent = data;
  }

  /**
   * Chain the given worker with other workers to compress the content with the
   * given compression.
   */
  static createWorkerFrom(
    uncompressedWorker: GenericWorker,
    compression,
    compressionOptions
  ): GenericWorker {
    return uncompressedWorker
      .pipe(new Crc32Probe())
      .pipe(new DataLengthProbe('uncompressedSize'))
      .pipe(compression.compressWorker(compressionOptions))
      .pipe(new DataLengthProbe('compressedSize'))
      .withStreamInfo('compression', compression);
  }
}
