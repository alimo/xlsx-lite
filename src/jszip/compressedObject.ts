import DataLengthProbe from './stream/DataLengthProbe';
import Crc32Probe from './stream/Crc32Probe';
import GenericWorker from './stream/GenericWorker';

/**
 * Chain the given worker with other workers to compress the content with the
 * given compression.
 */
export function createWorkerFrom(
  uncompressedWorker: GenericWorker,
  compression: any,
  compressionOptions: any
): GenericWorker {
  return uncompressedWorker
    .pipe(new Crc32Probe())
    .pipe(new DataLengthProbe('uncompressedSize'))
    .pipe(compression.compressWorker(compressionOptions))
    .pipe(new DataLengthProbe('compressedSize'))
    .withStreamInfo('compression', compression);
}
