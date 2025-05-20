"use strict";
/// <summary>
/// Everything (or nearly) that is in db and will POST/PUT/ETC to remote has a Guid and a timestamp.
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESTEndpointFromType = exports.iXRDbContext = exports.iXRErrors = exports.DbSetStorage = exports.iXRStorage = exports.StorageContainer = exports.iXRStorageData = exports.iXRXXXScalarContainer = exports.iXRXXXContainer = exports.iXREvent = exports.iXRAIProxy = exports.iXRTelemetry = exports.iXRLog = exports.iXRMetaDataObject = exports.StringToLogLevel = exports.LogLevelToString = exports.LogLevel = exports.iXRLocationData = exports.iXRApplication = exports.iXRLibConfiguration = exports.CaptureTimeStampLifetime = exports.iXRBase = void 0;
const iXRLibClient_1 = require("./iXRLibClient");
const types_1 = require("./network/types");
const DataObjectBase_1 = require("./network/utils/DataObjectBase");
const DotNetishTypes_1 = require("./network/utils/DotNetishTypes");
const iXRLibSQLite_1 = require("./network/utils/iXRLibSQLite");
const URLParser_1 = require("./network/utils/URLParser");
const iXRLibCoreModelTests_1 = require("./test/iXRLibCoreModelTests");
/// </summary>
class iXRBase extends (_b = DataObjectBase_1.DataObjectBase) {
    // ---
    static InitStatics() {
        this.m_bUseCapturedTimeStamp = false;
        this.m_nCapturedTimeStamp = types_1.DATEMAXVALUE;
    }
    // ---
    GetMapProperties() {
        return iXRBase.m_mapProperties;
    }
    // ---
    constructor() {
        super();
        // ---
        this.m_guidId = new types_1.SUID();
        this.m_guidParentId = new types_1.SUID();
        this.m_dtTimeStamp = new DotNetishTypes_1.DateTime().FromUnixTime(DotNetishTypes_1.DateTime.Now());
        this.m_nTimeStamp = this.m_dtTimeStamp.ToInt64();
        this.m_bSyncedWithCloud = false; // On the cloud db, this is always true.  On the device, false indicates exists only in device-local SQLite db... needs update or create in cloud db to sync.
        // ---
        if (iXRBase.m_bUseCapturedTimeStamp) {
            this.m_dtTimeStamp.FromInt64(iXRBase.m_nCapturedTimeStamp);
            this.m_nTimeStamp = iXRBase.m_nCapturedTimeStamp;
        }
        else {
            this.m_dtTimeStamp = new DotNetishTypes_1.DateTime().FromUnixTime(DotNetishTypes_1.DateTime.Now());
            this.m_nTimeStamp = this.m_dtTimeStamp.ToInt64();
        }
    }
    // ---
    static CaptureTimeStamp() {
        this.m_bUseCapturedTimeStamp = true;
        this.m_nCapturedTimeStamp = DotNetishTypes_1.DateTime.Now();
    }
    static UnCaptureTimeStamp() {
        this.m_bUseCapturedTimeStamp = false;
    }
    // ---
    ShouldDump(szFieldName, eJsonFieldType, eDumpCategory) {
        switch (eDumpCategory) {
            case DataObjectBase_1.DumpCategory.eDumpingJsonForBackend:
                return (szFieldName !== "Id" &&
                    szFieldName !== "parentId" &&
                    szFieldName !== "syncedWithCloud");
            default:
                break;
        }
        return true;
    }
}
exports.iXRBase = iXRBase;
_a = iXRBase;
// ---
iXRBase.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_b, "m_mapProperties", _a).m_rfp, { m_guidId: new DataObjectBase_1.FieldProperties("Id", DataObjectBase_1.FieldPropertyFlags.bfPrimaryKey) }, { m_guidParentId: new DataObjectBase_1.FieldProperties("parentId", DataObjectBase_1.FieldPropertyFlags.bfParentKey) }, { m_dtTimeStamp: new DataObjectBase_1.FieldProperties("timestamp") }, { m_nTimeStamp: new DataObjectBase_1.FieldProperties("preciseTimestamp") }, { m_bSyncedWithCloud: new DataObjectBase_1.FieldProperties("syncedWithCloud") }));
;
/// <summary>
/// Makes it easy to capture timestamp over a scope so all objects created/added in that scope get identical timestamp.
/// </summary>
class CaptureTimeStampLifetime {
    constructor() {
        iXRBase.CaptureTimeStamp();
    }
    dispose() {
        iXRBase.UnCaptureTimeStamp();
    }
}
exports.CaptureTimeStampLifetime = CaptureTimeStampLifetime;
;
/// <summary>
/// Global configuration options to govern network behaviour etc.
///		Reason it is inheriting from DataObjectBase is to make it easy to inherit from it
///		in TestData.h to have it in the JSON consumed by that code.
/// </summary>
/// This started out in iXRLibAnalytics.h where it arguably belongs among its native society
/// of associated objects.  But, it can be obtained from the backend and therefore needed by
/// iXRLibClient.h so it needs to be here.
class iXRLibConfiguration extends (_d = DataObjectBase_1.DataObjectBase) {
    // ---
    constructor() {
        super();
        // ---
        this.m_szRestUrl = ""; // |_Would be cool to use __declspec(property) but that does not port to Linux.
        this.m_urlRestUrl = new URLParser_1.HTTP_URL(); // | Using accessor instead.
        this.m_nSendRetriesOnFailure = 3;
        this.m_tsSendRetryInterval = DotNetishTypes_1.TimeSpan.Parse("00:00:03");
        this.m_tsSendNextBatchWait = DotNetishTypes_1.TimeSpan.Parse("00:00:30");
        this.m_tsStragglerTimeout = DotNetishTypes_1.TimeSpan.Parse("00:00:15");
        // ---
        this.m_dPositionCapturePeriodicity = 1.0;
        this.m_dFrameRateCapturePeriodicity = 60.0;
        this.m_dTelemetryCapturePeriodicity = 1.0;
        // ---
        this.m_nEventsPerSendAttempt = 16;
        this.m_nLogsPerSendAttempt = 16;
        this.m_nTelemetryEntriesPerSendAttempt = 16;
        this.m_nStorageEntriesPerSendAttempt = 16;
        this.m_tsPruneSentItemsOlderThan = DotNetishTypes_1.TimeSpan.Parse("1.00:00:00");
        this.m_nMaximumCachedItems = 1024;
        this.m_bRetainLocalAfterSent = false;
        this.m_bReAuthenticateBeforeTokenExpires = true;
        this.m_bUseDatabase = false;
        this.m_dictAuthMechanism = new DotNetishTypes_1.iXRDictStrings();
        // ---
        // Default URL... can be overriden by App.config or accessors in C# and C++.
        this.SetRestUrl("https://libapi.informxr.io/");
    }
    SetRestUrl(szRestUrl) {
        this.m_szRestUrl = szRestUrl;
        this.m_urlRestUrl = URLParser_1.URLParser.Parse(this.m_szRestUrl);
    }
    GetRestUrl() {
        return this.m_szRestUrl;
    }
    GetRestUrlObject() {
        return this.m_urlRestUrl;
    }
    // ---
    GetMapProperties() {
        return iXRLibConfiguration.m_mapProperties;
    }
    // ---
    /// <summary>
    /// Read App.config which is a standard C# App.config.
    /// </summary>
    /// <returns>Success or failure</returns>
    ReadConfig() {
        try {
            // MJP TODO: Auth to REST service?  Content creator vs Customer.
            // MJP TODO: LMS (Learning Management System) integration.
            this.m_szRestUrl = DotNetishTypes_1.ConfigurationManager.AppSettings("REST_URL", "");
            this.m_szRestUrl = (0, types_1.EnsureSingleEndingCharacter)(this.m_szRestUrl, '/');
            this.m_urlRestUrl = URLParser_1.URLParser.Parse(this.m_szRestUrl);
            this.m_nSendRetriesOnFailure = (0, types_1.atol)(DotNetishTypes_1.ConfigurationManager.AppSettings("SendRetriesOnFailure", "3"));
            // --- Bandwidth config parameters.
            this.m_tsSendRetryInterval = DotNetishTypes_1.TimeSpan.Parse(DotNetishTypes_1.ConfigurationManager.AppSettings("SendRetryInterval", "00:00:03"));
            this.m_tsSendNextBatchWait = DotNetishTypes_1.TimeSpan.Parse(DotNetishTypes_1.ConfigurationManager.AppSettings("SendNextBatchWait", "00:00:30"));
            // 0 = infinite, i.e. never send remainders = always send exactly EventsPerSendAttempt.
            this.m_tsStragglerTimeout = DotNetishTypes_1.TimeSpan.Parse(DotNetishTypes_1.ConfigurationManager.AppSettings("StragglerTimeout", "00:00:15"));
            // Periodicities on headset automatic data collection in seconds (floating point).  0.0 = infinite, i.e. never collect the data.
            this.m_dPositionCapturePeriodicity = (0, types_1.atof)(DotNetishTypes_1.ConfigurationManager.AppSettings("PositionCapturePeriodicity", "1.0"));
            this.m_dFrameRateCapturePeriodicity = (0, types_1.atof)(DotNetishTypes_1.ConfigurationManager.AppSettings("PositionCapturePeriodicity", "60.0"));
            this.m_dTelemetryCapturePeriodicity = (0, types_1.atof)(DotNetishTypes_1.ConfigurationManager.AppSettings("PositionCapturePeriodicity", "1.0"));
            // 0 = Send all not already sent.
            this.m_nEventsPerSendAttempt = (0, types_1.atol)(DotNetishTypes_1.ConfigurationManager.AppSettings("EventsPerSendAttempt", "16"));
            // 0 = infinite, i.e. never prune.
            this.m_tsPruneSentItemsOlderThan = DotNetishTypes_1.TimeSpan.Parse(DotNetishTypes_1.ConfigurationManager.AppSettings("PruneSentItemsOlderThan", "0"));
            this.m_nMaximumCachedItems = (0, types_1.atol)(DotNetishTypes_1.ConfigurationManager.AppSettings("MaximumCachedItems", "1024"));
            this.m_bRetainLocalAfterSent = (0, types_1.atobool)(DotNetishTypes_1.ConfigurationManager.AppSettings("RetainLocalAfterSent", "false"));
            this.m_bReAuthenticateBeforeTokenExpires = (0, types_1.atobool)(DotNetishTypes_1.ConfigurationManager.AppSettings("ReAuthenticateBeforeTokenExpires", "true"));
            this.m_bUseDatabase = (0, types_1.atobool)(DotNetishTypes_1.ConfigurationManager.AppSettings("UseDatabase", "false"));
            // Note the absence here of getting "AuthMechanism".  Unless something changes, that should be exclusively supplied by backend GET config.
        }
        catch (error) {
            console.log("Error: ", error);
            // ---
            return false;
        }
        // ---
        return true;
    }
    RESTConfigured() {
        return (this.m_szRestUrl.length > 0);
    }
}
exports.iXRLibConfiguration = iXRLibConfiguration;
_c = iXRLibConfiguration;
// ---
iXRLibConfiguration.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_d, "m_mapProperties", _c).m_rfp, { m_szRestUrl: new DataObjectBase_1.FieldProperties("rest_url") }, { m_szRestUrl: new DataObjectBase_1.FieldProperties("restUrl", DataObjectBase_1.FieldPropertyFlags.bfBackendAccommodation) }, 
// ---
{ m_nSendRetriesOnFailure: new DataObjectBase_1.FieldProperties("send_retries_on_failure") }, { m_nSendRetriesOnFailure: new DataObjectBase_1.FieldProperties("sendRetriesOnFailure", DataObjectBase_1.FieldPropertyFlags.bfBackendAccommodation) }, 
// ---
{ m_tsSendRetryInterval: new DataObjectBase_1.FieldProperties("send_retry_interval") }, { m_tsSendRetryInterval: new DataObjectBase_1.FieldProperties("sendRetryInterval", DataObjectBase_1.FieldPropertyFlags.bfBackendAccommodation) }, 
// ---
{ m_tsSendNextBatchWait: new DataObjectBase_1.FieldProperties("send_next_batch_wait") }, { m_tsSendNextBatchWait: new DataObjectBase_1.FieldProperties("sendNextBatchWait", DataObjectBase_1.FieldPropertyFlags.bfBackendAccommodation) }, 
// ---
{ m_tsStragglerTimeout: new DataObjectBase_1.FieldProperties("straggler_timeout") }, { m_tsStragglerTimeout: new DataObjectBase_1.FieldProperties("stragglerTimeout", DataObjectBase_1.FieldPropertyFlags.bfBackendAccommodation) }, 
// ---
{ m_dPositionCapturePeriodicity: new DataObjectBase_1.FieldProperties("position_capture_periodicity") }, { m_dPositionCapturePeriodicity: new DataObjectBase_1.FieldProperties("positionCapturePeriodicity", DataObjectBase_1.FieldPropertyFlags.bfBackendAccommodation) }, 
// ---
{ m_dFrameRateCapturePeriodicity: new DataObjectBase_1.FieldProperties("frame_rate_capture_periodicity") }, { m_dFrameRateCapturePeriodicity: new DataObjectBase_1.FieldProperties("frameRateCapturePeriodicity", DataObjectBase_1.FieldPropertyFlags.bfBackendAccommodation) }, 
// ---
{ m_dTelemetryCapturePeriodicity: new DataObjectBase_1.FieldProperties("telemetry_capture_periodicity") }, { m_dTelemetryCapturePeriodicity: new DataObjectBase_1.FieldProperties("telemetryCapturePeriodicity", DataObjectBase_1.FieldPropertyFlags.bfBackendAccommodation) }, 
// ---
{ m_nEventsPerSendAttempt: new DataObjectBase_1.FieldProperties("events_per_send_attempt") }, { m_nEventsPerSendAttempt: new DataObjectBase_1.FieldProperties("eventsPerSendAttempt", DataObjectBase_1.FieldPropertyFlags.bfBackendAccommodation) }, 
// ---
{ m_nLogsPerSendAttempt: new DataObjectBase_1.FieldProperties("logs_per_send_attempt") }, { m_nLogsPerSendAttempt: new DataObjectBase_1.FieldProperties("logsPerSendAttempt", DataObjectBase_1.FieldPropertyFlags.bfBackendAccommodation) }, 
// ---
{ m_nTelemetryEntriesPerSendAttempt: new DataObjectBase_1.FieldProperties("telemetry_entries_per_send_attempt") }, { m_nTelemetryEntriesPerSendAttempt: new DataObjectBase_1.FieldProperties("telemetryEntriesPerSendAttempt", DataObjectBase_1.FieldPropertyFlags.bfBackendAccommodation) }, 
// ---
{ m_nStorageEntriesPerSendAttempt: new DataObjectBase_1.FieldProperties("storage_entries_per_send_attempt") }, { m_nStorageEntriesPerSendAttempt: new DataObjectBase_1.FieldProperties("storageEntriesPerSendAttempt", DataObjectBase_1.FieldPropertyFlags.bfBackendAccommodation) }, 
// ---
{ m_tsPruneSentItemsOlderThan: new DataObjectBase_1.FieldProperties("prune_sent_items_older_than") }, { m_tsPruneSentItemsOlderThan: new DataObjectBase_1.FieldProperties("pruneSentItemsOlderThan", DataObjectBase_1.FieldPropertyFlags.bfBackendAccommodation) }, 
// ---
{ m_nMaximumCachedItems: new DataObjectBase_1.FieldProperties("maximum_cached_items") }, { m_nMaximumCachedItems: new DataObjectBase_1.FieldProperties("maximumCachedItems", DataObjectBase_1.FieldPropertyFlags.bfBackendAccommodation) }, 
// ---
{ m_bRetainLocalAfterSent: new DataObjectBase_1.FieldProperties("retain_local_after_sent") }, { m_bRetainLocalAfterSent: new DataObjectBase_1.FieldProperties("retainLocalAfterSent", DataObjectBase_1.FieldPropertyFlags.bfBackendAccommodation) }, 
// ---
{ m_bReAuthenticateBeforeTokenExpires: new DataObjectBase_1.FieldProperties("reauthenticate_before_token_expires") }, { m_bReAuthenticateBeforeTokenExpires: new DataObjectBase_1.FieldProperties("reauthenticateBeforeTokenExpires", DataObjectBase_1.FieldPropertyFlags.bfBackendAccommodation) }, 
// ---
{ m_bUseDatabase: new DataObjectBase_1.FieldProperties("use_database") }, { m_bUseDatabase: new DataObjectBase_1.FieldProperties("useDatabase", DataObjectBase_1.FieldPropertyFlags.bfBackendAccommodation) }, 
// ---
{ m_dictAuthMechanism: new DataObjectBase_1.FieldProperties("auth_mechanism", DataObjectBase_1.FieldPropertyFlags.bfStringOnly) }, { m_dictAuthMechanism: new DataObjectBase_1.FieldProperties("authMechanism", DataObjectBase_1.FieldPropertyFlags.bfBackendAccommodation | DataObjectBase_1.FieldPropertyFlags.bfStringOnly) }));
;
/// <summary>
/// Application object... from "Database Models" doc... Represents the software application in use.
/// </summary>
class iXRApplication extends (_f = iXRBase) {
    // ---
    constructor() {
        super();
        // ---
        this.m_szAppId = "";
        this.m_szDeviceUserId = "";
        this.m_szDeviceId = "";
        this.m_szLogLevel = "";
        this.m_szData = "";
    }
    GetMapProperties() {
        return iXRBase.m_mapProperties;
    }
    // --- TESTS.
    // #ifdef _DEBUG
    FakeUpSomeRandomCrap(bWantChildObjects = true) {
        (0, iXRLibCoreModelTests_1.FakeUpSomeRandomCrapApplication)(this);
    }
}
exports.iXRApplication = iXRApplication;
_e = iXRApplication;
// ---
iXRApplication.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_f, "m_mapProperties", _e).m_rfp, { m_szAppId: new DataObjectBase_1.FieldProperties("appId") }, { m_szDeviceUserId: new DataObjectBase_1.FieldProperties("deviceUserId") }, { m_szDeviceId: new DataObjectBase_1.FieldProperties("deviceId") }, { m_szLogLevel: new DataObjectBase_1.FieldProperties("logLevel") }, { m_szData: new DataObjectBase_1.FieldProperties("data") }));
;
// ---
/// <summary>
/// LocationData contained by Event.
/// </summary>
class iXRLocationData extends (_h = iXRBase) {
    // ---
    constructor() {
        super();
        // ---
        this.m_dX = 0.0;
        this.m_dY = 0.0;
        this.m_dZ = 0.0;
    }
    Construct(dX, dY, dZ) {
        this.m_dX = dX;
        this.m_dY = dY;
        this.m_dZ = dZ;
        // ---
        return this;
    }
    // ---
    GetMapProperties() {
        return iXRLocationData.m_mapProperties;
    }
    // ---
    ShouldDump(szFieldName, eJsonFieldType, eDumpCategory) {
        switch (eDumpCategory) {
            case DataObjectBase_1.DumpCategory.eDumpingJsonForBackend:
                if (szFieldName === "timestamp") {
                    return false;
                }
            default:
                break;
        }
        return super.ShouldDump(szFieldName, eJsonFieldType, eDumpCategory);
    }
    // ---
    // #ifdef _DEBUG
    FakeUpSomeRandomCrap(bWantChildObjects = true) {
        (0, iXRLibCoreModelTests_1.FakeUpSomeRandomCrapLocation)(this);
    }
}
exports.iXRLocationData = iXRLocationData;
_g = iXRLocationData;
// ---
iXRLocationData.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_h, "m_mapProperties", _g).m_rfp, { m_dX: new DataObjectBase_1.FieldProperties("x") }, { m_dY: new DataObjectBase_1.FieldProperties("y") }, { m_dZ: new DataObjectBase_1.FieldProperties("z") }));
;
/// <summary>
/// Suggested log level enum.  Can use this or just pass in a uint and let it mean whatever is desired.
/// </summary>
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["eDebug"] = 0] = "eDebug";
    LogLevel[LogLevel["eInfo"] = 1] = "eInfo";
    LogLevel[LogLevel["eWarn"] = 2] = "eWarn";
    LogLevel[LogLevel["eError"] = 3] = "eError";
    LogLevel[LogLevel["eCritical"] = 4] = "eCritical";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
;
function LogLevelToString(eLogLevel) {
    switch (eLogLevel) {
        case LogLevel.eDebug:
            return "Debug";
        case LogLevel.eInfo:
            return "Info";
        case LogLevel.eWarn:
            return "Warn";
        case LogLevel.eError:
            return "Error";
        case LogLevel.eCritical:
            return "Critical";
        default:
            break;
    }
    return "";
}
exports.LogLevelToString = LogLevelToString;
function StringToLogLevel(szLogLevel) {
    const msz = [
        ["Debug", LogLevel.eDebug],
        ["Info", LogLevel.eInfo],
        ["Warn", LogLevel.eWarn],
        ["Error", LogLevel.eError],
        ["Critical", LogLevel.eCritical]
    ];
    for (let it of msz) {
        if (it[0] === szLogLevel) {
            return it[1];
        }
    }
    return LogLevel.eDebug;
}
exports.StringToLogLevel = StringToLogLevel;
/// <summary>
/// Any object that has m_dictMeta... factored up once we decided Log, Telemetry, Event each needs this.
/// </summary>
class iXRMetaDataObject extends (_k = iXRBase) {
    // ---
    constructor() {
        super();
        // ---
        this.m_dictMeta = new DotNetishTypes_1.iXRDictStrings();
    }
    // На хуй TypeScript.  Could do this with that parameter-unioning bollocks
    // but that cure is worse than the disease.
    ConstructMetaData(dictMeta) {
        this.m_dictMeta = dictMeta;
    }
}
exports.iXRMetaDataObject = iXRMetaDataObject;
_j = iXRMetaDataObject;
// ---
iXRMetaDataObject.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_k, "m_mapProperties", _j).m_rfp, { m_dictMeta: new DataObjectBase_1.FieldProperties("meta") }));
;
/// <summary>
/// General purpose... for developer to log whatever they want to log.
/// </summary>
class iXRLog extends (_m = iXRMetaDataObject) {
    // ---
    GetMapProperties() {
        return iXRLog.m_mapProperties;
    }
    // ---
    constructor() {
        super();
        // ---
        this.m_szLogLevel = "";
        this.m_szText = "";
    }
    Construct(eLogLevel, szText, dictMeta) {
        super.ConstructMetaData(dictMeta);
        // ---
        this.m_szLogLevel = LogLevelToString(eLogLevel);
        this.m_szText = szText;
        // ---
        return this;
    }
    // --- TESTS.
    // #ifdef _DEBUG
    FakeUpSomeRandomCrap(bWantChildObjects = true) {
        (0, iXRLibCoreModelTests_1.FakeUpSomeRandomCrapLog)(this);
    }
}
exports.iXRLog = iXRLog;
_l = iXRLog;
// ---
iXRLog.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_m, "m_mapProperties", _l).m_rfp, { m_szLogLevel: new DataObjectBase_1.FieldProperties("logLevel") }, { m_szText: new DataObjectBase_1.FieldProperties("text") }));
;
/// <summary>
/// Metrics and position tracking.
/// </summary>
class iXRTelemetry extends (_p = iXRMetaDataObject) {
    // ---
    constructor() {
        super();
        // ---
        this.m_szName = "";
    }
    Construct(szName, dictMeta) {
        super.ConstructMetaData(dictMeta);
        // ---
        this.m_szName = szName;
        // ---
        return this;
    }
    // ---
    GetMapProperties() {
        return iXRTelemetry.m_mapProperties;
    }
    // 	// --- TESTS.
    // #ifdef _DEBUG
    FakeUpSomeRandomCrap(bWantChildObjects = true) {
        (0, iXRLibCoreModelTests_1.FakeUpSomeRandomCrapTelemetry)(this);
    }
}
exports.iXRTelemetry = iXRTelemetry;
_o = iXRTelemetry;
iXRTelemetry.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_p, "m_mapProperties", _o).m_rfp, { m_szName: new DataObjectBase_1.FieldProperties("name") }));
;
/// <summary>
/// Message to/from the user of the headset.
///		Sent immediately, no local cacheing to db.  But the send still uses SendRetriesOnFailure/SendRetryInterval.
///		Does NOT exist in database schema (iXRDbContext below).
/// </summary>
class iXRAIProxy extends (_r = iXRBase) {
    // ---
    constructor() {
        super();
        // ---
        this.m_szPrompt = "";
        this.m_dictPastMessages = new DotNetishTypes_1.iXRDictStrings();
        this.m_szLLMProvider = "";
    }
    /// <summary>
    /// For passing past messages in as comma-separated list.
    /// </summary>
    /// <param name="szPrompt">Prompt.</param>
    /// <param name="szPastMessages">Past messages as comma-separated list.</param>
    /// <param name="szLMMProvider">LMM Provider.</param>
    Construct0(szPrompt, szPastMessages, szLMMProvider) {
        this.m_szPrompt = szPrompt;
        this.m_dictPastMessages = new DotNetishTypes_1.iXRDictStrings().Construct(szPastMessages);
        this.m_szLLMProvider = szLMMProvider;
        // ---
        return this;
    }
    /// <summary>
    /// For passing past messages in as what it is... iXRDictStrings.
    /// </summary>
    /// <param name="szPrompt">Prompt.</param>
    /// <param name="szPastMessages">Past messages.</param>
    /// <param name="szLMMProvider">LMM Provider.</param>
    Construct1(szPrompt, dictPastMessages, szLMMProvider) {
        this.m_szPrompt = szPrompt;
        this.m_dictPastMessages = dictPastMessages;
        this.m_szLLMProvider = szLMMProvider;
        // ---
        return this;
    }
    // ---
    GetMapProperties() {
        return iXRAIProxy.m_mapProperties;
    }
    // 	// --- TESTS.
    // #ifdef _DEBUG
    FakeUpSomeRandomCrap(bWantChildObjects = true) {
        (0, iXRLibCoreModelTests_1.FakeUpSomeRandomCrapAIProxy)(this);
    }
}
exports.iXRAIProxy = iXRAIProxy;
_q = iXRAIProxy;
// ---
iXRAIProxy.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_r, "m_mapProperties", _q).m_rfp, { m_szPrompt: new DataObjectBase_1.FieldProperties("prompt") }, { m_dictPastMessages: new DataObjectBase_1.FieldProperties("pastMessages") }, { m_szLLMProvider: new DataObjectBase_1.FieldProperties("llmProvider") }));
;
/// <summary>
/// Event object... from "ixrlib Spec 2023" doc... the main event object that will be profligately POST/PUT/ETCed to the backend for data analytics.
///		These are proactively added by the content creator, i.e. NOT automatically obtained by us from the platform, headset-OS, other API, etc.
/// </summary>
class iXREvent extends (_t = iXRMetaDataObject) {
    // ---
    static InitStatics() {
        iXREvent.m_dictAssessmentStartTimes = new DotNetishTypes_1.Dictionary();
        iXREvent.m_dictObjectiveStartTimes = new DotNetishTypes_1.Dictionary();
        iXREvent.m_dictInteractionStartTimes = new DotNetishTypes_1.Dictionary();
        iXREvent.m_dictLevelStartTimes = new DotNetishTypes_1.Dictionary();
    }
    // ---
    constructor() {
        super();
        // ---
        this.m_szName = "";
        this.m_szEnvironment = "";
    }
    // ---
    GetMapProperties() {
        return iXREvent.m_mapProperties;
    }
    // ---
    Construct(szName, dictMeta) {
        super.ConstructMetaData(dictMeta);
        // ---
        this.m_szName = szName;
        this.m_dictMeta = dictMeta;
        // ---
        return this;
    }
    // --- TESTS.
    // #ifdef _DEBUG
    FakeUpSomeRandomCrap(bWantChildObjects = true) {
        (0, iXRLibCoreModelTests_1.FakeUpSomeRandomCrapEvent)(this, bWantChildObjects);
    }
}
exports.iXREvent = iXREvent;
_s = iXREvent;
iXREvent.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_t, "m_mapProperties", _s).m_rfp, { m_szName: new DataObjectBase_1.FieldProperties("name") }));
;
/// <summary>
/// Backend Event endpoint wants an object called "data" that contains the list of events.
///		This is that container object.  Uses the GenerateJsonAlternate() mechanism to dump
///		a list of iXREvent pointers instead of this child list which is therefore just a
///		placeholder in that case.
/// </summary>
/// <typeparam name="T">Type of object being contained.</typeparam>
/// <typeparam name="T_CONTAINS">Type of object inside T that also has to be on its own for when Python makes it an object instead of an array in the JSON.</typeparam>
/// <typeparam name="bWantTimeStamp">Want timestamp when dumping JSON for backend.</typeparam>
class iXRXXXContainer extends (_v = iXRBase) {
    // ---
    GetMapProperties() {
        return iXRXXXContainer.m_mapProperties;
    }
    // ---
    constructor(tTypeOfT, tTypeOfT_CONTAINS, bWantTimestamp = false) {
        super();
        this.bWantTimestamp = bWantTimestamp;
        if ((0, types_1.IsClass)(tTypeOfT_CONTAINS)) {
            this.m_tIXRXXX = new tTypeOfT_CONTAINS();
        }
        else {
            this.m_tIXRXXX = tTypeOfT_CONTAINS;
        }
        this.m_dspIXRXXXs = new DataObjectBase_1.DbSet(tTypeOfT);
    }
    ShouldDump(szFieldName, eJsonFieldType, eDumpCategory) {
        //const bWantTimestamp:	bTWantTimestamp;
        if (eJsonFieldType === DataObjectBase_1.JsonFieldType.eField) {
            if (szFieldName === "data") {
                return false;
            }
            switch (eDumpCategory) {
                case DataObjectBase_1.DumpCategory.eDumpingJsonForBackend:
                    if (szFieldName === "timestamp") {
                        return this.bWantTimestamp;
                    }
                    break;
                default:
                    break;
            }
        }
        return super.ShouldDump(szFieldName, eJsonFieldType, eDumpCategory);
    }
    // --- TESTS.
    // #ifdef _DEBUG
    FakeUpSomeRandomCrap(bWantChildObjects = true) {
        this.m_dspIXRXXXs.emplace_front().FakeUpSomeRandomCrap(bWantChildObjects);
    }
}
exports.iXRXXXContainer = iXRXXXContainer;
_u = iXRXXXContainer;
// ---
iXRXXXContainer.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_v, "m_mapProperties", _u).m_rfp, { m_tIXRXXX: new DataObjectBase_1.FieldProperties("data") }, 
// ---
{ m_dspIXRXXXs: new DataObjectBase_1.FieldProperties("data", DataObjectBase_1.FieldPropertyFlags.bfChildList) }));
;
/// <summary>
/// Backend Storage endpoint wants to wrap scalars in "data":{<the-scalar>}.
///		This is that container object.
/// </summary>
/// <typeparam name="T"></typeparam>
class iXRXXXScalarContainer extends (_x = iXRBase) {
    // ---
    constructor(tTypeOfT) {
        super();
        this.m_tIXRXXX = {};
        this.m_tIXRXXX = new tTypeOfT();
    }
    GetMapProperties() {
        return iXRXXXScalarContainer.m_mapProperties;
    }
    // ---
    ShouldDump(szFieldName, eJsonFieldType, eDumpCategory) {
        switch (eDumpCategory) {
            case DataObjectBase_1.DumpCategory.eDumpingJsonForBackend:
                if (szFieldName === "timestamp") {
                    return false;
                }
            default:
                break;
        }
        return super.ShouldDump(szFieldName, eJsonFieldType, eDumpCategory);
    }
}
exports.iXRXXXScalarContainer = iXRXXXScalarContainer;
_w = iXRXXXScalarContainer;
// ---
// iXRXXXScalarContainer<T>() = default;
// iXRXXXScalarContainer<T>(const T& t) :
// 	m_tIXRXXX(t)
// {
// }
// iXRXXXScalarContainer<T>(T&& t) :
// 	m_tIXRXXX(t)
// {
// }
// ---
iXRXXXScalarContainer.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_x, "m_mapProperties", _w).m_rfp, { m_tIXRXXX: new DataObjectBase_1.FieldProperties("data", DataObjectBase_1.FieldPropertyFlags.bfChild) }));
;
// ---
/// <summary>
/// Backend has this in a double-nested "data" structure.  That is why this is here, this is the inner one.
/// </summary>
class iXRStorageData extends (_z = iXRBase) {
    // ---
    constructor() {
        super();
        // ---
        this.m_cdictData = new DotNetishTypes_1.iXRDictStrings();
    }
    Construct0(dictData) {
        this.m_cdictData = dictData;
        // ---
        return this;
    }
    Construct1(szdictData) {
        this.m_cdictData = new DotNetishTypes_1.iXRDictStrings().Construct(szdictData);
        // ---
        return this;
    }
    // ---
    GetMapProperties() {
        return iXRStorageData.m_mapProperties;
    }
    // --- TESTS.
    // #ifdef _DEBUG
    FakeUpSomeRandomCrap(bWantChildObjects = true) {
        (0, iXRLibCoreModelTests_1.FakeUpSomeRandomCrapStorageData)(this);
    }
}
exports.iXRStorageData = iXRStorageData;
_y = iXRStorageData;
// ---
iXRStorageData.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_z, "m_mapProperties", _y).m_rfp, { m_cdictData: new DataObjectBase_1.FieldProperties("data") }));
;
/// <summary>
/// Inherit from container template that handles the array vs single object bollocks from Python.
///		Mainly to shorten the name of the thing and have FinalizeParse().  Would be cool if
///		FinalizeParse() could be in iXRXXXContainer<> but the other things that use iXRXXXContainer<>
///		bum that up due to T_CONTAINS.  Would like to clean that up.  If I manage to, I'll revisit this.
/// </summary>
class StorageContainer extends iXRXXXContainer {
    constructor() {
        super(iXRStorageData, DotNetishTypes_1.iXRDictStrings, true);
    }
    FinalizeParse() {
        if (this.m_dspIXRXXXs.empty()) {
            this.m_dspIXRXXXs.Add(new iXRStorageData().Construct0(this.m_tIXRXXX));
        }
    }
}
exports.StorageContainer = StorageContainer;
;
/// <summary>
/// Mainly state, but more general than that... whatever user wants but principally state info.
/// </summary>
class iXRStorage extends (_1 = iXRBase) {
    // ---
    constructor() {
        super();
        this.m_szKeepPolicy = "appendHistory";
        this.m_szName = "";
        this.m_dsData = new DataObjectBase_1.DbSet(StorageContainer);
        this.m_szOrigin = "";
        this.m_bSessionData = false;
        this.m_lszTags = new DotNetishTypes_1.StringList();
    }
    Construct0(bKeepLatest, szName, dictData, szOrigin, bSessionData) {
        this.m_szKeepPolicy = (bKeepLatest) ? "keepLatest" : "appendHistory";
        this.m_szName = szName;
        this.m_szOrigin = szOrigin;
        this.m_bSessionData = bSessionData;
        this.m_dsData.clear();
        this.m_dsData.Add(new StorageContainer).m_dspIXRXXXs.Add(new iXRStorageData().Construct0(dictData));
        // ---
        return this;
    }
    Construct1(bKeepLatest, szName, szdictData, szOrigin, bSessionData) {
        this.m_szKeepPolicy = (bKeepLatest) ? "keepLatest" : "appendHistory";
        this.m_szName = szName;
        this.m_szOrigin = szOrigin;
        this.m_bSessionData = bSessionData;
        this.m_dsData.clear();
        this.m_dsData.Add(new StorageContainer).m_dspIXRXXXs.Add(new iXRStorageData().Construct1(szdictData));
        // ---
        return this;
    }
    // ---
    GetMapProperties() {
        return iXRStorage.m_mapProperties;
    }
    // --- TESTS.
    // #ifdef _DEBUG
    FakeUpSomeRandomCrap(bWantChildObjects = true) {
        (0, iXRLibCoreModelTests_1.FakeUpSomeRandomCrapStorage)(this);
    }
}
exports.iXRStorage = iXRStorage;
_0 = iXRStorage;
// ---
iXRStorage.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_1, "m_mapProperties", _0).m_rfp, { m_szKeepPolicy: new DataObjectBase_1.FieldProperties("keepPolicy") }, { m_szName: new DataObjectBase_1.FieldProperties("name") }, { m_szOrigin: new DataObjectBase_1.FieldProperties("origin") }, { m_bSessionData: new DataObjectBase_1.FieldProperties("sessionData") }, { m_lszTags: new DataObjectBase_1.FieldProperties("tags") }, 
// ---
{ m_dsData: new DataObjectBase_1.FieldProperties("data", DataObjectBase_1.FieldPropertyFlags.bfChildList) }));
;
/// <summary>
/// Functionality for iXRStorage list... do NOT ever add data members to this as the actual instance needs
///		to be a DbSet<iXRStorage> so compile-time childobjectlistproperty type deduction works properly.
/// </summary>
class DbSetStorage extends DataObjectBase_1.DbSet {
    // ---
    static InitStatics() {
        this.DEFAULTNAME = "state";
    }
    // Default name 'state'
    GetEntry(szName = DbSetStorage.DEFAULTNAME) {
        for (let ixd of this.values()) {
            if (ixd.m_szName === szName) {
                return ixd;
            }
        }
        return null;
    }
    // ---
    // Default name 'state'
    async SetEntry(data, bKeepLatest, szOrigin, bSessionData, szName = DbSetStorage.DEFAULTNAME) {
        const dictData = typeof data === 'string'
            ? new DotNetishTypes_1.iXRDictStrings().Construct(data)
            : data;
        // Create new storage entry
        const storage = new iXRStorage().Construct0(bKeepLatest, szName, dictData, szOrigin, bSessionData);
        this.Add(storage);
        return DotNetishTypes_1.iXRResult.eOk;
    }
    // ---
    // Default name 'state'
    async RemoveEntry(szName = DbSetStorage.DEFAULTNAME) {
        const entry = this.GetEntry(szName);
        if (entry) {
            this.erase(entry);
            return DotNetishTypes_1.iXRResult.eOk;
        }
        // ---
        return DotNetishTypes_1.iXRResult.eObjectNotFound;
    }
    async RemoveMultipleEntries(dbContext, bSessionOnly) {
        var eRet;
        var szResponse = "";
        var bChangedSomething = false;
        // Delete from backend.
        eRet = await iXRLibClient_1.iXRLibClient.DeleteMultipleIXRStorageEntries(bSessionOnly, { szResponse });
        // ---
        if (eRet === DotNetishTypes_1.iXRResult.eOk) {
            // Reflect what we just did on backend in device-local db.
            for (let it of this.values()) {
                // If you look at the backend, there is a boolean userOnly flag whose specification is:
                //  true = Delete data for the user only across all devices for the current app.
                //  false = Delete data for the user on the current device only.
                // Note how there is no third clause with that in it... all the entries in the db are
                // on this device and therefore are all to be deleted for either value of that flag.
                if (!bSessionOnly || it.m_bSessionData) {
                    super.erase(it);
                    bChangedSomething = true;
                }
            }
            if (bChangedSomething) {
                if (!(0, iXRLibSQLite_1.DbSuccess)(dbContext.SaveChanges())) {
                    eRet = DotNetishTypes_1.iXRResult.eDeleteObjectsFailedDatabase;
                }
            }
            // ---
            return eRet;
        }
        // ---
        return DotNetishTypes_1.iXRResult.eObjectNotFound;
    }
}
exports.DbSetStorage = DbSetStorage;
;
/// <summary>
/// Last (configured) errors as last resort for those who do not want to call
/// synchronous and wait for error or call asynchronous and handle callback.
/// </summary>
class iXRErrors extends (_3 = iXRBase) {
    // ---
    constructor() {
        super();
        // ---
        this.m_szErrorString = "";
    }
    // ---
    GetMapProperties() {
        return iXRErrors.m_mapProperties;
    }
}
exports.iXRErrors = iXRErrors;
_2 = iXRErrors;
// ---
iXRErrors.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_3, "m_mapProperties", _2).m_rfp, { m_szErrorString: new DataObjectBase_1.FieldProperties("errorString") }));
;
/// <summary>
/// The Entity-Framework-ish database object.
/// </summary>
class iXRDbContext extends (_5 = DataObjectBase_1.DbContext) {
    // ---
    // iXRDbContext() :
    // 	iXRDbContext(false)
    // {
    // }
    constructor(bDeleteIfExists) {
        super();
        // ---
        this.m_dsIXRApplications = new DataObjectBase_1.DbSet(iXRApplication);
        this.m_dsIXRLogs = new DataObjectBase_1.DbSet(iXRLog);
        this.m_dsIXRTelemetry = new DataObjectBase_1.DbSet(iXRTelemetry);
        this.m_dsIXREvents = new DataObjectBase_1.DbSet(iXREvent);
        this.m_dsIXRStorage = new DataObjectBase_1.DbSet(iXRStorage);
        this.m_szDbPath = "";
        // ---
        // 	m_szDbPath = NormalizePath("InformXR.db").c_str();
        // 	if (bDeleteIfExists)
        // 	{
        // 		std.filesystem.path	fpDbPath(m_szDbPath.c_str());
        // 		if (std.filesystem.exists(fpDbPath))
        // 		{
        // 			std.filesystem.remove(fpDbPath);
        // 		}
        // 	}
        // 	ConstructGuts();
    }
    // iXRDbContext(const mstringb& szDbPath) :
    // 	iXRDbContext(szDbPath, false)
    // {
    // }
    // iXRDbContext(const mstringb& szDbPath, bool bDeleteIfExists)
    // {
    // 	std.filesystem.path	fpDbPath(szDbPath.c_str());
    // 	m_szDbPath = szDbPath;
    // 	if (bDeleteIfExists)
    // 	{
    // 		if (std.filesystem.exists(fpDbPath))
    // 		{
    // 			std.filesystem.remove(fpDbPath);
    // 		}
    // 	}
    // 	Construct();
    // }
    // DatabaseResult CreateSchema(SqliteDbConnection& db);
    // DatabaseResult LoadAll(SqliteDbConnection& db)
    // {
    // 	DatabaseResult	eRet = DatabaseResult.eOk,
    // 					eTestRet;
    // 	// We first get the number of child list properties.
    // 	constexpr size_t nbChildObjectListProperties = std.tuple_size<decltype(iXRDbContext.childobjectlistproperties)>.value;
    // 	// Recursively load them.
    // 	for_sequence(std.make_index_sequence<nbChildObjectListProperties>{}, [&](auto i)
    // 	{
    // 		// Get the property.
    // 		constexpr auto	objChildListProperty = std.get<i>(iXRDbContext.childobjectlistproperties);
    // 		// Call this recursively.
    // 		eTestRet = ExecuteSqlSelect(db, objChildListProperty.name, "SELECT %s FROM %s", {}, this->*(objChildListProperty.member));
    // 		if (!DbSuccess(eTestRet))
    // 		{
    // 			eRet = eTestRet;
    // 		}
    // 	});
    // 	// ---
    // 	return eRet;
    // }
    // --- Functions supporting adding/changing/deleting iXRStorage objects.  These objects are "more global" than the other
    //		objects, more like environment variables, hence enjoy pride of place as such.
    // DatabaseResult LoadStorageEntries()
    // {
    // 	return ExecuteSqlSelect(m_db, "iXRStorage", "SELECT %s FROM %s", {}, m_dsIXRStorage);
    // }
    LoadStorageEntriesIfNecessary() {
        // 	if (m_dsIXRStorage.Count() === 0)
        // 	{
        // 		return ExecuteSqlSelect(m_db, "iXRStorage", "SELECT %s FROM %s", {}, m_dsIXRStorage);
        // 	}
        return iXRLibSQLite_1.DatabaseResult.eOk;
    }
    // Default name 'state'
    StorageGetEntry(szName = DbSetStorage.DEFAULTNAME) {
        var pixrs;
        this.LoadStorageEntriesIfNecessary();
        pixrs = this.m_dsIXRStorage.GetEntry(szName);
        // ---
        return (pixrs && !pixrs.m_dsData.empty() && !pixrs.m_dsData[0].m_dspIXRXXXs.empty()) ? pixrs.m_dsData[0].m_dspIXRXXXs[0].m_cdictData : null;
    }
    // Default name 'state'
    StorageGetEntryAsString(szName = DbSetStorage.DEFAULTNAME) {
        var szRet = "";
        var pixrs;
        this.LoadStorageEntriesIfNecessary();
        pixrs = this.m_dsIXRStorage.GetEntry(szName);
        if (pixrs && !pixrs.m_dsData.empty() && !pixrs.m_dsData[0].m_dspIXRXXXs.empty()) {
            szRet = pixrs.m_dsData[0].m_dspIXRXXXs[0].m_cdictData.ToString();
        }
        // ---
        return szRet;
    }
    // Default name 'state'
    async StorageSetEntry(data, bKeepLatest, szOrigin, bSessionData, szName = DbSetStorage.DEFAULTNAME) {
        this.LoadStorageEntriesIfNecessary();
        // ---
        const dictData = typeof data === 'string'
            ? new DotNetishTypes_1.iXRDictStrings().Construct(data)
            : data;
        return await this.m_dsIXRStorage.SetEntry(dictData, bKeepLatest, szOrigin, bSessionData, szName);
    }
    // Default name 'state'
    async StorageRemoveEntry(szName = DbSetStorage.DEFAULTNAME) {
        this.LoadStorageEntriesIfNecessary();
        return await this.m_dsIXRStorage.RemoveEntry(szName);
    }
    async StorageRemoveMultipleEntries(bSessionOnly) {
        this.LoadStorageEntriesIfNecessary();
        // ---
        return await this.m_dsIXRStorage.RemoveMultipleEntries(this, bSessionOnly);
    }
    // --- END Functions supporting adding/changing/deleting iXRStorage objects.
    ConstructGuts() {
        // if (m_db.ConnectSQLite(m_szDbPath) === DatabaseResult.eOk)
        // {
        // 	if (!m_db.HasSchema())
        // 	{
        // 		CreateSchema(m_db);
        // 	}
        // }
    }
    SaveChanges() {
        //return iXRLib.SaveChanges(m_db, null, this);
        return iXRLibSQLite_1.DatabaseResult.eOk;
    }
    // Return dictionary
    getAllData() {
        return new DotNetishTypes_1.iXRDictStrings();
    }
    // --- TESTS.
    // #ifdef _DEBUG
    FakeUpSomeRandomCrap(bWantChildObjects = true) {
        (0, iXRLibCoreModelTests_1.FakeUpSomeRandomCrapDbContext)(this);
    }
}
exports.iXRDbContext = iXRDbContext;
_4 = iXRDbContext;
// ---
iXRDbContext.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_5, "m_mapProperties", _4).m_rfp, 
// ---
{ m_dsIXRApplications: new DataObjectBase_1.FieldProperties("IXRApplications", DataObjectBase_1.FieldPropertyFlags.bfChildList) }, { m_dsIXRLogs: new DataObjectBase_1.FieldProperties("IXRLogs", DataObjectBase_1.FieldPropertyFlags.bfChildList) }, { m_dsIXRTelemetry: new DataObjectBase_1.FieldProperties("IXRTelemetry", DataObjectBase_1.FieldPropertyFlags.bfChildList) }, { m_dsIXREvents: new DataObjectBase_1.FieldProperties("IXREvents", DataObjectBase_1.FieldPropertyFlags.bfChildList) }, { m_dsIXRStorage: new DataObjectBase_1.FieldProperties("IXRStorage", DataObjectBase_1.FieldPropertyFlags.bfChildList) }));
;
/// <summary>
/// Get all the REST endpoints in one place mapped to type being POSTed.
/// </summary>
/// <typeparam name="T">Type being POSTed.</typeparam>
/// <typeparam name="iXRLibConfiguration">Pass in iXRLibConfiguration where this is instantiated... resolves forward-referencing catch-22.</typeparam>
/// <returns>REST endpoint string const.</returns>
function RESTEndpointFromType(tDraft) {
    if (tDraft === iXREvent) {
        return "collect/event";
    }
    else if (tDraft === iXRLog) {
        return "collect/log";
    }
    else if (tDraft === iXRTelemetry) {
        return "collect/telemetry";
    }
    else if (tDraft === iXRAIProxy) {
        return "services/llm";
    }
    else if (tDraft === iXRLibConfiguration) {
        return "storage/config";
    }
    else if (tDraft === iXRStorage) {
        return "storage";
    }
    return "dev/null";
}
exports.RESTEndpointFromType = RESTEndpointFromType;
// The AI suggests these and since this seems to have to be revisited ad infinitum, going to document them with comments.
// export function RESTEndpointFromType<T>(): string
// {
// 	// Map types to their REST endpoints
// 	if ((T as any) === iXREvent) return "events";
// 	if ((T as any) === iXRLog) return "logs";
// 	if ((T as any) === iXRTelemetry) return "telemetry";
// 	if ((T as any) === iXRStorage) return "storage";
// 	if ((T as any) === iXRAIProxy) return "ai/proxy";
// 	return "";
// }
// export function RESTEndpointFromType<T extends iXRBase>(): string
// {
// 	switch (T.name)
// 	{
// 		case 'iXREvent': return 'events';
// 		case 'iXRLog': return 'logs';
// 		case 'iXRTelemetry': return 'telemetry';
// 		case 'iXRStorage': return 'storage';
// 		case 'iXRAIProxy': return 'ai/proxy';
// 		default: return '';
// 	}
// }
//# sourceMappingURL=iXRLibCoreModel.js.map