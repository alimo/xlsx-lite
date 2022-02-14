import { delay } from '../utils';
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
  dataIsReady = false;
  index = 0;
  max = 0;
  data: any = null;
  _tickScheduled = false;

  constructor(dataP) {
    super('DataWorker');

    dataP.then(
      (data) => {
        this.dataIsReady = true;
        this.data = data;
        this.max = (data && data.length) || 0;
        if (!this.isPaused) {
          this._tickAndRepeat();
        }
      },
      (e) => {
        this.error(e);
      }
    );
  }

  cleanUp(): void {
    GenericWorker.prototype.cleanUp.call(this);
    this.data = null;
  }

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

    let data = null;
    const nextIndex = Math.min(this.max, this.index + DEFAULT_BLOCK_SIZE);
    if (this.index >= this.max) {
      // EOF
      return this.end();
    } else {
      data = this.data.substring(this.index, nextIndex);
      this.index = nextIndex;
      return this.push({
        data,
        meta: {
          percent: this.max ? (this.index / this.max) * 100 : 0,
        },
      });
    }
  }
}
