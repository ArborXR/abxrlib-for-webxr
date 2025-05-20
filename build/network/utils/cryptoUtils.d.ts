/// <reference types="node" />
/// <reference types="node" />
export declare function sha256(message: string): Promise<string>;
export declare function SHA256(message: string): Promise<Buffer>;
export declare function jwtDecode(token: string): any;
