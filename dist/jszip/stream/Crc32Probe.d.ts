import GenericWorker from './GenericWorker';
/**
 * A worker which calculates the crc32 of the data flowing through.
 */
export default class Crc32Probe extends GenericWorker {
    constructor();
    processChunk(chunk: any): void;
}
