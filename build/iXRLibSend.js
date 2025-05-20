"use strict";
/// <summary>
/// API for sending objects to backend.
Object.defineProperty(exports, "__esModule", { value: true });
exports.iXRLibSend = void 0;
const iXRLibAnalytics_1 = require("./iXRLibAnalytics");
const iXRLibClient_1 = require("./iXRLibClient");
const iXRLibCoreModel_1 = require("./iXRLibCoreModel");
const DotNetishTypes_1 = require("./network/utils/DotNetishTypes");
// ---
/// </summary>
class iXRLibSend {
    // --- (C++ dll and C# dll) versions of LogXXX().
    static async LogSynchronous(eLogLevel, szText, dictMeta) {
        var ixrLog = new iXRLibCoreModel_1.iXRLog().Construct(eLogLevel, szText, dictMeta);
        return await iXRLibSend.AddLogSynchronous(ixrLog);
    }
    // private static Log(eLogLevel: LogLevel, szText: string, dictMeta: iXRDictStrings): Promise<iXRResult>
    // {
    // 	var	ixrLog:	iXRLog = new iXRLog().Construct(eLogLevel, szText, dictMeta);
    // 	return iXRLibSend.AddLog(ixrLog, true, null);
    // }
    // ---
    static async LogDebugSynchronous(szText, dictMeta) {
        return await iXRLibSend.LogSynchronous(iXRLibCoreModel_1.LogLevel.eDebug, szText, dictMeta);
    }
    // public static LogDebug(szText: string, dictMeta: iXRDictStrings): Promise<iXRResult>
    // {
    // 	return iXRLibSend.Log(LogLevel.eDebug, szText, dictMeta);
    // }
    static async LogInfoSynchronous(szText, dictMeta) {
        return await iXRLibSend.LogSynchronous(iXRLibCoreModel_1.LogLevel.eInfo, szText, dictMeta);
    }
    // public static LogInfo(szText: string, dictMeta: iXRDictStrings): Promise<iXRResult>
    // {
    // 	return iXRLibSend.Log(LogLevel.eInfo, szText, dictMeta);
    // }
    static async LogWarnSynchronous(szText, dictMeta) {
        return await iXRLibSend.LogSynchronous(iXRLibCoreModel_1.LogLevel.eWarn, szText, dictMeta);
    }
    // public static LogWarn(szText: string, dictMeta: iXRDictStrings): Promise<iXRResult>
    // {
    // 	return iXRLibSend.Log(LogLevel.eWarn, szText, dictMeta);
    // }
    static async LogErrorSynchronous(szText, dictMeta) {
        return await iXRLibSend.LogSynchronous(iXRLibCoreModel_1.LogLevel.eError, szText, dictMeta);
    }
    // public static LogError(szText: string, dictMeta: iXRDictStrings): Promise<iXRResult>
    // {
    // 	return iXRLibSend.Log(LogLevel.eError, szText, dictMeta);
    // }
    static async LogCriticalSynchronous(szText, dictMeta) {
        return await iXRLibSend.LogSynchronous(iXRLibCoreModel_1.LogLevel.eCritical, szText, dictMeta);
    }
    // public static LogCritical(szText: string, dictMeta: iXRDictStrings): Promise<iXRResult>
    // {
    // 	return iXRLibSend.Log(LogLevel.eCritical, szText, dictMeta);
    // }
    // --- End (C++ dll and C# dll) versions of LogXXX().
    // --- API (C++ dll and C# dll) versions of iXRLibSend.Event().
    static async EventSynchronous(szName, dictMeta) {
        var ixrEvent = new iXRLibCoreModel_1.iXREvent().Construct(szName, dictMeta);
        return await iXRLibSend.EventSynchronousCore(ixrEvent);
    }
    // public static async Event(szName: string, dictMeta: iXRDictStrings): Promise<iXRResult>
    // {
    // 	var	ixrEvent:	iXREvent = new iXREvent().Construct(szName, dictMeta);
    // 	return await iXRLibSend.EventCore(ixrEvent, true, null);
    // }
    // Convenient wrappers for particular forms of events.
    static async EventAssessmentStart(szAssessmentName, dictMeta) {
        dictMeta.set("verb", "started");
        dictMeta.set("assessment_name", szAssessmentName);
        // Store the start time.
        //iXREvent.m_csDictProtect.lock();
        iXRLibCoreModel_1.iXREvent.m_dictAssessmentStartTimes.set(szAssessmentName, new DotNetishTypes_1.DateTime().FromUnixTime(DotNetishTypes_1.DateTime.Now())); // MJPQ:  Just use default ctor?
        //iXREvent.m_csDictProtect.unlock();
        // ---
        return await iXRLibSend.EventSynchronous("assessment_start", dictMeta);
    }
    static async EventAssessmentComplete(szAssessmentName, szScore, eResultOptions, dictMeta) {
        var rpStartTime = { vRet: new DotNetishTypes_1.DateTime() };
        var bGotValue;
        dictMeta.set("verb", "completed");
        dictMeta.set("assessment_name", szAssessmentName);
        dictMeta.set("score", szScore);
        dictMeta.set("result_options", (0, DotNetishTypes_1.ResultOptionsToString)(eResultOptions));
        // Calculate and add duration if start time exists, otherwise use "0".
        //iXREvent.m_csDictProtect.lock();
        bGotValue = iXRLibCoreModel_1.iXREvent.m_dictAssessmentStartTimes.TryGetValue(szAssessmentName, rpStartTime);
        //iXREvent.m_csDictProtect.unlock();
        if (bGotValue) {
            var tsDuration = new DotNetishTypes_1.TimeSpan().FromUnixTime(DotNetishTypes_1.DateTime.Now() - rpStartTime.vRet.ToUnixTime());
            dictMeta.set("duration", tsDuration.ToString());
            // ---
            //iXREvent.m_csDictProtect.lock();
            iXRLibCoreModel_1.iXREvent.m_dictAssessmentStartTimes.Remove(szAssessmentName);
            //iXREvent.m_csDictProtect.unlock();
        }
        else {
            dictMeta.set("duration", "0");
        }
        // ---
        return await iXRLibSend.EventSynchronous("assessment_complete", dictMeta);
    }
    static async EventObjectiveStart(szObjectiveName, dictMeta) {
        dictMeta.set("verb", "started");
        dictMeta.set("objective_name", szObjectiveName);
        // Store the start time.
        //iXREvent.m_csDictProtect.lock();
        iXRLibCoreModel_1.iXREvent.m_dictObjectiveStartTimes.set(szObjectiveName, new DotNetishTypes_1.DateTime().FromUnixTime(DotNetishTypes_1.DateTime.Now())); // MJPQ:  Just use default ctor?
        //iXREvent.m_csDictProtect.unlock();
        // ---
        return await iXRLibSend.EventSynchronous("objective_start", dictMeta);
    }
    static async EventObjectiveComplete(szObjectiveName, szScore, eResultOptions, dictMeta) {
        var rpStartTime = { vRet: new DotNetishTypes_1.DateTime() };
        var bGotValue;
        dictMeta.set("verb", "completed");
        dictMeta.set("objective_name", szObjectiveName);
        dictMeta.set("score", szScore);
        dictMeta.set("result_options", (0, DotNetishTypes_1.ResultOptionsToString)(eResultOptions));
        // Calculate and add duration if start time exists, otherwise use "0".
        //iXREvent.m_csDictProtect.lock();
        bGotValue = iXRLibCoreModel_1.iXREvent.m_dictObjectiveStartTimes.TryGetValue(szObjectiveName, rpStartTime);
        //iXREvent.m_csDictProtect.unlock();
        if (bGotValue) {
            var tsDuration = new DotNetishTypes_1.TimeSpan().FromUnixTime(DotNetishTypes_1.DateTime.Now() - rpStartTime.vRet.ToUnixTime());
            dictMeta.set("duration", tsDuration.ToString());
            // ---
            //iXREvent.m_csDictProtect.lock();
            iXRLibCoreModel_1.iXREvent.m_dictObjectiveStartTimes.Remove(szObjectiveName);
            //iXREvent.m_csDictProtect.unlock();
        }
        else {
            dictMeta.set("duration", "0");
        }
        // ---
        return await iXRLibSend.EventSynchronous("objective_complete", dictMeta);
    }
    static async EventInteractionStart(szInteractionName, dictMeta) {
        dictMeta.set("verb", "started");
        dictMeta.set("interaction_name", szInteractionName);
        // ---
        //iXREvent.m_csDictProtect.lock();
        iXRLibCoreModel_1.iXREvent.m_dictInteractionStartTimes.set(szInteractionName, new DotNetishTypes_1.DateTime().FromUnixTime(DotNetishTypes_1.DateTime.Now())); // MJPQ:  Just use default ctor?
        //iXREvent.m_csDictProtect.unlock();
        // ---
        return await iXRLibSend.EventSynchronous("interaction_start", dictMeta);
    }
    // Modified EventInteractionComplete methods.
    static async EventInteractionComplete(szInteractionName, szResult, szResultDetails, eInteractionType, dictMeta) {
        var _a, _b;
        var rpStartTime = { vRet: new DotNetishTypes_1.DateTime() };
        var bGotValue;
        dictMeta.set("verb", "completed");
        dictMeta.set("interaction_name", szInteractionName);
        dictMeta.set("result", szResult);
        dictMeta.set("result_details", szResultDetails);
        dictMeta.set("lms_type", (0, DotNetishTypes_1.InteractionTypeToString)(eInteractionType));
        //iXREvent.m_csDictProtect.lock();
        bGotValue = iXRLibCoreModel_1.iXREvent.m_dictInteractionStartTimes.TryGetValue(szInteractionName, rpStartTime);
        //iXREvent.m_csDictProtect.unlock();
        if (bGotValue) {
            var tsDuration = new DotNetishTypes_1.TimeSpan().FromUnixTime(DotNetishTypes_1.DateTime.Now() - rpStartTime.vRet.ToUnixTime());
            dictMeta.set("duration", tsDuration.ToString());
            // ---
            //iXREvent.m_csDictProtect.lock();
            iXRLibCoreModel_1.iXREvent.m_dictInteractionStartTimes.Remove(szInteractionName);
            //iXREvent.m_csDictProtect.unlock();
        }
        else {
            dictMeta.set("duration", "0");
        }
        // Add assessment_name if there's only one iXREvent.m_dictAssessmentStartTimes value.
        //iXREvent.m_csDictProtect.lock();
        if (iXRLibCoreModel_1.iXREvent.m_dictAssessmentStartTimes.Count() === 1) {
            dictMeta.set("assessment_name", (_b = (_a = iXRLibCoreModel_1.iXREvent.m_dictAssessmentStartTimes.entries().next().value) === null || _a === void 0 ? void 0 : _a[1].ToString()) !== null && _b !== void 0 ? _b : "");
        }
        //iXREvent.m_csDictProtect.unlock();
        // ---
        return await iXRLibSend.EventSynchronous("interaction_complete", dictMeta);
    }
    static async EventLevelStart(szLevelName, dictMeta) {
        dictMeta.set("verb", "started");
        dictMeta.set("level_name", szLevelName);
        // ---
        //iXREvent.m_csDictProtect.lock();
        iXRLibCoreModel_1.iXREvent.m_dictLevelStartTimes.set(szLevelName, new DotNetishTypes_1.DateTime().FromUnixTime(DotNetishTypes_1.DateTime.Now())); // MJPQ:  Just use default ctor?
        //iXREvent.m_csDictProtect.unlock();
        // ---
        return await iXRLibSend.EventSynchronous("level_start", dictMeta);
    }
    static async EventLevelComplete(szLevelName, szScore, dictMeta) {
        var rpStartTime = { vRet: new DotNetishTypes_1.DateTime() };
        var bGotValue;
        dictMeta.set("verb", "completed");
        dictMeta.set("level_name", szLevelName);
        dictMeta.set("score", szScore);
        // Calculate and add duration if start time exists, otherwise use "0".
        //iXREvent.m_csDictProtect.lock();
        bGotValue = iXRLibCoreModel_1.iXREvent.m_dictLevelStartTimes.TryGetValue(szLevelName, rpStartTime);
        //iXREvent.m_csDictProtect.unlock();
        if (bGotValue) {
            var tsDuration = new DotNetishTypes_1.TimeSpan().FromUnixTime(DotNetishTypes_1.DateTime.Now() - rpStartTime.vRet.ToUnixTime());
            dictMeta.set("duration", tsDuration.ToString());
            // ---
            //iXREvent.m_csDictProtect.lock();
            iXRLibCoreModel_1.iXREvent.m_dictLevelStartTimes.Remove(szLevelName);
            //iXREvent.m_csDictProtect.unlock();
        }
        else {
            dictMeta.set("duration", "0");
        }
        // ---
        return await iXRLibSend.EventSynchronous("level_complete", dictMeta);
    }
    // --- End API (C++ dll and C# dll) versions of iXRLibSend.Event().
    // ---
    // --- API (C++ dll and C# dll) versions of AddTelemetryEntry().
    static async AddTelemetryEntrySynchronous(szName, dictData) {
        var ixrTelemetryEntry = new iXRLibCoreModel_1.iXRTelemetry().Construct(szName, dictData);
        return await iXRLibSend.AddTelemetryEntrySynchronousCore(ixrTelemetryEntry);
    }
    // public static AddTelemetryEntry(szName: string, dictData: iXRDictStrings): Promise<iXRResult>
    // {
    // 	var	ixrTelemetryEntry:	iXRTelemetry = new iXRTelemetry().Construct(szName, dictData);
    // 	return iXRLibSend.AddTelemetryEntryCore(ixrTelemetryEntry, true, null);
    // }
    // --- End API (C++ dll and C# dll) versions of AddTelemetryEntry().
    // ---
    // --- Core AddXXX() functions called by the API functions.
    //		These are deliberately public... users who are using the C++ lib directly may find it
    //		expedient/elegant to construct their own objects and call these directly.
    static async AddLogSynchronous(ixrLog) {
        return await iXRLibAnalytics_1.iXRLibAnalytics.AddXXXTask(ixrLog, iXRLibCoreModel_1.iXRLog, "IXRLogs", iXRLibClient_1.iXRLibClient.PostIXRLogs, false, false, null);
    }
    // public static AddLog(ixrLog: iXRLog, bNoCallbackOnSuccess: boolean, pfnStatusCallback?: iXRLibAnalyticsLogCallback | null): Promise<iXRResult>
    // {
    // 	iXRLibAnalytics.DiagnosticWriteLine("Going to call AddLog().");
    // 	// Notice the = capture... so pfnStatusCallback propagates by copy into the thread. <- Comment from C++... irrelevant here but leaving it to document that this is a port from C++.
    // 	return iXRLibAnalytics.m_ixrLibAsync.AddTask((pObject: any): Promise<iXRResult> => { return iXRLibAnalytics.AddXXXTask<iXRLog>(pObject as iXRLog, iXRLog, "IXRLogs", iXRLibClient.PostIXRLogs, false, bNoCallbackOnSuccess, pfnStatusCallback as iXRLibAnalyticsLogCallback | null).then((eRet: iXRResult) => { return eRet; }).catch((eRet: iXRResult) => { return eRet; }); },
    // 		ixrLog,
    // 		(pObject: any): void => { /*delete (iXRLog*)pObject;*/ });
    // }
    // ---
    static async EventSynchronousCore(ixrEvent) {
        return await iXRLibAnalytics_1.iXRLibAnalytics.AddXXXTask(ixrEvent, iXRLibCoreModel_1.iXREvent, "IXREvents", iXRLibClient_1.iXRLibClient.PostIXREvents, false, false, null);
    }
    // public static EventCore(ixrEvent: iXREvent, bNoCallbackOnSuccess: boolean, pfnStatusCallback?: iXRLibAnalyticsEventCallback | null): Promise<iXRResult>
    // {
    // 	iXRLibAnalytics.DiagnosticWriteLine("Going to call iXRLibSend.Event().");
    // 	// Notice the = capture... so pfnStatusCallback propagates by copy into the thread. <- Comment from C++... irrelevant here but leaving it to document that this is a port from C++.
    // 	return iXRLibAnalytics.m_ixrLibAsync.AddTask((pObject: any): Promise<iXRResult> => { return iXRLibAnalytics.AddXXXTask<iXREvent>(pObject as iXREvent, iXREvent, "IXREvents", iXRLibClient.PostIXREvents, false, bNoCallbackOnSuccess, pfnStatusCallback as iXRLibAnalyticsEventCallback | null).then((eRet: iXRResult) => { return eRet; }).catch((eRet: iXRResult) => { return eRet; }); },
    // 		ixrEvent,
    // 		(pObject: any): void => { /*delete (iXREvent*)pObject;*/ });
    // }
    // ---
    static async AddTelemetryEntrySynchronousCore(ixrTelemetry) {
        return await iXRLibAnalytics_1.iXRLibAnalytics.AddXXXTask(ixrTelemetry, iXRLibCoreModel_1.iXRTelemetry, "IXRTelemetry", iXRLibClient_1.iXRLibClient.PostIXRTelemetry, false, false, null);
    }
}
exports.iXRLibSend = iXRLibSend;
;
//# sourceMappingURL=iXRLibSend.js.map