"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iXRLibAnalytics = exports.iXRLibInit = void 0;
const iXRLibGlobal_1 = require("./iXRLibGlobal");
const iXRLibAsync_1 = require("./iXRLibAsync");
const iXRLibClient_1 = require("./iXRLibClient");
const iXRLibCoreModel_1 = require("./iXRLibCoreModel");
const iXRLibStorage_1 = require("./iXRLibStorage");
const types_1 = require("./network/types");
const crc32_1 = require("./network/utils/crc32");
const cryptoUtils_1 = require("./network/utils/cryptoUtils");
const DataObjectBase_1 = require("./network/utils/DataObjectBase");
const DotNetishTypes_1 = require("./network/utils/DotNetishTypes");
const JWT_1 = require("./network/utils/JWT");
/// <summary>
/// Object for authenticating with iXR webservice.
/// </summary>
class Authentication {
    // ---
    constructor() {
        this.m_szApiToken = ""; // JWT token obtained by authentication phase.  Goes into "Authentication:  Bearer" header.
        this.m_szApiSecret = ""; // Secret obtained by authentication phase.  Gets incorporated into SHA256 hash in X-iXRLib-Hash.
        this.m_szSessionId = ""; // Current session-id to be re-used on re-login.
        this.m_szAppID = "";
        this.m_szOrgID = "";
        // ---
        this.m_szAuthSecret = ""; // Not exposed via properties or anything else, only available to iXRLibInit for use in 2-stage authentication (dictAuthMechanism flows)... in C++, no friend classes in TypeScript so public.
        this.m_dtTokenExpiration = new DotNetishTypes_1.DateTime();
        this.m_dtTokenExpiration.setFullYear(types_1.DATEMAXVALUE);
        this.m_ePartner = iXRLibClient_1.Partner.eNone;
        // ---
        this.m_objAuthTokenRequest = new iXRLibClient_1.AuthTokenRequest();
    }
    // ---
    // Cat these together, then checksum then timestamp and hash it.
    // Headers for Hash, Timestamp, ApiToken, HardwareID.  Alternately or in addition to... JWT token?
    async SetHeadersFromCurrentState(objRequest, pbBodyContent, bHasBody) {
        try {
            const dtNow = new DotNetishTypes_1.DateTime();
            var szHashSource = this.m_szApiToken + this.m_szApiSecret + dtNow.ToUnixTimeAsString();
            var szHash = "";
            var nCrc32;
            if (bHasBody) {
                nCrc32 = (0, crc32_1.crc32)(pbBodyContent);
                // MJPQ:  unsigned?
                szHashSource += nCrc32.toString();
            }
            // MJPQ:  Lovely that the line after this solves the problem but this SHOULD work and would be nice to know what the big secret is for TypeScript base64 functioning correctly.
            // szHash = Base64.Encode(await SHA256(szHashSource));
            szHash = await (0, cryptoUtils_1.sha256)(szHashSource);
            // ---
            objRequest.AddHttpAuthHeader("Bearer", this.m_szApiToken);
            objRequest.AddHttpHeader("X-iXRLib-Hash", szHash);
            objRequest.AddHttpHeader("X-iXRLib-Timestamp", dtNow.ToUnixTimeAsString());
        }
        catch (error) {
            console.log("Error: ", error);
        }
    }
    TokenExpirationImminent() {
        return (DotNetishTypes_1.DateTime.Now() + new DotNetishTypes_1.TimeSpan().Construct0(0, 1, 0).totalMilliseconds >= this.m_dtTokenExpiration.getMilliseconds());
    }
}
/// <summary>
/// Object for setting up and cleaning up the library, and authenticating.
/// </summary>
class iXRLibInit {
    // ---
    static InitStatics() {
        this.m_ixrLibAuthentication = new Authentication();
    }
    // --- Initialization and its ancillaries.
    // Upon init/inclusion of the library we need to set the class variables.
    // Once we have the currentId set, we will also call GetAllData() so that its ready in cache right away.
    static Start() {
        (0, iXRLibGlobal_1.InitAllStatics)();
        // ---
        if (!iXRLibStorage_1.iXRLibStorage.m_ixrLibConfiguration.ReadConfig()) {
            iXRLibAnalytics.m_listErrors.push("Could not read AppConfig.");
            iXRLibAnalytics.DiagnosticWriteLine("Could not read AppConfig.");
        }
    }
    static End() {
    }
    /// <summary>
    /// Hit the authentication endpoint with the passed in data and if successful, store the (token, secret)
    ///		which will then get incorporated into the header information of every POST event call.
    /// </summary>
    /// <param name="szAppId">Identifies the application running on the headset</param>
    /// <param name="szOrgId">Identifies the organization that owns the application running on the headset</param>
    /// <param name="szCurrId">Current ID</param>
    /// <param name="szAuthSecret">Auth secret... obtained from, e.g., Arbor or whomever</param>
    /// <param name="szPartner">Blank if just iXR, "arborxr" or whomever if partner... this is how backend knows to do further AuthSecret validation with partner.</param>
    /// <param name="bNewSession">true on initial authentication, false (use current) on reauthenticate.</param>
    /// <param name="bLookForAuthMechanism">true on initial authentication that uses AuthMechanism, i.e. need PIN from headset, false for standard single-step authentication.</param>
    /// <returns>iXRResult enum</returns>
    static async AuthenticateGuts(szAppId, szOrgId, szDeviceId, szAuthSecret, ePartner, bNewSession, bLookForAuthMechanism) {
        var objAuthTokenRequest = new iXRLibClient_1.AuthTokenRequest();
        var eRet = DotNetishTypes_1.iXRResult.eOk;
        var rpResponse = { szResponse: "" };
        // Stuff these into this object's property variables for future ReAuthenticate().
        this.set_AppID(szAppId);
        this.set_OrgID(szOrgId);
        if (!bNewSession) {
            // Using pre-existing session, countermand constructed new one.
            objAuthTokenRequest.m_szSessionId = iXRLibInit.m_ixrLibAuthentication.m_szSessionId;
        }
        iXRLibAnalytics.set_DeviceId(szDeviceId);
        this.set_Partner(ePartner);
        // Set the core auth fields.
        objAuthTokenRequest.m_szAppId = szAppId;
        objAuthTokenRequest.m_szOrgId = szOrgId;
        objAuthTokenRequest.m_szAuthSecret = szAuthSecret;
        objAuthTokenRequest.m_szDeviceId = szDeviceId; // May also need UserId at some point.
        objAuthTokenRequest.m_szPartner = (0, iXRLibClient_1.PartnerToString)(ePartner);
        // Set the environment/session fields that come along for the ride in the auth payload.
        objAuthTokenRequest.m_szOsVersion = iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_szOsVersion;
        objAuthTokenRequest.m_szIpAddress = iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_szIpAddress;
        objAuthTokenRequest.m_szXrdmVersion = iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_szXrdmVersion;
        objAuthTokenRequest.m_szAppVersion = iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_szAppVersion;
        objAuthTokenRequest.m_szUnityVersion = iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_szUnityVersion;
        objAuthTokenRequest.m_szDeviceModel = iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_szDeviceModel;
        objAuthTokenRequest.m_szUserId = iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_szUserId;
        objAuthTokenRequest.m_lszTags = iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_lszTags;
        objAuthTokenRequest.m_dictGeoLocation = iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_dictGeoLocation;
        objAuthTokenRequest.m_dictAuthMechanism = iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_dictAuthMechanism;
        // ---
        eRet = await iXRLibClient_1.iXRLibClient.PostAuthenticate(objAuthTokenRequest, rpResponse);
        if (eRet === DotNetishTypes_1.iXRResult.eOk) {
            var eSuccessParse, eFailureParse, eJWTParse;
            var objAuthTokenResponseSuccess = new iXRLibClient_1.AuthTokenResponseSuccess();
            var objAuthTokenResponseFailure = new iXRLibClient_1.AuthTokenResponseFailure();
            var objAuthTokenDecodedJWT = new iXRLibClient_1.AuthTokenDecodedJWT();
            eSuccessParse = (0, DataObjectBase_1.LoadFromJson)(objAuthTokenResponseSuccess, rpResponse.szResponse);
            eFailureParse = (0, DataObjectBase_1.LoadFromJson)(objAuthTokenResponseFailure, rpResponse.szResponse);
            if (eSuccessParse === DotNetishTypes_1.JsonResult.eBadJsonStructure || eFailureParse === DotNetishTypes_1.JsonResult.eBadJsonStructure) {
                eRet = DotNetishTypes_1.iXRResult.eCorruptJson;
            }
            else if (eSuccessParse === DotNetishTypes_1.JsonResult.eOk) {
                var szJWT;
                iXRLibInit.m_ixrLibAuthentication.m_szApiToken = objAuthTokenResponseSuccess.m_szToken;
                iXRLibInit.m_ixrLibAuthentication.m_szApiSecret = objAuthTokenResponseSuccess.m_szApiSecret;
                // This is purely internal to this object... for two-step authentications using dictAuthMechanism so FinalAuthenticate() can use the same one used here.
                iXRLibInit.m_ixrLibAuthentication.m_szAuthSecret = szAuthSecret;
                // Set current session only on successful login.
                iXRLibInit.m_ixrLibAuthentication.m_szSessionId = objAuthTokenRequest.m_szSessionId;
                // --- iXRLibInit.m_ixrLibAuthentication.m_szApiToken is a JWT token that contains, among other things, an "exp"
                //		field which is the Unix time of token expiration.
                szJWT = (0, JWT_1.JWTDecode)(iXRLibInit.m_ixrLibAuthentication.m_szApiToken);
                eJWTParse = (0, DataObjectBase_1.LoadFromJson)(objAuthTokenDecodedJWT, szJWT);
                if (eJWTParse === DotNetishTypes_1.JsonResult.eOk) {
                    iXRLibInit.m_ixrLibAuthentication.m_dtTokenExpiration.FromUnixTime(objAuthTokenDecodedJWT.m_utTokenExpiration);
                }
                else {
                    // For now, silently shrug off not getting the token expiration.  At this stage of development,
                    // it is excessively fastidious/brittle to fail due to this.
                }
                // --- While we are here, and now that we are authenticated, try and get the config from the backend.
                eRet = await iXRLibStorage_1.iXRLibStorage.ReadConfigFromBackend(bLookForAuthMechanism);
            }
            else {
                eRet = DotNetishTypes_1.iXRResult.eAuthenticateFailed;
            }
        }
        // ---
        return eRet;
    }
    /// <summary>
    /// Hit the authentication endpoint with the passed in data and if successful, store the (token, secret)
    ///		which will then get incorporated into the header information of every POST event call.
    ///		THIS IS DEFAULT or FIRST-STEP-of-EXTRA-AUTH CASE:  single Authenticate() with new session that ReAuthenticate() will reuse / First step of 2-step-extra-auth
    ///		if we get back extra auth info from backend when issuing the request here.
    /// </summary>
    /// <param name="szAppId">Identifies the application running on the headset</param>
    /// <param name="szOrgId">Identifies the organization that owns the application running on the headset</param>
    /// <param name="szCurrId">Current ID</param>
    /// <param name="szAuthSecret">Auth secret... obtained from, e.g., Arbor or whomever</param>
    /// <param name="szPartner">Blank if just iXR, "arborxr" or whomever if partner... this is how backend knows to do further AuthSecret validation with partner.</param>
    /// <returns>iXRResult enum</returns>
    static async Authenticate(szAppId, szOrgId, szDeviceId, szAuthSecret, ePartner) {
        return await iXRLibInit.AuthenticateGuts(szAppId, szOrgId, szDeviceId, szAuthSecret, ePartner, true, true);
    }
    /// <summary>
    /// Hit the authentication endpoint with the passed in data and if successful, store the (token, secret)
    ///		which will then get incorporated into the header information of every POST event call.
    ///		THIS IS SECOND/FINAL STEP OF EXTRAUTH CASE:  Authenticate() with session and m_dictExtraAuthData copied into the auth session field from Authenticate().
    /// </summary>
    /// <param name="szAppId">Identifies the application running on the headset</param>
    /// <param name="szOrgId">Identifies the organization that owns the application running on the headset</param>
    /// <param name="szCurrId">Current ID</param>
    /// <param name="szAuthSecret">Auth secret... obtained from, e.g., Arbor or whomever</param>
    /// <param name="szPartner">Blank if just iXR, "arborxr" or whomever if partner... this is how backend knows to do further AuthSecret validation with partner.</param>
    /// <returns>iXRResult enum</returns>
    static async FinalAuthenticate() {
        return await iXRLibInit.AuthenticateGuts(iXRLibInit.get_AppID(), iXRLibInit.get_OrgID(), iXRLibAnalytics.get_DeviceId(), iXRLibInit.m_ixrLibAuthentication.m_szAuthSecret, iXRLibInit.get_Partner(), false, false);
    }
    /// <summary>
    /// Called by POST/PUT/WHATEVER objects to backend when backend returns an auth error.
    ///		Attempt to acquire the latest secret via user-registered callback (if flagged)
    ///		and then auth with it and the other variables used to Authenticate() initially
    ///		(or set via properties) prior to calling this.
    /// </summary>
    /// <param name="bObtainAuthSecret">false = auth with current (appid, orgid, deviceid, authsecret), true = grab the authSecret with user-registered callback before attempting authentication.</param>
    /// <returns>iXRResult enum.</returns>
    static async ReAuthenticate(bObtainAuthSecret) {
        var szAuthSecret;
        if (bObtainAuthSecret) {
            szAuthSecret = iXRLibAnalytics.m_pfnGetAuthSecretCallback(iXRLibAnalytics.m_pvGetAuthSecretCallbackData);
            if (!szAuthSecret || szAuthSecret === '') {
                return DotNetishTypes_1.iXRResult.eCouldNotObtainAuthSecret;
            }
            return await iXRLibInit.AuthenticateGuts(iXRLibInit.get_AppID(), iXRLibInit.get_OrgID(), iXRLibAnalytics.get_DeviceId(), szAuthSecret, iXRLibInit.get_Partner(), false, false);
        }
        // ---
        return await iXRLibInit.AuthenticateGuts(iXRLibInit.get_AppID(), iXRLibInit.get_OrgID(), iXRLibAnalytics.get_DeviceId(), iXRLibInit.get_ApiSecret(), iXRLibInit.get_Partner(), false, false);
    }
    /// <summary>
    /// Wrapper for Core-core function to force send unsent objects synchronously.  Used to be inlined in ^^^ TimerCallback().
    ///		Now we want it to be callable on its own for the user-goes-to-the-bog-then-resumes-playing workflow.
    /// </summary>
    /// <returns>iXRResult enum.</returns>
    static async ForceSendUnsentSynchronous() {
        return await iXRLibAnalytics.ForceSendUnsentSynchronous();
    }
    // --- End Initialization and its ancillaries.
    // --- Authentication fields.
    static get_ApiToken() { return iXRLibInit.m_ixrLibAuthentication.m_szApiToken; }
    static set_ApiToken(szApiToken) { iXRLibInit.m_ixrLibAuthentication.m_szApiToken = szApiToken; }
    // ---
    static get_ApiSecret() { return iXRLibInit.m_ixrLibAuthentication.m_szApiSecret; }
    static set_ApiSecret(szApiSecret) { iXRLibInit.m_ixrLibAuthentication.m_szApiSecret = szApiSecret; }
    // --- ^^^ These 2 are obtained from the Authentication endpoint.  vvv These are iXRAnalytics.m_ixrLibAuthentication fields that these properties can set for future (re)authentication.
    static get_AppID() { return iXRLibInit.m_ixrLibAuthentication.m_szAppID; }
    static set_AppID(szAppID) { iXRLibInit.m_ixrLibAuthentication.m_szAppID = szAppID; }
    // ---
    static get_OrgID() { return iXRLibInit.m_ixrLibAuthentication.m_szOrgID; }
    static set_OrgID(szOrgID) { iXRLibInit.m_ixrLibAuthentication.m_szOrgID = szOrgID; }
    // ---
    static get_TokenExpiration() { return iXRLibInit.m_ixrLibAuthentication.m_dtTokenExpiration; }
    static set_TokenExpiration(dtTokenExpiration) { iXRLibInit.m_ixrLibAuthentication.m_dtTokenExpiration = dtTokenExpiration; }
    // ---
    static get_Partner() { return iXRLibInit.m_ixrLibAuthentication.m_ePartner; }
    static set_Partner(value) { iXRLibInit.m_ixrLibAuthentication.m_ePartner = value; }
    // --- Environment/session globals that get sent with the auth payload in Authenticate() functions.
    static get_OsVersion() { return iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_szOsVersion; }
    static set_OsVersion(szOsVersion) { iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_szOsVersion = szOsVersion; }
    // ---
    static get_IpAddress() { return iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_szIpAddress; }
    static set_IpAddress(szIpAddress) { iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_szIpAddress = szIpAddress; }
    // ---
    static get_XrdmVersion() { return iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_szXrdmVersion; }
    static set_XrdmVersion(szXrdmVersion) { iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_szXrdmVersion = szXrdmVersion; }
    // ---
    static get_AppVersion() { return iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_szAppVersion; }
    static set_AppVersion(szAppVersion) { iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_szAppVersion = szAppVersion; }
    // ---
    static get_UnityVersion() { return iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_szUnityVersion; }
    static set_UnityVersion(szUnityVersion) { iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_szUnityVersion = szUnityVersion; }
    // ---
    static get_DeviceModel() { return iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_szDeviceModel; }
    static set_DeviceModel(szDeviceModel) { iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_szDeviceModel = szDeviceModel; }
    // ---
    static get_UserId() { return iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_szUserId; }
    static set_UserId(szUserId) { iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_szUserId = szUserId; }
    // ---
    static get_Tags() { return iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_lszTags; }
    static set_Tags(lszTags) { iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_lszTags = lszTags; }
    // ---
    static get_GeoLocation() { return iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_dictGeoLocation; }
    static set_GeoLocation(dictGeoLocation) { iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_dictGeoLocation = dictGeoLocation; }
    // ---
    static get_AuthMechanism() { return iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_dictAuthMechanism; }
    static set_AuthMechanism(dictAuthMechanism) { iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_dictAuthMechanism = dictAuthMechanism; }
}
exports.iXRLibInit = iXRLibInit;
;
// ---
class iXRLibAnalytics {
    // ---
    static InitStatics() {
        iXRLibAnalytics.m_ixrLibAsync = new iXRLibAsync_1.iXRLibAsync();
        iXRLibAnalytics.m_listErrors = new DotNetishTypes_1.StringList();
        iXRLibAnalytics.m_dtLastSuccessfulSend = new DotNetishTypes_1.DateTime();
        iXRLibAnalytics.m_bCheckForStragglers = false;
        iXRLibAnalytics.m_pfnGetAuthSecretCallback = iXRLibAnalytics.DefaultGetAuthSecretCallback;
        iXRLibAnalytics.m_pvGetAuthSecretCallbackData = null;
        iXRLibAnalytics.m_szUserId = "";
        iXRLibAnalytics.m_szDeviceId = "";
        iXRLibAnalytics.m_dssCurrentData = new DotNetishTypes_1.iXRDictStrings();
    }
    //private static					m_dsbAllEvents = new Dictionary<mstringb, bool>;
    static get_UserId() { return iXRLibAnalytics.m_szUserId; }
    static set_UserId(value) { iXRLibAnalytics.m_szUserId = value; }
    // ---
    static get_DeviceId() { return iXRLibAnalytics.m_szDeviceId; }
    static set_DeviceId(value) { iXRLibAnalytics.m_szDeviceId = value; } // https://docs.unity3d.com/ScriptReference/SystemInfo-deviceUniqueIdentifier.html
    // ---
    static get_CurrentId() { return iXRLibAnalytics.GetCurrentId(); } // This may be a copy of userId or some other unique value we come up with.
    static set_CurrentId(value) { }
    // ---
    /// <summary>
    /// Not sure as I write this (during port) exactly how this is going to be used so this is a stub for now.
    /// </summary>
    /// <returns>Blank if no-op, return value from C# if C# provides a callback.</returns>
    static DefaultGetAuthSecretCallback(pUserData) {
        // ---
        return "";
    }
    // ---
    static FinalUrl(szEndpoint) {
        var szRet = iXRLibStorage_1.iXRLibStorage.m_ixrLibConfiguration.GetRestUrl();
        szRet += szEndpoint;
        // ---
        return szRet;
    }
    // Calculate this when we have "valid" userId or deviceId then it gets used thereafter on all relevant filtering.
    static GetCurrentId() {
        return (this.m_szUserId.length > 0) ? this.m_szUserId : this.m_szDeviceId;
    }
    /// <summary>
    /// General TaskErrorReturn() that implements the callback logic on asynchronous calls.
    /// </summary>
    /// <param name="eResult">iXRResult to return indicating status.</param>
    /// <param name="bNoCallbackOnSuccess">Only call callback on failures if this is true (and pfnStatusCallback not null).  False means always call (unless pfnCallback null).</param>
    /// <param name="pfnStatusCallback">Callback to call if this logic ^^^ computes.</param>
    /// <param name="szExceptionMessage">Message describing problem to be passed to the callback.</param>
    /// <returns>eResult</returns>
    /*private*/ static TaskErrorReturn(eResult, bNoCallbackOnSuccess, pfnStatusCallback, szExceptionMessage) {
        if (pfnStatusCallback !== null && pfnStatusCallback !== undefined) {
            if (!bNoCallbackOnSuccess || eResult !== DotNetishTypes_1.iXRResult.eOk) {
                pfnStatusCallback(eResult, szExceptionMessage);
            }
        }
        return eResult;
    }
    /// <summary>
    /// Type-specific TaskErrorReturn() template for asynchronous functions that need to include a specific object in the status callback.
    /// </summary>
    /// <typeparam name="T">Type of the specific object to include in the status callback.</typeparam>
    /// <typeparam name="CB">Callback type, generally 1-1 with object type, e.g. (iXREvent, iXRLibAnalyticsEventCallback).</typeparam>
    /// <param name="eResult">iXRResult to return indicating status.</param>
    /// <param name="ixrXXX">The specific object.</param>
    /// <param name="bNoCallbackOnSuccess">Only call callback on failures if this is true (and pfnStatusCallback not null).  False means always call (unless pfnCallback null).</param>
    /// <param name="pfnStatusCallback">Callback to call if this logic ^^^ computes.</param>
    /// <param name="szExceptionMessage">Message describing problem to be passed to the callback.</param>
    /// <returns>eResult</returns>
    static TaskErrorReturnT(eResult, ixrXXX, bNoCallbackOnSuccess, pfnStatusCallback, szExceptionMessage) {
        if (pfnStatusCallback !== null && pfnStatusCallback !== undefined) {
            if (!bNoCallbackOnSuccess || eResult !== DotNetishTypes_1.iXRResult.eOk) {
                pfnStatusCallback(ixrXXX, eResult, szExceptionMessage);
            }
        }
        return eResult;
    }
    /// <summary>
    /// The core Add<Event, Log, etc> function template that is called directly by Add<Event, Log, etc>Synchronous() or indirectly by asynchronous Add<Event, Log, etc>().
    /// </summary>
    /// <typeparam name="T">Type of object to be added.</typeparam>
    /// <typeparam name="CB">Callback type, generally 1-1 with object type, e.g. (iXREvent, iXRLibAnalyticsEventCallback).</typeparam>
    /// <typeparam name="iXRLibStorage">Resolves forward reference catch-22.</typeparam>
    /// <param name="ixrT">T (Event, Log, etc) to add.</param>
    /// <(type)param name="tTypeOfT">Type of object to be deleted as an any due to TypeScript's screwiness w.r.t. generics.</typeparam>
    /// <param name="szTableName">Name of corresponding table in the database.</param>
    /// <param name="pfnPostIXRXXX">Pointer to function that sends a list of pointers to T which this function will calculate for sending to backend.</param>
    /// <param name="bOneAtATime">true = POST the objects one object per POST, false = POST them as one single POST with all objects in the body content.</param>
    /// <param name="bNoCallbackOnSuccess">true = Only call pfnStatusCallback on error, false = always call pfnStatusCallback (assuming pfnStatusCallback not null, do not call at all otherwise).</param>
    /// <param name="pfnStatusCallback">null = do not want status callback, else call according to ^^^.</param>
    /// <returns>As the call has not happened yet on return, this is the status of adding the task or failing to add it.</returns>
    /*private*/ static async AddXXXTask(ixrT, tTypeOfT, szTableName, pfnPostIXRXXX, bOneAtATime, bNoCallbackOnSuccess, pfnStatusCallback) {
        var nTrimCount;
        var dtNow = DotNetishTypes_1.DateTime.ConvertUnixTime(DotNetishTypes_1.DateTime.Now()), dtOlderThan = DotNetishTypes_1.DateTime.ConvertUnixTime(dtNow.ToUnixTime() - iXRLibStorage_1.iXRLibStorage.m_ixrLibConfiguration.m_tsPruneSentItemsOlderThan.ToInt64());
        var pdsIXRXXX = null;
        var eDb;
        var eRet = DotNetishTypes_1.iXRResult.eOk;
        try {
            var ixrDbContext = new iXRLibCoreModel_1.iXRDbContext(false);
            for (const [szField, objField] of Object.entries(ixrDbContext)) {
                if (objField instanceof DataObjectBase_1.DbSet) {
                    if (objField.ContainedType() === tTypeOfT) {
                        pdsIXRXXX = objField;
                        break;
                    }
                }
            }
            // ---
            // newscope
            // {
            // 	ScopeThreadBlock	cs(m_csDB);
            pdsIXRXXX === null || pdsIXRXXX === void 0 ? void 0 : pdsIXRXXX.Add(ixrT);
            // if (iXRLibStorage.m_ixrLibConfiguration.m_bUseDatabase)
            // {
            // 	eDb = ixrDbContext.SaveChanges();
            // }
            // }
            // If the un-pushed exceeds the limits (0 = ∞), trim out oldest necessary to get it under the limits.
            if (iXRLibStorage_1.iXRLibStorage.m_ixrLibConfiguration.m_nMaximumCachedItems > 0) {
                // ScopeThreadBlock	cs(m_csDB);
                // if (iXRLibStorage.m_ixrLibConfiguration.m_bUseDatabase)
                // {
                // 	// Could be faster by obtaining the count with a SELECT COUNT... in a hurry to finish this port so doing it this way for now.
                // 	eDb = ExecuteSqlSelect(ixrDbContext.m_db, szTableName, "SELECT %s FROM %s WHERE SyncedWithCloud !== 0 ORDER BY timestamp", {}, *pdsIXRXXX);
                // 	nTrimCount = pdsIXRXXX.Count() - iXRLibStorage.m_ixrLibConfiguration.m_nMaximumCachedItems;
                // 	if (nTrimCount > 0)
                // 	{
                // 		pdsIXRXXX.RemoveRange(nTrimCount);
                // 		eDb = ixrDbContext.SaveChanges();
                // 	}
                // }
                // else
                {
                    // If not using the db, simply remove everything that sent successfully.
                    pdsIXRXXX = pdsIXRXXX === null || pdsIXRXXX === void 0 ? void 0 : pdsIXRXXX.filter(t => !t.m_bSyncedWithCloud);
                }
            }
            // If pruneSentItemsOlderThan indicates a time (0 = ∞), trim older sent items.
            if (iXRLibStorage_1.iXRLibStorage.m_ixrLibConfiguration.m_tsPruneSentItemsOlderThan.ToInt64() > DotNetishTypes_1.TimeSpan.Zero().ToInt64()) {
                // ScopeThreadBlock	cs(m_csDB);
                // if (iXRLibStorage.m_ixrLibConfiguration.m_bUseDatabase)
                // {
                // 	eDb = ExecuteSqlSelect(ixrDbContext.m_db, szTableName, "SELECT %s FROM %s WHERE SyncedWithCloud !== 0 AND timestamp < ?", { {"timestamp", &dtOlderThan} }, *pdsIXRXXX);
                // 	if (pdsIXRXXX.Count() > 0)
                // 	{
                // 		pdsIXRXXX.RemoveRange();
                // 		eDb = ixrDbContext.SaveChanges();
                // 	}
                // }
                // else
                {
                    // If not using the db, simply remove everything that sent successfully.
                    pdsIXRXXX = pdsIXRXXX === null || pdsIXRXXX === void 0 ? void 0 : pdsIXRXXX.filter(t => { return !t.m_bSyncedWithCloud; });
                }
            }
            eRet = await iXRLibAnalytics.SendUnsentXXXs(ixrDbContext, pdsIXRXXX, tTypeOfT, szTableName, pfnPostIXRXXX, bOneAtATime, iXRLibStorage_1.iXRLibStorage.m_ixrLibConfiguration.m_nEventsPerSendAttempt, false);
            // ---
            // if (iXRLibStorage.m_ixrLibConfiguration.m_bUseDatabase)
            // {
            // 	// ScopeThreadBlock	cs(m_csDB);
            // 	eDb = ixrDbContext.SaveChanges();
            // }
        }
        catch (error) {
            console.log("Error: ", error);
            //iXRLibClient.WriteLine($"Error: {ex.Message}\nStackTrace: {ex.StackTrace}");
            // ---
            return iXRLibAnalytics.TaskErrorReturnT(DotNetishTypes_1.iXRResult.eSendEventFailed, ixrT, bNoCallbackOnSuccess, pfnStatusCallback, "Caught exception.");
        }
        // ---
        return iXRLibAnalytics.TaskErrorReturnT(eRet, ixrT, bNoCallbackOnSuccess, pfnStatusCallback, "");
    }
    /// <summary>
    /// The core Delete<Event, Log, etc> function template that is called directly by Delete<Event, Log, etc>Synchronous() or indirectly by asynchronous Delete<Event, Log, etc>().
    /// </summary>
    /// <typeparam name="T">Type of object to be deleted.</typeparam>
    /// <typeparam name="CB">Callback type, generally 1-1 with object type, e.g. (iXREvent, iXRLibAnalyticsEventCallback).</typeparam>
    /// <typeparam name="iXRLibStorage">Resolves forward reference catch-22.</typeparam>
    /// <param name="ixrT">T (Event, Log, etc) to delete.</param>
    /// <(type)param name="tTypeOfT">Type of object to be deleted as an any due to TypeScript's screwiness w.r.t. generics.</typeparam>
    /// <param name="szTableName">Name of corresponding table in the database.</param>
    /// <param name="pfnPostIXRXXX">Pointer to function that sends a list of pointers to T which this function will calculate for sending to backend.</param>
    /// <param name="bNoCallbackOnSuccess">true = Only call pfnStatusCallback on error, false = always call pfnStatusCallback (assuming pfnStatusCallback not null, do not call at all otherwise).</param>
    /// <param name="pfnStatusCallback">null = do not want status callback, else call according to ^^^.</param>
    /// <returns>As the call has not happened yet on return, this is the status of adding the task or failing to add it.</returns>
    static DeleteXXXTask(ixrT, tTypeOfT, szTableName, pfnDeleteIXRXXX, bNoCallbackOnSuccess, pfnStatusCallback) {
        var nTrimCount;
        var dtNow = DotNetishTypes_1.DateTime.ConvertUnixTime(DotNetishTypes_1.DateTime.Now()), dtOlderThan = DotNetishTypes_1.DateTime.ConvertUnixTime(dtNow.ToUnixTime() - iXRLibStorage_1.iXRLibStorage.m_ixrLibConfiguration.m_tsPruneSentItemsOlderThan.ToDateTime().ToUnixTime());
        var pdsIXRXXX = null;
        var eDb;
        var eRet = DotNetishTypes_1.iXRResult.eOk;
        try {
            var ixrDbContext = new iXRLibCoreModel_1.iXRDbContext(false);
            for (const [szField, objField] of Object.entries(ixrDbContext)) {
                if (objField instanceof DataObjectBase_1.DbSet) {
                    if (objField.ContainedType() === tTypeOfT) {
                        pdsIXRXXX = objField;
                        break;
                    }
                }
            }
            // ---
            // newscope
            // {
            // 	ScopeThreadBlock	cs(m_csDB);
            pdsIXRXXX === null || pdsIXRXXX === void 0 ? void 0 : pdsIXRXXX.Add(ixrT);
            eDb = ixrDbContext.SaveChanges();
            // }
            // If the un-pushed exceeds the limits (0 = ∞), trim out oldest necessary to get it under the limits.
            // if (iXRLibStorage.m_ixrLibConfiguration.m_nMaximumCachedItems > 0)
            // {
            // 	// ScopeThreadBlock	cs(m_csDB);
            // 	// Could be faster by obtaining the count with a SELECT COUNT... in a hurry to finish this port so doing it this way for now.
            // 	eDb = ExecuteSqlSelect(ixrDbContext.m_db, szTableName, "SELECT %s FROM %s WHERE SyncedWithCloud !== 0 ORDER BY timestamp", {}, pdsIXRXXX);
            // 	nTrimCount = pdsIXRXXX?.Count() - iXRLibStorage.m_ixrLibConfiguration.m_nMaximumCachedItems;
            // 	if (nTrimCount > 0)
            // 	{
            // 		pdsIXRXXX?.RemoveRange(nTrimCount);
            // 		eDb = ixrDbContext.SaveChanges();
            // 	}
            // }
            // If pruneSentItemsOlderThan indicates a time (0 = ∞), trim older sent items.
            // if (iXRLibStorage.m_ixrLibConfiguration.m_tsPruneSentItemsOlderThan > TimeSpan.Zero())
            // {
            // 	// ScopeThreadBlock	cs(m_csDB);
            // 	eDb = ExecuteSqlSelect(ixrDbContext.m_db, szTableName, "SELECT %s FROM %s WHERE SyncedWithCloud !== 0 AND timestamp < ?", { {"timestamp", &dtOlderThan} }, pdsIXRXXX);
            // 	if (pdsIXRXXX?.Count() > 0)
            // 	{
            // 		pdsIXRXXX?.RemoveRange();
            // 		eDb = ixrDbContext.SaveChanges();
            // 	}
            // }
            // ---
            // newscope
            // {
            // 	ScopeThreadBlock	cs(m_csDB);
            eDb = ixrDbContext.SaveChanges();
            // }
        }
        catch (error) {
            console.log("Error: ", error);
            //iXRLibClient.WriteLine($"Error: {ex.Message}\nStackTrace: {ex.StackTrace}");
            // ---
            return iXRLibAnalytics.TaskErrorReturnT(DotNetishTypes_1.iXRResult.eSendEventFailed, ixrT, bNoCallbackOnSuccess, pfnStatusCallback, "Caught exception.");
        }
        // ---
        return iXRLibAnalytics.TaskErrorReturnT(eRet, ixrT, bNoCallbackOnSuccess, pfnStatusCallback, "");
    }
    /// <summary>
    /// Core unsent-event function template... for main chunks and stragglers, handles resends etc.
    /// </summary>
    /// <typeparam name="T">Type of straggler objects to be sent.</typeparam>
    /// <typeparam name="iXRLibStorage">Resolves forward reference catch-22.</typeparam>
    /// <param name="ixrDbContext">Database object that contains all the iXRLib object lists</param>
    /// <param name="dsIXRXXX">DbSet<T extends iXRBase> passed in by caller so we use the same one as we want any changes in its state to bubble up to the caller... contains the objects to send.</param>
    /// <(type)param name="tTypeOfT">Type of object to be deleted as an any due to TypeScript's screwiness w.r.t. generics.</typeparam>
    /// <param name="szTableName">Name of corresponding table in the database.</param>
    /// <param name="pfnPostIXRXXX">Pointer to function that sends a list of pointers to T which this function will calculate for sending to backend.</param>
    /// <param name="bOneAtATime">true = POST the objects one object per POST, false = POST them as one single POST with all objects in the body content.</param>
    /// <param name="nConfiguredXXXPerSendAttempt">The corresponding how many T's per send attempt from iXRLibConfiguration.</param>
    /// <param name="bSendingStragglers">true when being called by TimerCallback to drive Nagle-algorithmish-straggler-send, false when doing a main send</param>
    /// <returns>iXRResult status code</returns>
    static async SendUnsentXXXs(ixrDbContext, dsIXRXXX, tTypeOfT, szTableName, pfnPostIXRXXX, bOneAtATime, nConfiguredXXXPerSendAttempt, bSendingStragglers) {
        var _a, _b;
        var eRet = DotNetishTypes_1.iXRResult.eOk, eTestRet = DotNetishTypes_1.iXRResult.eOk;
        // If we have enough new yet-to-be-pushed-to-REST items, then do that and mark as sent.
        if (iXRLibStorage_1.iXRLibStorage.m_ixrLibConfiguration.RESTConfigured()) {
            var dspObjectsToSend = null;
            var i;
            var bDoneSending = false;
            var eDb;
            // if (iXRLibStorage.m_ixrLibConfiguration.m_bUseDatabase)
            // {
            // ScopeThreadBlock	cs(m_csDB);
            // 	eDb = ExecuteSqlSelect(ixrDbContext.m_db, szTableName, "SELECT %s FROM %s WHERE SyncedWithCloud === 0 ORDER BY timestamp", {}, dsIXRXXX);
            // }
            // While the remaining unpushed > eventsPerSendAttempt...
            while (!bDoneSending && ((_a = dsIXRXXX === null || dsIXRXXX === void 0 ? void 0 : dsIXRXXX.Count()) !== null && _a !== void 0 ? _a : 0) > 0 && ((bSendingStragglers || ((_b = dsIXRXXX === null || dsIXRXXX === void 0 ? void 0 : dsIXRXXX.Count()) !== null && _b !== void 0 ? _b : 0) >= nConfiguredXXXPerSendAttempt) || (!iXRLibStorage_1.iXRLibStorage.m_ixrLibConfiguration.m_bUseDatabase))) {
                // newscope
                // {
                // ScopeThreadBlock	cs(m_csDB);
                dspObjectsToSend = dsIXRXXX === null || dsIXRXXX === void 0 ? void 0 : dsIXRXXX.Take(nConfiguredXXXPerSendAttempt);
                // ---
                if ((dspObjectsToSend === null || dspObjectsToSend === void 0 ? void 0 : dspObjectsToSend.size()) === 0) {
                    // I hope this code never gets executed.  I wrote it as a bandaid with a large comment
                    // rivaling the blather volume of this comment detailing how it really stinks and I
                    // hope I see the real problem someday then on further staring at the while clause,
                    // I saw why empties could get sent and then fixed it.  And that should be that, so
                    // why am I leaving this in?  Superstitiotology(tm).  There are 2 possible spacetimes:
                    // 1) The spacetime where I take this out and there is still a hole in the logic.
                    // 2) The spacetime where I leave it in and this code never gets executed.
                    // If you are in spacetime-1, don't sweat it, you aren't reading this comment anyway.
                    // ---
                    // The meaning of this is "if we are about to send an empty list, do the tidy up as if
                    // we just sent then break out of this loop."
                    iXRLibAnalytics.m_dtLastSuccessfulSend = DotNetishTypes_1.DateTime.ConvertUnixTime(DotNetishTypes_1.DateTime.Now());
                    iXRLibAnalytics.m_bCheckForStragglers = !bSendingStragglers;
                    bDoneSending = true;
                    break;
                }
                // }
                for (i = 0; i < iXRLibStorage_1.iXRLibStorage.m_ixrLibConfiguration.m_nSendRetriesOnFailure; i++) {
                    try {
                        var rpResponse = { szResponse: "" };
                        eTestRet = await pfnPostIXRXXX((dspObjectsToSend !== null && dspObjectsToSend !== void 0 ? dspObjectsToSend : new DataObjectBase_1.DbSet(tTypeOfT)), bOneAtATime, rpResponse);
                        if (eTestRet === DotNetishTypes_1.iXRResult.eOk) {
                            var eSuccessParse, eFailureParse;
                            var objResponseSuccess = new iXRLibClient_1.PostObjectsResponseSuccess();
                            var objResponseFailure = new iXRLibClient_1.PostObjectsResponseFailure();
                            eSuccessParse = (0, DataObjectBase_1.LoadFromJson)(objResponseSuccess, rpResponse.szResponse);
                            eFailureParse = (0, DataObjectBase_1.LoadFromJson)(objResponseFailure, rpResponse.szResponse);
                            if (eSuccessParse === DotNetishTypes_1.JsonResult.eBadJsonStructure || eFailureParse === DotNetishTypes_1.JsonResult.eBadJsonStructure) {
                                eTestRet = DotNetishTypes_1.iXRResult.eCorruptJson;
                            }
                            else if (eSuccessParse === DotNetishTypes_1.JsonResult.eOk) {
                                // Do something with the data?  Haven't seen a success yet.  TODO.
                                eTestRet = DotNetishTypes_1.iXRResult.eOk;
                            }
                            else {
                                eTestRet = DotNetishTypes_1.iXRResult.eAuthenticateFailed;
                            }
                            if (eTestRet === DotNetishTypes_1.iXRResult.eOk) {
                                // Succeeded... mark them as sent.
                                if (dspObjectsToSend) {
                                    for (let pt of dspObjectsToSend) {
                                        pt.m_bSyncedWithCloud = true;
                                    }
                                }
                                // newscope
                                // {
                                // 	ScopeThreadBlock	cs(m_csDB);
                                // if (iXRLibStorage.m_ixrLibConfiguration.m_bUseDatabase)
                                // {
                                // 	ixrDbContext.SaveChanges();
                                // 	eDb = ExecuteSqlSelect(ixrDbContext.m_db, szTableName, "SELECT %s FROM %s WHERE SyncedWithCloud === 0 ORDER BY timestamp", {}, dsIXRXXX);
                                // }
                                // else
                                {
                                    // If not using the db, simply remove everything that sent successfully.
                                    dsIXRXXX = dsIXRXXX === null || dsIXRXXX === void 0 ? void 0 : dsIXRXXX.filter(t => !t.m_bSyncedWithCloud);
                                }
                                iXRLibAnalytics.m_dtLastSuccessfulSend = DotNetishTypes_1.DateTime.ConvertUnixTime(DotNetishTypes_1.DateTime.Now());
                                iXRLibAnalytics.m_bCheckForStragglers = !bSendingStragglers;
                                bDoneSending = true;
                                // }
                                break;
                            }
                            else {
                                return eTestRet;
                            }
                        }
                        else {
                            await (0, types_1.Sleep)(iXRLibStorage_1.iXRLibStorage.m_ixrLibConfiguration.m_tsSendRetryInterval.ToInt64() * 1000);
                        }
                    }
                    catch (error) {
                        continue;
                    }
                }
                if (!bDoneSending) {
                    eRet = eTestRet;
                    bDoneSending = true;
                }
            }
            // Delete sent from local-db if thusly configured.
            // if (iXRLibStorage.m_ixrLibConfiguration.m_bUseDatabase)
            // {
            // 	if (!iXRLibStorage.m_ixrLibConfiguration.m_bRetainLocalAfterSent)
            // 	{
            // 		ScopeThreadBlock	cs(m_csDB);
            // 		eDb = ExecuteSqlSelect(ixrDbContext.m_db, szTableName, "SELECT %s FROM %s WHERE SyncedWithCloud !== 0", {}, dsIXRXXX);
            // 		dsIXRXXX.RemoveRange();
            // 		ixrDbContext.SaveChanges();
            // 	}
            // }
            // else
            {
                // If not using the db, simply remove everything that sent successfully.
                dsIXRXXX = dsIXRXXX === null || dsIXRXXX === void 0 ? void 0 : dsIXRXXX.filter(t => { return !t.m_bSyncedWithCloud; });
            }
        }
        // ---
        return eRet;
    }
    /// <summary>
    /// For immediately POSTing a single object to the backend with the send-retries-on-failure robustness but NONE of the db-cacheing, defer until later robustness.
    ///		AIProxy is the object that instigated creation of this function.
    /// </summary>
    /// <typeparam name="T">Type of object being POSTed to backend.</typeparam>
    /// <typeparam name="CB">Type of object-specific callback when asynchronous and callback is desired.</typeparam>
    /// <typeparam name="iXRLibStorage">Resolves forward reference catch-22.</typeparam>
    /// <param name="ixrT">The object to POST to backend.</param>
    /// <(type)param name="tTypeOfT">Type of object to be deleted as an any due to TypeScript's screwiness w.r.t. generics.</typeparam>
    /// <param name="pfnPostIXRXXX">Function pointer to function that POSTs list of objects (will always be list of one object when coming from here).</param>
    /// <param name="bOneAtATime">true = POST the objects one object per POST, false = POST them as one single POST with all objects in the body content.</param>
    /// <param name="bNoCallbackOnSuccess">When asynchronous and pfnStatusCallback not null, call always when this is false, only on failure when true.</param>
    /// <param name="pfnStatusCallback">null = no-op, not-null = callback in asynchronous case with respect to bNoCallbackOnSuccess.</param>
    /// <returns>iXRResult status code.</returns>
    static async AddXXXNoDbTask(ixrT, tTypeOfT, pfnPostIXRXXX, bOneAtATime, bNoCallbackOnSuccess, pfnStatusCallback) {
        var eRet = DotNetishTypes_1.iXRResult.eOk;
        try {
            // If we have enough new yet-to-be-pushed-to-REST items, then do that and mark as sent.
            if (iXRLibStorage_1.iXRLibStorage.m_ixrLibConfiguration.RESTConfigured()) {
                var pObjectsToSend = new DataObjectBase_1.DbSet(tTypeOfT);
                var i;
                var bDoneSending = false;
                // While the remaining unpushed > eventsPerSendAttempt...
                pObjectsToSend.Add(ixrT);
                while (!bDoneSending) {
                    for (i = 0; i < iXRLibStorage_1.iXRLibStorage.m_ixrLibConfiguration.m_nSendRetriesOnFailure; i++) {
                        try {
                            var rpResponse = { szResponse: "" };
                            if ((await pfnPostIXRXXX(pObjectsToSend, bOneAtATime, rpResponse)) === DotNetishTypes_1.iXRResult.eOk) {
                                var eSuccessParse, eFailureParse;
                                var objResponseSuccess = new iXRLibClient_1.PostObjectsResponseSuccess();
                                var objResponseFailure = new iXRLibClient_1.PostObjectsResponseFailure();
                                var eTestRet = DotNetishTypes_1.iXRResult.eOk;
                                eSuccessParse = (0, DataObjectBase_1.LoadFromJson)(objResponseSuccess, rpResponse.szResponse);
                                eFailureParse = (0, DataObjectBase_1.LoadFromJson)(objResponseFailure, rpResponse.szResponse);
                                if (eSuccessParse === DotNetishTypes_1.JsonResult.eBadJsonStructure || eFailureParse === DotNetishTypes_1.JsonResult.eBadJsonStructure) {
                                    eTestRet = DotNetishTypes_1.iXRResult.eCorruptJson;
                                }
                                else if (eSuccessParse === DotNetishTypes_1.JsonResult.eOk) {
                                    // Do something with the data?  Haven't seen a success yet.  TODO.
                                    eTestRet = DotNetishTypes_1.iXRResult.eOk;
                                }
                                else {
                                    eTestRet = DotNetishTypes_1.iXRResult.eAuthenticateFailed;
                                }
                                return eTestRet;
                            }
                            else {
                                await (0, types_1.Sleep)(iXRLibStorage_1.iXRLibStorage.m_ixrLibConfiguration.m_tsSendRetryInterval.ToInt64() * 1000);
                            }
                        }
                        catch (error) {
                            continue;
                        }
                    }
                }
            }
        }
        catch (error) {
            return iXRLibAnalytics.TaskErrorReturnT(DotNetishTypes_1.iXRResult.eSendEventFailed, ixrT, bNoCallbackOnSuccess, pfnStatusCallback, `Caught exception: '${error}'.`);
        }
        // ---
        return iXRLibAnalytics.TaskErrorReturnT(eRet, ixrT, bNoCallbackOnSuccess, pfnStatusCallback, "");
    }
    /// <summary>
    /// Core-core function to force send unsent objects synchronously.  Used to be inlined in ^^^ TimerCallback().
    ///		Now we want it to be callable on its own for the user-goes-to-the-bog-then-resumes-playing workflow.
    /// </summary>
    /// <returns>iXRResult enum.</returns>
    static async ForceSendUnsentSynchronous() {
        var eRet = DotNetishTypes_1.iXRResult.eOk, eTestRet = DotNetishTypes_1.iXRResult.eOk;
        var ixrDbContext = new iXRLibCoreModel_1.iXRDbContext(false);
        eTestRet = await iXRLibAnalytics.SendUnsentXXXs(ixrDbContext, ixrDbContext.m_dsIXREvents, iXRLibCoreModel_1.iXREvent, "IXREvents", iXRLibClient_1.iXRLibClient.PostIXREvents, false, iXRLibStorage_1.iXRLibStorage.m_ixrLibConfiguration.m_nEventsPerSendAttempt, true);
        if (eTestRet !== DotNetishTypes_1.iXRResult.eOk) {
            eRet = eTestRet;
        }
        eTestRet = await iXRLibAnalytics.SendUnsentXXXs(ixrDbContext, ixrDbContext.m_dsIXRLogs, iXRLibCoreModel_1.iXRLog, "IXRLogs", iXRLibClient_1.iXRLibClient.PostIXRLogs, false, iXRLibStorage_1.iXRLibStorage.m_ixrLibConfiguration.m_nLogsPerSendAttempt, true);
        if (eTestRet !== DotNetishTypes_1.iXRResult.eOk) {
            eRet = eTestRet;
        }
        eTestRet = await iXRLibAnalytics.SendUnsentXXXs(ixrDbContext, ixrDbContext.m_dsIXRTelemetry, iXRLibCoreModel_1.iXRTelemetry, "IXRTelemetry", iXRLibClient_1.iXRLibClient.PostIXRTelemetry, false, iXRLibStorage_1.iXRLibStorage.m_ixrLibConfiguration.m_nTelemetryEntriesPerSendAttempt, true);
        if (eTestRet !== DotNetishTypes_1.iXRResult.eOk) {
            eRet = eTestRet;
        }
        eTestRet = await iXRLibAnalytics.SendUnsentXXXs(ixrDbContext, ixrDbContext.m_dsIXRStorage, iXRLibCoreModel_1.iXRStorage, "IXRStorage", iXRLibClient_1.iXRLibClient.PostIXRStorage, true, iXRLibStorage_1.iXRLibStorage.m_ixrLibConfiguration.m_nStorageEntriesPerSendAttempt, true);
        if (eTestRet !== DotNetishTypes_1.iXRResult.eOk) {
            eRet = eTestRet;
        }
        // ---
        return eRet;
    }
    // ---
    // Would be cool to have these be private but the dll Interface.cpp code makes that too much of a pain at this point, maybe revisit later.
    static async SetHeadersFromCurrentStateStringBody(objRequest, szBodyContent, bHasBody, bIncludeAuthHeaders) {
        await iXRLibAnalytics.SetHeadersFromCurrentState(objRequest, Buffer.from(szBodyContent, "utf-8"), bHasBody, bIncludeAuthHeaders);
    }
    /// <summary>
    /// Prepping request for send.
    /// </summary>
    /// <param name="objRequest">The request being prepared</param>
    /// <param name="pbBodyContent">Body content where applicable (POST, PUT, ...)</param>
    /// <param name="bIncludeAuthHeaders">Include X-iXRLib-xxx headers computed from Authenticate() data... i.e. false when Authenticate()ing</param>
    static async SetHeadersFromCurrentState(objRequest, pbBodyContent, bHasBody, bIncludeAuthHeaders) {
        try {
            objRequest.AddHttpHeader("host", iXRLibStorage_1.iXRLibStorage.m_ixrLibConfiguration.GetRestUrlObject().HostAndPort());
            objRequest.AddHttpHeader("accept", "application/json");
            objRequest.AddHttpHeader("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; rv:109.0) Gecko/20100101 Firefox/119.0");
            objRequest.AddHttpHeader("accept-language", "en-US; q=0.5, en; q=0.5");
            objRequest.AddHttpHeader("accept-encoding", "gzip, deflate");
            objRequest.AddHttpHeader("Content-Type", "application/json"); // May need to parse pbBodyContent someday to distinguish Content-Type and Accept header settings.
            // ---
            if (bIncludeAuthHeaders) {
                await iXRLibInit.m_ixrLibAuthentication.SetHeadersFromCurrentState(objRequest, pbBodyContent, bHasBody);
            }
        }
        catch (error) {
            console.log("Error: ", error);
        }
    }
    // --- API (C++ dll and C# dll) versions of AddAIProxy().
    static async AddAIProxySynchronous0(szPrompt, szLMMProvider) {
        var ixrAIProxy = new iXRLibCoreModel_1.iXRAIProxy().Construct0(szPrompt, "", szLMMProvider);
        return await iXRLibAnalytics.AddAIProxySynchronous(ixrAIProxy);
    }
    static async AddAIProxySynchronous1(szPrompt, szPastMessages, szLMMProvider) {
        var ixrAIProxy = new iXRLibCoreModel_1.iXRAIProxy().Construct0(szPrompt, szPastMessages, szLMMProvider);
        return await iXRLibAnalytics.AddAIProxySynchronous(ixrAIProxy);
    }
    static async AddAIProxySynchronous2(szPrompt, dictPastMessages, szLMMProvider) {
        var ixrAIProxy = new iXRLibCoreModel_1.iXRAIProxy().Construct1(szPrompt, dictPastMessages, szLMMProvider);
        return await iXRLibAnalytics.AddAIProxySynchronous(ixrAIProxy);
    }
    // ---
    // public static AddAIProxy0(szPrompt: string, szLMMProvider: string): Promise<iXRResult>
    // {
    // 	var	ixrAIProxy:	iXRAIProxy = new iXRAIProxy().Construct0(szPrompt, "", szLMMProvider);
    // 	return iXRLibAnalytics.AddAIProxy(ixrAIProxy, true, null);
    // }
    // public static AddAIProxy1(szPrompt: string, szPastMessages: string, szLMMProvider: string): Promise<iXRResult>
    // {
    // 	var	ixrAIProxy:	iXRAIProxy = new iXRAIProxy().Construct0(szPrompt, szPastMessages, szLMMProvider);
    // 	return iXRLibAnalytics.AddAIProxy(ixrAIProxy, true, null);
    // }
    // public static AddAIProxy2(szPrompt: string, dictPastMessages: iXRDictStrings, szLMMProvider: string): Promise<iXRResult>
    // {
    // 	var	ixrAIProxy:	iXRAIProxy = new iXRAIProxy().Construct1(szPrompt, dictPastMessages, szLMMProvider);
    // 	return iXRLibAnalytics.AddAIProxy(ixrAIProxy, true, null);
    // }
    // --- End API (C++ dll and C# dll) versions of AddAIProxy().
    static async AddAIProxySynchronous(ixrAIProxy) {
        return await iXRLibAnalytics.AddXXXNoDbTask(ixrAIProxy, iXRLibCoreModel_1.iXRAIProxy, iXRLibClient_1.iXRLibClient.PostIXRAIProxyObjects, false, false, null);
    }
    // public static AddAIProxy(ixrAIProxy: iXRAIProxy, bNoCallbackOnSuccess: boolean, pfnStatusCallback: iXRLibAnalyticsAIProxyCallback | null): Promise<iXRResult>
    // {
    // 	iXRLibAnalytics.DiagnosticWriteLine("Going to call AddAIProxy().");
    // 	// Notice the = capture... so pfnStatusCallback propagates by copy into the thread.  Notice it is not needed in the typescript port colon paren.
    // 	return iXRLibAnalytics.m_ixrLibAsync.AddTask((pObject: any): Promise<iXRResult> => { return iXRLibAnalytics.AddXXXNoDbTask<iXRAIProxy>(pObject as iXRAIProxy, iXRAIProxy, iXRLibClient.PostIXRAIProxyObjects, false, bNoCallbackOnSuccess, pfnStatusCallback).then((eRet: iXRResult) => { return eRet; }).catch((eRet: iXRResult) => { return eRet; }); },
    // 		ixrAIProxy,
    // 		(pObject: any): void => { /*delete (iXRAIProxy*)pObject;*/ }
    // 	);
    // }
    // ---
    static async AddAIProxyEntrySynchronous(ixrAIProxy) {
        return await iXRLibAnalytics.AddXXXTask(ixrAIProxy, iXRLibCoreModel_1.iXRAIProxy, "IXRAIProxy", iXRLibClient_1.iXRLibClient.PostIXRAIProxy, false, false, null);
    }
    // public static AddAIProxyEntry(ixrAIProxy: iXRAIProxy, bNoCallbackOnSuccess: boolean, pfnStatusCallback: iXRLibAnalyticsAIProxyCallback): Promise<iXRResult>
    // {
    // 	iXRLibAnalytics.DiagnosticWriteLine("Going to call AddAIProxy().");
    // 	// Notice the = capture... so pfnStatusCallback propagates by copy into the thread.  Notice it is not needed in the typescript port colon paren.
    // 	return iXRLibAnalytics.m_ixrLibAsync.AddTask((pObject: any): Promise<iXRResult> => { return iXRLibAnalytics.AddXXXTask<iXRAIProxy>(pObject as iXRAIProxy, iXRAIProxy, "IXRAIProxy", iXRLibClient.PostIXRAIProxy, false, bNoCallbackOnSuccess, pfnStatusCallback).then((eRet: iXRResult) => { return eRet; }).catch((eRet: iXRResult) => { return eRet; }); },
    // 		ixrAIProxy,
    // 		(pObject: any): void => { /*delete (iXRAIProxy*)pObject;*/ });
    // }
    // --- End Core AddXXX() functions called by the API functions.
    static DefaultDiagnosticCallback(szLine) {
        // #ifdef _DEBUG
        // 	iXRLibAnalyticsTests.WriteLine(szLine);
        // #endif
    }
    static DiagnosticWriteLine(szLine) {
        console.log(szLine);
    }
}
exports.iXRLibAnalytics = iXRLibAnalytics;
;
//# sourceMappingURL=iXRLibAnalytics.js.map