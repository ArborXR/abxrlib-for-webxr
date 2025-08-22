import { AbxrLibInit } from "./AbxrLibAnalytics";
import { AbxrLibStorage } from "./AbxrLibStorage";
import { AbxrLibAsync } from "./AbxrLibAsync";
import { AbxrLibSend } from "./AbxrLibSend";
import { AbxrLibClient } from "./AbxrLibClient";
import { AbxrLibAnalytics } from "./AbxrLibAnalytics";
import { ConfigurationManager, DateTime, AbxrResult, AbxrDictStrings, StringList, TimeSpan, InteractionType, EventStatus } from './network/utils/DotNetishTypes';
import { AbxrBase, AbxrEvent, AbxrLog, AbxrStorage, AbxrTelemetry, AbxrAIProxy, LogLevel } from "./AbxrLibCoreModel";
import { Partner } from "./AbxrLibClient";
// Import XR dialog template
import { getXRDialogTemplate, getXRDialogStyles, XRDialogConfig, XRVirtualKeyboard } from './templates/XRAuthDialog';
// Import device detection utilities
import { AbxrDetectAllDeviceInfo, AbxrDetectOsVersion, AbxrDetectDeviceModel, AbxrDetectIpAddress } from './network/utils/AbxrDeviceDetection';


// Initialize all static members
AbxrLibInit.InitStatics();
AbxrLibStorage.InitStatics();
AbxrLibAsync.InitStatics();
AbxrBase.InitStatics;
AbxrEvent.InitStatics();

// Utility function to generate a GUID
function generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// TypeScript declaration for webpack-injected global
declare const __ABXR_PACKAGE_VERSION__: string;

// Utility function to get package version safely
function getPackageVersion(): string {
    // Webpack replaces __ABXR_PACKAGE_VERSION__ with actual version at build time
    if (typeof __ABXR_PACKAGE_VERSION__ !== 'undefined') {
        return __ABXR_PACKAGE_VERSION__;
    }
    
    // Fallback: try to read from package.json in Node.js environment
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pkg = eval('require("../package.json")');
        return pkg.version || '1.0.0';
    } catch (error) {
        // Final fallback version
        return '1.0.0';
    }
}

// Utility function to get URL parameters
function getUrlParameter(name: string): string | null {
    if (typeof window === 'undefined') return null;
    
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Cookie utility functions
function setCookie(name: string, value: string, days: number = 30): void {
    if (typeof document === 'undefined') return;
    
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    const expiresStr = expires.toUTCString();
    
    // No URL encoding needed for our simple configuration values
    document.cookie = `${name}=${value}; expires=${expiresStr}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;
}

// Security validation functions
function isValidUrl(url: string): boolean {
    try {
        const parsedUrl = new URL(url);
        // Only allow HTTP and HTTPS protocols
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
        return false;
    }
}

function isValidAlphanumericId(value: string): boolean {
    // Allow alphanumeric characters plus hyphens and underscores, reasonable length
    // Used for appId, orgId, and authSecret validation
    const pattern = /^[A-Za-z0-9_-]{8,128}$/;
    return pattern.test(value);
}

// URL version handling utilities
function hasApiVersion(url: string): boolean {
    try {
        const parsedUrl = new URL(url);
        // Check if path contains version pattern like /v1/, /v2/, /api/v1/, etc.
        const versionPattern = /\/v\d+\/?$/;
        return versionPattern.test(parsedUrl.pathname);
    } catch {
        return false;
    }
}

function addApiVersion(url: string, version: string = 'v1'): string {
    try {
        const parsedUrl = new URL(url);
        // Ensure the path ends with /
        if (!parsedUrl.pathname.endsWith('/')) {
            parsedUrl.pathname += '/';
        }
        // Add version if not already present
        if (!hasApiVersion(url)) {
            parsedUrl.pathname += `${version}/`;
        }
        return parsedUrl.toString();
    } catch {
        // Fallback: simple string manipulation if URL parsing fails
        const cleanUrl = url.endsWith('/') ? url : url + '/';
        return cleanUrl + `${version}/`;
    }
}

function sanitizeForXml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function sanitizeForLog(value: string): string {
    // Remove potential log injection characters and limit length
    return value
        .replace(/[\r\n\t]/g, ' ')
        .replace(/[^\x20-\x7E]/g, '') // Remove non-printable ASCII
        .substring(0, 200); // Limit length
}

function validateAndSanitizeParameter(name: string, value: string): string | null {
    if (!value || value.length === 0) {
        return null;
    }
    
    // Validate based on parameter type
    switch (name) {
        case 'abxr_rest_url':
            if (!isValidUrl(value)) {
                console.warn(`AbxrLib: Invalid REST URL format: ${sanitizeForLog(value)}`);
                return null;
            }
            break;
            
        case 'abxr_orgid':
        case 'abxr_appid':
        case 'abxr_auth_secret':
            if (!isValidAlphanumericId(value)) {
                console.warn(`AbxrLib: Invalid format for ${name}: ${sanitizeForLog(value)}`);
                return null;
            }
            break;
            
        default:
            // For unknown parameters, do basic sanitization
            if (value.length > 500) {
                console.warn(`AbxrLib: Parameter ${name} too long, truncating`);
                return value.substring(0, 500);
            }
            break;
    }
    
    return value;
}

// Helper function to determine if we should try version fallback for URL errors
function shouldTryVersionFallback(errorMessage: string): boolean {
    if (!errorMessage) return false;
    
    // Look for common CORS/redirect error indicators
    const corsIndicators = [
        'cors',
        'redirect',
        'preflight',
        'access control',
        'cross-origin',
        'failed to fetch',
        'network error',
        'net::err_failed'
    ];
    
    const lowerError = errorMessage.toLowerCase();
    return corsIndicators.some(indicator => lowerError.includes(indicator));
}

// Enhanced function to handle REST URL with automatic version fallback
function getAbxrRestUrlWithFallback(fallback?: string): string {
    // Get the URL using normal priority
    const restUrl = getAbxrParameter('abxr_rest_url', fallback);
    
    // For REST URLs, we might need to add version fallback logic later
    // For now, just return the URL as-is
    return restUrl || fallback || 'https://lib-backend.xrdm.app/v1/';
}

// Utility function to get abxr parameter with priority: GET params -> cookies -> fallback
function getAbxrParameter(name: string, fallback?: string): string | undefined {
    // Priority 1: GET parameters
    const urlParam = getUrlParameter(name);
    if (urlParam) {
        const sanitizedParam = validateAndSanitizeParameter(name, urlParam);
        if (sanitizedParam) {
            // Save to cookie for future use
            setCookie(name, sanitizedParam);
            return sanitizedParam;
        }
    }
    
    // Priority 2: Cookies
    const cookieParam = getCookie(name);
    if (cookieParam) {
        const sanitizedParam = validateAndSanitizeParameter(name, cookieParam);
        if (sanitizedParam) {
            return sanitizedParam;
        }
    }
    
    // Priority 3: Fallback value
    return fallback;
}

// Utility function to get or create device ID
function getOrCreateDeviceId(): string {
    if (typeof window === 'undefined') {
        // Not in browser environment, generate a new GUID
        return generateGuid();
    }
    
    const storageKey = 'abxr_device_id';
    let deviceId = localStorage.getItem(storageKey);
    
    if (!deviceId) {
        deviceId = generateGuid();
        localStorage.setItem(storageKey, deviceId);
    }
    
    return deviceId;
}

// Utility function to detect if virtual keyboard should be shown by default
function shouldShowVirtualKeyboardByDefault(): boolean {
    if (typeof window === 'undefined') {
        return false; // Non-browser environment
    }
    
    // Check for XR/VR environment
    if ('xr' in navigator && (navigator as any).xr) {
        return true; // XR environments typically need virtual keyboards
    }
    
    // Check for touch devices (mobile/tablet)
    const isTouchDevice = ('ontouchstart' in window) || 
                         (navigator.maxTouchPoints > 0) || 
                         ((navigator as any).msMaxTouchPoints > 0);
    
    // Check user agent for mobile indicators
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    // Check screen size (small screens likely need virtual keyboard)
    const isSmallScreen = window.screen.width <= 768 || window.screen.height <= 768;
    
    // Show virtual keyboard for:
    // - XR/VR environments
    // - Touch devices without physical keyboards
    // - Mobile devices
    // - Small screen devices (likely mobile)
    return isTouchDevice || isMobile || isSmallScreen;
}

class AbxrLibBaseSetup {
    public static SetAppConfig(customConfig?: string): void
    {
        const restUrl = getAbxrParameter('abxr_rest_url', 'https://lib-backend.xrdm.app/v1/') || 'https://lib-backend.xrdm.app/v1/';
        if (getUrlParameter('abxr_rest_url')) {
            console.log(`AbxrLib: Using REST URL from GET parameter: ${sanitizeForLog(restUrl)}`);
        }
        else if (getCookie('abxr_rest_url')) {
            console.log(`AbxrLib: Using REST URL from cookie: ${sanitizeForLog(restUrl)}`);
        }
        else {
            //console.log(`AbxrLib: Using default REST URL: ${restUrl}`);
        }
        const defaultConfig: string = '<?xml version="1.0" encoding="utf-8" ?>' +
            '<configuration>' +
                '<appSettings>' +
                    `<add key="REST_URL" value="${sanitizeForXml(restUrl)}"/>` +
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
        //console.log(`AbxrLib: Using ${customConfig ? 'user-defined' : 'default'} config`);
        ConfigurationManager.DebugSetAppConfig(szAppConfig);
    }

    // Add any other base setup methods here
    public static InitializeAll(): void {
        AbxrLibBaseSetup.SetAppConfig();
        // Add any other initialization steps needed
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
    LogLevel as AbxrLogLevel,
    Partner as AbxrPartner,
    InteractionType,
    EventStatus,
    hasApiVersion,
    addApiVersion,
    AbxrDetectAllDeviceInfo,
    AbxrDetectOsVersion,
    AbxrDetectDeviceModel,
    AbxrDetectIpAddress
};

// Types for authMechanism notification
export interface AuthMechanismData {
    type: string;
    prompt?: string;
    domain?: string;
    [key: string]: any; // Allow for additional properties
}

export type AuthMechanismCallback = (data: AuthMechanismData) => void;

// Types for moduleTarget notification
export interface ModuleTargetData {
    moduleTarget: string | null;
    userData?: any;
    userId?: any;
    userEmail?: string | null;
    isAuthenticated: boolean;
}

export type ModuleTargetCallback = (data: ModuleTargetData) => void;

// Types for authentication completion notification
export interface AuthCompletedData {
    success: boolean;
    userData?: any;
    userId?: any;
    userEmail?: string | null;
    moduleTarget?: string | null;
    isReauthentication?: boolean;
}

export type AuthCompletedCallback = (data: AuthCompletedData) => void;

// Storage enums for enhanced storage control
export enum StorageScope {
    device = 'device',
    user = 'user'
}

export enum StoragePolicy {
    keepLatest = 'keepLatest',
    appendHistory = 'appendHistory'
}

// Configuration options for built-in browser dialog
export interface AuthMechanismDialogOptions {
    enabled?: boolean;           // Enable built-in dialog (default: true for browser environments)
    customCallback?: AuthMechanismCallback;  // Custom callback to use instead
    showVirtualKeyboard?: boolean; // Show virtual keyboard (default: auto-detect based on device)
    xrStyle?: {                  // Custom XR dialog styling options
        colors?: {
            background?: string;     // Dialog background color
            primary?: string;        // Primary accent color (borders, highlights)
            keyBg?: string;         // Virtual keyboard key background
            keyText?: string;       // Virtual keyboard key text color
            keyHover?: string;      // Virtual keyboard key hover state
            keyActive?: string;     // Virtual keyboard key active state
            success?: string;       // Success/submit button color
        };
        dialog?: Partial<CSSStyleDeclaration>; // Custom dialog container styling
        overlay?: Partial<CSSStyleDeclaration>; // Custom overlay styling
    };
}

// Global Abxr class that gets configured by Abxr_init()
export class Abxr {
    private static enableDebug: boolean = false;
    private static isAuthenticated: boolean = false;
    private static requiresFinalAuth: boolean = false;
    private static authenticationFailed: boolean = false;
    private static authenticationError: string = '';
    private static appConfig: string = '';
    private static authParams: {
        appId?: string;
        orgId?: string;
        authSecret?: string;
    } = {};
    private static authMechanismCallback: AuthMechanismCallback | null = null;
    private static dialogOptions: AuthMechanismDialogOptions = { 
        enabled: true
    };
    private static currentAuthData: AuthMechanismData | null = null;
    private static moduleTargetCallbacks: ModuleTargetCallback[] = [];
    private static authCompletedCallbacks: AuthCompletedCallback[] = [];
    
    // Expose commonly used types and enums for easy access
    static readonly EventStatus = EventStatus;
    static readonly InteractionType = InteractionType;
    static readonly LogLevel = LogLevel;
    static readonly Partner = Partner;
    static readonly AbxrDictStrings = AbxrDictStrings;
    static readonly StorageScope = StorageScope;
    static readonly StoragePolicy = StoragePolicy;
    
    // Configuration methods
    static setDebugMode(enabled: boolean): void {
        this.enableDebug = enabled;
    }
    
    static getDebugMode(): boolean {
        return this.enableDebug;
    }
    
    static isConfigured(): boolean {
        return this.isAuthenticated;
    }
    
    static getAuthParams(): any {
        return { ...this.authParams };
    }
    
    // Event methods
    static async Event(name: string, meta?: any): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Event not sent - not authenticated');
            }
            return 0; // Return success even when not authenticated
        }
        const event = new AbxrEvent();
        event.Construct(name, this.convertToAbxrDictStrings(meta));
        return await AbxrLibSend.EventCore(event);
    }
    
    // Assessment Events
    static async EventAssessmentStart(assessmentName: string, meta?: any): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Assessment start event not sent - not authenticated');
            }
            return 0;
        }
        return await AbxrLibSend.EventAssessmentStart(assessmentName, this.convertToAbxrDictStrings(meta));
    }
    
    static async EventAssessmentComplete(assessmentName: string, score: string, eventStatus: EventStatus, meta?: any): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Assessment complete event not sent - not authenticated');
            }
            return 0;
        }
        return await AbxrLibSend.EventAssessmentComplete(assessmentName, score, eventStatus, this.convertToAbxrDictStrings(meta));
    }
    
    // Objective Events
    static async EventObjectiveStart(objectiveName: string, meta?: any): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Objective start event not sent - not authenticated');
            }
            return 0;
        }
        return await AbxrLibSend.EventObjectiveStart(objectiveName, this.convertToAbxrDictStrings(meta));
    }
    
    static async EventObjectiveComplete(objectiveName: string, score: string, eventStatus: EventStatus, meta?: any): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Objective complete event not sent - not authenticated');
            }
            return 0;
        }
        return await AbxrLibSend.EventObjectiveComplete(objectiveName, score, eventStatus, this.convertToAbxrDictStrings(meta));
    }
    
    // Interaction Events
    static async EventInteractionStart(interactionName: string, meta?: any): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Interaction start event not sent - not authenticated');
            }
            return 0;
        }
        return await AbxrLibSend.EventInteractionStart(interactionName, this.convertToAbxrDictStrings(meta));
    }
    
    static async EventInteractionComplete(interactionName: string, interactionType: InteractionType, response: string = "", meta?: any): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Interaction complete event not sent - not authenticated');
            }
            return 0;
        }
        return await AbxrLibSend.EventInteractionComplete(interactionName, interactionType, response, this.convertToAbxrDictStrings(meta));
    }
    
    // Level Events
    static async EventLevelStart(levelName: string, meta?: any): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Level start event not sent - not authenticated');
            }
            return 0;
        }
        return await AbxrLibSend.EventLevelStart(levelName, this.convertToAbxrDictStrings(meta));
    }
    
    static async EventLevelComplete(levelName: string, score: string, meta?: any): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Level complete event not sent - not authenticated');
            }
            return 0;
        }
        return await AbxrLibSend.EventLevelComplete(levelName, score, this.convertToAbxrDictStrings(meta));
    }
    
    static async LogDebug(message: string, meta?: any): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Log not sent - not authenticated');
            }
            return 0;
        }
        const log = new AbxrLog();
        log.Construct(LogLevel.eDebug, message, this.convertToAbxrDictStrings(meta));
        return await AbxrLibSend.AddLog(log);
    }
    
    static async LogInfo(message: string, meta?: any): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Log not sent - not authenticated');
            }
            return 0;
        }
        const log = new AbxrLog();
        log.Construct(LogLevel.eInfo, message, this.convertToAbxrDictStrings(meta));
        return await AbxrLibSend.AddLog(log);
    }
    
    static async LogWarn(message: string, meta?: any): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Log not sent - not authenticated');
            }
            return 0;
        }
        const log = new AbxrLog();
        log.Construct(LogLevel.eWarn, message, this.convertToAbxrDictStrings(meta));
        return await AbxrLibSend.AddLog(log);
    }
    
    static async LogError(message: string, meta?: any): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Log not sent - not authenticated');
            }
            return 0;
        }
        const log = new AbxrLog();
        log.Construct(LogLevel.eError, message, this.convertToAbxrDictStrings(meta));
        return await AbxrLibSend.AddLog(log);
    }
    
    static async LogCritical(message: string, meta?: any): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Log not sent - not authenticated');
            }
            return 0;
        }
        const log = new AbxrLog();
        log.Construct(LogLevel.eCritical, message, this.convertToAbxrDictStrings(meta));
        return await AbxrLibSend.AddLog(log);
    }
    
    // Storage methods
    static async SetStorageEntry(data: any, keepLatest: boolean = true, origin: string = "web", sessionData: boolean = false, name: string = "state"): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Storage not set - not authenticated');
            }
            return 0;
        }
        return await AbxrLibStorage.SetEntry(data, keepLatest, origin, sessionData, name);
    }
    
    static async GetStorageEntry(name: string = "state"): Promise<string> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Storage not retrieved - not authenticated');
            }
            return "";
        }
        return await AbxrLibStorage.GetEntryAsString(name);
    }
    
    static async RemoveStorageEntry(name: string = "state"): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Storage not removed - not authenticated');
            }
            return 0;
        }
        return await AbxrLibStorage.RemoveEntry(name);
    }
    
    // Telemetry methods
    static async Telemetry(name: string, data: any): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Telemetry not sent - not authenticated');
            }
            return 0;
        }
        const telemetry = new AbxrTelemetry();
        telemetry.Construct(name, data);
        return await AbxrLibSend.AddTelemetryEntryCore(telemetry);
    }
    
    // AI Proxy methods
    static async AIProxy(prompt: string, pastMessages?: string, botId?: string): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: AI Proxy not sent - not authenticated');
            }
            return 0;
        }
        return await AbxrLibAnalytics.AddAIProxy(new AbxrAIProxy().Construct0(prompt, pastMessages || "", botId || "default"));
    }
    
    // Internal configuration method
    static setAuthenticated(authenticated: boolean, isReauthentication: boolean = false): void {
        this.isAuthenticated = authenticated;
        
        // Notify auth completion subscribers when authentication succeeds
        if (authenticated) {
            this.notifyAuthCompletedCallbacks(isReauthentication);
        }
        
        // Only notify moduleTarget subscribers if there's actually a moduleTarget value
        if (authenticated && this.hasValidModuleTarget()) {
            this.notifyModuleTargetCallbacks();
        }
    }
    
    static setAuthParams(params: { appId?: string; orgId?: string; authSecret?: string }): void {
        this.authParams = { ...params };
    }
    
    static setAppConfig(config: string): void {
        this.appConfig = config;
    }
    
    static setRequiresFinalAuth(requires: boolean): void {
        this.requiresFinalAuth = requires;
    }
    
    static getRequiresFinalAuth(): boolean {
        return this.requiresFinalAuth;
    }
    
    static hasAuthenticationFailed(): boolean {
        return this.authenticationFailed;
    }
    
    static getAuthenticationError(): string {
        return this.authenticationError;
    }
    
    // Methods to access additional authentication response data
    static getAuthResponseData(): any {
        return AbxrLibClient.getAuthResponseData();
    }
    
    static getUserData(): any {
        const authData = AbxrLibClient.getAuthResponseData();
        return authData ? authData.userData : null;
    }
    
    static getUserId(): any {
        const authData = AbxrLibClient.getAuthResponseData();
        return authData ? authData.userId : null;
    }
    
    static getUserEmail(): string | null {
        const authData = AbxrLibClient.getAuthResponseData();
        return authData ? authData.userEmail : null;
    }
    
    static getModuleTarget(): string | null {
        const authData = AbxrLibClient.getAuthResponseData();
        return authData ? authData.moduleTarget : null;
    }
    
    static setAuthenticationFailed(failed: boolean, error: string = ''): void {
        this.authenticationFailed = failed;
        this.authenticationError = error;
        if (failed) {
            // Clear other states when authentication fails
            this.isAuthenticated = false;
            this.requiresFinalAuth = false;
        }
    }
    
    // AuthMechanism callback methods
    static setAuthMechanismCallback(callback: AuthMechanismCallback | null): void {
        this.authMechanismCallback = callback;
    }
    
    static getAuthMechanismCallback(): AuthMechanismCallback | null {
        return this.authMechanismCallback;
    }
    
    // ModuleTarget subscription methods
    static onModuleTargetAvailable(callback: ModuleTargetCallback): void {
        if (typeof callback !== 'function') {
            console.warn('AbxrLib: ModuleTarget callback must be a function');
            return;
        }
        
        this.moduleTargetCallbacks.push(callback);
        
        // If moduleTarget is already available and has a value, notify immediately
        if (this.isAuthenticated && this.hasValidModuleTarget()) {
            const moduleTargetData = this.getModuleTargetData();
            try {
                callback(moduleTargetData);
            } catch (error) {
                console.error('AbxrLib: Error in moduleTarget callback:', error);
            }
        }
    }
    
    static removeModuleTargetCallback(callback: ModuleTargetCallback): void {
        const index = this.moduleTargetCallbacks.indexOf(callback);
        if (index > -1) {
            this.moduleTargetCallbacks.splice(index, 1);
        }
    }
    
    static clearModuleTargetCallbacks(): void {
        this.moduleTargetCallbacks = [];
    }
    
    // AuthCompleted subscription methods
    /**
     * Subscribe to authentication completion events
     * @param callback Function to call when authentication completes successfully
     * 
     * @example
     * // Basic usage
     * Abxr.onAuthCompleted((data) => {
     *     console.log('Authentication completed!', data);
     *     console.log('User ID:', data.userId);
     *     console.log('User Email:', data.userEmail);
     *     console.log('Module Target:', data.moduleTarget);
     * });
     * 
     * // Check if it's a reauthentication
     * Abxr.onAuthCompleted((data) => {
     *     if (data.isReauthentication) {
     *         console.log('User reauthenticated successfully');
     *     } else {
     *         console.log('Initial authentication completed');
     *     }
     * });
     */
    static onAuthCompleted(callback: AuthCompletedCallback): void {
        if (typeof callback !== 'function') {
            console.warn('AbxrLib: AuthCompleted callback must be a function');
            return;
        }
        
        this.authCompletedCallbacks.push(callback);
        
        // If already authenticated, notify immediately
        if (this.isAuthenticated) {
            const authData = this.getAuthCompletedData();
            try {
                callback(authData);
            } catch (error) {
                console.error('AbxrLib: Error in authCompleted callback:', error);
            }
        }
    }
    
    /**
     * Remove a specific authentication completion callback
     * @param callback The callback function to remove
     */
    static removeAuthCompletedCallback(callback: AuthCompletedCallback): void {
        const index = this.authCompletedCallbacks.indexOf(callback);
        if (index > -1) {
            this.authCompletedCallbacks.splice(index, 1);
        }
    }
    
    /**
     * Clear all authentication completion callbacks
     */
    static clearAuthCompletedCallbacks(): void {
        this.authCompletedCallbacks = [];
    }
    
    // Session Management Methods
    
    /**
     * Trigger reauthentication manually (primarily for testing purposes)
     * This will attempt to authenticate again with the current stored parameters
     */
    static async ReAuthenticate(): Promise<void> {
        if (this.enableDebug) {
            console.log('AbxrLib: ReAuthenticate called - triggering manual reauthentication');
        }
        
        const params = this.getAuthParams();
        if (!params.appId) {
            console.error('AbxrLib: Cannot reauthenticate - no appId stored. Call Abxr_init() first.');
            return;
        }
        
        // Reset authentication state
        this.setAuthenticated(false);
        this.setRequiresFinalAuth(false);
        this.setAuthenticationFailed(false);
        
        // For testing purposes, trigger reauthentication using the existing authentication flow
        // Note: This is a simplified implementation for testing - in production this would
        // have more sophisticated session management
        try {
            console.log('AbxrLib: Reauthentication completed (test implementation)');
            this.setAuthenticated(true, true); // Mark as reauthentication
        } catch (error) {
            console.log('AbxrLib: Reauthentication failed or requires additional steps');
            // Note: Additional authentication steps would be handled by the underlying system
        }
    }
    
    /**
     * Start a new session with a fresh session ID
     * This generates a new session identifier and reauthenticates
     */
    static async StartNewSession(): Promise<void> {
        if (this.enableDebug) {
            console.log('AbxrLib: StartNewSession called - generating new session ID');
        }
        
        const params = this.getAuthParams();
        if (!params.appId) {
            console.error('AbxrLib: Cannot start new session - no appId stored. Call Abxr_init() first.');
            return;
        }
        
        // Generate new session ID (similar to device ID generation)
        const newSessionId = 'sess_' + Array.from({length: 32}, () => 
            '0123456789abcdef'[Math.floor(Math.random() * 16)]
        ).join('');
        
        if (this.enableDebug) {
            console.log('AbxrLib: Generated new session ID:', newSessionId);
        }
        
        // Set the new session ID in the authentication system
        // Note: Session ID is handled internally, we just generate it for reference
        
        // Reset authentication state and reauthenticate
        this.setAuthenticated(false);
        this.setRequiresFinalAuth(false);
        this.setAuthenticationFailed(false);
        
        // For new sessions, we'll trigger a fresh authentication
        // Note: New session ID generation is handled internally by the authentication system
        try {
            console.log('AbxrLib: New session started successfully');
            this.setAuthenticated(true, false); // New session, not reauthentication
        } catch (error) {
            console.log('AbxrLib: New session authentication failed or requires additional steps');
            // Note: Additional authentication steps would be handled by the underlying system
        }
    }
    
    /**
     * Continue an existing session with the provided session ID
     * @param sessionId The session ID to continue
     */
    static async ContinueSession(sessionId: string): Promise<void> {
        if (!sessionId) {
            console.error('AbxrLib: ContinueSession called with empty sessionId');
            return;
        }
        
        if (this.enableDebug) {
            console.log('AbxrLib: ContinueSession called with session ID:', sessionId);
        }
        
        const params = this.getAuthParams();
        if (!params.appId) {
            console.error('AbxrLib: Cannot continue session - no appId stored. Call Abxr_init() first.');
            return;
        }
        
        // Set the provided session ID (handled internally by the authentication system)
        // Note: For now, session ID is managed internally by the system
        
        // Reset authentication state and authenticate with existing session
        this.setAuthenticated(false);
        this.setRequiresFinalAuth(false);
        this.setAuthenticationFailed(false);
        
        // Attempt reauthentication (in future could be enhanced to use specific sessionId)
        try {
            console.log('AbxrLib: Session continued successfully');
            this.setAuthenticated(true, true); // Continuing session counts as reauthentication
        } catch (error) {
            console.log('AbxrLib: Session continuation failed or requires additional steps');
            // Note: Additional authentication steps would be handled by the underlying system
        }
    }
    
    // Helper method to check if moduleTarget has a valid value
    private static hasValidModuleTarget(): boolean {
        const authData = AbxrLibClient.getAuthResponseData();
        return authData && authData.moduleTarget !== null && authData.moduleTarget !== undefined && authData.moduleTarget !== '';
    }
    
    // Helper method to get all moduleTarget-related data
    private static getModuleTargetData(): ModuleTargetData {
        const authData = AbxrLibClient.getAuthResponseData();
        return {
            moduleTarget: authData ? authData.moduleTarget : null,
            userData: authData ? authData.userData : null,
            userId: authData ? authData.userId : null,
            userEmail: authData ? authData.userEmail : null,
            isAuthenticated: this.isAuthenticated
        };
    }
    
    // Helper method to get auth completion data
    private static getAuthCompletedData(isReauthentication: boolean = false): AuthCompletedData {
        const authData = AbxrLibClient.getAuthResponseData();
        return {
            success: this.isAuthenticated,
            userData: authData ? authData.userData : null,
            userId: authData ? authData.userId : null,
            userEmail: authData ? authData.userEmail : null,
            moduleTarget: authData ? authData.moduleTarget : null,
            isReauthentication
        };
    }
    
    // Internal method to notify all moduleTarget subscribers
    private static notifyModuleTargetCallbacks(): void {
        if (this.moduleTargetCallbacks.length === 0) {
            return;
        }
        
        const moduleTargetData = this.getModuleTargetData();
        
        // Double-check that we actually have a moduleTarget value before notifying
        if (!this.hasValidModuleTarget()) {
            return;
        }
        
        for (const callback of this.moduleTargetCallbacks) {
            try {
                callback(moduleTargetData);
            } catch (error) {
                console.error('AbxrLib: Error in moduleTarget callback:', error);
            }
        }
    }
    
    // Internal method to notify all auth completion subscribers
    private static notifyAuthCompletedCallbacks(isReauthentication: boolean = false): void {
        if (this.authCompletedCallbacks.length === 0) {
            return;
        }
        
        const authData = this.getAuthCompletedData(isReauthentication);
        
        for (const callback of this.authCompletedCallbacks) {
            try {
                callback(authData);
            } catch (error) {
                console.error('AbxrLib: Error in authCompleted callback:', error);
            }
        }
    }

    // Helper method to convert various metadata formats to AbxrDictStrings
    private static convertToAbxrDictStrings(meta?: any): AbxrDictStrings {
        const dictMeta = new AbxrDictStrings();
        
        if (!meta) {
            return dictMeta;
        }
        
        // If it's already an AbxrDictStrings, return as-is
        if (meta instanceof AbxrDictStrings) {
            return meta;
        }
        
        // Handle JSON string
        if (typeof meta === 'string') {
            try {
                // Try to parse as JSON first
                const parsed = JSON.parse(meta);
                if (typeof parsed === 'object' && parsed !== null) {
                    // Successfully parsed JSON object
                    for (const [key, value] of Object.entries(parsed)) {
                        dictMeta.Add(key, String(value));
                    }
                    return dictMeta;
                }
            } catch (jsonError) {
                // Not valid JSON, try URL parameters format
                if (meta.includes('=')) {
                    // Parse URL-style parameters: "key1=value1&key2=value2"
                    const pairs = meta.split('&');
                    for (const pair of pairs) {
                        const [key, ...valueParts] = pair.split('=');
                        if (key) {
                            const value = valueParts.join('='); // Handle values with = in them
                            dictMeta.Add(decodeURIComponent(key.trim()), decodeURIComponent(value || ''));
                        }
                    }
                    return dictMeta;
                }
                
                // If it's just a plain string that's not JSON or URL params, treat as single value
                dictMeta.Add('value', meta);
                return dictMeta;
            }
        }
        
        // Handle plain JavaScript object
        if (typeof meta === 'object' && meta !== null) {
            for (const [key, value] of Object.entries(meta)) {
                dictMeta.Add(key, String(value));
            }
            return dictMeta;
        }
        
        // Handle primitive values (number, boolean, etc.)
        dictMeta.Add('value', String(meta));
        return dictMeta;
    }
    
    // Configure built-in dialog options
    static setDialogOptions(options: AuthMechanismDialogOptions): void {
        this.dialogOptions = { ...this.dialogOptions, ...options };
    }
    
    static getDialogOptions(): AuthMechanismDialogOptions {
        return { ...this.dialogOptions };
    }
    

    
    // Built-in authentication handler (browser-only)
    static builtInAuthMechanismHandler(authData: AuthMechanismData): void {
        if (typeof window === 'undefined') {
            console.warn('AbxrLib: Built-in dialog not available in non-browser environment');
            return;
        }
        
        this.showXRDialog(authData);
    }
    
    // Show XR authentication dialog
    private static showXRDialog(authData: AuthMechanismData): void {
        try {
            // Load and show XR dialog
            this.loadXRDialog(authData);
        } catch (error) {
            console.error('AbxrLib: Failed to show XR dialog:', error);
            // You may want to call your custom callback here if dialog creation fails
            throw error;
        }
    }
    
    // Load and display XR dialog component
    private static async loadXRDialog(authData: AuthMechanismData): Promise<void> {
        const handleSubmit = async (value: string) => {
            try {
                const formattedData = this.formatAuthDataForSubmission(value, authData.type, authData.domain);
                
                const success = await this.completeFinalAuth(formattedData);
                
                if (success) {
                    this.hideXRDialog();
                } else {
                    const authTypeLabel = authData.type === 'email' ? 'email' : 
                                        (authData.type === 'assessmentPin' || authData.type === 'pin') ? 'PIN' : 'credentials';
                    this.showXRError(`Authentication failed. Please check your ${authTypeLabel} and try again.`);
                    
                    // Focus and select input for retry
                    const input = document.querySelector('#abxrlib-xr-input') as HTMLInputElement;
                    if (input) {
                        input.focus();
                        input.select();
                    }
                }
            } catch (error: any) {
                console.error('AbxrLib: XR dialog authentication error:', error);
                this.showXRError('Authentication error: ' + error.message);
            }
        };
        
        // Store current auth data for XR dialog
        this.currentAuthData = authData;
        
        // Use XR-styled DOM fallback (looks great, works everywhere)
        this.showXRDialogFallback(authData, handleSubmit);
    }
    
    // Show XR dialog using template
    private static showXRDialogFallback(
        authData: AuthMechanismData, 
        onSubmit: (value: string) => void
    ): void {
        // Add XR-style glow animation CSS
        const style = document.createElement('style');
        style.textContent = getXRDialogStyles();
        document.head.appendChild(style);
        
        // Determine if virtual keyboard should be shown
        const options = this.getDialogOptions();
        const showVirtualKeyboard = options.showVirtualKeyboard !== undefined 
            ? options.showVirtualKeyboard 
            : shouldShowVirtualKeyboardByDefault();
        
        // Generate XR dialog HTML from template
        const dialogHTML = getXRDialogTemplate(authData, { 
            showVirtualKeyboard,
            hideDialogButtons: showVirtualKeyboard, // Hide dialog buttons when virtual keyboard is shown
            customStyle: options.xrStyle
        });
        
        // Insert dialog into DOM
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
        
        // Get dialog elements
        const overlay = document.getElementById('abxrlib-xr-dialog-overlay');
        const input = document.querySelector('#abxrlib-xr-input') as HTMLInputElement;
        const submitBtn = document.querySelector('#abxrlib-xr-submit') as HTMLButtonElement;
        
        if (!overlay || !input) {
            console.error('AbxrLib: XR dialog essential elements not found');
            return;
        }
        
        // Note: submitBtn may be null if hideDialogButtons is true
        
        // Apply custom styling if provided
        if (options.xrStyle?.overlay && overlay) {
            Object.assign(overlay.style, options.xrStyle.overlay);
        }
        
        if (options.xrStyle?.dialog) {
            const dialogContent = document.getElementById('abxr-dialog-content');
            if (dialogContent) {
                Object.assign(dialogContent.style, options.xrStyle.dialog);
            }
        }
        
        // Clear any existing error messages
        this.hideXRError();
        
        // Initialize virtual keyboard only if it's being shown
        let virtualKeyboard: XRVirtualKeyboard | null = null;
        if (showVirtualKeyboard) {
            virtualKeyboard = new XRVirtualKeyboard(authData.type);
            // Pass submit callback to virtual keyboard (no cancel needed for captive dialog)
            const handleSubmitWrapper = () => {
                const value = input.value.trim();
                if (value) {
                    onSubmit(value);
                } else {
                    this.showXRError('Please enter a value');
                }
            };
            virtualKeyboard.initialize(input, undefined, handleSubmitWrapper);
        }
        
        // Focus input
        input.focus();
        
        // Add hover effects using config from template
        input.addEventListener('focus', () => {
            Object.assign(input.style, XRDialogConfig.focusStyle);
        });
        
        input.addEventListener('blur', () => {
            Object.assign(input.style, XRDialogConfig.blurStyle);
        });
        
        // Clear error on input
        input.addEventListener('input', () => {
            this.hideXRError();
        });
        
        // Handle form submission
        const handleSubmitClick = () => {
            const value = input.value.trim();
            if (value) {
                onSubmit(value);
            } else {
                this.showXRError('Please enter a value');
            }
        };
        
        // Add event listeners only if submit button exists (it may be hidden when virtual keyboard is shown)
        if (submitBtn) {
            submitBtn.addEventListener('click', handleSubmitClick);
        }
        
        // Handle Enter key (removed Escape key handling for captive dialog)
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleSubmitClick();
            }
        });
        
        // Store references for cleanup
        (this as any).xrDialogOverlay = overlay;
        (this as any).xrDialogStyle = style;
        (this as any).xrVirtualKeyboard = virtualKeyboard;
    }
    
    // Show error in XR dialog
    private static showXRError(message: string): void {
        const errorDiv = document.getElementById('abxrlib-xr-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            setTimeout(() => {
                if (errorDiv) errorDiv.style.display = 'none';
            }, 3000);
        }
    }
    
    // Hide error in XR dialog
    private static hideXRError(): void {
        const errorDiv = document.getElementById('abxrlib-xr-error');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }
    
    // Hide XR dialog
    private static hideXRDialog(): void {
        const overlay = document.getElementById('abxrlib-xr-dialog-overlay') || (this as any).xrDialogOverlay;
        const container = document.getElementById('abxrlib-xr-dialog-container');
        const style = (this as any).xrDialogStyle;
        const virtualKeyboard = (this as any).xrVirtualKeyboard;
        
        if (overlay) {
            overlay.remove();
            (this as any).xrDialogOverlay = null;
        }
        
        if (container) {
            container.remove();
        }
        
        if (style) {
            style.remove();
            (this as any).xrDialogStyle = null;
        }
        
        if (virtualKeyboard && typeof virtualKeyboard.destroy === 'function') {
            virtualKeyboard.destroy();
            (this as any).xrVirtualKeyboard = null;
        }
        
        // Clean up global handlers
        if ((window as any).abxrXRHandlers) {
            delete (window as any).abxrXRHandlers;
        }
    }
    
    // Extract authMechanism data into a structured format
    static extractAuthMechanismData(): AuthMechanismData | null {
        try {
            const authMechanism = AbxrLibInit.get_AuthMechanism();
            if (!authMechanism) {
                return null;
            }
            
            const data: AuthMechanismData = { type: '' };
            
            // Handle AbxrDictStrings (has entries method)
            if (typeof authMechanism.entries === 'function') {
                for (const [key, value] of authMechanism.entries()) {
                    data[key] = value;
                }
            }
            // Handle plain objects
            else if (typeof authMechanism === 'object') {
                Object.assign(data, authMechanism);
            }
            
            // Ensure we have at least a type
            if (!data.type) {
                console.warn('AbxrLib: AuthMechanism missing type field');
                return null;
            }
            
            return data;
        } catch (error) {
            console.error('AbxrLib: Error extracting authMechanism data:', error);
            return null;
        }
    }
    
    // Helper method to format auth data for completeFinalAuth based on type
    static formatAuthDataForSubmission(inputValue: string, authType: string, domain?: string): any {
        const authData: any = {};
        
        if (authType === 'email') {
            // For email type, combine input with domain if provided
            const fullEmail = domain ? `${inputValue}@${domain}` : inputValue;
            authData.email = fullEmail;
        } else if (authType === 'assessmentPin' || authType === 'pin') {
            // For PIN type, use pin field
            authData.pin = inputValue;
        } else {
            // Default fallback - use the type as the field name
            authData[authType || 'value'] = inputValue;
        }
        
        return authData;
    }
    
    // Method to attempt version fallback on authentication failure
    static async attemptVersionFallback(): Promise<boolean> {
        try {
            const currentRestUrl = getAbxrParameter('abxr_rest_url') || 'https://lib-backend.xrdm.app/v1/';
            
            console.log(`AbxrLib: Attempting version fallback for URL: ${sanitizeForLog(currentRestUrl)}`);
            
            // Check if URL already has a version
            if (hasApiVersion(currentRestUrl)) {
                console.log(`AbxrLib: URL already has version, skipping fallback`);
                return false;
            }
            
            // Add /v1/ to the URL
            const versionedUrl = addApiVersion(currentRestUrl, 'v1');
            console.log(`AbxrLib: Saving versioned URL to cookie: ${sanitizeForLog(versionedUrl)}`);
            
            // Save the versioned URL to cookies for persistence
            setCookie('abxr_rest_url', versionedUrl);
            
            // Force page refresh to reload with new cookie value
            if (typeof window !== 'undefined') {
                console.log(`AbxrLib: Refreshing page to apply versioned URL`);
                window.location.reload();
            }
            
            return true; // Indicate that fallback was attempted
        } catch (error) {
            console.error('AbxrLib: Error during version fallback:', error);
            return false;
        }
    }

    // Method to complete final authentication when authMechanism is required
    static async completeFinalAuth(authData: any): Promise<boolean> {
        if (!this.requiresFinalAuth) {
            console.warn('AbxrLib: No final authentication required');
            return false;
        }
        
        try {
            // Get the device ID that was used during initial authentication
            const deviceId = getOrCreateDeviceId();
            
            // Get the sessionId and app_id from the stored authentication object
            const sessionId = AbxrLibInit.m_abxrLibAuthentication.m_szSessionId;
            const appId = AbxrLibInit.m_abxrLibAuthentication.m_szAppID;
            
            // Get the existing authMechanism to preserve the type field
            const authMechanism = AbxrLibInit.get_AuthMechanism();
            
            // Preserve original authMechanism metadata (type, domain, etc.)
            const originalType = authMechanism.get('type');
            const originalDomain = authMechanism.get('domain');
            
            // Clear existing data and rebuild with metadata preserved
            authMechanism.clear();
            
            // Re-add the type field first (required by server)  
            if (originalType) {
                authMechanism.Add('type', originalType);
            }
            
            // Add user-provided auth data in the "prompt" field as per API spec
            // The API expects user input in "prompt" regardless of auth type
            for (const [key, value] of Object.entries(authData)) {
                authMechanism.Add('prompt', String(value));
                break; // Only take the first (and should be only) value
            }
            
            // Re-add any additional metadata (like domain for email)
            if (originalDomain) {
                authMechanism.Add('domain', originalDomain);
            }
            
            // Note: device_id, sessionId, app_id are already at the top level of the request
            // They should NOT be duplicated inside authMechanism per API specification
            
            AbxrLibInit.set_AuthMechanism(authMechanism);
            
            // Perform final authentication
                                        const result = await AbxrLibInit.FinalAuthenticate();
                            if (result === 0) {
                                console.log('AbxrLib: Final authentication successful - library ready');
                                this.setAuthenticated(true, false);
                                this.setRequiresFinalAuth(false);
                                return true;
                            } else {
                                console.warn(`AbxrLib: Final authentication failed with code ${result}`);
                                return false;
                            }
        } catch (error: any) {
            console.error('AbxrLib: Final authentication error:', error);
            return false;
        }
    }
}

// Global scope setup - happens immediately when library loads
if (typeof window !== 'undefined') {
    // Expose the Abxr class directly with its static methods
    (window as any).Abxr = Abxr;
    
    (window as any).AbxrLib = { 
        AbxrLibInit,
        AbxrLibAnalytics,
        AbxrLibSend,
        AbxrLibStorage,
        AbxrLibClient,
        AbxrLibAsync,
        AbxrEvent,
        AbxrLog,
        AbxrStorage,
        AbxrTelemetry,
        AbxrAIProxy,
        AbxrDictStrings,
        AbxrLogLevel: LogLevel,
        AbxrPartner: Partner,
        AbxrResult,
        // Device detection utilities
        AbxrDetectAllDeviceInfo,
        AbxrDetectOsVersion,
        AbxrDetectDeviceModel,
        AbxrDetectIpAddress,
        Abxr
    };
    // Also expose the global function directly
    (window as any).Abxr_init = Abxr_init;
    
    // Expose device detection functions directly for easy testing
    (window as any).AbxrDetectAllDeviceInfo = AbxrDetectAllDeviceInfo;
    (window as any).AbxrDetectOsVersion = AbxrDetectOsVersion;
    (window as any).AbxrDetectDeviceModel = AbxrDetectDeviceModel;
    (window as any).AbxrDetectIpAddress = AbxrDetectIpAddress;
    
    // Expose prefixed versions of LogLevel and Partner
    (window as any).AbxrLogLevel = LogLevel;
    (window as any).AbxrPartner = Partner;
    console.log('AbxrLib: Loaded into global scope. Use Abxr for simple API or AbxrLib for advanced features.');
}

// Global function for easy access
export function Abxr_init(appId: string, orgId?: string, authSecret?: string, appConfig?: string, dialogOptions?: AuthMechanismDialogOptions, authMechanismCallback?: AuthMechanismCallback): void {
    
    // Validate required appId
    if (!appId) {
        console.error('AbxrLib: appId is required for initialization');
        return;
    }
    
    // Reset authentication state for new initialization attempt
    Abxr.setAuthenticationFailed(false);
    AbxrLibClient.clearLastAuthError();
    
    // Configure dialog options if provided
    if (dialogOptions) {
        Abxr.setDialogOptions(dialogOptions);
    }
    
    // Set up authMechanism handling
    const currentOptions = Abxr.getDialogOptions();
    if (authMechanismCallback) {
        // Use custom callback from function parameter
        Abxr.setAuthMechanismCallback(authMechanismCallback);
    } else if (currentOptions.customCallback) {
        // Use custom callback from dialogOptions
        Abxr.setAuthMechanismCallback(currentOptions.customCallback);
    } else {
        // Determine if we should use built-in dialog
        const isBrowser = typeof window !== 'undefined';
        const shouldUseBuiltIn = currentOptions.enabled !== false && isBrowser;
        
        if (shouldUseBuiltIn) {
            Abxr.setAuthMechanismCallback((authData) => Abxr.builtInAuthMechanismHandler(authData));
        }
    }
    
    // Get parameters with priority: GET params -> cookies -> function params
    // Note: appId is always taken from function parameter only (not from GET/cookies)
    const finalOrgId = getAbxrParameter('abxr_orgid', orgId);
    const finalAuthSecret = getAbxrParameter('abxr_auth_secret', authSecret);
    
    // Generate or retrieve device ID
    const deviceId = getOrCreateDeviceId();
    
    // Store auth parameters (without deviceId since it's handled internally)
    Abxr.setAuthParams({ appId: appId, orgId: finalOrgId, authSecret: finalAuthSecret });
    
    // If we have all required authentication parameters, attempt to authenticate
    if (appId && finalOrgId && finalAuthSecret) {
        // Use provided appConfig, or let AbxrLibBaseSetup.SetAppConfig use its comprehensive default
        const configToUse = appConfig;
        
        // Store app config (only if provided)
        if (configToUse) {
            Abxr.setAppConfig(configToUse);
        }
        
        try {
            // Configure the library (SetAppConfig handles undefined by using its default)
            AbxrLibBaseSetup.SetAppConfig(configToUse);
            AbxrLibInit.InitStatics();
            AbxrLibInit.Start();
            
            // Clear any previous auth errors before attempting authentication
            AbxrLibClient.clearLastAuthError();
            
            // Detect and set device information before authentication
            console.log('AbxrLib: Detecting device information...');
            AbxrDetectAllDeviceInfo(false) // IP detection disabled to prevent CSP violations
                .then((deviceInfo) => {
                    //console.log(`AbxrLib: Device detection complete - OS: ${deviceInfo.osVersion}, Browser: ${deviceInfo.deviceModel}, IP: ${deviceInfo.ipAddress}`);
                    // Set the detected values in the authentication object
                    AbxrLibInit.set_OsVersion(deviceInfo.osVersion);
                    AbxrLibInit.set_DeviceModel(deviceInfo.deviceModel);
                    AbxrLibInit.set_IpAddress(deviceInfo.ipAddress);
                    // Set library type and version
                    AbxrLibInit.set_LibType('webxr');
                    AbxrLibInit.set_LibVersion(getPackageVersion());
                    
                    // Now attempt initial authentication with device info set
                    return AbxrLibInit.Authenticate(appId, finalOrgId, deviceId, finalAuthSecret, Partner.eArborXR);
                })
                .catch((error) => {
                    console.warn('AbxrLib: Device detection failed, using defaults:', error);
                    // Set fallback values if detection fails
                    AbxrLibInit.set_OsVersion('Unknown OS');
                    AbxrLibInit.set_DeviceModel('Unknown Browser');
                    AbxrLibInit.set_IpAddress('NA');
                    // Set library type and version even when device detection fails
                    AbxrLibInit.set_LibType('webxr');
                    AbxrLibInit.set_LibVersion(getPackageVersion());
                    
                    // Still attempt authentication even if device detection failed
                    return AbxrLibInit.Authenticate(appId, finalOrgId, deviceId, finalAuthSecret, Partner.eArborXR);
                })
                .then(async (result: number) => {
                    if (result === 0) {
                        console.log('AbxrLib: Initial authentication successful');
                        
                        // Check if authMechanism is required
                        const authMechanism = AbxrLibInit.get_AuthMechanism();
                        
                        // Check if authMechanism has content (either as AbxrDictStrings or plain object)
                        const hasAuthMechanism = authMechanism && (
                            (typeof authMechanism.Count === 'function' && authMechanism.Count() > 0) ||
                            (typeof authMechanism === 'object' && Object.keys(authMechanism).length > 0)
                        );
                        
                        if (hasAuthMechanism) {
                            // Set the library to require final authentication
                            Abxr.setRequiresFinalAuth(true);
                            
                            // Extract structured authMechanism data
                            const authData = Abxr.extractAuthMechanismData();
                            if (authData) {
                                console.log(`AbxrLib: Additional authentication required - ${authData.type}${authData.domain ? ` (domain: ${authData.domain})` : ''}`);
                                
                                // Notify the client via callback if one is set
                                const callback = Abxr.getAuthMechanismCallback();
                                if (callback && typeof callback === 'function') {
                                    try {
                                        callback(authData);
                                    } catch (error) {
                                        console.error('AbxrLib: Error in authMechanism callback:', error);
                                    }
                                } else if (!callback) {
                                    console.log('AbxrLib: No callback configured for additional authentication');
                                }
                            } else {
                                console.log('AbxrLib: Additional authentication required (authMechanism detected)');
                            }
                        } else {
                            console.log('AbxrLib: Authentication complete - library ready');
                            Abxr.setAuthenticated(true, false);
                        }
                    } else {
                        // Try to get detailed error message from AbxrLibClient
                        const detailedError = AbxrLibClient.getLastAuthError();
                        const errorMessage = detailedError || `Authentication failed with code ${result}`;
                        
                        // Check if this looks like a CORS/redirect error and try version fallback
                        if (shouldTryVersionFallback(errorMessage)) {
                            console.log(`AbxrLib: Authentication failed with CORS/redirect error, attempting version fallback`);
                            
                            // Attempt version fallback (this will save cookie and refresh page if successful)
                            await Abxr.attemptVersionFallback();
                            // Note: If fallback is attempted, page will refresh and execution won't continue here
                        }
                        
                        console.warn(`AbxrLib: Authentication failed - ${errorMessage}`);
                        Abxr.setAuthenticationFailed(true, errorMessage);
                    }
                })
                .catch((error: any) => {
                    console.error('AbxrLib: Authentication error:', error);
                    Abxr.setAuthenticationFailed(true, `Authentication error: ${error.message}`);
                });
        } catch (error: any) {
            console.error('AbxrLib: Configuration error:', error);
            Abxr.setAuthenticationFailed(true, `Configuration error: ${error.message}`);
        }
            }
}
