import GenericWorker from './stream/GenericWorker';

export default {
  magic: '\x00\x00',
  compressWorker(): GenericWorker {
    return new GenericWorker('STORE compression');
  },
};
