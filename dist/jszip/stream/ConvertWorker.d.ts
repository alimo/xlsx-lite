import GenericWorker from './GenericWorker';
/**
 * A worker which convert chunks to a specified type.
 */
export default class ConvertWorker extends GenericWorker {
    destType: string;
    constructor(destType: string);
    processChunk(chunk: any): void;
}
