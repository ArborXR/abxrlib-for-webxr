import { AbxrLibInit } from "./AbxrLibAnalytics";
import { AbxrLibStorage } from "./AbxrLibStorage";
import { AbxrLibAsync } from "./AbxrLibAsync";
import { AbxrLibSend } from "./AbxrLibSend";
import { AbxrLibClient } from "./AbxrLibClient";
import { AbxrLibAnalytics } from "./AbxrLibAnalytics";
import { ConfigurationManager, DateTime, AbxrResult, AbxrDictStrings, StringList, TimeSpan, InteractionType, ResultOptions } from './network/utils/DotNetishTypes';
import { AbxrBase, AbxrEvent, AbxrLog, AbxrStorage, AbxrTelemetry, AbxrAIProxy, LogLevel } from "./AbxrLibCoreModel";
import { Partner } from "./AbxrLibClient";

// Initialize all static members
AbxrLibInit.InitStatics();
AbxrLibStorage.InitStatics();
AbxrLibAsync.InitStatics();
AbxrBase.InitStatics;
AbxrEvent.InitStatics();

class AbxrLibBaseSetup {
    public static SetAppConfig(customConfig?: string): void
    {
        const defaultConfig: string = '<?xml version="1.0" encoding="utf-8" ?>' +
            '<configuration>' +
                '<appSettings>' +
                    '<add key="REST_URL" value="https://lib-backend.xrdm.app/v1/"/>' +
                    '<add key="SendRetriesOnFailure" value="3"/>' +
                    '<!-- Bandwidth config parameters. -->' +
                    '<add key="SendRetryInterval" value="00:00:03"/>' +
                    '<add key="SendNextBatchWait" value="00:00:30"/>' +
                    '<!-- 0 = infinite, i.e. never send remainders = always send exactly EventsPerSendAttempt. -->' +
                    '<add key="StragglerTimeout" value="00:00:15"/>' +
                    '<!-- 0 = Send all not-already-sent. -->' +
                    '<add key="EventsPerSendAttempt" value="4"/>' +
                    '<add key="LogsPerSendAttempt" value="4"/>' +
                    '<add key="TelemetryEntriesPerSendAttempt" value="4"/>' +
                    '<add key="StorageEntriesPerSendAttempt" value="4"/>' +
                    '<!-- 0 = infinite, i.e. never prune. -->' +
                    '<add key="PruneSentItemsOlderThan" value="12:00:00"/>' +
                    '<add key="MaximumCachedItems" value="1024"/>' +
                    '<add key="RetainLocalAfterSent" value="false"/>' +
                '</appSettings>' +
            '</configuration>';

        const szAppConfig = customConfig || defaultConfig;
        console.log(`Using ${customConfig ? 'user-defined' : 'default'} config`);
        ConfigurationManager.DebugSetAppConfig(szAppConfig);
    }

    // Add any other base setup methods here
    public static InitializeAll(): void {
        AbxrLibBaseSetup.SetAppConfig();
        // Add any other initialization steps needed
    }
}

// Simple Abxr wrapper class for clean developer experience
class Abxr {
    private static isInitialized = false;
    private static isAuthenticated = false;

    // Initialize the library
    public static Start(): void {
        AbxrLibInit.Start();
        this.isInitialized = true;
    }

    // Authenticate with the service
    public static async Authenticate(appId: string, orgId: string, deviceId: string, authSecret: string, partner: Partner = Partner.eArborXR): Promise<AbxrResult> {
        if (!this.isInitialized) {
            this.Start();
        }
        
        const result = await AbxrLibInit.Authenticate(appId, orgId, deviceId, authSecret, partner);
        if (result === AbxrResult.eOk) {
            this.isAuthenticated = true;
        }
        return result;
    }

    // Simple event API
    public static async Event(name: string, meta?: AbxrDictStrings): Promise<AbxrResult> {
        if (!this.isAuthenticated) {
            throw new Error("Must authenticate before sending events");
        }

        const event = new AbxrEvent();
        event.Construct(name, meta || new AbxrDictStrings());
        
        return await AbxrLibSend.EventCore(event);
    }

    // Simple log API
    public static async Log(level: LogLevel, message: string): Promise<AbxrResult> {
        if (!this.isAuthenticated) {
            throw new Error("Must authenticate before sending logs");
        }

        const log = new AbxrLog();
        log.Construct(level, message, new AbxrDictStrings());
        
        return await AbxrLibSend.AddLog(log);
    }

    // Convenience log methods
    public static async LogDebug(message: string): Promise<AbxrResult> {
        return this.Log(LogLevel.eDebug, message);
    }

    public static async LogInfo(message: string): Promise<AbxrResult> {
        return this.Log(LogLevel.eInfo, message);
    }

    public static async LogWarn(message: string): Promise<AbxrResult> {
        return this.Log(LogLevel.eWarn, message);
    }

    public static async LogError(message: string): Promise<AbxrResult> {
        return this.Log(LogLevel.eError, message);
    }

    public static async LogCritical(message: string): Promise<AbxrResult> {
        return this.Log(LogLevel.eCritical, message);
    }

    // Storage API
    public static async SetStorageEntry(data: string | AbxrDictStrings, keepLatest: boolean = true, origin: string = "web", sessionData: boolean = false, name: string = "state"): Promise<AbxrResult> {
        if (!this.isAuthenticated) {
            throw new Error("Must authenticate before using storage");
        }

        return await AbxrLibStorage.SetEntry(data, keepLatest, origin, sessionData, name);
    }

    public static async GetStorageEntry(name: string = "state"): Promise<string> {
        if (!this.isAuthenticated) {
            throw new Error("Must authenticate before using storage");
        }

        return await AbxrLibStorage.GetEntryAsString(name);
    }

    public static async RemoveStorageEntry(name: string = "state"): Promise<AbxrResult> {
        if (!this.isAuthenticated) {
            throw new Error("Must authenticate before using storage");
        }

        return await AbxrLibStorage.RemoveEntry(name);
    }

    // Telemetry API
    public static async Telemetry(name: string, data: AbxrDictStrings): Promise<AbxrResult> {
        if (!this.isAuthenticated) {
            throw new Error("Must authenticate before sending telemetry");
        }

        const telemetry = new AbxrTelemetry();
        telemetry.Construct(name, data);
        
        return await AbxrLibSend.AddTelemetryEntryCore(telemetry);
    }

    // AI Proxy API
    public static async AIProxy(prompt: string, pastMessages?: string, botId?: string): Promise<AbxrResult> {
        if (!this.isAuthenticated) {
            throw new Error("Must authenticate before using AI proxy");
        }

        const aiProxy = new AbxrAIProxy();
        aiProxy.Construct0(prompt, pastMessages || "", botId || "default");
        
        return await AbxrLibAnalytics.AddAIProxy(aiProxy);
    }

    // Configuration helpers
    public static SetAppConfig(customConfig?: string): void {
        AbxrLibBaseSetup.SetAppConfig(customConfig);
    }

    public static InitStatics(): void {
        AbxrLibInit.InitStatics();
    }

    // Getter for DictStrings constructor
    public static get DictStrings(): typeof AbxrDictStrings {
        return AbxrDictStrings;
    }

    // Initialize global scope for browser usage
    public static init(): void {
        if (typeof window !== 'undefined') {
            // Set up the simple Abxr API
            (window as any).Abxr = Abxr;
            
            // Set up the full library for advanced users
            (window as any).AbxrLib = {
                AbxrLibInit,
                AbxrLibStorage,
                AbxrLibAsync,
                AbxrLibSend,
                AbxrLibClient,
                AbxrLibAnalytics,
                AbxrLibBaseSetup,
                AbxrDictStrings,
                AbxrEvent,
                AbxrLog,
                AbxrStorage,
                AbxrTelemetry,
                AbxrAIProxy,
                LogLevel,
                Partner,
                InteractionType,
                ResultOptions
            };
            
            console.log('AbxrLib loaded into global scope. Use Abxr for simple API or AbxrLib for advanced features.');
        }
    }
}

// Export the main library objects that consumers will need
export {
    AbxrLibInit,
    AbxrLibStorage,
    AbxrLibAsync,
    AbxrLibSend,
    AbxrLibClient,
    AbxrLibAnalytics,
    AbxrLibBaseSetup,
    AbxrDictStrings,
    AbxrBase,
    AbxrEvent,
    AbxrLog,
    AbxrStorage,
    AbxrTelemetry,
    AbxrAIProxy,
    LogLevel,
    Partner,
    InteractionType,
    ResultOptions,
    Abxr
};
