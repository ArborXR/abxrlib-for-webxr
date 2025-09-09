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

// Types for event queuing system
enum QueuedEventType {
    AssessmentStart = 'AssessmentStart',
    AssessmentComplete = 'AssessmentComplete',
    ObjectiveStart = 'ObjectiveStart',
    ObjectiveComplete = 'ObjectiveComplete',
    InteractionStart = 'InteractionStart',
    InteractionComplete = 'InteractionComplete'
}

interface QueuedEvent {
    eventType: QueuedEventType;
    eventName: string;
    meta?: any;
    score?: string;  // Changed from number to string to match validateScore return type
    status?: EventStatus;
    interactionType?: InteractionType;
    response?: string;
}

// Types for moduleTarget notification
export interface CurrentSessionData {
    moduleTarget: string | null;
    userData?: any;
    userId?: any;
    userEmail?: string | null;
}

// Types for module information from authentication response
export interface ModuleData {
    id: string;       // Module unique identifier
    name: string;     // Module display name
    target: string;   // Module target identifier
    order: number;    // Module order/sequence
}

// Types for complete authentication response information
// Contains the full authentication payload for JSON reconstruction and comprehensive access
export interface AuthCompletedData {
    success: boolean;             // Whether authentication was successful
    token?: string;               // Authentication token
    secret?: string;              // Authentication secret
    userData?: any;               // Complete user data object from authentication response
    userId?: any;                 // User identifier
    userEmail?: string | null;    // User email address (extracted from userData.email)
    appId?: string;               // Application identifier
    modules?: ModuleData[];       // List of available modules
    moduleCount: number;          // Total number of modules available (use GetModuleTarget() to iterate through them)
    isReauthentication?: boolean; // Whether this was a reauthentication (vs initial auth)
    error?: string;               // Error message when success is false (enhancement over Unity)
    
    /**
     * Reconstruct the original authentication response as a JSON string
     * Useful for debugging or passing complete auth data to other systems
     */
    toJsonString?(): string;
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
    private static connectionActive: boolean = false;
    private static requiresFinalAuth: boolean = false;
    private static authenticationFailed: boolean = false;
    private static authenticationError: string = '';

    // Queue for events that need to wait for authentication completion
    private static queuedEvents: QueuedEvent[] = [];
    private static isAuthenticated: boolean = false;
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
    private static moduleIndex: number = 0;
    private static readonly MODULE_INDEX_KEY = 'abxr_module_index';
    private static latestAuthCompletedData: AuthCompletedData | null = null;
    private static authCompletedCallbacks: AuthCompletedCallback[] = [];
    private static superProperties: Map<string, string> = new Map();
    private static readonly SUPER_PROPERTIES_KEY = 'abxr_super_properties';
    
    // Static initialization
    static {
        Abxr.loadSuperProperties();
    }
    
    // Expose commonly used types and enums for easy access
    static readonly EventStatus = EventStatus;
    static readonly InteractionType = InteractionType;
    static readonly LogLevel = LogLevel;
    static readonly Partner = Partner;
    static readonly AbxrDictStrings = AbxrDictStrings;
    static readonly StorageScope = StorageScope;
    static readonly StoragePolicy = StoragePolicy;
    
    // Configuration methods
    static SetDebugMode(enabled: boolean): void {
        this.enableDebug = enabled;
    }
    
    static GetDebugMode(): boolean {
        return this.enableDebug;
    }
    
    /**
     * Check if AbxrLib has an active connection to the server and can send data
     * This indicates whether the library is configured and ready to communicate
     * @returns True if connection is active, false otherwise
     */
    static ConnectionActive(): boolean {
        return this.connectionActive;
    }
    
    // INTERNAL USE ONLY - Do not use in application code
    private static getAuthParams(): any {
        return { ...this.authParams };
    }

    /**
     * General logging method with configurable level - main logging function
     * @param message The log message
     * @param level Log level (defaults to LogLevel.eInfo)
     * @param meta Optional metadata with additional context
     */
    static Log(message: string, level: LogLevel = LogLevel.eInfo, meta?: any): void {
        if (!this.connectionActive) {
            if (this.enableDebug) {
                console.log('AbxrLib: Log not sent - not authenticated');
            }
            return;
        }
        
        // Add super properties to all logs
        meta = this.mergeSuperProperties(meta);
        
        const log = new AbxrLog();
        log.Construct(level, message, this.convertToAbxrDictStrings(meta));
        
        // Fire-and-forget async sending
        AbxrLibSend.AddLog(log).catch(error => {
            if (this.enableDebug) {
                console.error('AbxrLib: Failed to send log:', error);
            }
        });
    }

    /**
     * Send a debug-level log message with optional metadata
     * Debug logs are typically used for development and troubleshooting
     * @param message Log message to send
     * @param meta Optional metadata with additional context
     */
    static LogDebug(message: string, meta?: any): void {
        this.Log(message, LogLevel.eDebug, meta);
    }
    
    /**
     * Send an info-level log message with optional metadata
     * Info logs are used for general application events and user actions
     * @param message Log message to send
     * @param meta Optional metadata with additional context
     */
    static LogInfo(message: string, meta?: any): void {
        this.Log(message, LogLevel.eInfo, meta);
    }
    
    /**
     * Send a warning-level log message with optional metadata
     * Warning logs indicate potential issues that don't prevent operation
     * @param message Log message to send
     * @param meta Optional metadata with additional context  
     */
    static LogWarn(message: string, meta?: any): void {
        this.Log(message, LogLevel.eWarn, meta);
    }
    
    /**
     * Send an error-level log message with optional metadata
     * Error logs indicate problems that may impact application functionality  
     * @param message Log message to send
     * @param meta Optional metadata with error details
     */
    static LogError(message: string, meta?: any): void {
        this.Log(message, LogLevel.eError, meta);
    }
    
    /**
     * Send a critical-level log message with optional metadata
     * Critical logs indicate severe problems that may cause application failure
     * @param message Log message to send  
     * @param meta Optional metadata with critical error details
     */
    static LogCritical(message: string, meta?: any): void {
        this.Log(message, LogLevel.eCritical, meta);
    }

    /**
     * Log a named event with optional metadata
     * Timestamps and spatial context are automatically added
     * @param name The name of the event (use snake_case for better analytics processing)
     * @param meta Optional metadata - supports objects, JSON strings, URL parameters, or primitives
     * @returns Promise<number> Event ID or 0 if not authenticated
     */
    // Event methods
    static async Event(name: string, meta?: any): Promise<number> {
        if (!this.connectionActive) {
            if (this.enableDebug) {
                console.log('AbxrLib: Event not sent - not authenticated');
            }
            return 0; // Return success even when not authenticated
        }
        
        // Add super properties to all events
        meta = this.mergeSuperProperties(meta);
        
        const event = new AbxrEvent();
        event.Construct(name, this.convertToAbxrDictStrings(meta));
        
        // Fire-and-forget async sending
        AbxrLibSend.EventCore(event).catch(error => {
            if (this.enableDebug) {
                console.error('AbxrLib: Failed to send event:', error);
            }
        });
        
        return 1; // Return success immediately without waiting for server response
    }
    
    /**
     * Start timing an event to measure duration automatically
     * Call Event() or any other event method later with the same name to include duration
     * Works with all event methods since they use Event() internally
     * @param eventName Name of the event to start timing (must match later event name exactly)
     */
    static StartTimedEvent(eventName: string): void {
        AbxrEvent.m_dictTimedEventStartTimes.set(eventName, new DateTime().FromUnixTime(DateTime.Now()));
    }

    /**
     * Start tracking an assessment - essential for LMS integration and analytics
     * Assessments track overall learner performance across multiple objectives and interactions
     * Think of this as the learner's score for a specific course or curriculum
     * @param assessmentName Name of the assessment to start
     * @param meta Optional metadata with assessment details
     * @returns Promise<number> Event ID or 0 if not authenticated
     */
    // Assessment Events
    static async EventAssessmentStart(assessmentName: string, meta?: any): Promise<number> {
        // If authentication is not complete, queue this event
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log(`AbxrLib - Assessment Start '${assessmentName}' queued until authentication completes`);
            }
            this.queuedEvents.push({
                eventType: QueuedEventType.AssessmentStart,
                eventName: assessmentName,
                meta: meta
            });
            return 1; // Return success - event will be processed later
        }

        // Authentication is complete, process immediately
        if (!this.connectionActive) {
            if (this.enableDebug) {
                console.log('AbxrLib: Assessment start event not sent - not authenticated');
            }
            return 0;
        }
        
        // Fire-and-forget async sending
        AbxrLibSend.EventAssessmentStart(assessmentName, this.convertToAbxrDictStrings(meta)).catch(error => {
            if (this.enableDebug) {
                console.error('AbxrLib: Failed to send assessment start event:', error);
            }
        });
        
        return 1; // Return success immediately without waiting for server response
    }
    
    /**
     * Complete an assessment with score and status - triggers LMS grade recording
     * When complete, automatically records and closes the assessment in supported LMS platforms
     * @param assessmentName Name of the assessment (must match the start event)
     * @param score Numerical score achieved (number or string, automatically validated to 0-100 range)
     * @param eventStatus Result status of the assessment (ePass, eFail, eComplete, etc.)
     * @param meta Optional metadata with completion details
     * @returns Promise<number> Event ID or 0 if not authenticated
     */
    static async EventAssessmentComplete(assessmentName: string, score: number | string, eventStatus: EventStatus, meta?: any): Promise<number> {
        // If authentication is not complete, queue this event
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log(`AbxrLib - Assessment Complete '${assessmentName}' queued until authentication completes`);
            }
            this.queuedEvents.push({
                eventType: QueuedEventType.AssessmentComplete,
                eventName: assessmentName,
                meta: meta,
                score: this.validateScore(score, `assessment "${assessmentName}"`),
                status: eventStatus
            });
            return 1; // Return success - event will be processed later
        }

        // Authentication is complete, process immediately
        if (!this.connectionActive) {
            if (this.enableDebug) {
                console.log('AbxrLib: Assessment complete event not sent - not authenticated');
            }
            return 0;
        }
        const validatedScore = this.validateScore(score, `assessment "${assessmentName}"`);
        
        // Fire-and-forget async sending
        AbxrLibSend.EventAssessmentComplete(assessmentName, validatedScore, eventStatus, this.convertToAbxrDictStrings(meta)).catch(error => {
            if (this.enableDebug) {
                console.error('AbxrLib: Failed to send assessment complete event:', error);
            }
        });
        
        return 1; // Return success immediately without waiting for server response
    }
    
    /**
     * Start tracking an objective - individual learning goals within assessments
     * Objectives represent specific tasks or skills that contribute to overall assessment scores
     * @param objectiveName Name of the objective to start
     * @param meta Optional metadata with objective details
     * @returns Promise<number> Event ID or 0 if not authenticated
     */
    // Objective Events
    static async EventObjectiveStart(objectiveName: string, meta?: any): Promise<number> {
        // If authentication is not complete, queue this event
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log(`AbxrLib - Objective Start '${objectiveName}' queued until authentication completes`);
            }
            this.queuedEvents.push({
                eventType: QueuedEventType.ObjectiveStart,
                eventName: objectiveName,
                meta: meta
            });
            return 1; // Return success - event will be processed later
        }

        // Authentication is complete, process immediately
        if (!this.connectionActive) {
            if (this.enableDebug) {
                console.log('AbxrLib: Objective start event not sent - not authenticated');
            }
            return 0;
        }
        
        // Fire-and-forget async sending
        AbxrLibSend.EventObjectiveStart(objectiveName, this.convertToAbxrDictStrings(meta)).catch(error => {
            if (this.enableDebug) {
                console.error('AbxrLib: Failed to send objective start event:', error);
            }
        });
        
        return 1; // Return success immediately without waiting for server response
    }
    
    /**
     * Complete an objective with score and status - contributes to overall assessment
     * Objectives automatically calculate duration if corresponding start event was logged
     * @param objectiveName Name of the objective (must match the start event)
     * @param score Numerical score achieved for this objective (number or string, automatically validated to 0-100 range)
     * @param eventStatus Result status (eComplete, ePass, eFail, etc.)
     * @param meta Optional metadata with completion details
     * @returns Promise<number> Event ID or 0 if not authenticated
     */
    static async EventObjectiveComplete(objectiveName: string, score: number | string, eventStatus: EventStatus, meta?: any): Promise<number> {
        // If authentication is not complete, queue this event
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log(`AbxrLib - Objective Complete '${objectiveName}' queued until authentication completes`);
            }
            this.queuedEvents.push({
                eventType: QueuedEventType.ObjectiveComplete,
                eventName: objectiveName,
                meta: meta,
                score: this.validateScore(score, `objective "${objectiveName}"`),
                status: eventStatus
            });
            return 1; // Return success - event will be processed later
        }

        // Authentication is complete, process immediately
        if (!this.connectionActive) {
            if (this.enableDebug) {
                console.log('AbxrLib: Objective complete event not sent - not authenticated');
            }
            return 0;
        }
        const validatedScore = this.validateScore(score, `objective "${objectiveName}"`);
        
        // Fire-and-forget async sending
        AbxrLibSend.EventObjectiveComplete(objectiveName, validatedScore, eventStatus, this.convertToAbxrDictStrings(meta)).catch(error => {
            if (this.enableDebug) {
                console.error('AbxrLib: Failed to send objective complete event:', error);
            }
        });
        
        return 1; // Return success immediately without waiting for server response
    }
    
    /**
     * Start tracking a user interaction - granular user actions within objectives
     * Interactions capture specific user behaviors like clicks, selections, or inputs
     * @param interactionName Name of the interaction to start
     * @param meta Optional metadata with interaction context
     * @returns Promise<number> Event ID or 0 if not authenticated
     */
    // Interaction Events
    static async EventInteractionStart(interactionName: string, meta?: any): Promise<number> {
        // If authentication is not complete, queue this event
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log(`AbxrLib - Interaction Start '${interactionName}' queued until authentication completes`);
            }
            this.queuedEvents.push({
                eventType: QueuedEventType.InteractionStart,
                eventName: interactionName,
                meta: meta
            });
            return 1; // Return success - event will be processed later
        }

        // Authentication is complete, process immediately
        if (!this.connectionActive) {
            if (this.enableDebug) {
                console.log('AbxrLib: Interaction start event not sent - not authenticated');
            }
            return 0;
        }
        
        // Fire-and-forget async sending
        AbxrLibSend.EventInteractionStart(interactionName, this.convertToAbxrDictStrings(meta)).catch(error => {
            if (this.enableDebug) {
                console.error('AbxrLib: Failed to send interaction start event:', error);
            }
        });
        
        return 1; // Return success immediately without waiting for server response
    }
    
    /**
     * Complete an interaction with type, response, and optional metadata
     * Interactions automatically calculate duration if corresponding start event was logged
     * @param interactionName Name of the interaction (must match the start event)
     * @param interactionType Type of interaction (eClick, eSelect, eType, eDrag, etc.)
     * @param response User's response or result (e.g., "A", "correct", "blue_button")
     * @param meta Optional metadata with interaction details
     * @returns Promise<number> Event ID or 0 if not authenticated
     */
    static async EventInteractionComplete(interactionName: string, interactionType: InteractionType, response: string = "", meta?: any): Promise<number> {
        // If authentication is not complete, queue this event
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log(`AbxrLib - Interaction Complete '${interactionName}' queued until authentication completes`);
            }
            this.queuedEvents.push({
                eventType: QueuedEventType.InteractionComplete,
                eventName: interactionName,
                meta: meta,
                interactionType: interactionType,
                response: response
            });
            return 1; // Return success - event will be processed later
        }

        // Authentication is complete, process immediately
        if (!this.connectionActive) {
            if (this.enableDebug) {
                console.log('AbxrLib: Interaction complete event not sent - not authenticated');
            }
            return 0;
        }
        
        // Fire-and-forget async sending
        AbxrLibSend.EventInteractionComplete(interactionName, interactionType, response, this.convertToAbxrDictStrings(meta)).catch(error => {
            if (this.enableDebug) {
                console.error('AbxrLib: Failed to send interaction complete event:', error);
            }
        });
        
        return 1; // Return success immediately without waiting for server response
    }
    
    /**
     * Start tracking a level or stage in your application
     * Levels represent discrete sections or progressions in games, training, or experiences
     * @param levelName Name of the level to start
     * @param meta Optional metadata with level details
     * @returns Promise<number> Event ID or 0 if not authenticated
     */
    // Level Events
    static async EventLevelStart(levelName: string, meta?: any): Promise<number> {
        if (!this.connectionActive) {
            if (this.enableDebug) {
                console.log('AbxrLib: Level start event not sent - not authenticated');
            }
            return 0;
        }
        
        // Fire-and-forget async sending
        AbxrLibSend.EventLevelStart(levelName, this.convertToAbxrDictStrings(meta)).catch(error => {
            if (this.enableDebug) {
                console.error('AbxrLib: Failed to send level start event:', error);
            }
        });
        
        return 1; // Return success immediately without waiting for server response
    }
    
    /**
     * Complete a level with score and optional metadata
     * Levels automatically calculate duration if corresponding start event was logged
     * @param levelName Name of the level (must match the start event)
     * @param score Numerical score achieved for this level (number or string, automatically validated to 0-100 range)
     * @param meta Optional metadata with completion details
     * @returns Promise<number> Event ID or 0 if not authenticated
     */
    static async EventLevelComplete(levelName: string, score: number | string, meta?: any): Promise<number> {
        if (!this.connectionActive) {
            if (this.enableDebug) {
                console.log('AbxrLib: Level complete event not sent - not authenticated');
            }
            return 0;
        }
        const validatedScore = this.validateScore(score, `level "${levelName}"`);
        
        // Fire-and-forget async sending
        AbxrLibSend.EventLevelComplete(levelName, validatedScore, this.convertToAbxrDictStrings(meta)).catch(error => {
            if (this.enableDebug) {
                console.error('AbxrLib: Failed to send level complete event:', error);
            }
        });
        
        return 1; // Return success immediately without waiting for server response
    }
    
    /**
     * Flag critical training events for auto-inclusion in the Critical Choices Chart
     * Use this to mark important safety checks, high-risk errors, or critical decision points
     * These events receive special treatment in analytics dashboards and reports
     * @param label Label for the critical event (will be prefixed with CRITICAL_ABXR_)
     * @param meta Optional metadata with critical event details
     * @returns Promise<number> Event ID or 0 if not authenticated
     */
    static async EventCritical(label: string, meta?: any): Promise<number> {
        const taggedName = `CRITICAL_ABXR_${label}`;
        return await this.Event(taggedName, meta);
    }
    
    /**
     * Register a super property that will be automatically included in all events
     * Super properties persist across browser sessions and are stored in localStorage
     * @param key Property name
     * @param value Property value
     */
    static Register(key: string, value: string): void {
        if (this.isReservedSuperPropertyKey(key)) {
            const errorMessage = `AbxrLib: Cannot register super property with reserved key '${key}'. Reserved keys are: module, module_name, module_id, module_order`;
            console.warn(errorMessage);
            this.LogInfo(errorMessage, { 
                attempted_key: key, 
                attempted_value: value,
                error_type: 'reserved_super_property_key'
            });
            return;
        }

        this.superProperties.set(key, value);
        this.saveSuperProperties();
    }
    
    /**
     * Register a super property only if it doesn't already exist
     * Will not overwrite existing super properties with the same key - perfect for default values
     * Super properties persist across browser sessions and are stored in localStorage
     * @param key Property name
     * @param value Property value (only set if key doesn't already exist)
     */
    static RegisterOnce(key: string, value: string): void {
        if (this.isReservedSuperPropertyKey(key)) {
            const errorMessage = `AbxrLib: Cannot register super property with reserved key '${key}'. Reserved keys are: module, module_name, module_id, module_order`;
            console.warn(errorMessage);
            this.LogInfo(errorMessage, { 
                attempted_key: key, 
                attempted_value: value,
                error_type: 'reserved_super_property_key'
            });
            return;
        }

        if (!this.superProperties.has(key)) {
            this.superProperties.set(key, value);
            this.saveSuperProperties();
        }
    }
    
    /**
     * Remove a super property from all future events
     * Also removes the property from persistent storage (localStorage)
     * @param key Property name to remove
     */
    static Unregister(key: string): void {
        this.superProperties.delete(key);
        this.saveSuperProperties();
    }
    
    /**
     * Clear all super properties from current session and persistent storage  
     * Equivalent to mixpanel.reset() - useful for user logout or data reset scenarios
     */
    static Reset(): void {
        this.superProperties.clear();
        this.saveSuperProperties();
    }
    
    /**
     * Get a copy of all current super properties as a JavaScript object
     * Useful for debugging, backup, or inspecting current global event properties
     * @returns Object containing all super properties as key-value pairs
     */
    static GetSuperProperties(): { [key: string]: string } {
        const result: { [key: string]: string } = {};
        this.superProperties.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }
    
    private static loadSuperProperties(): void {
        if (typeof localStorage === 'undefined') return;
        
        try {
            const stored = localStorage.getItem(this.SUPER_PROPERTIES_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.superProperties.clear();
                Object.entries(parsed).forEach(([key, value]) => {
                    this.superProperties.set(key, value as string);
                });
            }
        } catch (error) {
            if (this.enableDebug) {
                console.warn('AbxrLib: Failed to load super properties:', error);
            }
        }
    }
    
    private static saveSuperProperties(): void {
        if (typeof localStorage === 'undefined') return;
        
        try {
            const obj: { [key: string]: string } = {};
            this.superProperties.forEach((value, key) => {
                obj[key] = value;
            });
            localStorage.setItem(this.SUPER_PROPERTIES_KEY, JSON.stringify(obj));
        } catch (error) {
            if (this.enableDebug) {
                console.warn('AbxrLib: Failed to save super properties:', error);
            }
        }
    }

    /**
     * Private helper function to merge super properties and module info into metadata
     * Handles various metadata formats and ensures data-specific properties take precedence
     * @param meta The metadata to merge super properties into
     * @returns The metadata with super properties and module info merged
     */
    private static mergeSuperProperties(meta: any): any {
        // Helper function to add module info to object-style metadata
        const addModuleInfoToObject = (obj: any): any => {
            // Get current module session data
            const currentSession = this.GetModuleTargetWithoutAdvance();
            if (currentSession) {
                // Only add module info if not already present (data-specific properties take precedence)
                if (!('module' in obj) && currentSession.moduleTarget) {
                    obj.module = currentSession.moduleTarget;
                }
                // For additional module metadata, we need to get it from the modules list
                const modules = this.GetModuleTargetList();
                if (modules && modules.length > 0) {
                    this.loadModuleIndex();
                    if (this.moduleIndex < modules.length) {
                        const currentModule = modules[this.moduleIndex];
                        if (!('module_name' in obj) && currentModule.name) {
                            obj.module_name = currentModule.name;
                        }
                        if (!('module_id' in obj) && currentModule.id) {
                            obj.module_id = currentModule.id;
                        }
                        if (!('module_order' in obj)) {
                            obj.module_order = currentModule.order.toString();
                        }
                    }
                }
            }
            return obj;
        };

        // Helper function to add module info to AbxrDictStrings
        const addModuleInfoToDictStrings = (dictStrings: any): any => {
            // Get current module session data
            const currentSession = this.GetModuleTargetWithoutAdvance();
            if (currentSession) {
                // Only add module info if not already present
                if (!dictStrings.has('module') && currentSession.moduleTarget) {
                    dictStrings.Add('module', currentSession.moduleTarget);
                }
                // For additional module metadata, we need to get it from the modules list
                const modules = this.GetModuleTargetList();
                if (modules && modules.length > 0) {
                    this.loadModuleIndex();
                    if (this.moduleIndex < modules.length) {
                        const currentModule = modules[this.moduleIndex];
                        if (!dictStrings.has('module_name') && currentModule.name) {
                            dictStrings.Add('module_name', currentModule.name);
                        }
                        if (!dictStrings.has('module_id') && currentModule.id) {
                            dictStrings.Add('module_id', currentModule.id);
                        }
                        if (!dictStrings.has('module_order')) {
                            dictStrings.Add('module_order', currentModule.order.toString());
                        }
                    }
                }
            }
            return dictStrings;
        };

        if (!meta) {
            // If no meta provided, create object with module info and super properties
            meta = {};
            meta = addModuleInfoToObject(meta);
            this.superProperties.forEach((value, key) => {
                if (!(key in meta)) { // Don't overwrite module info
                    meta[key] = value;
                }
            });
        } else if (typeof meta === 'object' && meta !== null && !Array.isArray(meta)) {
            // If meta is an object, add module info and super properties (don't overwrite data-specific properties)
            const combined = { ...meta }; // Start with data-specific properties
            addModuleInfoToObject(combined);
            this.superProperties.forEach((value, key) => {
                if (!(key in combined)) { // Only add if not already present (preserves data-specific and module info)
                    combined[key] = value;
                }
            });
            meta = combined;
        } else {
            // If meta is a string, JSON, URL params, etc., convert and merge
            const convertedMeta = this.convertToAbxrDictStrings(meta);
            addModuleInfoToDictStrings(convertedMeta);
            this.superProperties.forEach((value, key) => {
                if (!convertedMeta.has(key)) { // Don't overwrite data-specific or module info
                    convertedMeta.Add(key, value);
                }
            });
            meta = convertedMeta;
        }

        return meta;
    }

    /**
     * Private helper to check if a super property key is reserved for module data
     * Reserved keys: module, module_name, module_id, module_order
     * @param key The key to validate
     * @returns True if the key is reserved, false otherwise
     */
    private static isReservedSuperPropertyKey(key: string): boolean {
        return key === 'module' || key === 'module_name' || key === 'module_id' || key === 'module_order';
    }

    /**
     * Get the session data with the default name 'state'
     * Call this as follows:
     * const result = await StorageGetDefaultEntry(scope);
     * console.log("Result:", result);
     * @param scope Get from 'device' or 'user'
     * @returns Promise<{[key: string]: string}[]> All the session data stored under the default name 'state'
     */
    // Storage methods
    static async StorageGetDefaultEntry(scope: StorageScope): Promise<{[key: string]: string}[]> {
        return await this.StorageGetEntry("state", scope);
    }
    
    /**
     * Get the session data with the given name
     * Call this as follows:
     * const result = await StorageGetEntry(name, scope);
     * console.log("Result:", result);
     * @param name The name of the entry to retrieve
     * @param scope Get from 'device' or 'user'
     * @returns Promise<{[key: string]: string}[]> All the session data stored under the given name
     */
    static async StorageGetEntry(name: string, scope: StorageScope): Promise<{[key: string]: string}[]> {
        const localStorageKey = `abxr_storage_${scope}_${name}`;
        
        // First, try to get data from localStorage
        try {
            const localData = localStorage.getItem(localStorageKey);
            if (localData) {
                const parsed = JSON.parse(localData);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    //if (this.enableDebug) {
                    //    console.log(`AbxrLib: Retrieved data from localStorage with key: ${localStorageKey}`);
                    //}
                    return parsed;
                } else if (typeof parsed === 'object' && parsed !== null) {
                    // Single object, wrap in array
                    return [parsed];
                }
            }
        } catch (error) {
            if (this.enableDebug) {
                console.warn('AbxrLib: Failed to parse localStorage data:', error);
            }
        }
        
        // If not found in localStorage or not authenticated, try server if authenticated
        if (!this.connectionActive) {
            if (this.enableDebug) {
                console.log('AbxrLib: Storage not retrieved from server - not authenticated, returning empty result');
            }
            return [];
        }
        
        // Note: For retrieval, we allow reading even if user is not fully authenticated for device scope
        // This enables applications to check for existing data before requiring full login
        // For user scope, we need a user to actually be logged in
        if (scope === StorageScope.user && this.GetUserId() == null) {
            if (this.enableDebug) {
                console.log('AbxrLib: User-scoped storage requires user to be logged in, checking server anyway for any available data');
            }
        }
        
        try {
            const result = await AbxrLibStorage.GetEntryAsString(name);
            
            if (!result) {
                return [];
            }
            
            // Try to parse as JSON array of dictionaries (matching Unity's return type)
            const parsed = JSON.parse(result);
            let serverData: {[key: string]: string}[];
            
            if (Array.isArray(parsed)) {
                serverData = parsed;
            } else {
                // If it's a single object, wrap it in an array
                serverData = [parsed];
            }
            
            // Store server data in localStorage for future quick access
            if (serverData.length > 0) {
                try {
                    localStorage.setItem(localStorageKey, JSON.stringify(serverData));
                    if (this.enableDebug) {
                        console.log(`AbxrLib: Cached server data in localStorage with key: ${localStorageKey}`);
                    }
                } catch (cacheError) {
                    if (this.enableDebug) {
                        console.warn('AbxrLib: Failed to cache server data in localStorage:', cacheError);
                    }
                }
            }
            
            return serverData;
            
        } catch (error) {
            if (this.enableDebug) {
                console.warn('AbxrLib: Failed to parse server storage entry as JSON:', error);
            }
            return [];
        }
    }
    
    /**
     * Set the session data with the default name 'state'
     * @param entry The data to store
     * @param scope Store under 'device' or 'user'
     * @param policy How should this be stored, 'keepLatest' or 'appendHistory' (defaults to 'keepLatest')
     * @returns Promise<number> Storage entry ID or 0 if not authenticated
     */
    static async StorageSetDefaultEntry(entry: {[key: string]: string}, scope: StorageScope, policy: StoragePolicy = StoragePolicy.keepLatest): Promise<number> {
        return await this.StorageSetEntry("state", entry, scope, policy);
    }
    
    /**
     * Set the session data with the given name
     * @param name The name of the entry to store
     * @param entry The data to store
     * @param scope Store under 'device' or 'user'
     * @param policy How should this be stored, 'keepLatest' or 'appendHistory' (defaults to 'keepLatest')
     * @returns Promise<number> Storage entry ID or 0 if not authenticated
     */
    static async StorageSetEntry(name: string, entry: {[key: string]: string}, scope: StorageScope, policy: StoragePolicy = StoragePolicy.keepLatest): Promise<number> {
        // Always store in localStorage first for immediate availability
        const localStorageKey = `abxr_storage_${scope}_${name}`;
        
        try {
            // Handle storage policy for localStorage
            if (policy === StoragePolicy.keepLatest) {
                // Replace existing data
                localStorage.setItem(localStorageKey, JSON.stringify([entry]));
            } else if (policy === StoragePolicy.appendHistory) {
                // Append to existing data
                const existing = localStorage.getItem(localStorageKey);
                let existingData: {[key: string]: string}[] = [];
                if (existing) {
                    try {
                        existingData = JSON.parse(existing);
                        if (!Array.isArray(existingData)) {
                            existingData = [existingData];
                        }
                    } catch (error) {
                        // If parse fails, start fresh
                        existingData = [];
                    }
                }
                existingData.push(entry);
                localStorage.setItem(localStorageKey, JSON.stringify(existingData));
            }
            
            //if (this.enableDebug) {
            //    console.log(`AbxrLib: Data stored in localStorage with key: ${localStorageKey}`);
            //}
        } catch (error) {
            if (this.enableDebug) {
                console.error('AbxrLib: Failed to store in localStorage:', error);
            }
        }
        
        // Then send to server (fire-and-forget) if authenticated
        if (this.connectionActive) {
            // For user-scoped storage, we need a user to actually be logged in
            // For device-scoped storage, app-level authentication should be sufficient
            if (scope === StorageScope.user && this.GetUserId() == null) {
                if (this.enableDebug) {
                    console.log('AbxrLib: User-scoped storage requires user to be logged in, only storing locally');
                }
            } else {
                const keepLatest = (policy === StoragePolicy.keepLatest);
                const sessionData = (scope === StorageScope.device);
                
                // Convert plain object to JSON string for server storage
                const entryData = JSON.stringify([entry]); // Wrap in array to match Unity's List<Dictionary> format
                
                // Fire-and-forget async sending to server
                AbxrLibStorage.SetEntry(entryData, keepLatest, "web", sessionData, name).catch(error => {
                    if (this.enableDebug) {
                        console.error('AbxrLib: Failed to send storage to server:', error);
                    }
                });
            }
        } else if (this.enableDebug) {
            console.log('AbxrLib: Not authenticated, storage only saved locally');
        }
        
        return 1; // Return success immediately - data is stored locally
    }
    
    /**
     * Remove a stored user progress or application state entry
     * Useful for clearing save data, resetting progress, or cleaning up temporary data
     * @param name Identifier of the storage entry to remove (default: "state")
     * @param scope Storage scope - 'user' for cross-device data, 'device' for device-specific data (default: user)
     * @returns Promise<number> Operation result code - always returns 1 for success
     */
    static async StorageRemoveEntry(name: string = "state", scope: StorageScope = StorageScope.user): Promise<number> {
        const localStorageKey = `abxr_storage_${scope}_${name}`;
        
        // Always remove from localStorage first
        try {
            localStorage.removeItem(localStorageKey);
            if (this.enableDebug) {
                console.log(`AbxrLib: Removed data from localStorage with key: ${localStorageKey}`);
            }
        } catch (error) {
            if (this.enableDebug) {
                console.error('AbxrLib: Failed to remove from localStorage:', error);
            }
        }
        
        // Then remove from server (fire-and-forget) if authenticated
        if (this.connectionActive) {
            // For removing persistent user data, ensure user is logged in for user scope
            if (scope === StorageScope.user && this.GetUserId() == null) {
                if (this.enableDebug) {
                    console.log('AbxrLib: User-scoped storage removal requires user to be logged in, only removed locally');
                }
            } else {
                // Fire-and-forget async removal from server
                AbxrLibStorage.RemoveEntry(name).catch(error => {
                    if (this.enableDebug) {
                        console.error('AbxrLib: Failed to remove storage from server:', error);
                    }
                });
            }
        } else if (this.enableDebug) {
            console.log('AbxrLib: Not authenticated, storage only removed locally');
        }
        
        return 1; // Return success immediately - data is removed locally
    }
    
    /**
     * Remove the session data stored under the default name 'state'
     * Convenience method that calls StorageRemoveEntry with "state" as the name
     * @param scope Storage scope - 'user' for cross-device data, 'device' for device-specific data (default: user)
     * @returns Promise<number> Operation result code or 0 if not authenticated
     */
    static async StorageRemoveDefaultEntry(scope: StorageScope = StorageScope.user): Promise<number> {
        return await this.StorageRemoveEntry("state", scope);
    }

    /**
     * Remove all session data stored for the current user or device
     * This is a bulk operation that clears all stored entries at once
     * Use with caution as this cannot be undone
     * @param scope Storage scope - 'user' for cross-device data, 'device' for device-specific data (default: user)
     * @returns Promise<number> Operation result code or 0 if not authenticated
     */
    static async StorageRemoveMultipleEntries(scope: StorageScope = StorageScope.user): Promise<number> {
        // Remove all localStorage entries for this scope first
        const prefixToRemove = `abxr_storage_${scope}_`;
        const keysToRemove: string[] = [];
        
        try {
            // Find all keys that match our scope prefix
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefixToRemove)) {
                    keysToRemove.push(key);
                }
            }
            
            // Remove all matching keys
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
                if (this.enableDebug) {
                    console.log(`AbxrLib: Removed localStorage key: ${key}`);
                }
            });
            
            if (this.enableDebug) {
                console.log(`AbxrLib: Removed ${keysToRemove.length} localStorage entries for scope: ${scope}`);
            }
        } catch (error) {
            if (this.enableDebug) {
                console.error('AbxrLib: Failed to remove localStorage entries:', error);
            }
        }
        
        // For user-scoped bulk removal, ensure user is logged in to prevent accidental cross-user data removal
        if (scope === StorageScope.user && this.GetUserId() == null) {
            if (this.enableDebug) {
                console.log('AbxrLib: User-scoped bulk storage removal requires user to be logged in, only removed locally');
            }
        } else if (this.connectionActive) {
            // Fire-and-forget async bulk removal from server
            // Note: This is a simplified implementation that removes the primary entry
            // In practice, the backend would handle proper bulk operations
            AbxrLibStorage.RemoveEntry("state").catch(error => {
                if (this.enableDebug) {
                    console.error('AbxrLib: Failed to remove bulk storage from server:', error);
                }
            });
        } else if (this.enableDebug) {
            console.log('AbxrLib: Not authenticated, storage only removed locally');
        }
        
        return 1; // Return success immediately - data is removed locally
    }
    
    /**
     * Send spatial, hardware, or system telemetry data for XR analytics
     * Captures headset/controller movements, performance metrics, and environmental data
     * @param name Type of telemetry data (e.g., "headset_position", "frame_rate", "battery_level")
     * @param data Key-value pairs of telemetry measurements
     * @returns Promise<number> Telemetry entry ID or 0 if not authenticated
     */
    // Telemetry methods
    static async Telemetry(name: string, data: any): Promise<number> {
        if (!this.connectionActive) {
            if (this.enableDebug) {
                console.log('AbxrLib: Telemetry not sent - not authenticated');
            }
            return 0;
        }
        
        // Add super properties to all telemetry entries
        data = this.mergeSuperProperties(data);
        
        const telemetry = new AbxrTelemetry();
        telemetry.Construct(name, data);
        
        // Fire-and-forget async sending
        AbxrLibSend.AddTelemetryEntryCore(telemetry).catch(error => {
            if (this.enableDebug) {
                console.error('AbxrLib: Failed to send telemetry:', error);
            }
        });
        
        return 1; // Return success immediately without waiting for server response
    }
    
    /**
     * Send AI requests and get the actual response
     * Returns a Promise so developers can choose to await (blocking) or use .then() (non-blocking)
     * @param prompt The input prompt for the AI system
     * @param llmProvider The LLM provider to use (e.g., "gpt-4", "claude", "default")
     * @param pastMessages Optional array of previous conversation messages for context
     * @returns Promise<string | null> The AI response string, or null if request failed
     */
    // AI Proxy methods
    static async AIProxy(prompt: string, llmProvider: string = "default", pastMessages?: string[]): Promise<string | null> {
        if (!this.connectionActive) {
            if (this.enableDebug) {
                console.log('AbxrLib: AI Proxy not sent - not authenticated');
            }
            return null;
        }

        // Log the AI request for analytics (fire-and-forget)
        const pastMessagesParam = pastMessages ? pastMessages.join(",") : "";
        AbxrLibAnalytics.AddAIProxy(new AbxrAIProxy().Construct0(prompt, pastMessagesParam, llmProvider)).catch(error => {
            if (this.enableDebug) {
                console.error('AbxrLib: Failed to log AI proxy request for analytics:', error);
            }
        });

        try {
            // Build the AI request payload (matching Unity's AIPromptPayload structure)
            const payload = {
                prompt: prompt,
                llmProvider: llmProvider,
                pastMessages: pastMessages || []
            };

            // Make actual HTTP request to AI service
            const baseUrl = AbxrLibStorage.get_RestUrl();
            if (!baseUrl) {
                console.error('AbxrLib: No REST URL configured for AI requests');
                return null;
            }

            const aiUrl = new URL('/v1/services/llm', baseUrl);
            
            const response = await fetch(aiUrl.toString(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add authentication headers
                    ...this.buildAuthHeaders(JSON.stringify(payload))
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const aiResponse = await response.text();
                if (this.enableDebug) {
                    console.log('AbxrLib: AI request successful');
                }
                return aiResponse;
            } else {
                console.error(`AbxrLib: AI request failed with status ${response.status}: ${response.statusText}`);
                return null;
            }
        } catch (error) {
            console.error('AbxrLib: AI request failed with exception:', error);
            return null;
        }
    }


    /**
     * Build authentication headers for HTTP requests (similar to Unity's SetAuthHeaders)
     * @private
     */
    private static buildAuthHeaders(bodyContent: string): Record<string, string> {
        const headers: Record<string, string> = {};
        
        // Get auth data similar to Unity's approach
        const authData = AbxrLibClient.getAuthResponseData();
        if (authData?.token) {
            headers['X-AbxrLib-Token'] = authData.token;
        }
        if (authData?.secret) {
            headers['X-AbxrLib-Secret'] = authData.secret;
        }
        
        // Add device/user identification
        const userId = this.GetUserId();
        if (userId) {
            headers['X-AbxrLib-UserId'] = userId.toString();
        }

        return headers;
    }

    // ===== Mixpanel Compatibility Methods =====
    
    /**
     * Mixpanel compatibility method - tracks an event with optional properties
     * Drop-in replacement for mixpanel.track() - provides seamless migration from Mixpanel
     * Internally calls the AbxrLib Event method with enhanced XR capabilities
     * If StartTimedEvent() was called with this event name, duration will be added automatically
     * @param eventName Name of the event to track
     * @param properties Optional properties to send with the event (supports all ABXR metadata formats)
     * @returns Promise<number> Event ID or 0 if not authenticated
     */
    static async Track(eventName: string, properties?: any): Promise<number> {
        // Add AbxrMethod tag to track Mixpanel compatibility usage
        let trackProperties: any;
        
        if (!properties) {
            // No properties provided, create object with just the tag
            trackProperties = { AbxrMethod: "Track" };
        } else if (typeof properties === 'object' && properties !== null && !Array.isArray(properties)) {
            // Properties is an object, add the tag to it
            trackProperties = { ...properties, AbxrMethod: "Track" };
        } else {
            // Properties is a string, primitive, or other type - create wrapper object
            trackProperties = { AbxrMethod: "Track", originalProperties: properties };
        }
        
        return await this.Event(eventName, trackProperties);
    }

    // ===== Cognitive3D Compatibility Methods =====
    
    /**
     * Cognitive3D compatibility class for custom events
     * This class provides compatibility with Cognitive3D SDK for easier migration
     * Usage: new Cognitive3D.CustomEvent("event_name").Send() instead of Cognitive3D SDK calls
     */
    static CustomEvent = class {
        public eventName: string;
        public properties: { [key: string]: string };

        constructor(name: string) {
            this.eventName = name;
            this.properties = {};
        }

        /**
         * Set a property for this custom event
         * @param key Property key
         * @param value Property value
         * @returns This CustomEvent instance for method chaining
         */
        SetProperty(key: string, value: any): this {
            this.properties[key] = String(value);
            return this;
        }

        /**
         * Send the custom event to AbxrLib
         */
        async Send(): Promise<number> {
            const meta = { ...this.properties, Cognitive3DMethod: "CustomEvent" };
            return await Abxr.Event(this.eventName, meta);
        }
    };

    /**
     * Start an event (maps to EventAssessmentStart for Cognitive3D compatibility)
     * @param eventName Name of the event to start
     * @param properties Optional properties for the event
     * @returns Promise<number> Event ID or 0 if not authenticated
     */
    static async StartEvent(eventName: string, properties?: any): Promise<number> {
        const meta: any = { Cognitive3DMethod: "StartEvent" };

        if (properties && typeof properties === 'object') {
            Object.assign(meta, properties);
        }

        return await this.EventAssessmentStart(eventName, meta);
    }

    /**
     * End an event (maps to EventAssessmentComplete for Cognitive3D compatibility)
     * Attempts to convert Cognitive3D result formats to AbxrLib EventStatus
     * @param eventName Name of the event to end
     * @param result Event result (will attempt conversion to EventStatus)
     * @param score Optional score (defaults to 100)
     * @param properties Optional properties for the event
     * @returns Promise<number> Event ID or 0 if not authenticated
     */
    static async EndEvent(eventName: string, result?: any, score: number = 100, properties?: any): Promise<number> {
        const meta: any = { Cognitive3DMethod: "EndEvent" };

        if (properties && typeof properties === 'object') {
            Object.assign(meta, properties);
        }

        // Convert result to EventStatus with best guess logic
        let status = EventStatus.eComplete;
        if (result !== undefined && result !== null) {
            const resultStr = String(result).toLowerCase();
            if (resultStr.includes("pass") || resultStr.includes("success") || resultStr.includes("complete") || resultStr === "true" || resultStr === "1") {
                status = EventStatus.ePass;
            } else if (resultStr.includes("fail") || resultStr.includes("error") || resultStr === "false" || resultStr === "0") {
                status = EventStatus.eFail;
            } else if (resultStr.includes("incomplete")) {
                status = EventStatus.eIncomplete;
            } else if (resultStr.includes("browse")) {
                status = EventStatus.eBrowsed;
            }
        }

        return await this.EventAssessmentComplete(eventName, score, status, meta);
    }

    /**
     * Send an event (maps to EventObjectiveComplete for Cognitive3D compatibility)
     * @param eventName Name of the event
     * @param properties Event properties
     * @returns Promise<number> Event ID or 0 if not authenticated
     */
    static async SendEvent(eventName: string, properties?: any): Promise<number> {
        const meta: any = { Cognitive3DMethod: "SendEvent" };
        let score = 100;
        let status = EventStatus.eComplete;

        if (properties && typeof properties === 'object') {
            Object.entries(properties).forEach(([key, value]) => {
                const keyLower = key.toLowerCase();
                const valueStr = String(value);

                // Extract score if provided
                if (keyLower === "score") {
                    const parsedScore = parseInt(valueStr, 10);
                    if (!isNaN(parsedScore)) {
                        score = parsedScore;
                    }
                }
                // Extract status/result if provided
                else if (keyLower === "result" || keyLower === "status" || keyLower === "success") {
                    const valueLower = valueStr.toLowerCase();
                    if (valueLower.includes("pass") || valueLower.includes("success") || valueStr === "true" || valueStr === "1") {
                        status = EventStatus.ePass;
                    } else if (valueLower.includes("fail") || valueLower.includes("error") || valueStr === "false" || valueStr === "0") {
                        status = EventStatus.eFail;
                    } else if (valueLower.includes("incomplete")) {
                        status = EventStatus.eIncomplete;
                    }
                }

                meta[key] = valueStr;
            });
        }

        return await this.EventObjectiveComplete(eventName, score, status, meta);
    }

    /**
     * Set session property (maps to Register for Cognitive3D compatibility)
     * @param key Property key
     * @param value Property value
     */
    static SetSessionProperty(key: string, value: any): void {
        this.Register(key, String(value));
    }

    /**
     * Set participant property (stub for Cognitive3D compatibility - not implemented)
     * This method exists for string replacement compatibility but does not store data
     * Use AbxrLib's authentication system and GetLearnerData() instead
     * @param key Property key (ignored)
     * @param value Property value (ignored)
     * @deprecated SetParticipantProperty is not implemented. Use AbxrLib's authentication system and GetLearnerData() instead.
     */
    static SetParticipantProperty(key: string, value: any): void {
        // Intentionally empty stub for compatibility
        if (this.enableDebug) {
            console.warn(`AbxrLib: SetParticipantProperty called but not implemented. Key: ${key}, Value: ${value}. Use AbxrLib authentication system instead.`);
        }
    }

    /**
     * Get participant property (maps to GetLearnerData for Cognitive3D compatibility)
     * @param key Property key to retrieve
     * @returns Property value if found, null otherwise
     */
    static GetParticipantProperty(key: string): any {
        const learnerData = this.GetLearnerData();
        if (learnerData && typeof learnerData === 'object' && learnerData[key] !== undefined) {
            return learnerData[key];
        }
        return null;
    }

    /**
     * INTERNAL USE ONLY - Do not use in application code
     * This method is called by the authentication system to trigger callbacks
     * Unified method that handles both authentication success and failure (Unity-style)
     * Always notifies registered callbacks with AuthCompletedData containing success/failure information
     * @internal
     */
    static NotifyAuthCompleted(success: boolean, isReauthentication: boolean = false, moduleTargets?: string[], error: string = ''): void {
        // Update connection status based on authentication result (handles both success and failure)
        this.connectionActive = success;
        
        if (success) {
            // Handle successful authentication
            this.authenticationFailed = false;
            this.authenticationError = '';
            this.isAuthenticated = true;
            
            // Process any queued events if authentication was successful
            if (this.queuedEvents.length > 0) {
                if (this.enableDebug) {
                    console.log(`AbxrLib - Processing ${this.queuedEvents.length} queued events`);
                }
                this.ProcessQueuedEvents();
            }
        } else {
            // Handle authentication failure (unified failure handling)
            this.authenticationFailed = true;
            this.authenticationError = error;
            this.isAuthenticated = false;
            
            // Clear queued events when authentication fails
            if (this.queuedEvents.length > 0) {
                if (this.enableDebug) {
                    console.warn(`AbxrLib - Clearing ${this.queuedEvents.length} queued events due to authentication failure`);
                }
                this.queuedEvents = [];
            }
            
            // Clear other states when authentication fails
            this.requiresFinalAuth = false;
            
            if (this.enableDebug) {
                console.warn(`AbxrLib: Authentication failed - ${error}`);
            }
        }
        
        // Always notify auth completion subscribers (both success AND failure cases like Unity)
        // This ensures developers get AuthCompletedData for all authentication attempts
        this.notifyAuthCompletedCallbacks(isReauthentication, moduleTargets);
    }
    
    /**
     * INTERNAL USE ONLY - Do not use in application code
     * @internal
     */
    static setAuthParams(params: { appId?: string; orgId?: string; authSecret?: string }): void {
        this.authParams = { ...params };
    }
    
    /**
     * INTERNAL USE ONLY - Do not use in application code
     * @internal
     */
    static setAppConfig(config: string): void {
        this.appConfig = config;
    }
    
    /**
     * INTERNAL USE ONLY - Do not use in application code
     * @internal
     */
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
    
    static GetUserData(): any {
        const authData = AbxrLibClient.getAuthResponseData();
        return authData ? authData.userData : null;
    }
    
    static GetUserId(): any {
        const authData = AbxrLibClient.getAuthResponseData();
        return authData ? authData.userId : null;
    }
    
    static GetUserEmail(): string | null {
        const authData = AbxrLibClient.getAuthResponseData();
        return authData ? authData.userEmail : null;
    }

    /**
     * Get the complete authentication data from the most recent authentication completion
     * This allows you to access user data, email, module targets, and authentication status anytime
     * Returns null if no authentication has completed yet
     * @returns AuthCompletedData containing all authentication information, or null if not authenticated
     */
    static GetAuthCompletedData(): AuthCompletedData | null {
        return this.latestAuthCompletedData;
    }

    /**
     * Get the learner/user data from the most recent authentication completion
     * This is the userData object from the authentication response, containing user preferences and information
     * Returns null if no authentication has completed yet
     * @returns Object containing learner data, or null if not authenticated
     */
    static GetLearnerData(): any | null {
        return this.latestAuthCompletedData?.userData || null;
    }

    /**
     * Get all available modules from the authentication response
     * Provides complete module information including id, name, target, and order
     * Returns empty array if no authentication has completed yet
     * @returns Array of ModuleData objects with complete module information
     */
    static GetModuleTargetList(): ModuleData[] {
        return this.latestAuthCompletedData?.modules || [];
    }

    /**
     * Get the current module target again without advancing to the next one
     * Useful for checking what module you're currently on without consuming it
     * Returns the same CurrentSessionData structure as GetModuleTarget() but doesn't advance the index
     * @returns CurrentSessionData for the current module, or null if none available
     */
    static GetModuleTargetWithoutAdvance(): CurrentSessionData | null {
        const modules = this.GetModuleTargetList();
        if (!modules || modules.length === 0) {
            return null;
        }

        this.loadModuleIndex();

        if (this.moduleIndex >= modules.length) {
            return null;
        }

        const currentModule = modules[this.moduleIndex];
        
        // Return CurrentSessionData structure (same as GetModuleTarget but doesn't advance index)
        return {
            moduleTarget: currentModule.target,
            userData: this.GetUserData(),
            userId: this.GetUserId(),
            userEmail: this.GetUserEmail()
        };
    }
    
    /**
     * @deprecated Use NotifyAuthCompleted(success, isReauthentication, moduleTargets, error) instead
     * This method is kept for backward compatibility but will be removed in a future version
     * The unified NotifyAuthCompleted method now handles both success and failure cases
     */
    private static setAuthenticationFailed(failed: boolean, error: string = ''): void {
        // Redirect to unified method for consistency
        this.NotifyAuthCompleted(!failed, false, undefined, error);
    }
    
    // AuthMechanism callback methods
    static setAuthMechanismCallback(callback: AuthMechanismCallback | null): void {
        this.authMechanismCallback = callback;
    }
    
    static getAuthMechanismCallback(): AuthMechanismCallback | null {
        return this.authMechanismCallback;
    }
    
    /**
     * Get the next module target from the available modules for sequential module processing
     * Returns null when no more module targets are available
     * Each call moves to the next module in the sequence and updates persistent storage
     * @returns The next CurrentSessionData with complete module information, or null if no more modules
     */
    static GetModuleTarget(): CurrentSessionData | null {
        // Get current module data without advancing
        const currentSessionData = this.GetModuleTargetWithoutAdvance();
        if (!currentSessionData) {
            return null;
        }

        // Advance to next module
        this.loadModuleIndex();
        this.moduleIndex++;
        this.saveModuleIndex();

        return currentSessionData;
    }

    /**
     * Initialize module processing from authentication response
     * INTERNAL USE ONLY - Called by authentication system when authentication completes
     * Resets the module index to start from the beginning
     * @param moduleTargets List of module target identifiers from auth response (legacy parameter)
     */
    private static setModuleTargets(moduleTargets?: string[]): void {
        // Reset module index to start from the beginning
        // Note: moduleTargets parameter is now legacy - actual modules come from latestAuthCompletedData
        this.moduleIndex = 0;
        this.saveModuleIndex();
    }

    /**
     * Get the current number of module targets remaining
     * @returns Number of module targets remaining
     */
    static GetModuleTargetCount(): number {
        const modules = this.GetModuleTargetList();
        if (!modules || modules.length === 0) {
            return 0;
        }

        this.loadModuleIndex();
        const remaining = modules.length - this.moduleIndex;
        return Math.max(0, remaining);
    }

    /**
     * Clear module progress and reset to beginning
     */
    static ClearModuleTargets(): void {
        this.moduleIndex = 0;
        this.StorageRemoveEntry(this.MODULE_INDEX_KEY);
    }
    
    // AuthCompleted subscription methods
    /**
     * Subscribe to authentication completion events for post-auth initialization
     * Perfect for initializing UI components, loading user data, or showing welcome messages
     * Callbacks are triggered for BOTH authentication success and failure (like Unity)
     * @param callback Function to call when authentication completes (receives AuthCompletedData with success flag and error info)
     * 
     * @example
     * Abxr.onAuthCompleted((authData) => {
     *     if (authData.success) {
     *         console.log('Authentication successful!', authData.userId);
     *         console.log('Module target:', authData.moduleTarget);
     *     } else {
     *         console.log('Authentication failed:', authData.error);
     *     }
     * });
     */
    static OnAuthCompleted(callback: AuthCompletedCallback): void {
        if (typeof callback !== 'function') {
            console.warn('AbxrLib: AuthCompleted callback must be a function');
            return;
        }
        
        this.authCompletedCallbacks.push(callback);
        
        // Note: Callbacks are triggered only internally to ensure consistent data
        // No immediate callback - wait for proper authentication completion notification
    }
    
    /**
     * Remove a specific authentication completion callback
     * @param callback The callback function to remove
     */
    static RemoveAuthCompletedCallback(callback: AuthCompletedCallback): void {
        const index = this.authCompletedCallbacks.indexOf(callback);
        if (index > -1) {
            this.authCompletedCallbacks.splice(index, 1);
        }
    }
    
    /**
     * Clear all authentication completion callbacks
     */
    static ClearAuthCompletedCallbacks(): void {
        this.authCompletedCallbacks = [];
    }
    
    // Session Management Methods
    
    /**
     * Trigger manual reauthentication with existing stored parameters
     * Primarily useful for testing authentication flows or recovering from auth issues
     * Resets authentication state and attempts to re-authenticate with stored credentials
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
        
        try {
            // Call the actual reauthentication method (similar to Unity's Authentication.Authenticate())
            // Using AbxrLibInit since it contains the authentication logic
            const result = await (AbxrLibAnalytics as any).ReAuthenticate(false); // false = use existing authSecret, don't obtain new one via callback
            
            if (result === AbxrResult.eOk) {
                // Extract module targets from auth response data (similar to Unity version)
                const authResponseData = AbxrLibClient.getAuthResponseData();
                const moduleTargets = this.ExtractModuleTargetsFromAuthData(authResponseData?.modules || []);
                
                // Notify with isReauthentication=true (matching Unity's behavior)
                this.NotifyAuthCompleted(true, true, moduleTargets);
                
                if (this.enableDebug) {
                    console.log('AbxrLib: Reauthentication completed successfully');
                }
            } else {
                // Handle reauthentication failure
                const errorMessage = `Reauthentication failed with result: ${result}`;
                this.NotifyAuthCompleted(false, true, [], errorMessage);
                
                if (this.enableDebug) {
                    console.error(`AbxrLib: ${errorMessage}`);
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown reauthentication error';
            this.NotifyAuthCompleted(false, true, [], errorMessage);
            
            if (this.enableDebug) {
                console.error('AbxrLib: Reauthentication failed with exception:', error);
            }
        }
    }
    
    /**
     * Start a new session with a fresh session identifier
     * Generates a new session ID and performs fresh authentication
     * Useful for starting new training experiences or resetting user context
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
        
        // Reset authentication state and reauthenticate (unified approach)
        this.setRequiresFinalAuth(false);
        this.NotifyAuthCompleted(true); // Clear failed state by setting success=true
        
        // For new sessions, we'll trigger a fresh authentication
        // Note: New session ID generation is handled internally by the authentication system
        try {
            console.log('AbxrLib: New session started successfully');
            this.NotifyAuthCompleted(true, false); // New session, not reauthentication
        } catch (error) {
            console.log('AbxrLib: New session authentication failed or requires additional steps');
            // Note: Additional authentication steps would be handled by the underlying system
        }
    }
    
    // Internal method to notify all auth completion subscribers
    private static notifyAuthCompletedCallbacks(isReauthentication: boolean = false, moduleTargets?: string[]): void {
        // Get complete auth response data from the client
        const authResponseData = AbxrLibClient.getAuthResponseData();
        
        // Convert raw modules to typed ModuleData array
        const moduleDataList = this.convertToModuleDataList(authResponseData?.modules || []);
        
        // Set up module index for GetModuleTarget() calls
        // Start from index 0 so GetModuleTarget() returns ALL modules in sequence
        this.moduleIndex = 0;
        this.saveModuleIndex();

        // Create and store complete authentication data
        const authData = this.createAuthCompletedData(isReauthentication, authResponseData, moduleDataList);
        this.latestAuthCompletedData = authData;

        if (this.authCompletedCallbacks.length === 0) {
            return;
        }
        
        for (const callback of this.authCompletedCallbacks) {
            try {
                callback(authData);
            } catch (error) {
                console.error('AbxrLib: Error in authCompleted callback:', error);
            }
        }
    }
       
    // Helper method to extract module targets from auth response data (similar to Unity version)
    // Note: This method is intended for internal use by the authentication system
    static ExtractModuleTargetsFromAuthData(authResponseData: any): string[] {
        const moduleTargets: string[] = [];
        
        if (authResponseData && authResponseData.modules && Array.isArray(authResponseData.modules)) {
            // Sort modules by order field (similar to Unity ExtractModuleTargets)
            const sortedModules = authResponseData.modules.slice().sort((a: any, b: any) => {
                const orderA = parseInt(a.order) || 0;
                const orderB = parseInt(b.order) || 0;
                return orderA - orderB;
            });
            
            // Extract targets in correct order
            for (const module of sortedModules) {
                if (module.target) {
                    moduleTargets.push(module.target);
                }
            }
        }
        
        return moduleTargets;
    }

    // Helper method to create complete auth completion data
    private static createAuthCompletedData(
        isReauthentication: boolean = false,
        authResponseData: any = null,
        moduleDataList: ModuleData[] = []
    ): AuthCompletedData {
        const authData: AuthCompletedData = {
            success: this.connectionActive,
            token: authResponseData?.token || undefined,
            secret: authResponseData?.secret || undefined,
            userData: authResponseData?.userData || null,
            userId: authResponseData?.userId || null,
            userEmail: authResponseData?.userEmail || null,
            appId: authResponseData?.appId || undefined,
            modules: moduleDataList,
            moduleCount: moduleDataList.length,
            isReauthentication,
            error: !this.connectionActive ? this.authenticationError : undefined,
            
            // Method to reconstruct original JSON
            toJsonString: function(): string {
                try {
                    const originalResponse: any = {
                        token: this.token || "",
                        secret: this.secret || "",
                        userData: this.userData,
                        userId: this.userId,
                        appId: this.appId || ""
                    };

                    if (this.modules && this.modules.length > 0) {
                        originalResponse.modules = this.modules.map(m => ({
                            id: m.id || "",
                            name: m.name || "",
                            target: m.target || "",
                            order: m.order || 0
                        }));
                    }

                    return JSON.stringify(originalResponse, null, 2);
                } catch (error) {
                    console.error('AbxrLib: Failed to serialize AuthCompletedData to JSON:', error);
                    return "{}";
                }
            }
        };
        
        return authData;
    }

    // Helper method to convert raw module data to typed ModuleData objects
    private static convertToModuleDataList(rawModules: any[]): ModuleData[] {
        const moduleDataList: ModuleData[] = [];
        if (!rawModules || !Array.isArray(rawModules)) return moduleDataList;

        try {
            const tempList: ModuleData[] = [];
            
            for (const rawModule of rawModules) {
                const id = rawModule?.id ? rawModule.id.toString() : "";
                const name = rawModule?.name ? rawModule.name.toString() : "";
                const target = rawModule?.target ? rawModule.target.toString() : "";
                let order = 0;
                
                if (rawModule?.order !== undefined && rawModule.order !== null) {
                    const parsedOrder = parseInt(rawModule.order.toString(), 10);
                    if (!isNaN(parsedOrder)) {
                        order = parsedOrder;
                    }
                }

                tempList.push({ id, name, target, order });
            }

            // Sort modules by order field
            return tempList.sort((a, b) => a.order - b.order);
        } catch (error) {
            console.error('AbxrLib: Failed to convert module data:', error);
        }

        return moduleDataList;
    }
    
    // Helper methods for module index persistence
    private static saveModuleIndex(): void {
        try {
            // Module tracking uses persistent storage for LMS integrations - requires user to be logged in
            // The StorageSetEntry function will handle the authentication checks and defer until user auth is ready
            const indexData = { moduleIndex: this.moduleIndex.toString() };
            this.StorageSetEntry(this.MODULE_INDEX_KEY, indexData, StorageScope.user, StoragePolicy.keepLatest);
        } catch (error) {
            console.error('AbxrLib: Failed to save module index:', error);
        }
    }

    private static loadModuleIndex(): void {
        try {
            this.StorageGetEntry(this.MODULE_INDEX_KEY, StorageScope.user).then((result) => {
                if (result && result.length > 0) {
                    const data = result[0]; // Get the first (and should be only) entry
                    if (data.moduleIndex) {
                        const moduleIndexString = data.moduleIndex;
                        if (moduleIndexString) {
                            const parsedIndex = parseInt(moduleIndexString, 10);
                            if (!isNaN(parsedIndex)) {
                                this.moduleIndex = parsedIndex;
                            }
                        }
                    }
                }
            }).catch((error) => {
                console.error('AbxrLib: Failed to load module index:', error);
                this.moduleIndex = 0;
            });
        } catch (error) {
            console.error('AbxrLib: Failed to load module index:', error);
            this.moduleIndex = 0;
        }
    }

    // Helper method to validate and normalize score values (0-100 range)
    private static validateScore(score: number | string, context: string): string {
        // Convert to number for validation
        const numericScore = typeof score === 'number' ? score : parseFloat(score.toString());
        
        // Check if it's a valid number
        if (isNaN(numericScore)) {
            if (this.enableDebug) {
                console.warn(`AbxrLib: Invalid score "${score}" for ${context}. Score must be a valid number. Using 0 as fallback.`);
            }
            return '0';
        }
        
        // Check range (0-100)
        if (numericScore < 0 || numericScore > 100) {
            if (this.enableDebug) {
                console.warn(`AbxrLib: Score ${numericScore} for ${context} is outside valid range (0-100). Clamping to valid range.`);
            }
            // Clamp to valid range
            const clampedScore = Math.max(0, Math.min(100, numericScore));
            return clampedScore.toString();
        }
        
        // Valid score - return as string
        return numericScore.toString();
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
    
    /**
     * INTERNAL USE ONLY - Configure built-in dialog options
     * @internal
     */
    static setDialogOptions(options: AuthMechanismDialogOptions): void {
        this.dialogOptions = { ...this.dialogOptions, ...options };
    }

    /**
     * INTERNAL USE ONLY - Get built-in dialog options
     * @internal
     */
    static getDialogOptions(): AuthMechanismDialogOptions {
        return { ...this.dialogOptions };
    }
    

    
    /**
     * INTERNAL USE ONLY - Built-in authentication handler (browser-only)
     * @internal
     */
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
    
    /**
     * INTERNAL USE ONLY - Extract authMechanism data into a structured format
     * @internal
     */
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
    
    // INTERNAL USE ONLY - Helper method to format auth data for completeFinalAuth based on type
    private static formatAuthDataForSubmission(inputValue: string, authType: string, domain?: string): any {
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
    
    /**
     * INTERNAL USE ONLY - Method to attempt version fallback on authentication failure
     * @internal
     */
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

    // INTERNAL USE ONLY - Method to complete final authentication when authMechanism is required
    private static async completeFinalAuth(authData: any): Promise<boolean> {
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
                
                // Extract module targets from auth response data (similar to Unity version)
                const authResponseData = AbxrLibClient.getAuthResponseData();
                const moduleTargets = Abxr.ExtractModuleTargetsFromAuthData(authResponseData);
                
                Abxr.NotifyAuthCompleted(true, false, moduleTargets);
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

    /**
     * Process all queued events after authentication completes
     * @private
     */
    private static ProcessQueuedEvents(): void {
        this.queuedEvents.forEach(queuedEvent => {
            try {
                switch (queuedEvent.eventType) {
                    case QueuedEventType.AssessmentStart:
                        AbxrLibSend.EventAssessmentStart(queuedEvent.eventName, this.convertToAbxrDictStrings(queuedEvent.meta)).catch(error => {
                            if (this.enableDebug) {
                                console.error('AbxrLib: Failed to send queued assessment start event:', error);
                            }
                        });
                        break;
                    
                    case QueuedEventType.AssessmentComplete:
                        AbxrLibSend.EventAssessmentComplete(queuedEvent.eventName, queuedEvent.score!, queuedEvent.status!, this.convertToAbxrDictStrings(queuedEvent.meta)).catch(error => {
                            if (this.enableDebug) {
                                console.error('AbxrLib: Failed to send queued assessment complete event:', error);
                            }
                        });
                        break;
                    
                    case QueuedEventType.ObjectiveStart:
                        AbxrLibSend.EventObjectiveStart(queuedEvent.eventName, this.convertToAbxrDictStrings(queuedEvent.meta)).catch(error => {
                            if (this.enableDebug) {
                                console.error('AbxrLib: Failed to send queued objective start event:', error);
                            }
                        });
                        break;
                    
                    case QueuedEventType.ObjectiveComplete:
                        AbxrLibSend.EventObjectiveComplete(queuedEvent.eventName, queuedEvent.score!, queuedEvent.status!, this.convertToAbxrDictStrings(queuedEvent.meta)).catch(error => {
                            if (this.enableDebug) {
                                console.error('AbxrLib: Failed to send queued objective complete event:', error);
                            }
                        });
                        break;
                    
                    case QueuedEventType.InteractionStart:
                        AbxrLibSend.EventInteractionStart(queuedEvent.eventName, this.convertToAbxrDictStrings(queuedEvent.meta)).catch(error => {
                            if (this.enableDebug) {
                                console.error('AbxrLib: Failed to send queued interaction start event:', error);
                            }
                        });
                        break;
                    
                    case QueuedEventType.InteractionComplete:
                        AbxrLibSend.EventInteractionComplete(queuedEvent.eventName, queuedEvent.interactionType!, queuedEvent.response!, this.convertToAbxrDictStrings(queuedEvent.meta)).catch(error => {
                            if (this.enableDebug) {
                                console.error('AbxrLib: Failed to send queued interaction complete event:', error);
                            }
                        });
                        break;
                }
                
                if (this.enableDebug) {
                    console.log(`AbxrLib - Processed queued event: ${queuedEvent.eventType} '${queuedEvent.eventName}'`);
                }
            } catch (error: any) {
                console.error(`AbxrLib - Error processing queued event ${queuedEvent.eventType} '${queuedEvent.eventName}':`, error);
            }
        });
        
        this.queuedEvents = []; // Clear the queue
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
    
    // Reset authentication state for new initialization attempt (unified approach)
    Abxr.NotifyAuthCompleted(true); // Clear failed state by setting success=true
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
                            // Note: NotifyAuthCompleted will be called after final authentication completes
                        } else {
                            // No additional authentication needed - complete authentication now
                            console.log('AbxrLib: Authentication complete - library ready');
                            
                            // Extract module targets from auth response data (similar to Unity version)
                            const authResponseData = AbxrLibClient.getAuthResponseData();
                            const moduleTargets = Abxr.ExtractModuleTargetsFromAuthData(authResponseData);
                            
                            Abxr.NotifyAuthCompleted(true, false, moduleTargets);
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
                        Abxr.NotifyAuthCompleted(false, false, undefined, errorMessage);
                    }
                })
                .catch((error: any) => {
                    console.error('AbxrLib: Authentication error:', error);
                    Abxr.NotifyAuthCompleted(false, false, undefined, `Authentication error: ${error.message}`);
                });
        } catch (error: any) {
            console.error('AbxrLib: Configuration error:', error);
            Abxr.NotifyAuthCompleted(false, false, undefined, `Configuration error: ${error.message}`);
        }
            }
}
