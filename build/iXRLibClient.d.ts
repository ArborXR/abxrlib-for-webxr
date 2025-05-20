import { iXRAIProxy, iXRBase, iXREvent, iXRLibConfiguration, iXRLog, iXRStorage, iXRTelemetry, iXRXXXContainer } from "./iXRLibCoreModel";
import { JsonScalarArrayElement, time_t } from "./network/types";
import { DataObjectBase, DbSet, FieldPropertiesRecordContainer } from "./network/utils/DataObjectBase";
import { iXRResult, iXRDictStrings, StringList } from "./network/utils/DotNetishTypes";
export declare enum Partner {
    eNone = 0,
    eArborXR = 1
}
export declare function PartnerToString(ePartner: Partner): string;
export declare function StringToPartner(szString: string): Partner;
export declare class AuthTokenRequest extends DataObjectBase {
    m_szAppId: string;
    m_szOrgId: string;
    m_szAuthSecret: string;
    m_szDeviceId: string;
    m_szSessionId: string;
    m_szPartner: string;
    m_szOsVersion: string;
    m_szIpAddress: string;
    m_szXrdmVersion: string;
    m_szAppVersion: string;
    m_szUnityVersion: string;
    m_szDeviceModel: string;
    m_szUserId: string;
    m_lszTags: StringList;
    m_dictGeoLocation: iXRDictStrings;
    m_dictAuthMechanism: iXRDictStrings;
    static m_mapProperties: FieldPropertiesRecordContainer;
    GetMapProperties(): FieldPropertiesRecordContainer;
    constructor();
    RefreshSessionId(): void;
}
export declare class AuthTokenDecodedJWT extends DataObjectBase {
    m_utTokenExpiration: time_t;
    m_szType: string;
    m_szJti: string;
    static m_mapProperties: FieldPropertiesRecordContainer;
    GetMapProperties(): FieldPropertiesRecordContainer;
}
export declare class AuthTokenResponseSuccess extends DataObjectBase {
    m_szToken: string;
    m_szApiSecret: string;
    static m_mapProperties: FieldPropertiesRecordContainer;
    GetMapProperties(): FieldPropertiesRecordContainer;
}
export declare class PostObjectsResponseSuccess extends DataObjectBase {
    m_szStatus: string;
    static m_mapProperties: FieldPropertiesRecordContainer;
    GetMapProperties(): FieldPropertiesRecordContainer;
}
export declare class PostObjectsResponseFailure extends DataObjectBase {
    m_szDetail: string;
    static m_mapProperties: FieldPropertiesRecordContainer;
    GetMapProperties(): FieldPropertiesRecordContainer;
}
export declare class AuthTokenResponseFailureDetail extends DataObjectBase {
    m_lszLoc: DbSet<JsonScalarArrayElement<string>>;
    m_szMsg: string;
    m_szType: string;
    m_szInput: string;
    m_szUrl: string;
    static m_mapProperties: FieldPropertiesRecordContainer;
    constructor();
    GetMapProperties(): FieldPropertiesRecordContainer;
}
export declare class AuthTokenResponseFailure extends DataObjectBase {
    m_szMessage: string;
    m_listDetail: DbSet<AuthTokenResponseFailureDetail>;
    static m_mapProperties: FieldPropertiesRecordContainer;
    constructor();
    GetMapProperties(): FieldPropertiesRecordContainer;
}
export declare class ApiTokenJWT extends DataObjectBase {
    m_szType: string;
    m_szDeviceId: string;
    m_szUserId: string;
    constructor(szDeviceId: string, szUserId: string);
    SetupAccessJWT(szDeviceId: string, szUserId: string): void;
    static m_mapProperties: FieldPropertiesRecordContainer;
    GetMapProperties(): FieldPropertiesRecordContainer;
}
export declare class iXRLibClient {
    static PostIXRXXXs<T extends iXRBase>(listpXXXs: DbSet<T>, tTypeOfT: any, bOneAtATime: boolean, rpResponse: {
        szResponse: string;
    }): Promise<iXRResult>;
    static GetIXRXXXs<T extends DataObjectBase>(tTypeOfT: any, vpszQueryParameters: Array<[string, string]>, /*OUT*/ ptContainedResponse: iXRXXXContainer<T, iXRDictStrings, false> | null, /*OUT*/ ptResponse: T | null): Promise<iXRResult>;
    static DeleteIXRXXX<T extends iXRBase>(tTypeOfT: any, vpszQueryParameters: Array<[string, string]>, rpResponse: {
        szResponse: string;
    }): Promise<iXRResult>;
    static PostAuthenticate(authTokenRequest: AuthTokenRequest, rpResponse: {
        szResponse: string;
    }): Promise<iXRResult>;
    static GetIXRConfig(/*OUT*/ ixrConfiguration: iXRLibConfiguration): Promise<iXRResult>;
    static GetIXRStorage(/*OUT*/ ixrStorage: iXRXXXContainer<iXRStorage, iXRDictStrings, false>): Promise<iXRResult>;
    static DeleteIXRStorageEntry(szName: string, rpResponse: {
        szResponse: string;
    }): Promise<iXRResult>;
    static DeleteMultipleIXRStorageEntries(bSessionOnly: boolean, rpResponse: {
        szResponse: string;
    }): Promise<iXRResult>;
    static PostIXREvents(listpEvents: DbSet<iXREvent>, bOneAtATime: boolean, rpResponse: {
        szResponse: string;
    }): Promise<iXRResult>;
    static PostIXRAIProxyObjects(listpAIProxyObjects: DbSet<iXRAIProxy>, bOneAtATime: boolean, rpResponse: {
        szResponse: string;
    }): Promise<iXRResult>;
    static PostIXRLogs(listpLogs: DbSet<iXRLog>, bOneAtATime: boolean, rpResponse: {
        szResponse: string;
    }): Promise<iXRResult>;
    static PostIXRTelemetry(listpTelemetry: DbSet<iXRTelemetry>, bOneAtATime: boolean, rpResponse: {
        szResponse: string;
    }): Promise<iXRResult>;
    static PostIXRAIProxy(listpAIProxy: DbSet<iXRAIProxy>, bOneAtATime: boolean, rpResponse: {
        szResponse: string;
    }): Promise<iXRResult>;
    static PostIXRStorage(listpStorage: DbSet<iXRStorage>, bOneAtATime: boolean, rpResponse: {
        szResponse: string;
    }): Promise<iXRResult>;
    static WriteLine(szLine: string): void;
}
