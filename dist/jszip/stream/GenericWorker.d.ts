/**
 * A worker that does nothing but passing chunks to the next one. This is like
 * a nodejs stream but with some differences. On the good side :
 * - it works on IE 6-9 without any issue / polyfill
 * - it weights less than the full dependencies bundled with browserify
 * - it forwards errors (no need to declare an error handler EVERYWHERE)
 *
 * A chunk is an object with 2 attributes : `meta` and `data`. The former is an
 * object containing anything (`percent` for example), see each worker for more
 * details. The latter is the real data (String, Uint8Array, etc).
 *
 * @constructor
 * @param {String} name the name of the stream (mainly used for debugging purposes)
 */
export default class GenericWorker {
    name: string;
    streamInfo: any;
    generatedError: any;
    extraStreamInfo: any;
    isPaused: boolean;
    isFinished: boolean;
    isLocked: boolean;
    _listeners: {
        data: ((chunk: any) => void)[];
        end: (() => void)[];
        error: ((e: any) => void)[];
    };
    previous: GenericWorker;
    constructor(name?: string);
    /**
     * Push a chunk to the next workers.
     */
    push(chunk: any): void;
    /**
     * End the stream.
     */
    end(): boolean;
    /**
     * End the stream with an error.
     * @param {Error} e the error which caused the premature end.
     * @return {Boolean} true if this call ended the worker with an error, false otherwise.
     */
    error(e: any): boolean;
    /**
     * Add a callback on an event.
     */
    on(name: string, listener: (...args: any[]) => void): GenericWorker;
    /**
     * Clean any references when a worker is ending.
     */
    cleanUp(): void;
    /**
     * Trigger an event. This will call registered callback with the provided arg.
     */
    emit(name: 'data' | 'end' | 'error', arg?: any): void;
    /**
     * Chain a worker with an other.
     */
    pipe(next: GenericWorker): GenericWorker;
    /**
     * Same as `pipe` in the other direction.
     * Using an API with `pipe(next)` is very easy.
     * Implementing the API with the point of view of the next one registering
     * a source is easier, see the ZipFileWorker.
     */
    registerPrevious(previous: GenericWorker): GenericWorker;
    /**
     * Pause the stream so it doesn't send events anymore.
     */
    pause(): boolean;
    /**
     * Resume a paused stream.
     */
    resume(): boolean;
    /**
     * Flush any remaining bytes as the stream is ending.
     */
    flush(): void;
    /**
     * Process a chunk. This is usually the method overridden.
     * @param {Object} chunk the chunk to process.
     */
    processChunk(chunk: any): void;
    /**
     * Add a key/value to be added in the workers chain streamInfo once activated.
     */
    withStreamInfo(key: string, value: any): GenericWorker;
    /**
     * Merge this worker's streamInfo into the chain's streamInfo.
     */
    mergeStreamInfo(): void;
    /**
     * Lock the stream to prevent further updates on the workers chain.
     * After calling this method, all calls to pipe will fail.
     */
    lock(): void;
    /**
     * Pretty print the workers chain.
     */
    toString(): string;
}
