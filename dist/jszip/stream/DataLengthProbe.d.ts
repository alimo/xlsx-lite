import GenericWorker from './GenericWorker';
/**
 * A worker which calculate the total length of the data flowing through.
 */
export default class DataLengthProbe extends GenericWorker {
    propName: string;
    constructor(propName: string);
    /**
     * @see GenericWorker.processChunk
     */
    processChunk(chunk: any): void;
}
