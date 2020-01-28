import ZipFileWorker from './ZipFileWorker';
import JSZip from '../';
/**
 * Create a worker to generate a zip file.
 * @param {JSZip} zip the JSZip instance at the right root level.
 * @param {Object} options to generate the zip file.
 */
export declare function generateWorker(zip: JSZip, options: any): ZipFileWorker;
