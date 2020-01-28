import GenericWorker from './GenericWorker';
import crc32 from '../crc32';

/**
 * A worker which calculates the crc32 of the data flowing through.
 */
export default class Crc32Probe extends GenericWorker {
  constructor() {
    super('Crc32Probe');
    this.withStreamInfo('crc32', 0);
  }

  processChunk(chunk): void {
    this.streamInfo.crc32 = crc32(chunk.data, this.streamInfo.crc32 || 0);
    this.push(chunk);
  }
}
