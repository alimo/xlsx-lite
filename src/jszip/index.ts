import { prepareContent, checkSupport } from './utils';
import { utf8encode } from './utf8';
import defaults from './defaults';
import GenericWorker from './stream/GenericWorker';
import ZipObject from './zipObject';
import StreamHelper from './stream/StreamHelper';
import support from './support';
import { generateWorker } from './generate';

function forceTrailingSlash(path: string): string {
  if (path.slice(-1) !== '/') {
    return `${path}/`;
  }
  return path;
}

function removeTrailingSlash(path: string): string {
  if (path.slice(-1) === '/') {
    return path.substr(0, path.length - 1);
  }
  return path;
}

function parentFolder(path: string): string {
  const lastSlash = removeTrailingSlash(path).lastIndexOf('/');
  return lastSlash > 0 ? path.substring(0, lastSlash) : '';
}

export default class JSZip {
  // object containing the files :
  // {
  //   "folder/" : {...},
  //   "folder/data.txt" : {...}
  // }
  files: { [key: string]: ZipObject } = {};

  comment = null;

  // Where we are in the hierarchy
  root = '';

  clone(): JSZip {
    const newObj = new JSZip();
    for (const i in this as JSZip) {
      if (typeof this[i] !== 'function') {
        newObj[i] = this[i];
      }
    }
    return newObj;
  }

  /**
   * Call a callback function for each entry at this folder level.
   */
  forEach(cb: (relativePath: string, file: ZipObject) => void): void {
    for (const filename in this.files) {
      if (!Object.prototype.hasOwnProperty.call(this.files, filename)) {
        continue;
      }
      const file = this.files[filename];
      const relativePath = filename.slice(this.root.length, filename.length);
      if (relativePath && filename.slice(0, this.root.length) === this.root) {
        // the file is in the current root
        cb(relativePath, file); // TODO reverse the parameters ? need to be clean AND consistent with the filter search fn...
      }
    }
  }

  /**
   * Add a (sub) folder in the current folder.
   */
  folderAdd(name: string, createFolders = defaults.createFolders): ZipObject {
    name = forceTrailingSlash(name);

    // Does this folder already exist?
    if (!this.files[name]) {
      this.fileAdd(name, null, {
        dir: true,
        createFolders,
      });
    }
    return this.files[name];
  }

  /**
   * Add a file in the current folder.
   */
  fileAdd(
    name: string,
    data: string,
    originalOptions?: {
      dir: boolean;
      createFolders: boolean;
    }
  ): void {
    const o = {
      ...defaults,
      ...originalOptions,
    };
    o.date = o.date || new Date();
    if (o.compression !== null) {
      o.compression = o.compression.toUpperCase();
    }

    if (typeof o.unixPermissions === 'string') {
      o.unixPermissions = parseInt(o.unixPermissions, 8);
    }

    // UNX_IFDIR  0040000 see zipinfo.c
    if (o.unixPermissions && o.unixPermissions & 0x4000) {
      o.dir = true;
    }
    // Bit 4    Directory
    if (o.dosPermissions && o.dosPermissions & 0x0010) {
      o.dir = true;
    }

    if (o.dir) {
      name = forceTrailingSlash(name);
    }

    // be sure sub folders exist
    let parent: string;
    if (o.createFolders && (parent = parentFolder(name))) {
      this.folderAdd(parent, true);
    }

    o.binary = o.binary || o.base64;

    if (o.dir || !data || data.length === 0) {
      o.base64 = false;
      o.binary = true;
      data = '';
      o.compression = 'STORE';
    }

    const zipObjectContent = prepareContent(data, o.base64);
    const object = new ZipObject(name, zipObjectContent, o);
    this.files[name] = object;
  }

  file(name: string, data: string): JSZip {
    this.fileAdd(this.root + name, data);
    return this;
  }

  folder(name: string): JSZip {
    name = this.root + name;
    const newFolder = this.folderAdd(name);

    // Allow chaining by returning a new object with this folder as the root
    const ret = this.clone();
    ret.root = newFolder.name;
    return ret;
  }

  /**
   * Generate the complete zip file as an internal stream.
   * @return {StreamHelper} the streamed zip file.
   */
  generateAsync(): Promise<any> {
    const options = {
      streamFiles: false,
      compression: 'STORE',
      compressionOptions: null,
      type: 'blob',
      platform: 'DOS',
      comment: null,
      mimeType: 'application/zip',
      encodeFileName: utf8encode,
    };

    let worker: GenericWorker;
    try {
      checkSupport('blob');
      worker = generateWorker(this, options);
    } catch (e) {
      worker = new GenericWorker('error');
      worker.error(e);
    }
    return new StreamHelper(worker).accumulate();
  }

  support = support;
  defaults = defaults;
  version = '3.2.0';
}
