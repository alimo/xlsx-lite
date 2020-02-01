import DataWorker from './stream/DataWorker';
import { Utf8EncodeWorker } from './utf8';
import CompressedObject from './compressedObject';
import GenericWorker from './stream/GenericWorker';

/**
 * A simple object representing a file in the zip file.
 * @constructor
 * @param {String|ArrayBuffer|Uint8Array|Buffer} data the data
 * @param {Object} options the options of the file
 */
export default class ZipObject {
  name;
  dir;
  date;
  comment;
  unixPermissions;
  dosPermissions;
  _data;
  _dataBinary;
  options;

  constructor(name: string, data, options) {
    this.name = name;
    this.dir = options.dir;
    this.date = options.date;
    this.comment = options.comment;
    this.unixPermissions = options.unixPermissions;
    this.dosPermissions = options.dosPermissions;

    this._data = data;
    this._dataBinary = options.binary;
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
    let result: GenericWorker = new DataWorker(this._data);
    if (!this._dataBinary) {
      result = result.pipe(new Utf8EncodeWorker());
    }
    return CompressedObject.createWorkerFrom(
      result,
      compression,
      compressionOptions
    );
  }
}
