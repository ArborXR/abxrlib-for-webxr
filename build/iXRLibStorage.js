"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iXRLibStorage = void 0;
const iXRLibClient_1 = require("./iXRLibClient");
const iXRLibCoreModel_1 = require("./iXRLibCoreModel");
const DotNetishTypes_1 = require("./network/utils/DotNetishTypes");
const iXRLibAnalytics_1 = require("./iXRLibAnalytics");
// ---
class iXRLibStorage {
    // ---
    static InitStatics() {
        this.m_ixrLibConfiguration = new iXRLibCoreModel_1.iXRLibConfiguration();
    }
    // MJP:  Retaining this in comments to remind myself of this approach which may come in handy for something else though I am standardizing on InitStatics() for all statics.
    //public static get m_ixrLibConfiguration(): iXRLibConfiguration {if (!iXRLibStorage.v_ixrLibConfiguration) {iXRLibStorage.v_ixrLibConfiguration = new iXRLibConfiguration();} return iXRLibStorage.v_ixrLibConfiguration;}
    // ---
    /// <summary>
    /// GET "/config" endpoint and merge with m_ixrLibConfiguration read locally.
    ///		Note the (potential) catch-22:  at least the REST_URL entry MUST be
    ///		set in the App.config on the headset so this knows WHAT backend.
    ///		Also, this is done after auth.
    /// </summary>
    /// <param name="bLookForAuthMechanism">true = copy iXRLibStorage.m_ixrLibConfiguration.m_dictAuthMechanism into iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_dictAuthMechanism.
    ///		That is, this is part of an auth at the specific point (first Authenticate()) where we need to obtain extra-auth-data.
    ///		false = not only do not copy it but destroy it as it is not needed and would gum up the works on the backend.
    /// </param>
    /// <returns>iXRResult status code.</returns>
    static async ReadConfigFromBackend(bLookForAuthMechanism) {
        var eRet = await iXRLibClient_1.iXRLibClient.GetIXRConfig(iXRLibStorage.m_ixrLibConfiguration);
        if (eRet === DotNetishTypes_1.iXRResult.eOk) {
            if (bLookForAuthMechanism) {
                iXRLibAnalytics_1.iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_dictAuthMechanism = Object.assign({}, iXRLibStorage.m_ixrLibConfiguration.m_dictAuthMechanism);
            }
            else {
                iXRLibAnalytics_1.iXRLibInit.m_ixrLibAuthentication.m_objAuthTokenRequest.m_dictAuthMechanism.clear();
                iXRLibStorage.m_ixrLibConfiguration.m_dictAuthMechanism.clear();
            }
        }
        // ---
        return eRet;
    }
    /// <summary>
    /// GET "/storage" endpoint
    /// </summary>
    /// <returns></returns>
    static async ReadStorageFromBackend() {
        var ixrStorage = new iXRLibCoreModel_1.iXRXXXContainer(iXRLibCoreModel_1.iXRStorage, DotNetishTypes_1.iXRDictStrings);
        return iXRLibClient_1.iXRLibClient.GetIXRStorage(ixrStorage);
    }
    // --- Configuration fields.
    static get_RestUrl() { return iXRLibStorage.m_ixrLibConfiguration.GetRestUrl(); }
    static set_RestUrl(szValue) { iXRLibStorage.m_ixrLibConfiguration.SetRestUrl(szValue); }
    // ---
    static get_SendRetriesOnFailure() { return iXRLibStorage.m_ixrLibConfiguration.m_nSendRetriesOnFailure; }
    static set_SendRetriesOnFailure(nValue) { iXRLibStorage.m_ixrLibConfiguration.m_nSendRetriesOnFailure = nValue; }
    // ---
    static get_SendRetryInterval() { return iXRLibStorage.m_ixrLibConfiguration.m_tsSendRetryInterval; }
    static set_SendRetryInterval(tsValue) { iXRLibStorage.m_ixrLibConfiguration.m_tsSendRetryInterval = tsValue; }
    // ---
    static get_SendNextBatchWait() { return iXRLibStorage.m_ixrLibConfiguration.m_tsSendNextBatchWait; }
    static set_SendNextBatchWait(tsValue) { iXRLibStorage.m_ixrLibConfiguration.m_tsSendNextBatchWait = tsValue; }
    // ---
    static get_StragglerTimeout() { return iXRLibStorage.m_ixrLibConfiguration.m_tsStragglerTimeout; }
    static set_StragglerTimeout(tsValue) { iXRLibStorage.m_ixrLibConfiguration.m_tsStragglerTimeout = tsValue; }
    // ---
    static get_PositionCapturePeriodicity() { return iXRLibStorage.m_ixrLibConfiguration.m_dPositionCapturePeriodicity; }
    static set_PositionCapturePeriodicity(dValue) { iXRLibStorage.m_ixrLibConfiguration.m_dPositionCapturePeriodicity = dValue; }
    // ---
    static get_FrameRateCapturePeriodicity() { return iXRLibStorage.m_ixrLibConfiguration.m_dFrameRateCapturePeriodicity; }
    static set_FrameRateCapturePeriodicity(dValue) { iXRLibStorage.m_ixrLibConfiguration.m_dFrameRateCapturePeriodicity = dValue; }
    // ---
    static get_TelemetryCapturePeriodicity() { return iXRLibStorage.m_ixrLibConfiguration.m_dTelemetryCapturePeriodicity; }
    static set_TelemetryCapturePeriodicity(dValue) { iXRLibStorage.m_ixrLibConfiguration.m_dTelemetryCapturePeriodicity = dValue; }
    // ---
    static get_EventsPerSendAttempt() { return iXRLibStorage.m_ixrLibConfiguration.m_nEventsPerSendAttempt; }
    static set_EventsPerSendAttempt(nValue) { iXRLibStorage.m_ixrLibConfiguration.m_nEventsPerSendAttempt = nValue; }
    // ---
    static get_LogsPerSendAttempt() { return iXRLibStorage.m_ixrLibConfiguration.m_nLogsPerSendAttempt; }
    static set_LogsPerSendAttempt(nValue) { iXRLibStorage.m_ixrLibConfiguration.m_nLogsPerSendAttempt = nValue; }
    // ---
    static get_TelemetryEntriesPerSendAttempt() { return iXRLibStorage.m_ixrLibConfiguration.m_nTelemetryEntriesPerSendAttempt; }
    static set_TelemetryEntriesPerSendAttempt(nValue) { iXRLibStorage.m_ixrLibConfiguration.m_nTelemetryEntriesPerSendAttempt = nValue; }
    // ---
    static get_StorageEntriesPerSendAttempt() { return iXRLibStorage.m_ixrLibConfiguration.m_nStorageEntriesPerSendAttempt; }
    static set_StorageEntriesPerSendAttempt(nValue) { iXRLibStorage.m_ixrLibConfiguration.m_nStorageEntriesPerSendAttempt = nValue; }
    // ---
    static get_PruneSentItemsOlderThan() { return iXRLibStorage.m_ixrLibConfiguration.m_tsPruneSentItemsOlderThan; }
    static set_PruneSentItemsOlderThan(tsValue) { iXRLibStorage.m_ixrLibConfiguration.m_tsPruneSentItemsOlderThan = tsValue; }
    // ---
    static get_MaximumCachedItems() { return iXRLibStorage.m_ixrLibConfiguration.m_nMaximumCachedItems; }
    static set_MaximumCachedItems(nValue) { iXRLibStorage.m_ixrLibConfiguration.m_nMaximumCachedItems = nValue; }
    // ---
    static get_RetainLocalAfterSent() { return iXRLibStorage.m_ixrLibConfiguration.m_bRetainLocalAfterSent; }
    static set_RetainLocalAfterSent(bValue) { iXRLibStorage.m_ixrLibConfiguration.m_bRetainLocalAfterSent = bValue; }
    // ---
    static get_ReAuthenticateBeforeTokenExpires() { return iXRLibStorage.m_ixrLibConfiguration.m_bReAuthenticateBeforeTokenExpires; }
    static set_ReAuthenticateBeforeTokenExpires(bValue) { iXRLibStorage.m_ixrLibConfiguration.m_bReAuthenticateBeforeTokenExpires = bValue; }
    // ---
    static get_UseDatabase() { return iXRLibStorage.m_ixrLibConfiguration.m_bUseDatabase; }
    static set_UseDatabase(bValue) { iXRLibStorage.m_ixrLibConfiguration.m_bUseDatabase = bValue; }
    // ---
    static get_AuthMechanism() { return iXRLibStorage.m_ixrLibConfiguration.m_dictAuthMechanism; }
    static set_AuthMechanism(dictValue) { iXRLibStorage.m_ixrLibConfiguration.m_dictAuthMechanism = dictValue; }
    // ---
    static ReadConfig() { return iXRLibStorage.m_ixrLibConfiguration.ReadConfig(); }
    // --- End Configuration fields.
    // --- Environment / storage entry functions.
    //		For 1.0 release, will construct an iXRDbContext on the fly and do the operation.  Seems like it can be that way in perpetuity
    //		as reading/writing config and storage entries would not be done that often and is not a speed-critical operation (and there should
    //		never be that many of them).
    // Default name 'state'
    static async GetEntryAsString(szName = iXRLibCoreModel_1.DbSetStorage.DEFAULTNAME) {
        const dbContext = new iXRLibCoreModel_1.iXRDbContext(false);
        return await dbContext.StorageGetEntryAsString(szName);
    }
    // Merge GetEntryRaw0 and GetEntryRaw1
    static async GetEntryRaw(szName = iXRLibCoreModel_1.DbSetStorage.DEFAULTNAME) {
        const dbContext = new iXRLibCoreModel_1.iXRDbContext(false);
        return await dbContext.StorageGetEntry(szName);
    }
    // Merge all SetEntry functions (0,1,2,3)
    static async SetEntry(data, bKeepLatest, szOrigin, bSessionData, szName = iXRLibCoreModel_1.DbSetStorage.DEFAULTNAME) {
        const dbContext = new iXRLibCoreModel_1.iXRDbContext(false);
        return await dbContext.StorageSetEntry(data, bKeepLatest, szOrigin, bSessionData, szName);
    }
    // Merge RemoveEntry4 and RemoveEntry5
    static async RemoveEntry(szName = iXRLibCoreModel_1.DbSetStorage.DEFAULTNAME) {
        const dbContext = new iXRLibCoreModel_1.iXRDbContext(false);
        // ---
        return await dbContext.StorageRemoveEntry(szName);
    }
    static async RemoveMultipleEntries(bSessionOnly) {
        const dbContext = new iXRLibCoreModel_1.iXRDbContext(false);
        return await dbContext.StorageRemoveMultipleEntries(bSessionOnly);
    }
    // --- END Environment / state data functions.
    static async AddEntrySynchronous(ixrStorage) {
        return await iXRLibAnalytics_1.iXRLibAnalytics.AddXXXTask(ixrStorage, iXRLibCoreModel_1.iXRStorage, "IXRStorage", iXRLibClient_1.iXRLibClient.PostIXRStorage, true, false, null);
    }
}
exports.iXRLibStorage = iXRLibStorage;
;
//# sourceMappingURL=iXRLibStorage.js.map