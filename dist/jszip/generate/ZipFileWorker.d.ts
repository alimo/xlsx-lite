import GenericWorker from '../stream/GenericWorker';
/**
 * A worker to concatenate other workers to create a zip file.
 * @param {Boolean} streamFiles `true` to stream the content of the files,
 * `false` to accumulate it.
 * @param {String} comment the comment to use.
 * @param {String} platform the platform to use, "UNIX" or "DOS".
 * @param {Function} encodeFileName the function to encode file names and comments.
 */
export default class ZipFileWorker extends GenericWorker {
    bytesWritten: number;
    zipPlatform: any;
    encodeFileName: any;
    streamFiles: any;
    accumulate: any;
    contentBuffer: any;
    dirRecords: any;
    currentSourceOffset: any;
    entriesCount: any;
    currentFile: any;
    _sources: any;
    constructor(streamFiles: any, platform: any, encodeFileName: any);
    /**
     * @see GenericWorker.push
     */
    push(chunk: any): void;
    /**
     * The worker started a new source (an other worker).
     * @param {Object} streamInfo the streamInfo object from the new source.
     */
    openedSource(streamInfo: any): void;
    /**
     * The worker finished a source (an other worker).
     * @param {Object} streamInfo the streamInfo object from the finished source.
     */
    closedSource(streamInfo: any): void;
    /**
     * @see GenericWorker.flush
     */
    flush(): void;
    /**
     * Prepare the next source to be read.
     */
    prepareNextSource(): void;
    /**
     * @see GenericWorker.registerPrevious
     */
    registerPrevious(previous: any): this;
    /**
     * @see GenericWorker.resume
     */
    resume(): boolean;
    /**
     * @see GenericWorker.error
     */
    error(e: any): boolean;
    /**
     * @see GenericWorker.lock
     */
    lock(): void;
}
