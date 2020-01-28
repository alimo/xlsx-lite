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
    constructor(name: string, data: Promise<string>, options: any);
    /**
     * Return a worker for the compressed content.
     * @private
     * @param {Object} compression the compression object to use.
     * @param {Object} compressionOptions the options to use when compressing.
     * @return Worker the worker.
     */
    _compressWorker(compression: any, compressionOptions: any): GenericWorker;
}
