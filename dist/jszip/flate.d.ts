import GenericWorker from './stream/GenericWorker';
/**
 * Create a worker that uses pako to inflate/deflate.
 * @constructor
 * @param {String} action the name of the pako function to call : either "Deflate" or "Inflate".
 * @param {Object} options the options to use when (de)compressing.
 */
declare class FlateWorker extends GenericWorker {
    _pako: any;
    _pakoAction: any;
    _pakoOptions: any;
    meta: any;
    constructor(action: any, options: any);
    /**
     * @see GenericWorker.processChunk
     */
    processChunk(chunk: any): void;
    /**
     * @see GenericWorker.flush
     */
    flush(): void;
    /**
     * @see GenericWorker.cleanUp
     */
    cleanUp(): void;
    /**
     * Create the _pako object.
     * TODO: lazy-loading this object isn't the best solution but it's the
     * quickest. The best solution is to lazy-load the worker list. See also the
     * issue #446.
     */
    _createPako(): void;
}
export declare function compressWorker(compressionOptions: any): FlateWorker;
export declare function uncompressWorker(): FlateWorker;
export declare const magic = "\b\0";
export {};
