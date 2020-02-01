import { transformTo } from '../utils';
import GenericWorker from '../stream/GenericWorker';
import { utf8encode } from '../utf8';
import crc32 from '../crc32';
import signature from '../signature';

/**
 * Transform an integer into a string in hexadecimal.
 */
function decToHex(dec: number, bytes: number): string {
  let hex = '';
  for (let i = 0; i < bytes; i++) {
    hex += String.fromCharCode(dec & 0xff);
    dec = dec >>> 8;
  }
  return hex;
}

/**
 * Generate the DOS part of the external file attributes.
 * @param {Object} dosPermissions the dos permissions or null.
 *
 * Bit 0     Read-Only
 * Bit 1     Hidden
 * Bit 2     System
 * Bit 3     Volume Label
 * Bit 4     Directory
 * Bit 5     Archive
 */
function generateDosExternalFileAttr(dosPermissions): number {
  // the dir flag is already set for compatibility
  return (dosPermissions || 0) & 0x3f;
}

/**
 * Generate the various parts used in the construction of the final zip file.
 * @param {Object} streamInfo the hash with information about the compressed file.
 */
function generateZipParts(
  streamInfo,
  offset: number
): {
  fileRecord: string;
  dirRecord: string;
} {
  const file = streamInfo['file'];
  const compression = streamInfo['compression'];
  const encodedFileName = transformTo(
    'string',
    utf8encode(file.name)
  ) as string;
  const useUTF8ForFileName = encodedFileName.length !== file.name.length;
  const dir = file.dir;
  const date = file.date;

  const dataInfo = {
    crc32: 0,
    compressedSize: 0,
    uncompressedSize: 0,
  };

  // if the content is streamed, the sizes/crc32 are only available AFTER
  // the end of the stream.
  dataInfo.crc32 = streamInfo['crc32'];
  dataInfo.compressedSize = streamInfo['compressedSize'];
  dataInfo.uncompressedSize = streamInfo['uncompressedSize'];

  let bitflag = 0;
  if (useUTF8ForFileName) {
    // Bit 11: Language encoding flag (EFS).
    bitflag |= 0x0800;
  }

  let extFileAttr = 0;
  let versionMadeBy = 0;
  if (dir) {
    // dos or unix, we set the dos dir flag
    extFileAttr |= 0x00010;
  }

  versionMadeBy = 0x0014; // DOS, version 2.0
  extFileAttr |= generateDosExternalFileAttr(file.dosPermissions);

  // date
  // @see http://www.delorie.com/djgpp/doc/rbinter/it/52/13.html
  // @see http://www.delorie.com/djgpp/doc/rbinter/it/65/16.html
  // @see http://www.delorie.com/djgpp/doc/rbinter/it/66/16.html

  let dosTime = date.getUTCHours();
  dosTime = dosTime << 6;
  dosTime = dosTime | date.getUTCMinutes();
  dosTime = dosTime << 5;
  dosTime = dosTime | (date.getUTCSeconds() / 2);

  let dosDate = date.getUTCFullYear() - 1980;
  dosDate = dosDate << 4;
  dosDate = dosDate | (date.getUTCMonth() + 1);
  dosDate = dosDate << 5;
  dosDate = dosDate | date.getUTCDate();

  let extraFields = '';
  let unicodePathExtraField = '';

  if (useUTF8ForFileName) {
    // set the unicode path extra field. unzip needs at least one extra
    // field to correctly handle unicode path, so using the path is as good
    // as any other information. This could improve the situation with
    // other archive managers too.
    // This field is usually used without the utf8 flag, with a non
    // unicode path in the header (winrar, winzip). This helps (a bit)
    // with the messy Windows' default compressed folders feature but
    // breaks on p7zip which doesn't seek the unicode path extra field.
    // So for now, UTF-8 everywhere !
    unicodePathExtraField =
      // Version
      decToHex(1, 1) +
      // NameCRC32
      decToHex(crc32(encodedFileName), 4) +
      // UnicodeName
      encodedFileName;

    extraFields +=
      // Info-ZIP Unicode Path Extra Field
      '\x75\x70' +
      // size
      decToHex(unicodePathExtraField.length, 2) +
      // content
      unicodePathExtraField;
  }

  let header = '';
  // version needed to extract
  header += '\x0A\x00';
  // general purpose bit flag
  header += decToHex(bitflag, 2);
  // compression method
  header += compression.magic;
  // last mod file time
  header += decToHex(dosTime, 2);
  // last mod file date
  header += decToHex(dosDate, 2);
  // crc-32
  header += decToHex(dataInfo.crc32, 4);
  // compressed size
  header += decToHex(dataInfo.compressedSize, 4);
  // uncompressed size
  header += decToHex(dataInfo.uncompressedSize, 4);
  // file name length
  header += decToHex(encodedFileName.length, 2);
  // extra field length
  header += decToHex(extraFields.length, 2);

  const fileRecord =
    signature.LOCAL_FILE_HEADER + header + encodedFileName + extraFields;

  const dirRecord =
    signature.CENTRAL_FILE_HEADER +
    // version made by (00: DOS)
    decToHex(versionMadeBy, 2) +
    // file header (common to file and central directory)
    header +
    // file comment length
    decToHex(0, 2) +
    // disk number start
    '\x00\x00' +
    // internal file attributes TODO
    '\x00\x00' +
    // external file attributes
    decToHex(extFileAttr, 4) +
    // relative offset of local header
    decToHex(offset, 4) +
    // file name
    encodedFileName +
    // extra field
    extraFields;

  return {
    fileRecord,
    dirRecord,
  };
}

/**
 * Generate the EOCD record.
 */
function generateCentralDirectoryEnd(
  entriesCount: number,
  centralDirLength: number,
  localDirLength: number
): string {
  // end of central dir signature
  return (
    signature.CENTRAL_DIRECTORY_END +
    // number of this disk
    '\x00\x00' +
    // number of the disk with the start of the central directory
    '\x00\x00' +
    // total number of entries in the central directory on this disk
    decToHex(entriesCount, 2) +
    // total number of entries in the central directory
    decToHex(entriesCount, 2) +
    // size of the central directory   4 bytes
    decToHex(centralDirLength, 4) +
    // offset of start of central directory with respect to the starting disk number
    decToHex(localDirLength, 4) +
    // .ZIP file comment length
    decToHex(0, 2)
  );
}

/**
 * A worker to concatenate other workers to create a zip file.
 */
export default class ZipFileWorker extends GenericWorker {
  // The number of bytes written so far. This doesn't count accumulated chunks.
  bytesWritten = 0;
  // If `streamFiles` is false, we will need to accumulate the content of the
  // files to calculate sizes / crc32 (and write them *before* the content).
  // This boolean indicates if we are accumulating chunks (it will change a lot
  // during the lifetime of this worker).
  accumulate = false;
  // The buffer receiving chunks when accumulating content.
  contentBuffer = [];
  // The list of generated directory records.
  dirRecords = [];
  // The offset (in bytes) from the beginning of the zip file for the current source.
  currentSourceOffset = 0;
  // The total number of entries in this zip file.
  entriesCount = 0;
  // the name of the file currently being added, null when handling the end of the zip file.
  // Used for the emitted metadata.
  currentFile = null;
  _sources = [];

  constructor() {
    super('ZipFileWorker');
  }

  push(chunk): void {
    const currentFilePercent = chunk.meta.percent || 0;
    const entriesCount = this.entriesCount;
    const remainingFiles = this._sources.length;

    if (this.accumulate) {
      this.contentBuffer.push(chunk);
    } else {
      this.bytesWritten += chunk.data.length;

      GenericWorker.prototype.push.call(this, {
        data: chunk.data,
        meta: {
          currentFile: this.currentFile,
          percent: entriesCount
            ? (currentFilePercent + 100 * (entriesCount - remainingFiles - 1)) /
              entriesCount
            : 100,
        },
      });
    }
  }

  /**
   * The worker started a new source (an other worker).
   * @param {Object} streamInfo the streamInfo object from the new source.
   */
  openedSource(streamInfo): void {
    this.currentSourceOffset = this.bytesWritten;
    this.currentFile = streamInfo['file'].name;
    this.accumulate = true;
  }

  /**
   * The worker finished a source (an other worker).
   * @param {Object} streamInfo the streamInfo object from the finished source.
   */
  closedSource(streamInfo): void {
    this.accumulate = false;
    const record = generateZipParts(streamInfo, this.currentSourceOffset);

    this.dirRecords.push(record.dirRecord);
    // the content wasn't streamed, we need to push everything now
    // first the file record, then the content
    this.push({
      data: record.fileRecord,
      meta: { percent: 0 },
    });
    while (this.contentBuffer.length) {
      this.push(this.contentBuffer.shift());
    }
    this.currentFile = null;
  }

  flush(): void {
    const localDirLength = this.bytesWritten;
    for (let i = 0; i < this.dirRecords.length; i++) {
      this.push({
        data: this.dirRecords[i],
        meta: { percent: 100 },
      });
    }
    const centralDirLength = this.bytesWritten - localDirLength;

    const dirEnd = generateCentralDirectoryEnd(
      this.dirRecords.length,
      centralDirLength,
      localDirLength
    );

    this.push({
      data: dirEnd,
      meta: { percent: 100 },
    });
  }

  /**
   * Prepare the next source to be read.
   */
  prepareNextSource(): void {
    this.previous = this._sources.shift();
    this.openedSource(this.previous.streamInfo);
    if (this.isPaused) {
      this.previous.pause();
    } else {
      this.previous.resume();
    }
  }

  registerPrevious(previous: GenericWorker): GenericWorker {
    this._sources.push(previous);

    previous.on('data', chunk => {
      this.processChunk(chunk);
    });
    previous.on('end', () => {
      this.closedSource(this.previous.streamInfo);
      if (this._sources.length) {
        this.prepareNextSource();
      } else {
        this.end();
      }
    });
    previous.on('error', e => {
      this.error(e);
    });
    return this;
  }

  resume(): boolean {
    if (!GenericWorker.prototype.resume.call(this)) {
      return false;
    }

    if (!this.previous && this._sources.length) {
      this.prepareNextSource();
      return true;
    }
    if (!this.previous && !this._sources.length && !this.generatedError) {
      this.end();
      return true;
    }
  }

  error(e): boolean {
    const sources = this._sources;
    if (!GenericWorker.prototype.error.call(this, e)) {
      return false;
    }
    for (let i = 0; i < sources.length; i++) {
      try {
        sources[i].error(e);
      } catch (e) {
        // the `error` exploded, nothing to do
      }
    }
    return true;
  }

  lock(): void {
    GenericWorker.prototype.lock.call(this);
    const sources = this._sources;
    for (let i = 0; i < sources.length; i++) {
      sources[i].lock();
    }
  }
}
