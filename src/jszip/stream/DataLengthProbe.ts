import GenericWorker from './GenericWorker';

/**
 * A worker which calculate the total length of the data flowing through.
 */
export default class DataLengthProbe extends GenericWorker {
  propName: string;

  constructor(propName: string) {
    super(`DataLengthProbe for ${propName}`);
    this.propName = propName;
    this.withStreamInfo(propName, 0);
  }

  processChunk(chunk): void {
    if (chunk) {
      const length = this.streamInfo[this.propName] || 0;
      this.streamInfo[this.propName] = length + chunk.data.length;
    }
    GenericWorker.prototype.processChunk.call(this, chunk);
  }
}
