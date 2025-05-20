/// <reference types="node" />
/// <reference types="node" />
import { Guid } from 'guid-typescript';
import { DataObjectBase, FieldPropertiesRecordContainer } from './utils/DataObjectBase';
export declare const DATEMAXVALUE = 2222;
export declare const DATEMINVALUE = 1972;
export declare const DEFAULTNAME = "state";
export declare const SIZE_MAX: number;
export declare class Base64 {
    static Decode: (str: string) => Buffer;
    static Encode: (buf: Buffer) => string;
}
export type time_t = number;
export declare class JsonScalarArrayElement<T> extends DataObjectBase {
    m_data: T | null;
    static m_mapProperties: FieldPropertiesRecordContainer;
    GetMapProperties(): FieldPropertiesRecordContainer;
}
export declare function Sleep(nMilliseconds: number): Promise<void>;
export declare function IsClass(value: unknown): value is (new () => any);
export declare class ScopeThreadBlock {
    private m_cs;
    constructor(cs: object);
    Enter(): void;
    Leave(): void;
}
export declare class SyncEvent {
    m_bEvent: boolean;
    SetEvent(): void;
    Wait(): Promise<void>;
}
export declare enum Verb {
    eGet = 0,
    eDelete = 1,
    eOptions = 2,
    eHead = 3,
    ePost = 4,
    eHasBody = 4,
    ePut = 5,
    ePatch = 6
}
export declare class CurlHttp {
    m_objRequestHeaders: Headers;
    m_objRequest: Request;
    m_objResponse: Response;
    m_szLastError: string;
    constructor();
    AddHttpHeader(szName: string, szValue: string): void;
    AddHttpAuthHeader(szName: string, szValue: string): void;
    Initialize(szUrl: string, vpszQueryParameters: Array<[string, string]>, eVerb: Verb, pmbBodyContent: Buffer | null): boolean;
    Get(szUrl: string, vpszQueryParameters: Array<[string, string]>, rpResponse: {
        szResponse: string;
    }): Promise<boolean>;
    Post(szUrl: string, vpszQueryParameters: Array<[string, string]>, mbBodyContent: Buffer, rpResponse: {
        szResponse: string;
    }): Promise<boolean>;
    Delete(szUrl: string, vpszQueryParameters: Array<[string, string]>, rpResponse: {
        szResponse: string;
    }): Promise<boolean>;
}
export declare class SUID {
    m_guid: Guid;
    constructor();
    private static hexStringToGuid;
    Construct(szHexString: string): void;
    Create(): void;
    FromHex(szHex: string): SUID;
    MakeNull(): void;
    IsNull(): boolean;
    ToString(): string;
    ToStringPureHex(): string;
}
export declare class Regex {
    static Contains(data: string, regex: RegExp): boolean;
    static FirstMatch(szData: string, rxRegex: RegExp): {
        match: string;
        range: [number, number];
    } | null;
    static ProgressiveMatch(szData: string, vrxszRegexLevels: RegExp[], pbrxszFilterRegexes: Array<[boolean, RegExp]>): string[];
    static DeepMatch(szData: string, vrxszRegexLevels: RegExp[], rxPrefixRegex: RegExp, rxPostfixRegex: RegExp): string[];
}
export declare function atol(str: string): number;
export declare function atobool(str: string): boolean;
export declare function atoi(str: string): number;
export declare function atof(str: string): number;
export declare function EnsureSingleEndingCharacter(str: string, ch: string): string;
export declare function logError(context: string, error: any): void;
