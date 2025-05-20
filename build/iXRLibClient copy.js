"use strict";
/// <summary>
/// All the partners of which we are aware (for authentication purposes).
///		Comaintain with iXRAnalytics.cs.
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
Object.defineProperty(exports, "__esModule", { value: true });
exports.iXRLibClient = exports.ApiTokenJWT = exports.AuthTokenResponseFailure = exports.AuthTokenResponseFailureDetail = exports.PostObjectsResponseFailure = exports.PostObjectsResponseSuccess = exports.AuthTokenResponseSuccess = exports.AuthTokenDecodedJWT = exports.AuthTokenRequest = exports.StringToPartner = exports.PartnerToString = exports.Partner = void 0;
const iXRLibAnalytics_1 = require("./iXRLibAnalytics");
const iXRLibCoreModel_1 = require("./iXRLibCoreModel");
const types_1 = require("./network/types");
const DataObjectBase_1 = require("./network/utils/DataObjectBase");
const DotNetishTypes_1 = require("./network/utils/DotNetishTypes");
/// </summary>
var Partner;
(function (Partner) {
    Partner[Partner["eNone"] = 0] = "eNone";
    Partner[Partner["eArborXR"] = 1] = "eArborXR";
})(Partner = exports.Partner || (exports.Partner = {}));
;
function PartnerToString(ePartner) {
    switch (ePartner) {
        case Partner.eArborXR:
            return "arborxr";
        default:
            break;
    }
    return "";
}
exports.PartnerToString = PartnerToString;
function StringToPartner(szString) {
    switch (szString) {
        case "arborxr":
            return Partner.eArborXR;
        default:
            break;
    }
    return Partner.eNone;
}
exports.StringToPartner = StringToPartner;
/// <summary>
/// Object that gets POSTed to /auth/token to obtain a JWT.
///		Not in database so does not inherit from DataObjectBase.
/// </summary>
class AuthTokenRequest extends (_b = DataObjectBase_1.DataObjectBase) {
    // ---
    GetMapProperties() {
        return AuthTokenRequest.m_mapProperties;
    }
    // ---
    constructor() {
        super();
        // --- Fixed auth fields taken as parameters to Authenticate().
        this.m_szAppId = "";
        this.m_szOrgId = "";
        this.m_szAuthSecret = "";
        this.m_szDeviceId = "";
        this.m_szSessionId = "";
        this.m_szPartner = ""; // Blank if it is just us (iXR).  Otherwise, "arborxr", ... if not blank this is how backend knows to do further authentication with partner.
        // --- Extra environment-variable kind of data set by properties.
        this.m_szOsVersion = "";
        this.m_szIpAddress = "";
        this.m_szXrdmVersion = "";
        this.m_szAppVersion = "";
        this.m_szUnityVersion = "";
        this.m_szDeviceModel = "";
        this.m_szUserId = "";
        // ---
        this.m_lszTags = new DotNetishTypes_1.StringList();
        this.m_dictGeoLocation = new DotNetishTypes_1.PythonDictStrings();
        this.m_dictAuthMechanism = new DotNetishTypes_1.PythonDictStrings();
        // ---
        this.RefreshSessionId();
    }
    RefreshSessionId() {
        var suid = new types_1.SUID();
        this.m_szSessionId = suid.ToStringPureHex();
    }
}
exports.AuthTokenRequest = AuthTokenRequest;
_a = AuthTokenRequest;
// ---
AuthTokenRequest.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_b, "m_mapProperties", _a).m_rfp, { m_szAppId: new DataObjectBase_1.FieldProperties("app_id") }, { m_szOrgId: new DataObjectBase_1.FieldProperties("org_id") }, { m_szAuthSecret: new DataObjectBase_1.FieldProperties("auth_secret") }, { m_szDeviceId: new DataObjectBase_1.FieldProperties("device_id") }, { m_szSessionId: new DataObjectBase_1.FieldProperties("session_id") }, { m_szPartner: new DataObjectBase_1.FieldProperties("partner") }, 
// ---
{ m_szOsVersion: new DataObjectBase_1.FieldProperties("os_version", DataObjectBase_1.FieldPropertyFlags.bfStringOnly) }, { m_szIpAddress: new DataObjectBase_1.FieldProperties("ip_address") }, { m_szXrdmVersion: new DataObjectBase_1.FieldProperties("xrdm_version", DataObjectBase_1.FieldPropertyFlags.bfStringOnly) }, { m_szAppVersion: new DataObjectBase_1.FieldProperties("app_version", DataObjectBase_1.FieldPropertyFlags.bfStringOnly) }, { m_szUnityVersion: new DataObjectBase_1.FieldProperties("unity_version", DataObjectBase_1.FieldPropertyFlags.bfStringOnly) }, { m_szDeviceModel: new DataObjectBase_1.FieldProperties("device_model") }, { m_szUserId: new DataObjectBase_1.FieldProperties("user_id") }, { m_lszTags: new DataObjectBase_1.FieldProperties("tags") }, { m_dictGeoLocation: new DataObjectBase_1.FieldProperties("geolocation") }, { m_dictAuthMechanism: new DataObjectBase_1.FieldProperties("auth_mechanism") }));
;
/// <summary>
/// When AuthTokenResponseSuccess parses successfully (successful auth), use this to parse the decoded JWT "token" field.
/// </summary>
class AuthTokenDecodedJWT extends (_d = DataObjectBase_1.DataObjectBase) {
    constructor() {
        super(...arguments);
        this.m_utTokenExpiration = 0; // Token expiration in Unix time (time_t).
        this.m_szType = "";
        this.m_szJti = "";
    }
    // ---
    GetMapProperties() {
        return AuthTokenDecodedJWT.m_mapProperties;
    }
}
exports.AuthTokenDecodedJWT = AuthTokenDecodedJWT;
_c = AuthTokenDecodedJWT;
// ---
AuthTokenDecodedJWT.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_d, "m_mapProperties", _c).m_rfp, { m_utTokenExpiration: new DataObjectBase_1.FieldProperties("exp") }, { m_szType: new DataObjectBase_1.FieldProperties("type") }, { m_szJti: new DataObjectBase_1.FieldProperties("jti") }));
;
/// <summary>
/// Success response to auth token request.
/// </summary>
class AuthTokenResponseSuccess extends (_f = DataObjectBase_1.DataObjectBase) {
    constructor() {
        super(...arguments);
        this.m_szToken = ""; // Bearer token to use in future POSTs/etc (JWT).
        this.m_szApiSecret = ""; // Key to use for SHA256 hashing in the header.
    }
    // ---
    GetMapProperties() {
        return AuthTokenResponseSuccess.m_mapProperties;
    }
}
exports.AuthTokenResponseSuccess = AuthTokenResponseSuccess;
_e = AuthTokenResponseSuccess;
// ---
AuthTokenResponseSuccess.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_f, "m_mapProperties", _e).m_rfp, { m_szToken: new DataObjectBase_1.FieldProperties("token") }, { m_szApiSecret: new DataObjectBase_1.FieldProperties("secret") }));
;
/// <summary>
/// Success response to POST events (and Logs, and Telemetry...).
/// </summary>
class PostObjectsResponseSuccess extends (_h = DataObjectBase_1.DataObjectBase) {
    constructor() {
        super(...arguments);
        this.m_szStatus = "";
    }
    // ---
    GetMapProperties() {
        return PostObjectsResponseSuccess.m_mapProperties;
    }
}
exports.PostObjectsResponseSuccess = PostObjectsResponseSuccess;
_g = PostObjectsResponseSuccess;
// ---
PostObjectsResponseSuccess.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_h, "m_mapProperties", _g).m_rfp, { m_szStatus: new DataObjectBase_1.FieldProperties("status") }));
;
/// <summary>
/// Failure response to POST events (and Logs, and Telemetry...).
/// </summary>
class PostObjectsResponseFailure extends (_k = DataObjectBase_1.DataObjectBase) {
    constructor() {
        super(...arguments);
        this.m_szDetail = "";
    }
    // ---
    GetMapProperties() {
        return PostObjectsResponseFailure.m_mapProperties;
    }
}
exports.PostObjectsResponseFailure = PostObjectsResponseFailure;
_j = PostObjectsResponseFailure;
// ---
PostObjectsResponseFailure.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_k, "m_mapProperties", _j).m_rfp, { m_szDetail: new DataObjectBase_1.FieldProperties("detail") }));
;
/// <summary>
/// Failure response to auth token request.
/// </summary>
class AuthTokenResponseFailureDetail extends (_m = DataObjectBase_1.DataObjectBase) {
    // ---
    constructor() {
        super();
        this.m_szMsg = "";
        this.m_szType = "";
        this.m_szInput = "";
        this.m_szUrl = "";
        // ---
        this.m_lszLoc = new DataObjectBase_1.DbSet((types_1.JsonScalarArrayElement));
    }
    GetMapProperties() {
        return AuthTokenResponseFailureDetail.m_mapProperties;
    }
}
exports.AuthTokenResponseFailureDetail = AuthTokenResponseFailureDetail;
_l = AuthTokenResponseFailureDetail;
// ---
AuthTokenResponseFailureDetail.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_m, "m_mapProperties", _l).m_rfp, { m_szMsg: new DataObjectBase_1.FieldProperties("msg") }, { m_szType: new DataObjectBase_1.FieldProperties("type") }, { m_szInput: new DataObjectBase_1.FieldProperties("input") }, { m_szUrl: new DataObjectBase_1.FieldProperties("url") }, 
// ---
{ m_lszLoc: new DataObjectBase_1.FieldProperties("loc", DataObjectBase_1.FieldPropertyFlags.bfChildList) }));
;
/// <summary>
/// Failure response to auth token request.
/// </summary>
class AuthTokenResponseFailure extends (_p = DataObjectBase_1.DataObjectBase) {
    // ---
    constructor() {
        super();
        this.m_szMessage = ""; // This is for failures in the LMS/AuthMechanism flow where we get e.g. {"message": "Invalid assessment pin or the assessment is already active."}
        // ---
        this.m_listDetail = new DataObjectBase_1.DbSet(AuthTokenResponseFailureDetail);
    }
    GetMapProperties() {
        return AuthTokenResponseFailure.m_mapProperties;
    }
}
exports.AuthTokenResponseFailure = AuthTokenResponseFailure;
_o = AuthTokenResponseFailure;
// ^^^ Both of these are simply unioned and it will find and parse whichever is present.
// ---
AuthTokenResponseFailure.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_p, "m_mapProperties", _o).m_rfp, { m_szMessage: new DataObjectBase_1.FieldProperties("message") }, 
// ---
{ m_listDetail: new DataObjectBase_1.FieldProperties("detail", DataObjectBase_1.FieldPropertyFlags.bfChildList) }));
;
/// <summary>
/// Wrote this when I thought I had to generate it.  May have need of it someday, i.e. for decoding,
///		so leaving it in but do not be confused by it... not being used by anything at the moment.
/// </summary>
class ApiTokenJWT extends (_r = DataObjectBase_1.DataObjectBase) {
    // ---
    // ApiTokenJWT() = default;
    constructor(szDeviceId, szUserId) {
        super();
        this.m_szType = "";
        this.m_szDeviceId = "";
        this.m_szUserId = "";
        this.SetupAccessJWT(szDeviceId, szUserId);
    }
    SetupAccessJWT(szDeviceId, szUserId) {
        this.m_szType = "access";
        this.m_szDeviceId = szDeviceId;
        this.m_szUserId = szUserId;
    }
    // ---
    GetMapProperties() {
        return ApiTokenJWT.m_mapProperties;
    }
}
exports.ApiTokenJWT = ApiTokenJWT;
_q = ApiTokenJWT;
// ToJWTString(szKey: string): string
// {
// 	var	mapPayload = { ["type", m_szType], ["device_id", m_szDeviceId], ["user_id", m_szUserId] };
// 	return JWTEncode(szKey, mapPayload);
// }
// ---
ApiTokenJWT.m_mapProperties = new DataObjectBase_1.FieldPropertiesRecordContainer(Object.assign({}, Reflect.get(_r, "m_mapProperties", _q).m_rfp, { m_szType: new DataObjectBase_1.FieldProperties("type") }, { m_szDeviceId: new DataObjectBase_1.FieldProperties("device_id") }, { m_szUserId: new DataObjectBase_1.FieldProperties("user_id") }));
;
// ---
/// <summary>
/// Object for communicating with the REST interface.
///		This layer knows the REST endpoints and sends the data and acquires the response.
///		Layer calling this handles parsing/interpreting the response.
/// </summary>
class iXRLibClient {
    /// <summary>
    /// Core template-function for POSTing list of T to backend.
    /// </summary>
    /// <typeparam name="T">Type of object being POSTed.</typeparam>
    /// <typeparam name="iXRLibAnalytics">Pass in iXRLibAnalytics where this is instantiated... resolves forward-referencing catch-22.</typeparam>
    /// <typeparam name="iXRLibConfiguration">Pass in iXRLibConfiguration where this is instantiated... resolves forward-referencing catch-22.</typeparam>
    /// <param name="listpXXXs">List of pointers to Ts to be JSONed and POSTed.</param>
    /// <(type)param name="tTypeOfT">Type of object to be deleted as an any due to TypeScript's screwiness w.r.t. generics.</typeparam>
    /// <param name="szRESTEndpoint">Backend REST endpoint that receives the POST.</param>
    /// <param name="szResponse">Response from backend... either success JSON or failure JSON.</param>
    /// <returns>iXRResult status code.</returns>
    static async PostIXRXXXs(listpXXXs, tTypeOfT, bOneAtATime, rpResponse) {
        try {
            var ixrXXXContainer = new iXRLibCoreModel_1.iXRXXXContainer(tTypeOfT, false);
            var eTestCurlRet, eCurlRet = true;
            var eJsonRet;
            var szJSON = "";
            var eReauthResult;
            var mbBodyContent = Buffer.from("");
            var objResponseSuccess = new PostObjectsResponseSuccess(); // e.g. {"status":"success"}
            var objResponseFailure = new PostObjectsResponseFailure(); // e.g. {"detail":"Invalid Login - Hash"}
            if (bOneAtATime) {
                var list1pXXXs = new DataObjectBase_1.DbSet(tTypeOfT);
                // list1pXXXs.push(null);
                for (let pT of listpXXXs.values()) {
                    var objRequest = new types_1.CurlHttp();
                    // Backend complains about "missing name" which is not actually missing with this one.
                    //szJSON = GenerateJson(*pT, DumpCategory.eDumpingJsonForBackend);
                    // Backend complains about "it should be a valid list" with this one.
                    //szJSON = GenerateJsonAlternate(ixrXXXContainer, DumpCategory.eDumpingJsonForBackend, { {"data", [&]()->mstringb { return GenerateJson<T, 1>(*pT, DumpCategory.eDumpingJsonForBackend); } } });
                    list1pXXXs[0] = pT;
                    szJSON = (0, DataObjectBase_1.GenerateJsonAlternate)(ixrXXXContainer, DataObjectBase_1.DumpCategory.eDumpingJsonForBackend, [["data", () => { return (0, DataObjectBase_1.GenerateJsonList)(list1pXXXs, DataObjectBase_1.DumpCategory.eDumpingJsonForBackend); }]]);
                    mbBodyContent = Buffer.from(szJSON);
                    // OUTPUTDEBUGSTRING(szJSON, "\n");
                    await iXRLibAnalytics_1.iXRLibAnalytics.SetHeadersFromCurrentState(objRequest, Buffer.from(szJSON), true, true);
                    eTestCurlRet = await objRequest.Post(iXRLibAnalytics_1.iXRLibAnalytics.FinalUrl((0, iXRLibCoreModel_1.RESTEndpointFromType)(tTypeOfT)), [], mbBodyContent, rpResponse);
                    // OUTPUTDEBUGSTRING(szResponse, "\n");
                    if (!eTestCurlRet) {
                        eCurlRet = eTestCurlRet;
                    }
                }
            }
            else {
                var objRequest = new types_1.CurlHttp();
                szJSON = (0, DataObjectBase_1.GenerateJsonAlternate)(ixrXXXContainer, DataObjectBase_1.DumpCategory.eDumpingJsonForBackend, [["data", () => { return (0, DataObjectBase_1.GenerateJsonList)(listpXXXs, DataObjectBase_1.DumpCategory.eDumpingJsonForBackend); }]]);
                mbBodyContent = Buffer.from(szJSON);
                // OUTPUTDEBUGSTRING(szJSON, "\n");
                await iXRLibAnalytics_1.iXRLibAnalytics.SetHeadersFromCurrentState(objRequest, mbBodyContent, true, true);
                eCurlRet = await objRequest.Post(iXRLibAnalytics_1.iXRLibAnalytics.FinalUrl((0, iXRLibCoreModel_1.RESTEndpointFromType)(tTypeOfT)), [], mbBodyContent, rpResponse);
                // OUTPUTDEBUGSTRING(szJSON, "\n\nRESPONSE:\n\n", szResponse);
            }
            // Judgment call here... if (bOneAtATime) then szResponse will be the last response and this will react to that.
            // Betting that trying to do all of them and maybe some will get through is the good policy.  It may prove that
            // bailing on the first failure is better but I do not know for sure.
            if (eCurlRet) {
                eJsonRet = (0, DataObjectBase_1.LoadFromJson)(objResponseSuccess, rpResponse.szResponse);
                if (eJsonRet === DotNetishTypes_1.JsonResult.eOk) {
                    return DotNetishTypes_1.iXRResult.eOk;
                }
                else {
                    // Did not get success, does failure parse?
                    eJsonRet = (0, DataObjectBase_1.LoadFromJson)(objResponseFailure, rpResponse.szResponse);
                    if (eJsonRet === DotNetishTypes_1.JsonResult.eOk) {
                        // Failure parses, probably auth error.
                        eReauthResult = await iXRLibAnalytics_1.iXRLibInit.ReAuthenticate(true);
                        if (eReauthResult != DotNetishTypes_1.iXRResult.eOk) {
                            return eReauthResult;
                        }
                    }
                    else {
                        // Response does not parse.
                        return DotNetishTypes_1.iXRResult.ePostObjectsBadJsonResponse;
                    }
                }
            }
            else {
                return DotNetishTypes_1.iXRResult.ePostObjectsFailedNetworkError;
            }
        }
        catch (error) {
            console.log("Error: ", error);
            // ---
            return DotNetishTypes_1.iXRResult.ePostObjectsFailed;
        }
        // ---
        return DotNetishTypes_1.iXRResult.eOk;
    }
    // TODO:  Summary this when dust has settled.
    static async GetIXRXXXs(tTypeOfT, vpszQueryParameters, /*OUT*/ ptContainedResponse, /*OUT*/ ptResponse) {
        try {
            var objRequest = new types_1.CurlHttp();
            var eCurlRet;
            var eJsonRet;
            var eReauthResult;
            var rpResponse = { szResponse: "" };
            var objResponseFailure = new PostObjectsResponseFailure(); // e.g. {"detail":"Invalid Login - Hash"}
            await iXRLibAnalytics_1.iXRLibAnalytics.SetHeadersFromCurrentState(objRequest, Buffer.from(""), false, true);
            eCurlRet = await objRequest.Get(iXRLibAnalytics_1.iXRLibAnalytics.FinalUrl((0, iXRLibCoreModel_1.RESTEndpointFromType)(tTypeOfT)), vpszQueryParameters, rpResponse);
            // OUTPUTDEBUGSTRING("RESPONSE:\n", szResponse, "\n");
            if (eCurlRet) {
                if (ptResponse) {
                    eJsonRet = (0, DataObjectBase_1.LoadFromJson)(ptResponse, rpResponse.szResponse);
                }
                else {
                    eJsonRet = (0, DataObjectBase_1.LoadFromJson)(ptContainedResponse, rpResponse.szResponse);
                }
                if (eJsonRet === DotNetishTypes_1.JsonResult.eOk) {
                    return DotNetishTypes_1.iXRResult.eOk;
                }
                else {
                    // Did not get success, does failure parse?
                    eJsonRet = (0, DataObjectBase_1.LoadFromJson)(objResponseFailure, rpResponse.szResponse);
                    if (eJsonRet === DotNetishTypes_1.JsonResult.eOk) {
                        // Failure parses, probably auth error.
                        eReauthResult = await iXRLibAnalytics_1.iXRLibInit.ReAuthenticate(true);
                        if (eReauthResult != DotNetishTypes_1.iXRResult.eOk) {
                            return eReauthResult;
                        }
                    }
                    else {
                        // Response does not parse.
                        return DotNetishTypes_1.iXRResult.ePostObjectsBadJsonResponse;
                    }
                }
            }
            else {
                return DotNetishTypes_1.iXRResult.ePostObjectsFailedNetworkError;
            }
        }
        catch (error) {
            console.log("Error: ", error);
            //WriteLine($"Error: {ex.Message}\nStackTrace: {ex.StackTrace}");
            // ---
            return DotNetishTypes_1.iXRResult.ePostObjectsFailed;
        }
        // ---
        return DotNetishTypes_1.iXRResult.eOk;
    }
    // TODO:  Summary this when dust has settled.
    static async DeleteIXRXXX(tTypeOfT, vpszQueryParameters, rpResponse) {
        try {
            var objRequest = new types_1.CurlHttp();
            var eCurlRet;
            var eJsonRet;
            var eReauthResult;
            var objResponseSuccess = new PostObjectsResponseSuccess(); // e.g. {"status":"all data reset"}
            var objResponseFailure = new PostObjectsResponseFailure(); // e.g. {"detail":"Invalid Login - Hash"}
            await iXRLibAnalytics_1.iXRLibAnalytics.SetHeadersFromCurrentState(objRequest, Buffer.from(""), false, true);
            eCurlRet = await objRequest.Delete(iXRLibAnalytics_1.iXRLibAnalytics.FinalUrl((0, iXRLibCoreModel_1.RESTEndpointFromType)(tTypeOfT)), vpszQueryParameters, rpResponse);
            // OUTPUTDEBUGSTRING(szResponse, "\n");
            if (eCurlRet) {
                eJsonRet = (0, DataObjectBase_1.LoadFromJson)(objResponseSuccess, rpResponse.szResponse);
                if (eJsonRet === DotNetishTypes_1.JsonResult.eOk) {
                    return DotNetishTypes_1.iXRResult.eOk;
                }
                else {
                    // Did not get success, does failure parse?
                    eJsonRet = (0, DataObjectBase_1.LoadFromJson)(objResponseFailure, rpResponse.szResponse);
                    if (eJsonRet === DotNetishTypes_1.JsonResult.eOk) {
                        // Failure parses, probably auth error.
                        eReauthResult = await iXRLibAnalytics_1.iXRLibInit.ReAuthenticate(true);
                        if (eReauthResult != DotNetishTypes_1.iXRResult.eOk) {
                            return eReauthResult;
                        }
                    }
                    else {
                        // Response does not parse.
                        return DotNetishTypes_1.iXRResult.eDeleteObjectsBadJsonResponse;
                    }
                }
            }
            else {
                return DotNetishTypes_1.iXRResult.eDeleteObjectsFailedNetworkError;
            }
        }
        catch (error) {
            console.log("Error: ", error);
            //WriteLine($"Error: {ex.Message}\nStackTrace: {ex.StackTrace}");
            // ---
            return DotNetishTypes_1.iXRResult.eDeleteObjectsFailed;
        }
        // ---
        return DotNetishTypes_1.iXRResult.eOk;
    }
    // ---
    /// <summary>
    /// POST as JSON an authentication request and acquire the token (or error if not).
    /// </summary>
    /// <param name="authTokenRequest"></param>
    /// <returns>Success or failure</returns>
    static async PostAuthenticate(authTokenRequest, rpResponse) {
        var objRequest = new types_1.CurlHttp();
        var eCurlRet;
        var szJSON = (0, DataObjectBase_1.GenerateJson)(authTokenRequest, DataObjectBase_1.DumpCategory.eDumpEverything);
        var mbBodyContent = Buffer.from(szJSON);
        try {
            // Set additional headers from current state
            await iXRLibAnalytics_1.iXRLibAnalytics.SetHeadersFromCurrentState(objRequest, mbBodyContent, true, false);
            // Debug logging
            console.log("Authentication Request:", {
                url: iXRLibAnalytics_1.iXRLibAnalytics.FinalUrl("auth/token"),
                requestBody: JSON.parse(szJSON)
            });
            eCurlRet = await objRequest.Post(iXRLibAnalytics_1.iXRLibAnalytics.FinalUrl("auth/token"), [], mbBodyContent, rpResponse);
            // Response logging
            console.log("Authentication Response:", {
                success: eCurlRet,
                response: rpResponse.szResponse,
                responseObject: JSON.parse(rpResponse.szResponse)
            });
            if (!eCurlRet) {
                return DotNetishTypes_1.iXRResult.eAuthenticateFailedNetworkError;
            }
        }
        catch (error) {
            console.log("Authentication Error:", error);
            return DotNetishTypes_1.iXRResult.eAuthenticateFailed;
        }
        return DotNetishTypes_1.iXRResult.eOk;
    }
    // ---
    static async GetIXRConfig(/*OUT*/ ixrConfiguration) {
        var szRestUrl = ixrConfiguration.GetRestUrl();
        var eRet = await iXRLibClient.GetIXRXXXs(iXRLibCoreModel_1.iXRLibConfiguration, [], null, ixrConfiguration);
        // Judgment call here... restore the REST_URL to what it was before getting the config from the backend.
        // For example, when I am running test code, the local backend populates this field with the cloud URL,
        // which bwns up the future requests if allowed to stand.  And I do not see any downside as how could we
        // have communicated to the backend without a URL that was valid to begin with?
        ixrConfiguration.SetRestUrl(szRestUrl);
        // ---
        return eRet;
    }
    static async GetIXRStorage(/*OUT*/ ixrStorage) {
        return await iXRLibClient.GetIXRXXXs(iXRLibCoreModel_1.iXRStorage, [], ixrStorage, null);
    }
    /// <summary>
    /// Delete single iXRStorage entry by name.
    ///		Note neither of these are using the "userOnly" flag as it should always be default false indicating current device.
    /// </summary>
    /// <param name="szName">Name of the Storage element.</param>
    /// <param name="szResponse">Response from backend.</param>
    /// <returns>iXRResult status code.</returns>
    static async DeleteIXRStorageEntry(szName, rpResponse) {
        return await iXRLibClient.DeleteIXRXXX(iXRLibCoreModel_1.iXRStorage, [["name", szName]], rpResponse);
    }
    /// <summary>
    /// Delete iXRStorage entries for this device, either session only or all of them.
    ///		Note neither of these are using the "userOnly" flag as it should always be default false indicating current device.
    /// </summary>
    /// <param name="bSessionOnly">true if only session data is to be deleted, else all data.</param>
    /// <param name="szResponse">Response from backend.</param>
    /// <returns>iXRResult status code.</returns>
    static async DeleteMultipleIXRStorageEntries(bSessionOnly, rpResponse) {
        return await iXRLibClient.DeleteIXRXXX(iXRLibCoreModel_1.iXRStorage, [["sessionOnly", (bSessionOnly) ? "true" : "false"]], rpResponse);
    }
    // ---
    static async PostIXREvents(listpEvents, bOneAtATime, rpResponse) {
        return await iXRLibClient.PostIXRXXXs(listpEvents, iXRLibCoreModel_1.iXREvent, bOneAtATime, rpResponse);
    }
    static async PostIXRAIProxyObjects(listpAIProxyObjects, bOneAtATime, rpResponse) {
        return await iXRLibClient.PostIXRXXXs(listpAIProxyObjects, iXRLibCoreModel_1.iXRAIProxy, bOneAtATime, rpResponse);
    }
    static async PostIXRLogs(listpLogs, bOneAtATime, rpResponse) {
        return await iXRLibClient.PostIXRXXXs(listpLogs, iXRLibCoreModel_1.iXRLog, bOneAtATime, rpResponse);
    }
    static async PostIXRTelemetry(listpTelemetry, bOneAtATime, rpResponse) {
        return await iXRLibClient.PostIXRXXXs(listpTelemetry, iXRLibCoreModel_1.iXRTelemetry, bOneAtATime, rpResponse);
    }
    static async PostIXRAIProxy(listpAIProxy, bOneAtATime, rpResponse) {
        return await iXRLibClient.PostIXRXXXs(listpAIProxy, iXRLibCoreModel_1.iXRAIProxy, bOneAtATime, rpResponse);
    }
    static async PostIXRStorage(listpStorage, bOneAtATime, rpResponse) {
        return await iXRLibClient.PostIXRXXXs(listpStorage, iXRLibCoreModel_1.iXRStorage, bOneAtATime, rpResponse);
    }
    // ---
    /// <summary>
    /// Debug/Test code... output diagnostic information for other debug/test code.
    /// </summary>
    /// <param name="szLine"></param>
    static WriteLine(szLine) {
        // https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/preprocessor-directives
        szLine = (0, types_1.EnsureSingleEndingCharacter)(szLine, '\n');
        // if (Platform.IsWindows())
        // {
        console.log(szLine);
        // }
        // else
        // {
        // 	OutputDebugStringA(szLine);
        // }
        iXRLibAnalytics_1.iXRLibAnalytics.DiagnosticWriteLine(szLine);
    }
}
exports.iXRLibClient = iXRLibClient;
;
//# sourceMappingURL=iXRLibClient%20copy.js.map