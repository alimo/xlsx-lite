import GenericWorker from './GenericWorker';
/**
 * A worker that reads a content and emits chunks.
 * @constructor
 * @param {Promise} dataP the promise of the data to split
 */
export default class DataWorker extends GenericWorker {
    dataIsReady: any;
    index: any;
    max: any;
    data: any;
    type: any;
    _tickScheduled: any;
    constructor(dataP: any);
    /**
     * @see GenericWorker.cleanUp
     */
    cleanUp(): void;
    /**
     * @see GenericWorker.resume
     */
    resume(): boolean;
    /**
     * Trigger a tick a schedule an other call to this function.
     */
    _tickAndRepeat(): void;
    /**
     * Read and push a chunk.
     */
    _tick(): boolean | void;
}
