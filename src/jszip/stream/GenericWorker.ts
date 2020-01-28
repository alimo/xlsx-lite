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
  // the name of the worker
  name: string;
  // an object containing metadata about the workers chain
  streamInfo: any = {};
  // an error which happened when the worker was paused
  generatedError: any = null;
  // an object containing metadata to be merged by this worker into the general metadata
  extraStreamInfo: any = {};
  // true if the stream is paused (and should not do anything), false otherwise
  isPaused = true;
  // true if the stream is finished (and should not do anything), false otherwise
  isFinished = false;
  // true if the stream is locked to prevent further structure updates (pipe), false otherwise
  isLocked = false;
  // the event listeners
  _listeners: {
    data: ((chunk) => void)[];
    end: (() => void)[];
    error: ((e) => void)[];
  } = {
    data: [],
    end: [],
    error: [],
  };
  // the previous worker, if any
  previous: GenericWorker = null;

  constructor(name = 'default') {
    this.name = name;
  }

  /**
   * Push a chunk to the next workers.
   */
  push(chunk): void {
    this.emit('data', chunk);
  }

  /**
   * End the stream.
   */
  end(): boolean {
    if (this.isFinished) {
      return false;
    }

    this.flush();
    try {
      this.emit('end');
      this.cleanUp();
      this.isFinished = true;
    } catch (e) {
      this.emit('error', e);
    }
    return true;
  }

  /**
   * End the stream with an error.
   * @param {Error} e the error which caused the premature end.
   * @return {Boolean} true if this call ended the worker with an error, false otherwise.
   */
  error(e): boolean {
    if (this.isFinished) {
      return false;
    }

    if (this.isPaused) {
      this.generatedError = e;
    } else {
      this.isFinished = true;

      this.emit('error', e);

      // in the workers chain exploded in the middle of the chain,
      // the error event will go downward but we also need to notify
      // workers upward that there has been an error.
      if (this.previous) {
        this.previous.error(e);
      }

      this.cleanUp();
    }
    return true;
  }

  /**
   * Add a callback on an event.
   */
  on(name: string, listener: (...args) => void): GenericWorker {
    this._listeners[name].push(listener);
    return this;
  }

  /**
   * Clean any references when a worker is ending.
   */
  cleanUp(): void {
    this.streamInfo = this.generatedError = this.extraStreamInfo = null;
    this._listeners = {
      data: [],
      end: [],
      error: [],
    };
  }

  /**
   * Trigger an event. This will call registered callback with the provided arg.
   */
  emit(name: 'data' | 'end' | 'error', arg?): void {
    if (this._listeners[name]) {
      for (let i = 0; i < this._listeners[name].length; i++) {
        this._listeners[name][i].call(this, arg);
      }
    }
  }

  /**
   * Chain a worker with an other.
   */
  pipe(next: GenericWorker): GenericWorker {
    return next.registerPrevious(this);
  }

  /**
   * Same as `pipe` in the other direction.
   * Using an API with `pipe(next)` is very easy.
   * Implementing the API with the point of view of the next one registering
   * a source is easier, see the ZipFileWorker.
   */
  registerPrevious(previous: GenericWorker): GenericWorker {
    if (this.isLocked) {
      throw new Error("The stream '" + this + "' has already been used.");
    }

    // sharing the streamInfo...
    this.streamInfo = previous.streamInfo;
    // ... and adding our own bits
    this.mergeStreamInfo();
    this.previous = previous;
    previous.on('data', chunk => {
      this.processChunk(chunk);
    });
    previous.on('end', () => {
      this.end();
    });
    previous.on('error', e => {
      this.error(e);
    });
    return this;
  }

  /**
   * Pause the stream so it doesn't send events anymore.
   */
  pause(): boolean {
    if (this.isPaused || this.isFinished) {
      return false;
    }
    this.isPaused = true;

    if (this.previous) {
      this.previous.pause();
    }
    return true;
  }

  /**
   * Resume a paused stream.
   */
  resume(): boolean {
    if (!this.isPaused || this.isFinished) {
      return false;
    }
    this.isPaused = false;

    // if true, the worker tried to resume but failed
    let withError = false;
    if (this.generatedError) {
      this.error(this.generatedError);
      withError = true;
    }
    if (this.previous) {
      this.previous.resume();
    }

    return !withError;
  }

  /**
   * Flush any remaining bytes as the stream is ending.
   */
  flush(): void {
    return;
  }

  /**
   * Process a chunk. This is usually the method overridden.
   * @param {Object} chunk the chunk to process.
   */
  processChunk(chunk): void {
    this.push(chunk);
  }

  /**
   * Add a key/value to be added in the workers chain streamInfo once activated.
   */
  withStreamInfo(key: string, value): GenericWorker {
    this.extraStreamInfo[key] = value;
    this.mergeStreamInfo();
    return this;
  }

  /**
   * Merge this worker's streamInfo into the chain's streamInfo.
   */
  mergeStreamInfo(): void {
    for (const key in this.extraStreamInfo) {
      if (!Object.prototype.hasOwnProperty.call(this.extraStreamInfo, key)) {
        continue;
      }
      this.streamInfo[key] = this.extraStreamInfo[key];
    }
  }

  /**
   * Lock the stream to prevent further updates on the workers chain.
   * After calling this method, all calls to pipe will fail.
   */
  lock(): void {
    if (this.isLocked) {
      throw new Error("The stream '" + this + "' has already been used.");
    }
    this.isLocked = true;
    if (this.previous) {
      this.previous.lock();
    }
  }

  /**
   * Pretty print the workers chain.
   */
  toString(): string {
    const me = 'Worker ' + this.name;
    if (this.previous) {
      return this.previous + ' -> ' + me;
    } else {
      return me;
    }
  }
}
