import DataWorker from './stream/DataWorker';
import CompressedObject from './compressedObject';
import GenericWorker from './stream/GenericWorker';

/**
 * A simple object representing a file in the zip file.
 * @constructor
 * @param {String|ArrayBuffer|Uint8Array|Buffer} data the data
 * @param {Object} options the options of the file
 */
export default class ZipObject {
  name: string;
  data: Promise<string>;
  dir: any;
  date: any;
  comment: any;
  unixPermissions: any;
  dosPermissions: any;
  options: any;

  constructor(name: string, data: Promise<string>, options) {
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
  _compressWorker(compression, compressionOptions): GenericWorker {
    const result = new DataWorker(this.data);
    return CompressedObject.createWorkerFrom(
      result,
      compression,
      compressionOptions
    );
  }
}
