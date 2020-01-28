export interface XMLObject {
    _t: string;
    _c?: XMLObject[];
    [key: string]: string | number | XMLObject[];
}
export declare function jsonToXml(obj: XMLObject): string;
