import { iXREvent, iXRLog, iXRTelemetry } from "./iXRLibCoreModel";
import { InteractionType, iXRResult, iXRDictStrings, ResultOptions } from "./network/utils/DotNetishTypes";
export type iXRLibAnalyticsLogCallback = (ixrLog: iXRLog, eResult: iXRResult, szExceptionMessage: string) => void;
export type iXRLibAnalyticsEventCallback = (ixrEvent: iXREvent, eResult: iXRResult, szExceptionMessage: string) => void;
export type iXRLibAnalyticsTelemetryCallback = (ixrTelemetry: iXRTelemetry, eResult: iXRResult, szExceptionMessage: string) => void;
export declare class iXRLibSend {
    private static LogSynchronous;
    static LogDebugSynchronous(szText: string, dictMeta: iXRDictStrings): Promise<iXRResult>;
    static LogInfoSynchronous(szText: string, dictMeta: iXRDictStrings): Promise<iXRResult>;
    static LogWarnSynchronous(szText: string, dictMeta: iXRDictStrings): Promise<iXRResult>;
    static LogErrorSynchronous(szText: string, dictMeta: iXRDictStrings): Promise<iXRResult>;
    static LogCriticalSynchronous(szText: string, dictMeta: iXRDictStrings): Promise<iXRResult>;
    static EventSynchronous(szName: string, dictMeta: iXRDictStrings): Promise<iXRResult>;
    static EventAssessmentStart(szAssessmentName: string, dictMeta: iXRDictStrings): Promise<iXRResult>;
    static EventAssessmentComplete(szAssessmentName: string, szScore: string, eResultOptions: ResultOptions, dictMeta: iXRDictStrings): Promise<iXRResult>;
    static EventObjectiveStart(szObjectiveName: string, dictMeta: iXRDictStrings): Promise<iXRResult>;
    static EventObjectiveComplete(szObjectiveName: string, szScore: string, eResultOptions: ResultOptions, dictMeta: iXRDictStrings): Promise<iXRResult>;
    static EventInteractionStart(szInteractionName: string, dictMeta: iXRDictStrings): Promise<iXRResult>;
    static EventInteractionComplete(szInteractionName: string, szResult: string, szResultDetails: string, eInteractionType: InteractionType, dictMeta: iXRDictStrings): Promise<iXRResult>;
    static EventLevelStart(szLevelName: string, dictMeta: iXRDictStrings): Promise<iXRResult>;
    static EventLevelComplete(szLevelName: string, szScore: string, dictMeta: iXRDictStrings): Promise<iXRResult>;
    static AddTelemetryEntrySynchronous(szName: string, dictData: iXRDictStrings): Promise<iXRResult>;
    static AddLogSynchronous(ixrLog: iXRLog): Promise<iXRResult>;
    static EventSynchronousCore(ixrEvent: iXREvent): Promise<iXRResult>;
    static AddTelemetryEntrySynchronousCore(ixrTelemetry: iXRTelemetry): Promise<iXRResult>;
}
