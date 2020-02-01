import GenericWorker from './GenericWorker';
import { transformTo } from '../utils';

/**
 * A worker which convert chunks to a specified type.
 */
export default class ConvertWorker extends GenericWorker {
  destType: string;

  constructor(destType: string) {
    super(`ConvertWorker to ${destType}`);
    this.destType = destType;
  }

  processChunk(chunk): void {
    this.push({
      data: transformTo(this.destType, chunk.data),
      meta: chunk.meta,
    });
  }
}
