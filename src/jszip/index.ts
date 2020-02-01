/**
 * The entire `jszip` directory is a fork of `jszip`
 * released under the MIT license, see https://github.com/Stuk/jszip/
 */

import { checkSupport } from './utils';
import defaults from './defaults';
import GenericWorker from './stream/GenericWorker';
import ZipObject from './zipObject';
import StreamHelper from './stream/StreamHelper';
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

function getParentFolder(path: string): string {
  path = removeTrailingSlash(path);
  const lastSlash = path.lastIndexOf('/');
  return lastSlash > 0 ? path.substr(0, lastSlash) : '';
}

export default class JSZip {
  /**
   * object containing the files:
   * {
   *   "folder/data.txt" : {...}
   *   "folder/" : {...},
   * }
   */
  files = {};

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
  forEach(cb): void {
    for (const filename in this.files) {
      if (!Object.prototype.hasOwnProperty.call(this.files, filename)) {
        continue;
      }
      const file = this.files[filename];
      const relativePath = filename.slice(this.root.length, filename.length);
      if (relativePath && filename.slice(0, this.root.length) === this.root) {
        // the file is in the current root
        cb(relativePath, file);
      }
    }
  }

  /**
   * Add a file in the current folder.
   */
  fileAdd(name: string, data: string, options = {}): void {
    const o = {
      ...defaults,
      ...options,
    };
    o.date = o.date || new Date();

    // be sure sub folders exist
    let parent: string;
    if (o.createFolders && (parent = getParentFolder(name))) {
      this.folderAdd(parent, true);
    }

    if (o.dir || !data || data.length === 0) {
      o.base64 = false;
      o.binary = true;
      data = '';
      o.compression = 'STORE';
    }

    /*
     * Convert content to fit.
     */
    const object = new ZipObject(name, Promise.resolve(data), o);
    this.files[name] = object;
  }

  /**
   * Add a (sub) folder in the current folder.
   */
  folderAdd(
    name: string,
    createFolders: boolean = defaults.createFolders
  ): ZipObject {
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
   * Add a file to the zip file.
   */
  file(name: string, data: string): JSZip {
    this.fileAdd(this.root + name, data);
    return this;
  }

  /**
   * Add a directory to the zip file.
   */
  folder(name: string): JSZip {
    const newFolder = this.folderAdd(this.root + name);

    // Allow chaining by returning a new object with this folder as the root
    const ret = this.clone();
    ret.root = newFolder.name;
    return ret;
  }

  /**
   * Generate the complete zip file as an internal stream.
   */
  generateAsync(): Promise<any> {
    let worker: GenericWorker;
    try {
      checkSupport('blob');
      worker = generateWorker(this);
    } catch (e) {
      worker = new GenericWorker('error');
      worker.error(e);
    }
    return new StreamHelper(worker).accumulate();
  }
}
