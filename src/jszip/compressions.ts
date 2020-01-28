import GenericWorker from './stream/GenericWorker';

export const STORE = {
  magic: '\x00\x00',
  compressWorker(): GenericWorker {
    return new GenericWorker('STORE compression');
  },
  uncompressWorker(): GenericWorker {
    return new GenericWorker('STORE decompression');
  },
};
