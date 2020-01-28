import ZipObject from './zipObject';
export default class JSZip {
    files: {
        [key: string]: ZipObject;
    };
    comment: any;
    root: string;
    clone(): JSZip;
    /**
     * Call a callback function for each entry at this folder level.
     */
    forEach(cb: (relativePath: string, file: ZipObject) => void): void;
    /**
     * Add a (sub) folder in the current folder.
     */
    folderAdd(name: string, createFolders?: boolean): ZipObject;
    /**
     * Add a file in the current folder.
     */
    fileAdd(name: string, data: string, originalOptions?: {
        dir: boolean;
        createFolders: boolean;
    }): void;
    file(name: string, data: string): JSZip;
    folder(name: string): JSZip;
    /**
     * Generate the complete zip file as an internal stream.
     * @return {StreamHelper} the streamed zip file.
     */
    generateAsync(): Promise<any>;
    support: {
        base64: boolean;
        array: boolean;
        string: boolean;
        arraybuffer: boolean;
        nodebuffer: boolean;
        uint8array: boolean;
        blob: boolean;
    };
    defaults: {
        base64: boolean;
        binary: boolean;
        dir: boolean;
        createFolders: boolean;
        date: any;
        compression: any;
        compressionOptions: any;
        unixPermissions: any;
        dosPermissions: any;
    };
    version: string;
}
