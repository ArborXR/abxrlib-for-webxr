/// <reference types="node" />
/// <reference types="node" />
export declare enum iXRResult {
    eOk = 0,
    eNotInitialized = 1,
    eAnalyticsDisabled = 2,
    eTooManyItems = 3,
    eSizeLimitReached = 4,
    eTooManyRequests = 5,
    eInvalidData = 6,
    eUnsupportedPlatform = 7,
    eEnableEventFailed = 8,
    eEventNotEnabled = 9,
    eEventCached = 10,
    eSendEventFailed = 11,
    ePostObjectsFailed = 12,
    ePostObjectsFailedNetworkError = 13,
    ePostObjectsBadJsonResponse = 14,
    eDeleteObjectsFailed = 15,
    eDeleteObjectsFailedNetworkError = 16,
    eDeleteObjectsFailedDatabase = 17,
    eDeleteObjectsBadJsonResponse = 18,
    eAuthenticateFailed = 19,
    eAuthenticateFailedNetworkError = 20,
    eCouldNotObtainAuthSecret = 21,
    eCorruptJson = 22,
    eSetEnvironmentDataFailed = 23,
    eObjectNotFound = 24
}
export declare function iXRResultToString(eRet: iXRResult): string;
export declare enum InteractionType {
    eNull = 0,
    eBool = 1,
    eSelect = 2,
    eText = 3,
    eRating = 4,
    eNumber = 5
}
export declare function InteractionTypeToString(eRet: InteractionType): string;
export declare enum ResultOptions {
    eNull = 0,
    ePass = 1,
    eFail = 2,
    eComplete = 3,
    eIncomplete = 4
}
export declare function ResultOptionsToString(eRet: ResultOptions): string;
export declare enum JsonResult {
    eOk = 0,
    eBadJsonStructure = 1,
    eMissingField = 2,
    eExtraneousField = 3,
    eFieldTypeNotSupported = 4,
    eSingleObjectWhereListExpected = 5,
    eListWhereSingleObjectExpected = 6,
    eBoolFromDoubleNotSupported = 7,
    eSUIDFromBoolNotSupported = 8,
    eSUIDFromIntNotSupported = 9,
    eSUIDFromDoubleNotSupported = 10,
    eDictFromBoolNotSupported = 11,
    eDictFromIntNotSupported = 12,
    eDictFromDoubleNotSupported = 13,
    eStringListFromBoolNotSupported = 14,
    eStringListFromIntNotSupported = 15,
    eStringListFromDoubleNotSupported = 16,
    eDateTimeFromBoolNotSupported = 17,
    eDateTimeFromIntNotSupported = 18,
    eDateTimeFromDoubleNotSupported = 19,
    eTimeSpanFromBoolNotSupported = 20,
    eTimeSpanFromIntNotSupported = 21,
    eTimeSpanFromDoubleNotSupported = 22,
    eBinaryFromBoolNotSupported = 23,
    eBinaryFromIntNotSupported = 24,
    eBinaryFromDoubleNotSupported = 25,
    eDoubleFromBoolNotSupported = 26
}
export declare function JsonSuccess(eRet: JsonResult): boolean;
export declare function JsonResultToString(eRet: JsonResult): string;
export declare class ConfigurationManager {
    static m_szAppConfig: string;
    static DebugSetAppConfig(szAppConfig: string): void;
    static AppSettings(szFieldName: string, szDefaultValue: string): string;
}
export declare class TimeSpan {
    private m_dtDate;
    constructor();
    Construct0(nHours: number, nMinutes: number, nSeconds: number): TimeSpan;
    Construct1(nDays: number, nHours: number, nMinutes: number, nSeconds: number): TimeSpan;
    Construct2(d: number): TimeSpan;
    ToInt64(): number;
    get totalMilliseconds(): number;
    ToMilliseconds(): number;
    static Zero(): TimeSpan;
    static Parse(sz: string): TimeSpan;
    ToString(): string;
    ToDateTime(): DateTime;
    FromUnixTime(nTime: number): TimeSpan;
}
export declare class DateTime extends Date {
    static Now(): number;
    static MaxValue(): DateTime;
    static MinValue(): DateTime;
    constructor(nYear?: number, nMonth?: number, nDay?: number, nHour?: number, nMinute?: number, nSecond?: number, nMilliseconds?: number);
    ToLocalTimeString(): string;
    ToUtcTimeString(): string;
    ToString(): string;
    ToUnixTime(): number;
    ToInt64(): number;
    ToUnixTimeAsString(): string;
    FromUnixTime(nTime: number): DateTime;
    FromInt64(nTime: number): DateTime;
    static ConvertUnixTime(nTime: number): DateTime;
    static Parse(sz: string): DateTime;
}
export declare class Dictionary<KEY, VALUE> extends Map<KEY, VALUE> {
    constructor();
    Add(kKey: KEY, vValue: VALUE): void;
    Remove(kKey: KEY): boolean;
    Count(): number;
    TryGetValue(kKey: KEY, refparam: {
        vRet: VALUE;
    }): boolean;
    ToString(): string;
    LoadFromJson(): JsonResult;
    JSONstringify(): string;
}
export declare class iXRDictStrings extends Dictionary<string, string> {
    constructor();
    Construct(szCommaSeparatedNameEqualsValueList: string): iXRDictStrings;
    FromCommaSeparatedList(szCommaSeparatedNameEqualsValueList: string): iXRDictStrings;
    GenerateJson(): string;
    static StringIfNotNumber(value: any): any;
    FromJsonFieldValue(szJsonFieldValue: string): iXRDictStrings;
    private CommaSeparatedStringToDictionary;
    private JsonFieldValueToDictionary;
}
export declare class StringList extends Array<string> {
    constructor();
    emplace_back(sz: string): string;
    emplace_front(): string;
    FromCommaSeparatedList(szCommaSeparatedList: string): void;
    JSONstringify(): string;
    LoadFromJson(): JsonResult;
    ToString(): string;
    private CommaSeparatedStringToStringList;
}
export declare class Random {
    Next(nFirst?: number, nLast?: number): number;
    NextBytes(mbBytes: Buffer): void;
}
export declare class Task {
    m_pfnTask?: (pObject?: object) => void;
    m_pObject?: object;
    m_pfnCleanup?: (pObject?: object) => void;
    constructor(pfnTask?: (pObject?: object) => void, pObject?: object, pfnCleanup?: (pObject?: object) => void);
    RunSynchronously(): void;
}
export declare class Queue<T> {
    private items;
    Enqueue(item: T): T;
    Dequeue(): T | undefined;
    Peek(): T | undefined;
    get length(): number;
    IsEmpty(): boolean;
}
