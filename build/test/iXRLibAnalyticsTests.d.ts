import { iXRLibAnalyticsGeneralCallback } from "../iXRLibAnalytics";
import { iXRAIProxy, iXRBase, iXREvent, iXRLog, iXRStorage, iXRTelemetry } from "../iXRLibCoreModel";
import { DbSet } from "../network/utils/DataObjectBase";
import { SyncEvent } from "../network/types";
import { iXRResult } from "../network/utils/DotNetishTypes";
export declare class iXRLibAnalyticsTests {
    static AddXXX<T extends iXRBase>(tTypeOfT: any, bSynchronous: boolean, seAsyncOperationComplete: SyncEvent, bAlreadyAuthenticated: boolean, pfnAddXXXSynchronous: (ixrT: T) => Promise<iXRResult>, pfnAddXXX: ((ixrT: T, bNoCallbackOnSuccess: boolean, pfnCallback: (ixrT: T, eResult: iXRResult, szExceptionMessage: string) => void) => Promise<iXRResult>) | null): Promise<void>;
    static TestPostXXX<T extends iXRBase>(tTypeOfT: any, szT: string, pfnModifyTheList: (listXXXs: DbSet<T>) => void, bAlreadyAuthenticated: boolean, bAsync: boolean, bOneAtATime: boolean, seAsyncOperationComplete: SyncEvent, pfnPostXXX: (listpXXXs: DbSet<T>, bOneAtATime: boolean, szResponse: string) => iXRResult, pfnSendXXXs: (listXXXs: DbSet<T>, bNoCallbackOnSuccess: boolean, pfnCallback: iXRLibAnalyticsGeneralCallback) => iXRResult): Promise<iXRResult>;
    static SendXXXsSynchronous<T extends iXRBase>(tTypeOfT: any, szT: string, listXXXs: DbSet<T>, bOneAtATime: boolean, bNoCallbackOnSuccess: boolean, pfnStatusCallback: iXRLibAnalyticsGeneralCallback): Promise<iXRResult>;
    static SendLogsSynchronous(listLogs: DbSet<iXRLog>, bNoCallbackOnSuccess: boolean, pfnStatusCallback: iXRLibAnalyticsGeneralCallback): Promise<iXRResult>;
    static SendEventsSynchronous(listEvents: DbSet<iXREvent>, bNoCallbackOnSuccess: boolean, pfnStatusCallback: iXRLibAnalyticsGeneralCallback): Promise<iXRResult>;
    static SendTelemetrySynchronous(listTelemetryEntries: DbSet<iXRTelemetry>, bNoCallbackOnSuccess: boolean, pfnStatusCallback: iXRLibAnalyticsGeneralCallback): Promise<iXRResult>;
    static SendAIProxySynchronous(listAIProxyEntries: DbSet<iXRAIProxy>, bNoCallbackOnSuccess: boolean, pfnStatusCallback: iXRLibAnalyticsGeneralCallback): Promise<iXRResult>;
    static SendStorageSynchronous(listStorageEntries: DbSet<iXRStorage>, bNoCallbackOnSuccess: boolean, pfnStatusCallback: iXRLibAnalyticsGeneralCallback): Promise<iXRResult>;
    static TestAuthenticate(): Promise<iXRResult>;
}
