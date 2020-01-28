import GenericWorker from './GenericWorker';
/**
 * An helper to easily use workers outside of JSZip.
 * @constructor
 * @param {Worker} worker the worker to wrap
 */
export default class StreamHelper {
    worker: GenericWorker;
    constructor(worker: GenericWorker);
    /**
     * Listen a StreamHelper, accumulate its content and concatenate it into a
     * complete block.
     */
    accumulate(): Promise<any>;
    /**
     * Add a listener on an event triggered on a stream.
     */
    on(event: string, fn: any): StreamHelper;
    /**
     * Resume the flow of chunks.
     */
    resume(): StreamHelper;
    /**
     * Pause the flow of chunks.
     */
    pause(): StreamHelper;
}
