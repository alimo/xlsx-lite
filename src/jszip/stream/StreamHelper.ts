import * as utils from '../utils';
import ConvertWorker from './ConvertWorker';
import GenericWorker from './GenericWorker';

/**
 * Apply the final transformation of the data. If the user wants a Blob for
 * example, it's easier to work with an U8intArray and finally do the
 * ArrayBuffer/Blob conversion.
 * @return {String|Uint8Array|ArrayBuffer|Buffer|Blob} the content in the right format.
 */
function transformZipOutput(content: Uint8Array) {
  return utils.newBlob(utils.transformTo('arraybuffer', content));
}

/**
 * Concatenate an array of data of the given type.
 * @param {Array} dataArray the array containing the data chunks to concatenate
 * @throws Error if the asked type is unsupported
 */
function concat(dataArray): Uint8Array {
  let index = 0;
  let totalLength = 0;
  for (let i = 0; i < dataArray.length; i++) {
    totalLength += dataArray[i].length;
  }

  const res = new Uint8Array(totalLength);
  for (let i = 0; i < dataArray.length; i++) {
    res.set(dataArray[i], index);
    index += dataArray[i].length;
  }
  return res;
}

/**
 * An helper to easily use workers outside of JSZip.
 * @constructor
 * @param {Worker} worker the worker to wrap
 */
export default class StreamHelper {
  worker: GenericWorker;

  constructor(worker: GenericWorker) {
    try {
      utils.checkSupport('uint8array');
      this.worker = worker.pipe(new ConvertWorker('uint8array'));
      // the last workers can be rewired without issues but we need to
      // prevent any updates on previous workers.
      worker.lock();
    } catch (e) {
      this.worker = new GenericWorker('error');
      this.worker.error(e);
    }
  }

  /**
   * Listen a StreamHelper, accumulate its content and concatenate it into a
   * complete block.
   */
  accumulate(): Promise<any> {
    return new Promise((resolve, reject) => {
      let dataArray = [];
      this.on('data', data => {
        dataArray.push(data);
      })
        .on('error', err => {
          dataArray = [];
          reject(err);
        })
        .on('end', () => {
          try {
            const result = transformZipOutput(concat(dataArray));
            resolve(result);
          } catch (e) {
            reject(e);
          }
          dataArray = [];
        })
        .resume();
    });
  }

  /**
   * Add a listener on an event triggered on a stream.
   */
  on(event: string, fn): StreamHelper {
    if (event === 'data') {
      this.worker.on(event, chunk => {
        fn.call(this, chunk.data, chunk.meta);
      });
    } else {
      this.worker.on(event, (...args) => {
        utils.delay(fn, args, this);
      });
    }
    return this;
  }

  /**
   * Resume the flow of chunks.
   */
  resume(): StreamHelper {
    utils.delay(this.worker.resume, [], this.worker);
    return this;
  }

  /**
   * Pause the flow of chunks.
   */
  pause(): StreamHelper {
    this.worker.pause();
    return this;
  }
}
