import { getTypeOf, delay } from '../utils';
import GenericWorker from './GenericWorker';

// the size of the generated chunks
// TODO expose this as a public variable
const DEFAULT_BLOCK_SIZE = 16 * 1024;

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

  constructor(dataP) {
    super('DataWorker');
    this.dataIsReady = false;
    this.index = 0;
    this.max = 0;
    this.data = null;
    this.type = '';

    this._tickScheduled = false;

    dataP.then(
      data => {
        this.dataIsReady = true;
        this.data = data;
        this.max = (data && data.length) || 0;
        this.type = getTypeOf(data);
        if (!this.isPaused) {
          this._tickAndRepeat();
        }
      },
      e => {
        this.error(e);
      }
    );
  }

  /**
   * @see GenericWorker.cleanUp
   */
  cleanUp(): void {
    GenericWorker.prototype.cleanUp.call(this);
    this.data = null;
  }

  /**
   * @see GenericWorker.resume
   */
  resume(): boolean {
    if (!GenericWorker.prototype.resume.call(this)) {
      return false;
    }

    if (!this._tickScheduled && this.dataIsReady) {
      this._tickScheduled = true;
      delay(this._tickAndRepeat, [], this);
    }
    return true;
  }

  /**
   * Trigger a tick a schedule an other call to this function.
   */
  _tickAndRepeat(): void {
    this._tickScheduled = false;
    if (this.isPaused || this.isFinished) {
      return;
    }
    this._tick();
    if (!this.isFinished) {
      delay(this._tickAndRepeat, [], this);
      this._tickScheduled = true;
    }
  }

  /**
   * Read and push a chunk.
   */
  _tick() {
    if (this.isPaused || this.isFinished) {
      return false;
    }

    const size = DEFAULT_BLOCK_SIZE;
    let data = null;
    const nextIndex = Math.min(this.max, this.index + size);
    if (this.index >= this.max) {
      // EOF
      return this.end();
    } else {
      switch (this.type) {
        case 'string':
          data = this.data.substring(this.index, nextIndex);
          break;
        case 'uint8array':
          data = this.data.subarray(this.index, nextIndex);
          break;
        case 'array':
        case 'nodebuffer':
          data = this.data.slice(this.index, nextIndex);
          break;
      }
      this.index = nextIndex;
      return this.push({
        data: data,
        meta: {
          percent: this.max ? (this.index / this.max) * 100 : 0,
        },
      });
    }
  }
}
