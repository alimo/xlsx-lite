import compression from '../compression';
import ZipFileWorker from './ZipFileWorker';
import JSZip from '../';

/**
 * Create a worker to generate a zip file.
 */
export function generateWorker(zip: JSZip): ZipFileWorker {
  const zipFileWorker = new ZipFileWorker();
  let entriesCount = 0;
  try {
    zip.forEach((relativePath, file) => {
      entriesCount++;
      const compressionOptions = file.options.compressionOptions || {};
      const dir = file.dir,
        date = file.date;

      file
        ._compressWorker(compression, compressionOptions)
        .withStreamInfo('file', {
          name: relativePath,
          dir,
          date,
          comment: file.comment || '',
          unixPermissions: file.unixPermissions,
          dosPermissions: file.dosPermissions,
        })
        .pipe(zipFileWorker);
    });
    zipFileWorker.entriesCount = entriesCount;
  } catch (e) {
    zipFileWorker.error(e);
  }

  return zipFileWorker;
}
