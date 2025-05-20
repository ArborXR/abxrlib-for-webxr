import { /*Factory,MJPQ*/ SUID } from "./network/types";
import { DataObjectBase, DbContext, DbSet, DumpCategory, FieldPropertiesRecordContainer, JsonFieldType } from "./network/utils/DataObjectBase";
import { DateTime, Dictionary, iXRResult, iXRDictStrings, StringList, TimeSpan } from "./network/utils/DotNetishTypes";
import { DatabaseResult } from "./network/utils/iXRLibSQLite";
import { HTTP_URL } from "./network/utils/URLParser";
export declare class iXRBase extends DataObjectBase {
    protected static m_bUseCapturedTimeStamp: boolean;
    protected static m_nCapturedTimeStamp: number;
    static InitStatics(): void;
    m_guidId: SUID;
    m_guidParentId: SUID;
    m_dtTimeStamp: DateTime;
    m_nTimeStamp: number;
    m_bSyncedWithCloud: boolean;
    static m_mapProperties: FieldPropertiesRecordContainer;
    GetMapProperties(): FieldPropertiesRecordContainer;
    constructor();
    static CaptureTimeStamp(): void;
    static UnCaptureTimeStamp(): void;
    ShouldDump(szFieldName: string, eJsonFieldType: JsonFieldType, eDumpCategory: DumpCategory): boolean;
}
export declare class CaptureTimeStampLifetime {
    constructor();
    dispose(): void;
}
export declare class iXRLibConfiguration extends DataObjectBase {
    protected m_szRestUrl: string;
    protected m_urlRestUrl: HTTP_URL;
    m_nSendRetriesOnFailure: number;
    m_tsSendRetryInterval: TimeSpan;
    m_tsSendNextBatchWait: TimeSpan;
    m_tsStragglerTimeout: TimeSpan;
    m_dPositionCapturePeriodicity: number;
    m_dFrameRateCapturePeriodicity: number;
    m_dTelemetryCapturePeriodicity: number;
    m_nEventsPerSendAttempt: number;
    m_nLogsPerSendAttempt: number;
    m_nTelemetryEntriesPerSendAttempt: number;
    m_nStorageEntriesPerSendAttempt: number;
    m_tsPruneSentItemsOlderThan: TimeSpan;
    m_nMaximumCachedItems: number;
    m_bRetainLocalAfterSent: boolean;
    m_bReAuthenticateBeforeTokenExpires: boolean;
    m_bUseDatabase: boolean;
    m_dictAuthMechanism: iXRDictStrings;
    constructor();
    SetRestUrl(szRestUrl: string): void;
    GetRestUrl(): string;
    GetRestUrlObject(): HTTP_URL;
    static m_mapProperties: FieldPropertiesRecordContainer;
    GetMapProperties(): FieldPropertiesRecordContainer;
    ReadConfig(): boolean;
    RESTConfigured(): boolean;
}
export declare class iXRApplication extends iXRBase {
    m_szAppId: string;
    m_szDeviceUserId: string;
    m_szDeviceId: string;
    m_szLogLevel: string;
    m_szData: string;
    static m_mapProperties: FieldPropertiesRecordContainer;
    constructor();
    GetMapProperties(): FieldPropertiesRecordContainer;
    FakeUpSomeRandomCrap(bWantChildObjects?: boolean): void;
}
export declare class iXRLocationData extends iXRBase {
    m_dX: number;
    m_dY: number;
    m_dZ: number;
    constructor();
    Construct(dX: number, dY: number, dZ: number): iXRLocationData;
    static m_mapProperties: FieldPropertiesRecordContainer;
    GetMapProperties(): FieldPropertiesRecordContainer;
    ShouldDump(szFieldName: string, eJsonFieldType: JsonFieldType, eDumpCategory: DumpCategory): boolean;
    FakeUpSomeRandomCrap(bWantChildObjects?: boolean): void;
}
export declare enum LogLevel {
    eDebug = 0,
    eInfo = 1,
    eWarn = 2,
    eError = 3,
    eCritical = 4
}
export declare function LogLevelToString(eLogLevel: LogLevel): string;
export declare function StringToLogLevel(szLogLevel: string): LogLevel;
export declare class iXRMetaDataObject extends iXRBase {
    m_dictMeta: iXRDictStrings;
    static m_mapProperties: FieldPropertiesRecordContainer;
    constructor();
    ConstructMetaData(dictMeta: iXRDictStrings): void;
}
export declare class iXRLog extends iXRMetaDataObject {
    m_szLogLevel: string;
    m_szText: string;
    static m_mapProperties: FieldPropertiesRecordContainer;
    GetMapProperties(): FieldPropertiesRecordContainer;
    constructor();
    Construct(eLogLevel: LogLevel, szText: string, dictMeta: iXRDictStrings): iXRLog;
    FakeUpSomeRandomCrap(bWantChildObjects?: boolean): void;
}
export declare class iXRTelemetry extends iXRMetaDataObject {
    m_szName: string;
    constructor();
    Construct(szName: string, dictMeta: iXRDictStrings): iXRTelemetry;
    static m_mapProperties: FieldPropertiesRecordContainer;
    GetMapProperties(): FieldPropertiesRecordContainer;
    FakeUpSomeRandomCrap(bWantChildObjects?: boolean): void;
}
export declare class iXRAIProxy extends iXRBase {
    m_szPrompt: string;
    m_dictPastMessages: iXRDictStrings;
    m_szLLMProvider: string;
    constructor();
    Construct0(szPrompt: string, szPastMessages: string, szLMMProvider: string): iXRAIProxy;
    Construct1(szPrompt: string, dictPastMessages: iXRDictStrings, szLMMProvider: string): iXRAIProxy;
    static m_mapProperties: FieldPropertiesRecordContainer;
    GetMapProperties(): FieldPropertiesRecordContainer;
    FakeUpSomeRandomCrap(bWantChildObjects?: boolean): void;
}
export declare class iXREvent extends iXRMetaDataObject {
    static m_dictAssessmentStartTimes: Dictionary<string, DateTime>;
    static m_dictObjectiveStartTimes: Dictionary<string, DateTime>;
    static m_dictInteractionStartTimes: Dictionary<string, DateTime>;
    static m_dictLevelStartTimes: Dictionary<string, DateTime>;
    static InitStatics(): void;
    m_szName: string;
    m_szEnvironment: string;
    constructor();
    static m_mapProperties: FieldPropertiesRecordContainer;
    GetMapProperties(): FieldPropertiesRecordContainer;
    Construct(szName: string, dictMeta: iXRDictStrings): iXREvent;
    FakeUpSomeRandomCrap(bWantChildObjects?: boolean): void;
}
export declare class iXRXXXContainer<T extends DataObjectBase, T_CONTAINS, bTWantTimestamp extends boolean> extends iXRBase {
    bWantTimestamp: bTWantTimestamp;
    m_tIXRXXX: T_CONTAINS;
    m_dspIXRXXXs: DbSet<T>;
    static m_mapProperties: FieldPropertiesRecordContainer;
    GetMapProperties(): FieldPropertiesRecordContainer;
    constructor(tTypeOfT: any, tTypeOfT_CONTAINS: any, bWantTimestamp?: bTWantTimestamp);
    ShouldDump(szFieldName: string, eJsonFieldType: JsonFieldType, eDumpCategory: DumpCategory): boolean;
    FakeUpSomeRandomCrap(bWantChildObjects?: boolean): void;
}
export declare class iXRXXXScalarContainer<T extends iXRBase> extends iXRBase {
    m_tIXRXXX: T;
    static m_mapProperties: FieldPropertiesRecordContainer;
    constructor(tTypeOfT: any);
    GetMapProperties(): FieldPropertiesRecordContainer;
    ShouldDump(szFieldName: string, eJsonFieldType: JsonFieldType, eDumpCategory: DumpCategory): boolean;
}
export declare class iXRStorageData extends iXRBase {
    m_cdictData: iXRDictStrings;
    constructor();
    Construct0(dictData: iXRDictStrings): iXRStorageData;
    Construct1(szdictData: string): iXRStorageData;
    static m_mapProperties: FieldPropertiesRecordContainer;
    GetMapProperties(): FieldPropertiesRecordContainer;
    FakeUpSomeRandomCrap(bWantChildObjects?: boolean): void;
}
export declare class StorageContainer extends iXRXXXContainer<iXRStorageData, iXRDictStrings, true> {
    constructor();
    FinalizeParse(): void;
}
export declare class iXRStorage extends iXRBase {
    m_szKeepPolicy: string;
    m_szName: string;
    m_dsData: DbSet<StorageContainer>;
    m_szOrigin: string;
    m_bSessionData: boolean;
    m_lszTags: StringList;
    constructor();
    Construct0(bKeepLatest: boolean, szName: string, dictData: iXRDictStrings, szOrigin: string, bSessionData: boolean): iXRStorage;
    Construct1(bKeepLatest: boolean, szName: string, szdictData: string, szOrigin: string, bSessionData: boolean): iXRStorage;
    static m_mapProperties: FieldPropertiesRecordContainer;
    GetMapProperties(): FieldPropertiesRecordContainer;
    FakeUpSomeRandomCrap(bWantChildObjects?: boolean): void;
}
export declare class DbSetStorage extends DbSet<iXRStorage> {
    static DEFAULTNAME: string;
    static InitStatics(): void;
    GetEntry(szName?: string): iXRStorage | null;
    SetEntry(data: string | iXRDictStrings, bKeepLatest: boolean, szOrigin: string, bSessionData: boolean, szName?: string): Promise<iXRResult>;
    RemoveEntry(szName?: string): Promise<iXRResult>;
    RemoveMultipleEntries(dbContext: iXRDbContext, bSessionOnly: boolean): Promise<iXRResult>;
}
export declare class iXRErrors extends iXRBase {
    m_szErrorString: string;
    constructor();
    static m_mapProperties: FieldPropertiesRecordContainer;
    GetMapProperties(): FieldPropertiesRecordContainer;
}
export declare class iXRDbContext extends DbContext {
    m_dsIXRApplications: DbSet<iXRApplication>;
    m_dsIXRLogs: DbSet<iXRLog>;
    m_dsIXRTelemetry: DbSet<iXRTelemetry>;
    m_dsIXREvents: DbSet<iXREvent>;
    m_dsIXRStorage: DbSet<iXRStorage>;
    m_szDbPath: string;
    static m_mapProperties: FieldPropertiesRecordContainer;
    constructor(bDeleteIfExists: boolean);
    LoadStorageEntriesIfNecessary(): DatabaseResult;
    StorageGetEntry(szName?: string): iXRDictStrings | null;
    StorageGetEntryAsString(szName?: string): string;
    StorageSetEntry(data: string | iXRDictStrings, bKeepLatest: boolean, szOrigin: string, bSessionData: boolean, szName?: string): Promise<iXRResult>;
    StorageRemoveEntry(szName?: string): Promise<iXRResult>;
    StorageRemoveMultipleEntries(bSessionOnly: boolean): Promise<iXRResult>;
    private ConstructGuts;
    SaveChanges(): DatabaseResult;
    getAllData(): iXRDictStrings;
    FakeUpSomeRandomCrap(bWantChildObjects?: boolean): void;
}
export declare function RESTEndpointFromType<T>(tDraft: any): string;
