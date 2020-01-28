import * as compressions from '../compressions';
import ZipFileWorker from './ZipFileWorker';
import JSZip from '../';

/**
 * Find the compression to use.
 * @param {String} fileCompression the compression defined at the file level, if any.
 * @param {String} zipCompression the compression defined at the load() level.
 * @return {Object} the compression object to use.
 */
function getCompression(fileCompression, zipCompression) {
  const compressionName = fileCompression || zipCompression;
  const compression = compressions[compressionName];
  if (!compression) {
    throw new Error(compressionName + ' is not a valid compression method !');
  }
  return compression;
}

/**
 * Create a worker to generate a zip file.
 * @param {JSZip} zip the JSZip instance at the right root level.
 * @param {Object} options to generate the zip file.
 */
export function generateWorker(zip: JSZip, options: any): ZipFileWorker {
  const zipFileWorker = new ZipFileWorker(
    options.streamFiles,
    options.platform,
    options.encodeFileName
  );
  let entriesCount = 0;
  try {
    zip.forEach((relativePath, file) => {
      entriesCount++;
      const compression = getCompression(
        file.options.compression,
        options.compression
      );
      const compressionOptions =
        file.options.compressionOptions || options.compressionOptions || {};
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
