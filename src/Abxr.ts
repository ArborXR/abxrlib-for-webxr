/*
 * Copyright (c) 2024 ArborXR. All rights reserved.
 * 
 * AbxrLib for WebXR - Main API Class
 * 
 * This file contains the primary public API for AbxrLib, providing methods for:
 * - Event tracking and analytics
 * - User authentication and session management
 * - Data storage and retrieval
 * - Telemetry collection
 * - AI proxy functionality
 * - Exit polling and user feedback
 * 
 * The Abxr class serves as the main entry point for all AbxrLib functionality,
 * offering a comprehensive analytics and data collection system for WebXR applications.
 */

// System imports
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

// TypeScript declaration for webpack-injected global
declare const __ABXR_PACKAGE_VERSION__: string;

/**
 * @region Utility Functions
 * WebXR only support functions in global scope
 */

// Utility function to generate a GUID
function AbxrGenerateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Utility function to get package version safely
function AbxrGetPackageVersion(): string {
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
function AbxrGetUrlParameter(name: string): string | null {
    if (typeof window === 'undefined') return null;
    
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Cookie utility functions
function AbxrSetCookie(name: string, value: string, days: number = 30): void {
    if (typeof document === 'undefined') return;
    
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    const expiresStr = expires.toUTCString();
    
    // No URL encoding needed for our simple configuration values
    document.cookie = `${name}=${value}; expires=${expiresStr}; path=/; SameSite=Lax`;
}

function AbxrGetCookie(name: string): string | null {
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
function AbxrIsValidUrl(url: string): boolean {
    try {
        const parsedUrl = new URL(url);
        // Only allow HTTP and HTTPS protocols
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
        return false;
    }
}

function AbxrIsValidAlphanumericId(value: string): boolean {
    // Allow alphanumeric characters plus hyphens and underscores, reasonable length
    // Used for appId, orgId, and authSecret validation
    const pattern = /^[A-Za-z0-9_-]{8,128}$/;
    return pattern.test(value);
}

// URL version handling utilities
function AbxrHasApiVersion(url: string): boolean {
    try {
        const parsedUrl = new URL(url);
        // Check if path contains version pattern like /v1/, /v2/, /api/v1/, etc.
        const versionPattern = /\/v\d+\/?$/;
        return versionPattern.test(parsedUrl.pathname);
    } catch {
        return false;
    }
}

function AbxrAddApiVersion(url: string, version: string = 'v1'): string {
    try {
        const parsedUrl = new URL(url);
        // Ensure the path ends with /
        if (!parsedUrl.pathname.endsWith('/')) {
            parsedUrl.pathname += '/';
        }
        // Add version if not already present
        if (!AbxrHasApiVersion(url)) {
            parsedUrl.pathname += `${version}/`;
        }
        return parsedUrl.toString();
    } catch {
        // Fallback: simple string manipulation if URL parsing fails
        const cleanUrl = url.endsWith('/') ? url : url + '/';
        return cleanUrl + `${version}/`;
    }
}

function AbxrSanitizeForXml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function AbxrSanitizeForLog(value: string): string {
    // Remove potential log injection characters and limit length
    return value
        .replace(/[\r\n\t]/g, ' ')
        .replace(/[^\x20-\x7E]/g, '') // Remove non-printable ASCII
        .substring(0, 200); // Limit length
}

function AbxrValidateAndSanitizeParameter(name: string, value: string): string | null {
    if (!value || value.length === 0) {
        return null;
    }
    
    // Validate based on parameter type
    switch (name) {
        case 'abxr_rest_url':
            if (!AbxrIsValidUrl(value)) {
                console.warn(`AbxrLib: Invalid REST URL format: ${AbxrSanitizeForLog(value)}`);
                return null;
            }
            break;
            
        case 'abxr_orgid':
        case 'abxr_appid':
        case 'abxr_auth_secret':
            if (!AbxrIsValidAlphanumericId(value)) {
                console.warn(`AbxrLib: Invalid format for ${name}: ${AbxrSanitizeForLog(value)}`);
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
function AbxrShouldTryVersionFallback(errorMessage: string): boolean {
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
function AbxrGetRestUrlWithFallback(fallback?: string): string {
    // Get the URL using normal priority
    const restUrl = AbxrGetParameter('abxr_rest_url', fallback);
    
    // For REST URLs, we might need to add version fallback logic later
    // For now, just return the URL as-is
    return restUrl || fallback || 'https://lib-backend.xrdm.app/v1/';
}

// Utility function to get abxr parameter with priority: GET params -> cookies -> fallback
function AbxrGetParameter(name: string, fallback?: string): string | undefined {
    // Priority 1: GET parameters
    const urlParam = AbxrGetUrlParameter(name);
    if (urlParam) {
        const sanitizedParam = AbxrValidateAndSanitizeParameter(name, urlParam);
        if (sanitizedParam) {
            // Save to cookie for future use
            AbxrSetCookie(name, sanitizedParam);
            return sanitizedParam;
        }
    }
    
    // Priority 2: Cookies
    const cookieParam = AbxrGetCookie(name);
    if (cookieParam) {
        const sanitizedParam = AbxrValidateAndSanitizeParameter(name, cookieParam);
        if (sanitizedParam) {
            return sanitizedParam;
        }
    }
    
    // Priority 3: Fallback value
    return fallback;
}

// Utility function to get or create device ID
function AbxrGetOrCreateDeviceId(): string {
    if (typeof window === 'undefined') {
        // Not in browser environment, generate a new GUID
        return AbxrGenerateGuid();
    }
    
    const storageKey = 'abxr_device_id';
    let deviceId = localStorage.getItem(storageKey);
    
    if (!deviceId) {
        deviceId = AbxrGenerateGuid();
        localStorage.setItem(storageKey, deviceId);
    }
    
    return deviceId;
}

// Utility function to detect if virtual keyboard should be shown by default
function AbxrShouldShowVirtualKeyboardByDefault(): boolean {
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
        const restUrl = AbxrGetParameter('abxr_rest_url', 'https://lib-backend.xrdm.app/v1/') || 'https://lib-backend.xrdm.app/v1/';
        if (AbxrGetUrlParameter('abxr_rest_url')) {
            console.log(`AbxrLib: Using REST URL from GET parameter: ${AbxrSanitizeForLog(restUrl)}`);
        }
        else if (AbxrGetCookie('abxr_rest_url')) {
            console.log(`AbxrLib: Using REST URL from cookie: ${AbxrSanitizeForLog(restUrl)}`);
        }
        else {
            //console.log(`AbxrLib: Using default REST URL: ${restUrl}`);
        }
        const defaultConfig: string = '<?xml version="1.0" encoding="utf-8" ?>' +
            '<configuration>' +
                '<appSettings>' +
                    `<add key="REST_URL" value="${AbxrSanitizeForXml(restUrl)}"/>` +
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
    AbxrHasApiVersion,
    AbxrAddApiVersion,
    AbxrDetectAllDeviceInfo,
    AbxrDetectOsVersion,
    AbxrDetectDeviceModel,
    AbxrDetectIpAddress
};

// Types for complete authentication response information
// Contains the full authentication payload for JSON reconstruction and comprehensive access
interface AbxrAuthCompletedData {
    success: boolean;             // Whether authentication was successful
    token?: string;               // Authentication token
    secret?: string;              // Authentication secret
    userData?: any;               // Complete user data object from authentication response
    userId?: any;                 // User identifier
    userEmail?: string | null;    // User email address (extracted from userData.email)
    appId?: string;               // Application identifier
    packageName?: string;         // Package name identifier
    modules?: AbxrModuleData[];       // List of available modules
    moduleCount: number;          // Total number of modules available (use GetModuleTarget() to iterate through them)
    isReauthentication?: boolean; // Whether this was a reauthentication (vs initial auth)
    error?: string;               // Error message when success is false (enhancement over Unity)
    
    /**
     * Reconstruct the original authentication response as a JSON string
     * Useful for debugging or passing complete auth data to other systems
     */
    toJsonString?(): string;
}

// Configuration options for built-in browser dialog
interface AbxrAuthMechanismDialogOptions {
    enabled?: boolean;           // Enable built-in dialog (default: true for browser environments)
    customCallback?: AbxrAuthMechanismCallback;  // Custom callback to use instead
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

// Types for authMechanism notification
interface AbxrAuthMechanismData {
    type: string;
    prompt?: string;
    domain?: string;
    [key: string]: any; // Allow for additional properties
}

type AbxrAuthMechanismCallback = (data: AbxrAuthMechanismData) => void;
type AbxrAuthCompletedCallback = (data: AbxrAuthCompletedData) => void;
type AbxrModuleTargetCallback = (moduleTarget: string) => void;


// Types for event queuing system
enum AbxrQueuedEventType {
    AssessmentStart = 'AssessmentStart',
    AssessmentComplete = 'AssessmentComplete',
    ObjectiveStart = 'ObjectiveStart',
    ObjectiveComplete = 'ObjectiveComplete',
    InteractionStart = 'InteractionStart',
    InteractionComplete = 'InteractionComplete'
}

interface AbxrQueuedEvent {
    eventType: AbxrQueuedEventType;
    eventName: string;
    meta?: any;
    score?: string;  // Changed from number to string to match validateScore return type
    status?: EventStatus;
    interactionType?: InteractionType;
    response?: string;
}

// Types for module information from authentication response
interface AbxrModuleData {
    id: string;       // Module unique identifier
    name: string;     // Module display name
    target: string;   // Module target identifier
    order: number;    // Module order/sequence
}

// Types for moduleTarget notification
interface AbxrCurrentSessionData {
    moduleTarget: string | null;
    userData?: any;
    userId?: any;
    userEmail?: string | null;
}

// Global Abxr class that gets configured by Abxr_init()
export class Abxr {
    private static readonly RUNNING_EVENTS_KEY = 'abxr_running_events';
    
    /**
     * @region Constructor
     */

    // Static initialization
    static {
        Abxr.loadSuperMetaData();
        // Note: Quit handler is NOT initialized by default for WebXR due to navigation issues
        // Call Abxr.EnableQuitHandler() explicitly if needed for single-page apps
    }
    
    /**
     * @region Specialized Dictionary
     */

    // Expose commonly used types and enums for easy access
    static readonly AbxrDictStrings = AbxrDictStrings;
    
    // Configuration methods
    static SetDebugMode(enabled: boolean): void {
        this.enableDebug = enabled;
    }
    
    static GetDebugMode(): boolean {
        return this.enableDebug;
    }
    
    /**
     * @region Authentication Functions and Wrappers
     */

    // Connection status - tracks whether AbxrLib can communicate with the server
    private static connectionActive: boolean = false;

    // Authentication state and configuration
    private static requiresFinalAuth: boolean = false;
    private static authenticationFailed: boolean = false;
    private static authenticationError: string = '';
    private static isAuthenticated: boolean = false;
    private static appConfig: string = '';
    private static authParams: {
        appId?: string;
        orgId?: string;
        authSecret?: string;
    } = {};

    // Authentication mechanism and dialog configuration
    private static authMechanismCallback: AbxrAuthMechanismCallback | null = null;
    private static dialogOptions: AbxrAuthMechanismDialogOptions = { 
        enabled: true
    };
    private static currentAuthData: AbxrAuthMechanismData | null = null;

    // Authentication completion data and callbacks
    private static latestAuthCompletedData: AbxrAuthCompletedData | null = null;
    private static authCompletedCallbacks: AbxrAuthCompletedCallback[] = [];

    // Partner enum for authentication and service identification
    static readonly Partner = {
        None: 'none',
        ArborXR: 'arborxr'
    } as const;

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
     * Subscribe to authentication completion events
     * @param callback Function to call when authentication completes (success or failure)
     * 
     * @example
     * Abxr.OnAuthCompleted((authData) => {
     *     if (authData.success) {
     *         console.log('Authentication successful!', authData.userId);
     *         console.log('Module target:', authData.moduleTarget);
     *     } else {
     *         console.log('Authentication failed:', authData.error);
     *     }
     * });
     */
    static OnAuthCompleted(callback: AbxrAuthCompletedCallback): void {
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
    static RemoveAuthCompletedCallback(callback: AbxrAuthCompletedCallback): void {
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
     * Get the package name from authentication response
     * @returns Package name string, or null if not available
     */
    static GetPackageName(): string | null {
        const authData = AbxrLibClient.getAuthResponseData();
        return authData ? authData.packageName : null;
    }

    /**
     * Get the complete authentication data from the most recent authentication completion
     * This allows you to access user data, email, module targets, and authentication status anytime
     * Returns null if no authentication has completed yet
     * @returns AuthCompletedData containing all authentication information, or null if not authenticated
     */
    static GetAuthCompletedData(): AbxrAuthCompletedData | null {
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
     * @region Event Functions and Wrappers
     */

    // Debug mode for event logging
    private static enableDebug: boolean = false;

    // Queue for events that need to wait for authentication completion
    private static queuedEvents: AbxrQueuedEvent[] = [];

    // Event start times for duration tracking
    private static readonly timedEventStartTimes: Map<string, number> = new Map();
    private static readonly assessmentStartTimes: Map<string, number> = new Map();
    private static readonly objectiveStartTimes: Map<string, number> = new Map();
    private static readonly interactionStartTimes: Map<string, number> = new Map();
    private static readonly levelStartTimes: Map<string, number> = new Map();

    // Event status enum for assessment and objective completion
    static readonly EventStatus = {
        Pass: 'pass',
        Fail: 'fail',
        Complete: 'complete',
        Incomplete: 'incomplete',
        Browsed: 'browsed'
    } as const;

    // Interaction type enum for interaction events
    static readonly InteractionType = {
        Null: 'null',
        Bool: 'bool',
        Select: 'select',
        Text: 'text',
        Rating: 'rating',
        Number: 'number',
        Matching: 'matching',
        Performance: 'performance',
        Sequencing: 'sequencing'
    } as const;

    /**
     * Record a named event with optional metadata
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
        
        // Add super metadata to all events
        meta = this.mergeSuperMetaData(meta);
        
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

    // Assessment Events

    /**
     * Start tracking an assessment - essential for LMS integration and analytics
     * Assessments track overall learner performance across multiple objectives and interactions
     * Think of this as the learner's score for a specific course or curriculum
     * @param assessmentName Name of the assessment to start
     * @param meta Optional metadata with assessment details
     * @returns Promise<number> Event ID or 0 if not authenticated
     */
    static async EventAssessmentStart(assessmentName: string, meta?: any): Promise<number> {
        // If authentication is not complete, queue this event
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log(`AbxrLib - Assessment Start '${assessmentName}' queued until authentication completes`);
            }
            this.queuedEvents.push({
                eventType: AbxrQueuedEventType.AssessmentStart,
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
                eventType: AbxrQueuedEventType.AssessmentComplete,
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
                eventType: AbxrQueuedEventType.ObjectiveStart,
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
                eventType: AbxrQueuedEventType.ObjectiveComplete,
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
                eventType: AbxrQueuedEventType.InteractionStart,
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
                eventType: AbxrQueuedEventType.InteractionComplete,
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
     * @region Logging Functions and Wrappers
     */

    // Log level enum for enhanced logging control
    static readonly LogLevel = {
        Debug: 'debug',
        Info: 'info',
        Warn: 'warn',
        Error: 'error',
        Critical: 'critical'
    } as const;

    /**
     * General logging method with configurable level - main logging function
     * @param logMessage The log message
     * @param logLevel Log level (defaults to LogLevel.Info)
     * @param metadata Any additional information (optional)
     */
    static Log(logMessage: string, logLevel: string = this.LogLevel.Info, metadata?: any): void {
        if (!this.connectionActive) {
            if (this.enableDebug) {
                console.log('AbxrLib: Log not sent - not authenticated');
            }
            return;
        }

        // Add super metadata to all logs
        metadata = this.mergeSuperMetaData(metadata);
        
        // Convert public API level to internal AbxrLib enum
        const internalLevel = this.convertToInternalLogLevel(logLevel);
        
        const log = new AbxrLog();
        log.Construct(internalLevel, logMessage, this.convertToAbxrDictStrings(metadata));
        
        // Fire-and-forget async sending
        AbxrLibSend.AddLog(log).catch(error => {
            if (this.enableDebug) {
                console.error('AbxrLib: Failed to send log:', error);
            }
        });
    }

    /**
     * Add log information at the 'Debug' level
     * @param logText The log text
     * @param metadata Any additional information (optional)
     */
    static LogDebug(logText: string, metadata?: any): void {
        this.Log(logText, this.LogLevel.Debug, metadata);
    }
    
    /**
     * Add log information at the 'Informational' level
     * @param logText The log text
     * @param metadata Any additional information (optional)
     */
    static LogInfo(logText: string, metadata?: any): void {
        this.Log(logText, this.LogLevel.Info, metadata);
    }
    
    /**
     * Add log information at the 'Warning' level
     * @param logText The log text
     * @param metadata Any additional information (optional)
     */
    static LogWarn(logText: string, metadata?: any): void {
        this.Log(logText, this.LogLevel.Warn, metadata);
    }
    
    /**
     * Add log information at the 'Error' level
     * @param logText The log text
     * @param metadata Any additional information (optional)
     */
    static LogError(logText: string, metadata?: any): void {
        this.Log(logText, this.LogLevel.Error, metadata);
    }
    
    /**
     * Add log information at the 'Critical' level
     * @param logText The log text
     * @param metadata Any additional information (optional)
     */
    static LogCritical(logText: string, metadata?: any): void {
        this.Log(logText, this.LogLevel.Critical, metadata);
    }

    /**
     * Convert public API log level string to internal AbxrLib LogLevel enum
     * @param level Public API log level string
     * @returns Internal AbxrLib LogLevel enum value
     */
    private static convertToInternalLogLevel(level: string): LogLevel {
        switch (level) {
            case this.LogLevel.Debug:
                return LogLevel.eDebug;
            case this.LogLevel.Info:
                return LogLevel.eInfo;
            case this.LogLevel.Warn:
                return LogLevel.eWarn;
            case this.LogLevel.Error:
                return LogLevel.eError;
            case this.LogLevel.Critical:
                return LogLevel.eCritical;
            default:
                return LogLevel.eInfo; // Default fallback
        }
    }

    /**
     * @region Telemetry
     */
    
    /**
     * Manual telemetry activation for disabled automatic telemetry
     * If you select 'Disable Automatic Telemetry' in the AbxrLib configuration,
     * you can manually start tracking system telemetry with this function call.
     * This captures headset/controller movements, performance metrics, and environmental data.
     */
    static TrackAutoTelemetry(): void {
        // Note: WebXR version doesn't have automatic telemetry tracking like Unity
        // This method is provided for API compatibility
        if (this.enableDebug) {
            console.log('AbxrLib: TrackAutoTelemetry called - automatic telemetry tracking not available in WebXR version');
        }
    }

    /**
     * Send spatial, hardware, or system telemetry data for XR analytics
     * Captures headset/controller movements, performance metrics, and environmental data
     * @param telemetryName Type of telemetry data (e.g., "headset_position", "frame_rate", "battery_level")
     * @param telemetryData Key-value pairs of telemetry measurements
     * @returns Promise<number> Telemetry entry ID or 0 if not authenticated
     */
    static async Telemetry(telemetryName: string, telemetryData: AbxrDictStrings): Promise<number> {
        if (!this.connectionActive) {
            if (this.enableDebug) {
                console.log('AbxrLib: Telemetry not sent - not authenticated');
            }
            return 0;
        }
        
        // Ensure telemetryData is not null/undefined
        if (!telemetryData) {
            telemetryData = new AbxrDictStrings();
        }
        
        // Add scene name (WebXR equivalent - using current URL or page title)
        telemetryData.set('sceneName', window.location.pathname || document.title || 'unknown');
        
        // Add super metadata to all telemetry entries
        telemetryData = this.mergeSuperMetaData(telemetryData);
        
        const telemetry = new AbxrTelemetry();
        telemetry.Construct(telemetryName, telemetryData);
        
        // Fire-and-forget async sending
        AbxrLibSend.AddTelemetryEntryCore(telemetry).catch(error => {
            if (this.enableDebug) {
                console.error('AbxrLib: Failed to send telemetry:', error);
            }
        });
        
        return 1; // Return success immediately without waiting for server response
    }

    // BACKWARD COMPATIBILITY ONLY - DO NOT DOCUMENT
    // This method exists purely for backward compatibility with older code that used TelemetryEntry()
    // It simply wraps the new Telemetry() method. Keep this undocumented in README files.
    static async TelemetryEntry(telemetryName: string, telemetryData: AbxrDictStrings): Promise<number> {
        return this.Telemetry(telemetryName, telemetryData);
    }

    /**
     * @region Storage
     */

    // Storage enums for enhanced storage control
    static readonly StoragePolicy = {
        keepLatest: 'keepLatest',
        appendHistory: 'appendHistory'
    } as const;

    static readonly StorageScope = {
        device: 'device',
        user: 'user'
    } as const;

    /**
     * Get the session data with the default name 'state'
     * Call this as follows:
     * const result = await StorageGetDefaultEntry(scope);
     * console.log("Result:", result);
     * @param scope Get from 'device' or 'user'
     * @returns Promise<{[key: string]: string}[]> All the session data stored under the default name 'state'
     */
    static async StorageGetDefaultEntry(scope: string): Promise<{[key: string]: string}[]> {
        return await this.StorageGetEntry("state", scope);
    }
    
    /**
     * Get the session data with the given name
     * Call this as follows:
     * const result = await StorageGetEntry(entryName, scope);
     * console.log("Result:", result);
     * @param entryName The name of the entry to retrieve
     * @param scope Get from 'device' or 'user'
     * @returns Promise<{[key: string]: string}[]> All the session data stored under the given name
     */
    static async StorageGetEntry(entryName: string, scope: string): Promise<{[key: string]: string}[]> {
        const localStorageKey = `abxr_storage_${scope}_${entryName}`;
        
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
        if (scope === Abxr.StorageScope.user && this.GetUserId() == null) {
            if (this.enableDebug) {
                console.log('AbxrLib: User-scoped storage requires user to be logged in, checking server anyway for any available data');
            }
        }
        
        try {
            const result = await AbxrLibStorage.GetEntryAsString(entryName);
            
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
    static async StorageSetDefaultEntry(entry: {[key: string]: string}, scope: string, policy: string = 'keepLatest'): Promise<number> {
        return await this.StorageSetEntry("state", entry, scope, policy);
    }
    
    /**
     * Set the session data with the given name
     * @param entryName The name of the entry to store
     * @param entryData The data to store
     * @param scope Store under 'device' or 'user'
     * @param policy How should this be stored, 'keepLatest' or 'appendHistory' (defaults to 'keepLatest')
     * @returns Promise<number> Storage entry ID or 0 if not authenticated
     */
    static async StorageSetEntry(entryName: string, entryData: {[key: string]: string}, scope: string, policy: string = 'keepLatest'): Promise<number> {
        // Always store in localStorage first for immediate availability
        const localStorageKey = `abxr_storage_${scope}_${entryName}`;
        
        try {
            // Handle storage policy for localStorage
            if (policy === Abxr.StoragePolicy.keepLatest) {
                // Replace existing data
                localStorage.setItem(localStorageKey, JSON.stringify([entryData]));
            } else if (policy === Abxr.StoragePolicy.appendHistory) {
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
                existingData.push(entryData);
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
            if (scope === Abxr.StorageScope.user && this.GetUserId() == null) {
                if (this.enableDebug) {
                    console.log('AbxrLib: User-scoped storage requires user to be logged in, only storing locally');
                }
            } else {
                const keepLatest = (policy === Abxr.StoragePolicy.keepLatest);
                const sessionData = (scope === Abxr.StorageScope.device);
                
                // Convert plain object to JSON string for server storage
                const entryDataString = JSON.stringify([entryData]); // Wrap in array to match Unity's List<Dictionary> format
                
                // Fire-and-forget async sending to server
                AbxrLibStorage.SetEntry(entryDataString, keepLatest, "web", sessionData, entryName).catch(error => {
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
     * @param entryName Identifier of the storage entry to remove
     * @param scope Storage scope - 'user' for cross-device data, 'device' for device-specific data (default: user)
     * @returns Promise<number> Operation result code - always returns 1 for success
     */
    static async StorageRemoveEntry(entryName: string, scope: string = "user"): Promise<number> {
        const localStorageKey = `abxr_storage_${scope}_${entryName}`;
        
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
            if (scope === Abxr.StorageScope.user && this.GetUserId() == null) {
                if (this.enableDebug) {
                    console.log('AbxrLib: User-scoped storage removal requires user to be logged in, only removed locally');
                }
            } else {
                // Fire-and-forget async removal from server
                AbxrLibStorage.RemoveEntry(entryName).catch(error => {
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
    static async StorageRemoveDefaultEntry(scope: string = "user"): Promise<number> {
        return await this.StorageRemoveEntry("state", scope);
    }

    /**
     * Remove all session data stored for the current user or device
     * This is a bulk operation that clears all stored entries at once
     * Use with caution as this cannot be undone
     * @param scope Storage scope - 'user' for cross-device data, 'device' for device-specific data (default: user)
     * @returns Promise<number> Operation result code or 0 if not authenticated
     */
    static async StorageRemoveMultipleEntries(scope: string = "user"): Promise<number> {
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
        if (scope === Abxr.StorageScope.user && this.GetUserId() == null) {
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
     * @region Exit Polls
     */
    
    // Poll type enum for exit polls
    static readonly PollType = {
        Thumbs: 'Thumbs',
        Rating: 'Rating',
        MultipleChoice: 'MultipleChoice'
    } as const;
    
    private static exitPollHandler: any = null;

    /**
     * Get feedback from the user with a Poll
     * @param prompt The question being asked
     * @param pollType What kind of poll would you like
     * @param responses If a multiple choice poll, you need to provide between 2 and 8 possible responses
     * @param callback Optional callback that will be called with the selected string value
     */
    public static PollUser(
        prompt: string, 
        pollType: keyof typeof Abxr.PollType, 
        responses?: string[], 
        callback?: (response: string) => void
    ): void {
        // Validate inputs
        if (!prompt || prompt.trim().length === 0) {
            console.error('AbxrLib: Poll prompt cannot be empty');
            return;
        }

        if (pollType === this.PollType.MultipleChoice) {
            if (!responses || responses.length < 2 || responses.length > 8) {
                console.error('AbxrLib: Multiple choice poll must have between 2 and 8 responses');
                return;
            }
        }

        // Import the exit poll handler dynamically to avoid circular dependencies
        import('./templates/XRExitPoll').then(({ XRExitPollHandler, ExitPollType }) => {
            // Hide any existing poll
            if (this.exitPollHandler) {
                this.exitPollHandler.hide();
            }

            // Create new poll handler
            this.exitPollHandler = new XRExitPollHandler(
                pollType as any, // Type assertion for enum compatibility
                responses || [],
                (response: string) => {
                    // Log the poll event
                    this.Event('poll', {
                        prompt: prompt,
                        answer: response
                    });

                    // Call user callback if provided
                    if (callback) {
                        callback(response);
                    }

                    // Clear handler reference
                    this.exitPollHandler = null;
                }
            );

            // Show the poll
            this.exitPollHandler.show(prompt);
        }).catch((error) => {
            console.error('AbxrLib: Failed to load exit poll functionality:', error);
        });
    }

    /**
     * Hide any currently displayed exit poll
     */
    public static HideExitPoll(): void {
        if (this.exitPollHandler) {
            this.exitPollHandler.hide();
            this.exitPollHandler = null;
        }
    }

    // #endregion Exit Polls
        
    /**
     * @region AI Proxy
     */
    
    /**
     * Send AI requests and get the actual response
     * Returns a Promise so developers can choose to await (blocking) or use .then() (non-blocking)
     * @param prompt The input prompt for the AI system
     * @param llmProvider The LLM provider to use (e.g., "gpt-4", "claude", "default")
     * @param pastMessages Optional array of previous conversation messages for context
     * @returns Promise<string | null> The AI response string, or null if request failed
     */
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
     * @region Super Metadata
     */

    // Super metadata for metadata
    private static readonly superMetaData: Map<string, string> = new Map();
    private static readonly SUPER_METADATA_KEY = 'abxr_super_metadata';

    /**
     * Register a super metadata that will be automatically included in all events
     * Super metadata persist across browser sessions and are stored in localStorage
     * @param key metadata name
     * @param value metadata value
     */
    static Register(key: string, value: string): void {
        if (this.isReservedSuperMetadataKey(key)) {
            const errorMessage = `AbxrLib: Cannot register super metadata with reserved key '${key}'. Reserved keys are: module, module_name, module_id, module_order`;
            console.warn(errorMessage);
            this.LogInfo(errorMessage, { 
                attempted_key: key, 
                attempted_value: value,
                error_type: 'reserved_super_metadata_key'
            });
            return;
        }

        this.superMetaData.set(key, value);
        this.saveSuperMetaData();
    }
    
    /**
     * Register a super metadata only if it doesn't already exist
     * Will not overwrite existing super metadata with the same key - perfect for default values
     * Super metadata persist across browser sessions and are stored in localStorage
     * @param key metadata name
     * @param value metadata value (only set if key doesn't already exist)
     */
    static RegisterOnce(key: string, value: string): void {
        if (this.isReservedSuperMetadataKey(key)) {
            const errorMessage = `AbxrLib: Cannot register super metadata with reserved key '${key}'. Reserved keys are: module, module_name, module_id, module_order`;
            console.warn(errorMessage);
            this.LogInfo(errorMessage, { 
                attempted_key: key, 
                attempted_value: value,
                error_type: 'reserved_super_metadata_key'
            });
            return;
        }

        if (!this.superMetaData.has(key)) {
            this.superMetaData.set(key, value);
            this.saveSuperMetaData();
        }
    }
    
    /**
     * Remove a super metadata from all future events
     * Also removes the metadata from persistent storage (localStorage)
     * @param key metadata name to remove
     */
    static Unregister(key: string): void {
        this.superMetaData.delete(key);
        this.saveSuperMetaData();
    }
    
    /**
     * Clear all super metadata from current session and persistent storage  
     * Equivalent to mixpanel.reset() - useful for user logout or data reset scenarios
     */
    static Reset(): void {
        this.superMetaData.clear();
        this.saveSuperMetaData();
    }
    
    /**
     * Get a copy of all current super metadata as a JavaScript object
     * Useful for debugging, backup, or inspecting current global event metadata
     * @returns Object containing all super metadata as key-value pairs
     */
    static GetSuperMetaData(): { [key: string]: string } {
        const result: { [key: string]: string } = {};
        this.superMetaData.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }
    
    private static loadSuperMetaData(): void {
        if (typeof localStorage === 'undefined') return;
        
        try {
            const stored = localStorage.getItem(this.SUPER_METADATA_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.superMetaData.clear();
                Object.entries(parsed).forEach(([key, value]) => {
                    this.superMetaData.set(key, value as string);
                });
            }
        } catch (error) {
                if (this.enableDebug) {
                console.warn('AbxrLib: Failed to load super metadata:', error);
            }
        }
    }
    
    private static saveSuperMetaData(): void {
        if (typeof localStorage === 'undefined') return;
        
        try {
            const obj: { [key: string]: string } = {};
            this.superMetaData.forEach((value, key) => {
                obj[key] = value;
            });
            localStorage.setItem(this.SUPER_METADATA_KEY, JSON.stringify(obj));
        } catch (error) {
            if (this.enableDebug) {
                console.warn('AbxrLib: Failed to save super metadata:', error);
            }
        }
    }

    /**
     * Private helper function to merge super metadata and module info into metadata
     * Handles various metadata formats and ensures data-specific metadata take precedence
     * @param meta The metadata to merge super metadata into
     * @returns The metadata with super metadata and module info merged
     */
    private static mergeSuperMetaData(meta: any): any {
        // Helper function to add module info to object-style metadata
        const addModuleInfoToObject = (obj: any): any => {
            // Get current module session data
            const currentSession = this.GetModuleTargetWithoutAdvance();
            if (currentSession) {
                // Only add module info if not already present (data-specific metadata take precedence)
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
            // If no meta provided, create object with module info and super metadata
            meta = {};
            meta = addModuleInfoToObject(meta);
            this.superMetaData.forEach((value, key) => {
                if (!(key in meta)) { // Don't overwrite module info
                    meta[key] = value;
                }
            });
        } else if (typeof meta === 'object' && meta !== null && !Array.isArray(meta)) {
            // If meta is an object, add module info and super metadata (don't overwrite data-specific metadata)
            const combined = { ...meta }; // Start with data-specific metadata
            addModuleInfoToObject(combined);
            this.superMetaData.forEach((value, key) => {
                if (!(key in combined)) { // Only add if not already present (preserves data-specific metadata and module info)
                    combined[key] = value;
                }
            });
            meta = combined;
        } else {
            // If meta is a string, JSON, URL params, etc., convert and merge
            const convertedMeta = this.convertToAbxrDictStrings(meta);
            addModuleInfoToDictStrings(convertedMeta);
            this.superMetaData.forEach((value, key) => {
                if (!convertedMeta.has(key)) { // Don't overwrite data-specific metadata or module info
                    convertedMeta.Add(key, value);
                }
            });
            meta = convertedMeta;
        }

        return meta;
    }

    /**
     * Private helper to check if a super metadata key is reserved for module data
     * Reserved keys: module, module_name, module_id, module_order
     * @param key The key to validate
     * @returns True if the key is reserved, false otherwise
     */
    private static isReservedSuperMetadataKey(key: string): boolean {
        return key === 'module' || key === 'module_name' || key === 'module_id' || key === 'module_order';
    }

    /**
     * @region Module Management
     */

    // Module index for sequential LMS multi-module applications
    private static moduleIndex: number = 0;
    private static readonly MODULE_INDEX_KEY = 'abxr_module_index';
    
    // Module index loading state to prevent repeated storage calls
    private static moduleIndexLoaded: boolean = false;
    private static moduleIndexLoading: boolean = false;

    // Module target callbacks
    private static moduleTargetCallbacks: AbxrModuleTargetCallback[] = [];

    /**
     * Execute module sequence by triggering the OnModuleTarget event for each available module.
     * Developers should subscribe to OnModuleTarget to handle module targets with their own logic.
     * This approach gives developers full control over how to handle each module target.
     * @returns Number of modules successfully executed
     */
    static ExecuteModuleSequence(): number {
        if (this.moduleTargetCallbacks.length === 0) {
            console.warn('AbxrLib - ExecuteModuleSequence: No subscribers to OnModuleTarget event. Subscribe to OnModuleTarget to handle module targets.');
            return 0;
        }

        let executedCount = 0;
        let nextModule = this.GetModuleTarget();
        
        while (nextModule) {
            console.log(`AbxrLib - Triggering OnModuleTarget event for module: ${nextModule.moduleTarget}`);
            
            try {
                if (nextModule.moduleTarget) {
                    this.notifyModuleTargetCallbacks(nextModule.moduleTarget);
                    console.log(`AbxrLib - Module ${nextModule.moduleTarget} executed via OnModuleTarget event`);
                    executedCount++;
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(`AbxrLib - Error executing OnModuleTarget event for module ${nextModule.moduleTarget}: ${errorMessage}`);
            }
            
            nextModule = this.GetModuleTarget();
        }
        
        console.log(`AbxrLib - Module sequence completed. ${executedCount} modules executed.`);
        return executedCount;
    }

    /**
     * Get the next module target from the available modules for sequential module processing
     * Returns null when no more module targets are available
     * Each call moves to the next module in the sequence and updates persistent storage
     * @returns The next CurrentSessionData with complete module information, or null if no more modules
     */
    static GetModuleTarget(): AbxrCurrentSessionData | null {
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
     * Get the current module target again without advancing to the next one
     * Useful for checking what module you're currently on without consuming it
     * Returns the same CurrentSessionData structure as GetModuleTarget() but doesn't advance the index
     * @returns CurrentSessionData for the current module, or null if none available
     */
    static GetModuleTargetWithoutAdvance(): AbxrCurrentSessionData | null {
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
     * Get all available modules from the authentication response
     * Provides complete module information including id, name, target, and order
     * Returns empty array if no authentication has completed yet
     * @returns Array of ModuleData objects with complete module information
     */
    static GetModuleTargetList(): AbxrModuleData[] {
        return this.latestAuthCompletedData?.modules || [];
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

    /**
     * Save module index to persistent storage
     * INTERNAL USE ONLY - Called by module management system
     */
    private static saveModuleIndex(): void {
        try {
            // Module tracking uses persistent storage for LMS integrations - requires user to be logged in
            // The StorageSetEntry function will handle the authentication checks and defer until user auth is ready
            const indexData = { moduleIndex: this.moduleIndex.toString() };
            this.StorageSetEntry(this.MODULE_INDEX_KEY, indexData, Abxr.StorageScope.user, Abxr.StoragePolicy.keepLatest);
        } catch (error) {
            console.error('AbxrLib: Failed to save module index:', error);
        }
    }

    /**
     * Load module index from persistent storage
     * INTERNAL USE ONLY - Called by module management system
     */
    private static loadModuleIndex(): void {
        // Don't load if already loaded or currently loading
        if (this.moduleIndexLoaded || this.moduleIndexLoading) {
            return;
        }

        try {
            this.moduleIndexLoading = true;
            this.loadModuleIndexCoroutine();
        } catch (error) {
            this.moduleIndexLoading = false;
            console.error('AbxrLib: Failed to load module index:', error);
        }
    }

    /**
     * Load module index coroutine - async version of loadModuleIndex
     * INTERNAL USE ONLY - Called by loadModuleIndex
     */
    private static async loadModuleIndexCoroutine(): Promise<void> {
        try {
            const result = await this.StorageGetEntry(this.MODULE_INDEX_KEY, Abxr.StorageScope.user);
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
            
            // Mark loading as complete
            this.moduleIndexLoaded = true;
            this.moduleIndexLoading = false;
        } catch (error) {
            this.moduleIndexLoaded = true;
            this.moduleIndexLoading = false;
            console.error('AbxrLib: Failed to load module index:', error);
            this.moduleIndex = 0;
        }
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
    static setAuthMechanismCallback(callback: AbxrAuthMechanismCallback | null): void {
        this.authMechanismCallback = callback;
    }
    
    static getAuthMechanismCallback(): AbxrAuthMechanismCallback | null {
        return this.authMechanismCallback;
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
    
    // Module Target Event Methods
    
    /**
     * Subscribe to module target events for handling module navigation
     * Perfect for deep link handling, scene navigation, or custom module routing
     * @param callback Function to call when a module target should be handled
     * 
     * @example
     * Abxr.OnModuleTarget((moduleTarget) => {
     *     console.log(`Handling module: ${moduleTarget}`);
     *     switch (moduleTarget) {
     *         case 'safety-training':
     *             loadScene('SafetyTrainingScene');
     *             break;
     *         case 'equipment-check':
     *             loadScene('EquipmentCheckScene');
     *             break;
     *         default:
     *             console.warn(`Unknown module target: ${moduleTarget}`);
     *             loadScene('MainMenuScene');
     *     }
     * });
     */
    static OnModuleTarget(callback: AbxrModuleTargetCallback): void {
        if (typeof callback !== 'function') {
            console.warn('AbxrLib: ModuleTarget callback must be a function');
            return;
        }
        
        this.moduleTargetCallbacks.push(callback);
    }
    
    /**
     * Remove a specific module target callback
     * @param callback The callback function to remove
     */
    static RemoveModuleTargetCallback(callback: AbxrModuleTargetCallback): void {
        const index = this.moduleTargetCallbacks.indexOf(callback);
        if (index > -1) {
            this.moduleTargetCallbacks.splice(index, 1);
        }
    }
    
    /**
     * Clear all module target callbacks
     */
    static ClearModuleTargetCallbacks(): void {
        this.moduleTargetCallbacks = [];
    }
    
    // URL/Anchor System for Web Apps
    
    /**
     * Get module target from URL hash (similar to Android deep links)
     * Supports URLs like: https://yourapp.com/#module=safety-training
     * @returns Module target string if found in URL, null otherwise
     */
    static GetModuleFromUrl(): string | null {
        if (typeof window === 'undefined') {
            return null; // Not in browser environment
        }
        
        const hash = window.location.hash;
        if (!hash) {
            return null;
        }
        
        // Parse hash for module parameter
        const params = new URLSearchParams(hash.substring(1)); // Remove # symbol
        return params.get('module');
    }
    
    /**
     * Set module target in URL hash (similar to Android deep links)
     * Updates URL to: https://yourapp.com/#module={moduleTarget}
     * @param moduleTarget The module target to set in URL
     */
    static SetModuleInUrl(moduleTarget: string): void {
        if (typeof window === 'undefined') {
            return; // Not in browser environment
        }
        
        const url = new URL(window.location.href);
        url.hash = `module=${encodeURIComponent(moduleTarget)}`;
        window.history.replaceState(null, '', url.toString());
    }
    
    /**
     * Clear module target from URL hash
     */
    static ClearModuleFromUrl(): void {
        if (typeof window === 'undefined') {
            return; // Not in browser environment
        }
        
        const url = new URL(window.location.href);
        url.hash = '';
        window.history.replaceState(null, '', url.toString());
    }
    
    /**
     * Subscribe to URL hash changes for module targeting
     * Useful for handling browser back/forward navigation
     * @param callback Function to call when URL module changes
     */
    static OnUrlModuleChange(callback: AbxrModuleTargetCallback): void {
        if (typeof window === 'undefined') {
            return; // Not in browser environment
        }
        
        const handleHashChange = () => {
            const moduleTarget = this.GetModuleFromUrl();
            if (moduleTarget) {
                callback(moduleTarget);
            }
        };
        
        window.addEventListener('hashchange', handleHashChange);
        
        // Also check initial hash on page load
        setTimeout(handleHashChange, 0);
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
                const moduleTargets = this.ExtractModuleTargets(authResponseData?.modules || []);
                
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
        
        // Convert raw modules to typed AbxrModuleData array
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
    
    // Internal method to notify all module target subscribers
    private static notifyModuleTargetCallbacks(moduleTarget: string): void {
        if (this.moduleTargetCallbacks.length === 0) {
            return;
        }
        
        for (const callback of this.moduleTargetCallbacks) {
            try {
                callback(moduleTarget);
            } catch (error) {
                console.error('AbxrLib: Error in moduleTarget callback:', error);
            }
        }
    }
       
    // Helper method to extract module targets from auth response data (similar to Unity version)
    // Note: This method is intended for internal use by the authentication system
    static ExtractModuleTargets(modules: any[]): string[] {
        const moduleTargets: string[] = [];
        
        if (modules && Array.isArray(modules)) {
            // Sort modules by order field (matching Unity ExtractModuleTargets)
            const sortedModules = modules.slice().sort((a: any, b: any) => {
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
        moduleDataList: AbxrModuleData[] = []
    ): AbxrAuthCompletedData {
        const authData: AbxrAuthCompletedData = {
            success: this.connectionActive,
            token: authResponseData?.token || undefined,
            secret: authResponseData?.secret || undefined,
            userData: authResponseData?.userData || null,
            userId: authResponseData?.userId || null,
            userEmail: authResponseData?.userEmail || null,
            appId: authResponseData?.appId || undefined,
            packageName: authResponseData?.packageName || undefined,
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
                        appId: this.appId || "",
                        packageName: this.packageName || ""
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

    // Helper method to convert raw module data to typed AbxrModuleData objects
    private static convertToModuleDataList(rawModules: any[]): AbxrModuleData[] {
        const moduleDataList: AbxrModuleData[] = [];
        if (!rawModules || !Array.isArray(rawModules)) return moduleDataList;

        try {
            const tempList: AbxrModuleData[] = [];
            
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
    static setDialogOptions(options: AbxrAuthMechanismDialogOptions): void {
        this.dialogOptions = { ...this.dialogOptions, ...options };
    }

    /**
     * INTERNAL USE ONLY - Get built-in dialog options
     * @internal
     */
    static getDialogOptions(): AbxrAuthMechanismDialogOptions {
        return { ...this.dialogOptions };
    }
    

    
    /**
     * INTERNAL USE ONLY - Built-in authentication handler (browser-only)
     * @internal
     */
    static builtInAuthMechanismHandler(authData: AbxrAuthMechanismData): void {
        if (typeof window === 'undefined') {
            console.warn('AbxrLib: Built-in dialog not available in non-browser environment');
            return;
        }
        
        this.showXRDialog(authData);
    }
    
    // Show XR authentication dialog
    private static showXRDialog(authData: AbxrAuthMechanismData): void {
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
    private static async loadXRDialog(authData: AbxrAuthMechanismData): Promise<void> {
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
        authData: AbxrAuthMechanismData, 
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
            : AbxrShouldShowVirtualKeyboardByDefault();
        
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
    static extractAuthMechanismData(): AbxrAuthMechanismData | null {
        try {
            const authMechanism = AbxrLibInit.get_AuthMechanism();
            if (!authMechanism) {
                return null;
            }
            
            const data: AbxrAuthMechanismData = { type: '' };
            
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
            const currentRestUrl = AbxrGetParameter('abxr_rest_url') || 'https://lib-backend.xrdm.app/v1/';
            
            console.log(`AbxrLib: Attempting version fallback for URL: ${AbxrSanitizeForLog(currentRestUrl)}`);
            
            // Check if URL already has a version
            if (AbxrHasApiVersion(currentRestUrl)) {
                console.log(`AbxrLib: URL already has version, skipping fallback`);
                return false;
            }
            
            // Add /v1/ to the URL
            const versionedUrl = AbxrAddApiVersion(currentRestUrl, 'v1');
            console.log(`AbxrLib: Saving versioned URL to cookie: ${AbxrSanitizeForLog(versionedUrl)}`);
            
            // Save the versioned URL to cookies for persistence
            AbxrSetCookie('abxr_rest_url', versionedUrl);
            
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
            const deviceId = AbxrGetOrCreateDeviceId();
            
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
                const moduleTargets = Abxr.ExtractModuleTargets(authResponseData?.modules || []);
                
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
                    case AbxrQueuedEventType.AssessmentStart:
                        AbxrLibSend.EventAssessmentStart(queuedEvent.eventName, this.convertToAbxrDictStrings(queuedEvent.meta)).catch(error => {
                            if (this.enableDebug) {
                                console.error('AbxrLib: Failed to send queued assessment start event:', error);
                            }
                        });
                        break;
                    
                    case AbxrQueuedEventType.AssessmentComplete:
                        AbxrLibSend.EventAssessmentComplete(queuedEvent.eventName, queuedEvent.score!, queuedEvent.status!, this.convertToAbxrDictStrings(queuedEvent.meta)).catch(error => {
                            if (this.enableDebug) {
                                console.error('AbxrLib: Failed to send queued assessment complete event:', error);
                            }
                        });
                        break;
                    
                    case AbxrQueuedEventType.ObjectiveStart:
                        AbxrLibSend.EventObjectiveStart(queuedEvent.eventName, this.convertToAbxrDictStrings(queuedEvent.meta)).catch(error => {
                            if (this.enableDebug) {
                                console.error('AbxrLib: Failed to send queued objective start event:', error);
                            }
                        });
                        break;
                    
                    case AbxrQueuedEventType.ObjectiveComplete:
                        AbxrLibSend.EventObjectiveComplete(queuedEvent.eventName, queuedEvent.score!, queuedEvent.status!, this.convertToAbxrDictStrings(queuedEvent.meta)).catch(error => {
                            if (this.enableDebug) {
                                console.error('AbxrLib: Failed to send queued objective complete event:', error);
                            }
                        });
                        break;
                    
                    case AbxrQueuedEventType.InteractionStart:
                        AbxrLibSend.EventInteractionStart(queuedEvent.eventName, this.convertToAbxrDictStrings(queuedEvent.meta)).catch(error => {
                            if (this.enableDebug) {
                                console.error('AbxrLib: Failed to send queued interaction start event:', error);
                            }
                        });
                        break;
                    
                    case AbxrQueuedEventType.InteractionComplete:
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

    // ===== COMPATIBILITY METHODS =====
    // These methods provide compatibility for migrating from other analytics SDKs
    // They are organized at the end of the class to keep the main API clean

    /**
     * @region Mixpanel Compatibility Methods
     * Equal to code in AbxrCompatibility.cs, but for WebXR
     */
    
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

    /**
     * @region Cognitive3D Compatibility Methods
     * Equal to code in AbxrCompatibility.cs, but for WebXR
     */
    
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
     * @region Quit Handler
     * Equal to code in ApplicationQuitHandler.cs, but for WebXR
     */

    // Quit handler state
    private static quitHandlerEnabled: boolean = false;  // Disabled by default for WebXR

    /**
     * Enable application quit detection for single-page WebXR applications
     * WARNING: Do NOT use this for multi-page WebXR apps as it will incorrectly close events on navigation
     * For multi-page apps, use manual event management or implement custom persistence
     * @param enablePersistence If true, running events will be saved to localStorage and restored on page load
     */
    static EnableQuitHandler(enablePersistence: boolean = true): void {
        if (typeof window === 'undefined') {
            console.warn('AbxrLib: EnableQuitHandler called in non-browser environment');
            return;
        }

        if (this.quitHandlerEnabled) {
            console.warn('AbxrLib: Quit handler already enabled');
            return;
        }

        console.log('AbxrLib: Enabling quit handler' + (enablePersistence ? ' with persistence' : ''));
        this.quitHandlerEnabled = true;

        if (enablePersistence) {
            // Check if we should restore or clear zombie events
            this.handlePersistenceOnLoad();
        }

        // More conservative approach - only handle events that likely indicate app close
        // NOT beforeunload/unload which fire on navigation
        
        // Handle visibility change with timeout (user might come back)
        let visibilityTimeout: NodeJS.Timeout | null = null;
        let pageHiddenTime: number | null = null;
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                pageHiddenTime = Date.now();
                //console.log('AbxrLib: Page hidden, starting quit detection timeout');
                // Start a timeout - if page stays hidden for 3 hours, consider it closed
                visibilityTimeout = setTimeout(() => {
                    console.log('AbxrLib: Page hidden for 3 hours, closing running events');
                    if (enablePersistence) {
                        this.saveRunningEventsToStorage();
                    }
                    this.closeRunningEvents();
                }, 10800000); // 3 hours = 3 * 60 * 60 * 1000 milliseconds
            } else {
                // Page became visible again, cancel the timeout
                if (visibilityTimeout) {
                    if (pageHiddenTime) {
                        const hiddenDuration = Date.now() - pageHiddenTime;
                        const seconds = Math.round(hiddenDuration / 1000);
                        const minutes = Math.floor(seconds / 60);
                        const hours = Math.floor(minutes / 60);
                        
                        let durationText = '';
                        if (hours > 0) {
                            durationText = `${hours}h ${minutes % 60}m ${seconds % 60}s`;
                        } else if (minutes > 0) {
                            durationText = `${minutes}m ${seconds % 60}s`;
                        } else {
                            durationText = `${seconds}s`;
                        }
                        
                        console.log(`AbxrLib: Page visible again after ${durationText}, canceling quit detection`);
                        pageHiddenTime = null;
                    } else {
                        console.log('AbxrLib: Page visible again, canceling quit detection');
                    }
                    clearTimeout(visibilityTimeout);
                    visibilityTimeout = null;
                }
            }
        });

        // Handle page freeze (mobile browsers when app goes to background)
        document.addEventListener('freeze', () => {
            console.log('AbxrLib: Page frozen, saving running events');
            if (enablePersistence) {
                this.saveRunningEventsToStorage();
            }
        });

        // Handle page resume (mobile browsers when app comes back to foreground)
        document.addEventListener('resume', () => {
            console.log('AbxrLib: Page resumed');
            if (enablePersistence) {
                this.restoreRunningEventsFromStorage();
            }
        });

        // Handle beforeunload - try to complete events properly
        window.addEventListener('beforeunload', (event) => {
            const runningCount = this.getRunningEventsCount();
            if (runningCount > 0) {
                console.log(`AbxrLib: Page unloading with ${runningCount} running events - attempting to complete them`);
                
                // Try to complete events immediately (synchronous)
                this.closeRunningEvents();
                
                // Also save to persistence as backup
                if (enablePersistence) {
                    this.saveRunningEventsToStorage();
                }
            }
        });
    }

    /**
     * Disable the quit handler (for debugging or manual control)
     */
    static DisableQuitHandler(): void {
        this.quitHandlerEnabled = false;
        console.log('AbxrLib: Quit handler disabled');
    }

    /**
     * Check if quit handler is enabled
     */
    static IsQuitHandlerEnabled(): boolean {
        return this.quitHandlerEnabled;
    }

    /**
     * @region Persistence & Storage
     * WebXR only supports localStorage for persistence
     */

    /**
     * Get count of currently running events
     * @private
     */
    private static getRunningEventsCount(): number {
        try {
            const assessmentTimes = AbxrEvent.m_dictAssessmentStartTimes;
            const objectiveTimes = AbxrEvent.m_dictObjectiveStartTimes;
            const interactionTimes = AbxrEvent.m_dictInteractionStartTimes;

            const assessmentCount = assessmentTimes ? assessmentTimes.size : 0;
            const objectiveCount = objectiveTimes ? objectiveTimes.size : 0;
            const interactionCount = interactionTimes ? interactionTimes.size : 0;
            
            return assessmentCount + objectiveCount + interactionCount;
        } catch (error) {
            console.warn('AbxrLib: Error counting running events:', error);
            return 0;
        }
    }

    /**
     * Save running events to localStorage for persistence across page navigation
     * @private
     */
    private static saveRunningEventsToStorage(): void {
        try {
            const runningEvents = {
                assessments: Array.from(AbxrEvent.m_dictAssessmentStartTimes.entries()).map(([name, time]) => ({
                    name,
                    startTime: time.ToInt64()
                })),
                objectives: Array.from(AbxrEvent.m_dictObjectiveStartTimes.entries()).map(([name, time]) => ({
                    name,
                    startTime: time.ToInt64()
                })),
                interactions: Array.from(AbxrEvent.m_dictInteractionStartTimes.entries()).map(([name, time]) => ({
                    name,
                    startTime: time.ToInt64()
                })),
                savedAt: Date.now()
            };

            localStorage.setItem(this.RUNNING_EVENTS_KEY, JSON.stringify(runningEvents));
            console.log(`AbxrLib: Saved ${this.getRunningEventsCount()} running events to storage`);
        } catch (error) {
            console.warn('AbxrLib: Error saving running events to storage:', error);
        }
    }

    /**
     * Handle persistence on page load - restore valid events or clear zombies
     * @private
     */
    private static handlePersistenceOnLoad(): void {
        // Delay this check to allow authentication to attempt first
        setTimeout(() => {
            if (this.connectionActive) {
                // Authentication successful - restore any valid events
                this.restoreRunningEventsFromStorage();
            } else {
                // Authentication failed/invalid - clear any zombie events
                this.clearZombieEvents();
            }
        }, 2000); // Wait 2 seconds for auth to complete
    }

    /**
     * Clear zombie events when authentication is invalid
     * @private
     */
    private static clearZombieEvents(): void {
        try {
            const stored = localStorage.getItem(this.RUNNING_EVENTS_KEY);
            if (stored) {
                console.log('AbxrLib: Authentication invalid but stored events found - clearing zombie events');
                localStorage.removeItem(this.RUNNING_EVENTS_KEY);
            }
        } catch (error) {
            console.warn('AbxrLib: Error clearing zombie events:', error);
        }
    }

    /**
     * Restore running events from localStorage after page navigation
     * @private
     */
    private static restoreRunningEventsFromStorage(): void {
        try {
            const stored = localStorage.getItem(this.RUNNING_EVENTS_KEY);
            if (!stored) return;

            const runningEvents = JSON.parse(stored);
            
            let restoredCount = 0;

            // Restore assessments
            if (runningEvents.assessments) {
                runningEvents.assessments.forEach((event: any) => {
                    const startTime = new DateTime().FromInt64(event.startTime);
                    AbxrEvent.m_dictAssessmentStartTimes.set(event.name, startTime);
                    restoredCount++;
                });
            }

            // Restore objectives
            if (runningEvents.objectives) {
                runningEvents.objectives.forEach((event: any) => {
                    const startTime = new DateTime().FromInt64(event.startTime);
                    AbxrEvent.m_dictObjectiveStartTimes.set(event.name, startTime);
                    restoredCount++;
                });
            }

            // Restore interactions
            if (runningEvents.interactions) {
                runningEvents.interactions.forEach((event: any) => {
                    const startTime = new DateTime().FromInt64(event.startTime);
                    AbxrEvent.m_dictInteractionStartTimes.set(event.name, startTime);
                    restoredCount++;
                });
            }

            if (restoredCount > 0) {
                console.log(`AbxrLib: Restored ${restoredCount} running events from storage`);
            }

            // Clear the stored events since they've been restored
            localStorage.removeItem(this.RUNNING_EVENTS_KEY);
        } catch (error) {
            console.warn('AbxrLib: Error restoring running events from storage:', error);
            // Clear potentially corrupted data
            localStorage.removeItem(this.RUNNING_EVENTS_KEY);
        }
    }

    /**
     * Manually save current running events to storage (for developer use)
     */
    static SaveRunningEventsToStorage(): void {
        if (!this.quitHandlerEnabled) {
            console.warn('AbxrLib: SaveRunningEventsToStorage called but quit handler not enabled');
            return;
        }
        this.saveRunningEventsToStorage();
    }

    /**
     * Manually restore running events from storage (for developer use) 
     */
    static RestoreRunningEventsFromStorage(): void {
        if (!this.quitHandlerEnabled) {
            console.warn('AbxrLib: RestoreRunningEventsFromStorage called but quit handler not enabled');
            return;
        }
        this.restoreRunningEventsFromStorage();
    }

    /**
     * Clear any stored running events from localStorage without restoring them
     * Useful when you want to abandon previously saved events
     */
    static ClearStoredRunningEvents(): void {
        try {
            localStorage.removeItem(this.RUNNING_EVENTS_KEY);
            console.log('AbxrLib: Cleared stored running events from localStorage');
        } catch (error) {
            console.warn('AbxrLib: Error clearing stored running events:', error);
        }
    }

    /**
     * Clear currently running events and complete them as abandoned
     * Use this when you want to clean up "zombie" events
     */
    static CompleteAllRunningEventsAsAbandoned(): void {
        const totalRunning = this.getRunningEventsCount();
        if (totalRunning === 0) {
            console.log('AbxrLib: No running events to complete');
            return;
        }

        console.log(`AbxrLib: Completing ${totalRunning} running events as abandoned`);
        
        try {
            const assessmentTimes = AbxrEvent.m_dictAssessmentStartTimes;
            const objectiveTimes = AbxrEvent.m_dictObjectiveStartTimes;
            const interactionTimes = AbxrEvent.m_dictInteractionStartTimes;

            // Complete running Interactions as abandoned
            if (interactionTimes && interactionTimes.size > 0) {
                const interactionNames = Array.from(interactionTimes.keys());
                interactionNames.forEach(interactionName => {
                    this.EventInteractionComplete(interactionName, InteractionType.eNull, 'abandoned', {
                        abandon_reason: 'manually_abandoned',
                        auto_completed: 'true'
                    }).catch(error => console.warn('AbxrLib: Failed to complete abandoned interaction:', error));
                });
            }

            // Complete running Objectives as abandoned
            if (objectiveTimes && objectiveTimes.size > 0) {
                const objectiveNames = Array.from(objectiveTimes.keys());
                objectiveNames.forEach(objectiveName => {
                    this.EventObjectiveComplete(objectiveName, 0, EventStatus.eIncomplete, {
                        abandon_reason: 'manually_abandoned',
                        auto_completed: 'true'
                    }).catch(error => console.warn('AbxrLib: Failed to complete abandoned objective:', error));
                });
            }

            // Complete running Assessments as abandoned
            if (assessmentTimes && assessmentTimes.size > 0) {
                const assessmentNames = Array.from(assessmentTimes.keys());
                assessmentNames.forEach(assessmentName => {
                    this.EventAssessmentComplete(assessmentName, 0, EventStatus.eFail, {
                        abandon_reason: 'manually_abandoned',
                        auto_completed: 'true'
                    }).catch(error => console.warn('AbxrLib: Failed to complete abandoned assessment:', error));
                });
            }

            // Also clear any stored events
            this.ClearStoredRunningEvents();
            
        } catch (error) {
            console.error('AbxrLib: Error completing abandoned events:', error);
        }
    }

    /**
     * Get count of currently running events (public method for monitoring)
     */
    static GetRunningEventsCount(): number {
        return this.getRunningEventsCount();
    }

    /**
     * Automatically complete all running Assessments, Objectives, and Interactions
     * Used when the page is being unloaded to ensure data integrity
     * @private
     */
    private static closeRunningEvents(): void {
        try {
            const assessmentTimes = AbxrEvent.m_dictAssessmentStartTimes;
            const objectiveTimes = AbxrEvent.m_dictObjectiveStartTimes;
            const interactionTimes = AbxrEvent.m_dictInteractionStartTimes;

            let totalClosed = 0;

            // Close running Assessments - try synchronous completion first
            if (assessmentTimes && assessmentTimes.size > 0) {
                const assessmentNames = Array.from(assessmentTimes.keys());
                assessmentNames.forEach(assessmentName => {
                    try {
                        // For beforeunload, try to send synchronously using sendBeacon or fetch with keepalive
                        this.sendEventSync('assessment_complete', {
                            name: assessmentName,
                            score: 0,
                            status: EventStatus.eIncomplete,
                            quit_reason: 'page_unload',
                            auto_closed: 'true'
                        });
                        totalClosed++;
                    } catch (error) {
                        // Fallback to async if sync fails
                        try {
                            Abxr.EventAssessmentComplete(assessmentName, 0, EventStatus.eIncomplete, {
                                quit_reason: 'page_unload',
                                auto_closed: 'true'
                            }).catch(() => {});
                            totalClosed++;
                        } catch (asyncError) {
                            // Silent fail during page unload
                        }
                    }
                });
            }

            // Close running Objectives  
            if (objectiveTimes && objectiveTimes.size > 0) {
                const objectiveNames = Array.from(objectiveTimes.keys());
                objectiveNames.forEach(objectiveName => {
                    try {
                        this.sendEventSync('objective_complete', {
                            name: objectiveName,
                            score: 0,
                            status: EventStatus.eIncomplete,
                            quit_reason: 'page_unload',
                            auto_closed: 'true'
                        });
                        totalClosed++;
                    } catch (error) {
                        try {
                            Abxr.EventObjectiveComplete(objectiveName, 0, EventStatus.eIncomplete, {
                                quit_reason: 'page_unload',
                                auto_closed: 'true'
                            }).catch(() => {});
                            totalClosed++;
                        } catch (asyncError) {}
                    }
                });
            }

            // Close running Interactions
            if (interactionTimes && interactionTimes.size > 0) {
                const interactionNames = Array.from(interactionTimes.keys());
                interactionNames.forEach(interactionName => {
                    try {
                        this.sendEventSync('interaction_complete', {
                            name: interactionName,
                            interactionType: InteractionType.eNull,
                            response: 'incomplete_quit',
                            quit_reason: 'page_unload',
                            auto_closed: 'true'
                        });
                        totalClosed++;
                    } catch (error) {
                        try {
                            Abxr.EventInteractionComplete(interactionName, InteractionType.eNull, 'incomplete_quit', {
                                quit_reason: 'page_unload',
                                auto_closed: 'true'
                            }).catch(() => {});
                            totalClosed++;
                        } catch (asyncError) {}
                    }
                });
            }

            if (totalClosed > 0) {
                console.log(`AbxrLib: Automatically closed ${totalClosed} running events due to page unload`);
            }
        } catch (error) {
            // Silent fail - we're in page unload, don't interfere with the process
            console.warn('AbxrLib: Error during quit handler cleanup:', error);
        }
    }

    /**
     * Send event synchronously during page unload using sendBeacon
     * Attempts to use the normal event system but synchronously
     * @private
     */
    private static sendEventSync(eventType: string, eventData: any): void {
        try {
            // Just call the normal event methods but don't wait for promises
            // The event batching system should handle the actual sending
            switch (eventType) {
                case 'assessment_complete':
                    // Fire and forget - don't await
                    this.EventAssessmentComplete(eventData.name, eventData.score, eventData.status, {
                        quit_reason: eventData.quit_reason,
                        auto_closed: eventData.auto_closed
                    }).catch(() => {});
                    break;
                    
                case 'objective_complete':
                    this.EventObjectiveComplete(eventData.name, eventData.score, eventData.status, {
                        quit_reason: eventData.quit_reason,
                        auto_closed: eventData.auto_closed
                    }).catch(() => {});
                    break;
                    
                case 'interaction_complete':
                    this.EventInteractionComplete(eventData.name, eventData.interactionType, eventData.response, {
                        quit_reason: eventData.quit_reason,
                        auto_closed: eventData.auto_closed
                    }).catch(() => {});
                    break;
            }
            
            // Also try to force immediate send of batched events if possible
            // This might help get events out before page unload
            this.forceSendBatchedEvents().catch(() => {});
            
        } catch (error) {
            // Silent fail during page unload
        }
    }

    /**
     * Attempt to force immediate sending of any batched events
     * @private
     */
    private static async forceSendBatchedEvents(): Promise<void> {
        try {
            // Try to trigger immediate sending of batched events
            // Use the Analytics system to flush pending events
            await AbxrLibAnalytics.ForceSendUnsent();
        } catch (error) {
            // Silent fail - this is called during page unload
        }
    }

    /**
     * Log information about currently running events without closing them
     * Used for debugging and monitoring purposes
     * @private
     */
    private static DebugLogRunningEvents(): void {
        try {
            const assessmentTimes = AbxrEvent.m_dictAssessmentStartTimes;
            const objectiveTimes = AbxrEvent.m_dictObjectiveStartTimes;
            const interactionTimes = AbxrEvent.m_dictInteractionStartTimes;

            const assessmentCount = assessmentTimes ? assessmentTimes.size : 0;
            const objectiveCount = objectiveTimes ? objectiveTimes.size : 0;
            const interactionCount = interactionTimes ? interactionTimes.size : 0;
            const totalRunning = assessmentCount + objectiveCount + interactionCount;

            if (totalRunning > 0) {
                console.log(`AbxrLib: Currently ${totalRunning} events running (Assessments: ${assessmentCount}, Objectives: ${objectiveCount}, Interactions: ${interactionCount})`);
            }
        } catch (error) {
            console.warn('AbxrLib: Error logging running events:', error);
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
    
    // Expose prefixed versions of all enums
    (window as any).AbxrLogLevel = LogLevel;
    (window as any).AbxrPartner = Partner;
    (window as any).AbxrEventStatus = EventStatus;
    (window as any).AbxrInteractionType = InteractionType;
    (window as any).AbxrAbxr.StorageScope = Abxr.StorageScope;
    (window as any).AbxrAbxr.StoragePolicy = Abxr.StoragePolicy;
    console.log('AbxrLib: Loaded into global scope. Use Abxr for simple API or AbxrLib for advanced features.');
}

// Global function for easy access
export function Abxr_init(appId: string, orgId?: string, authSecret?: string, appConfig?: string, dialogOptions?: AbxrAuthMechanismDialogOptions, authMechanismCallback?: AbxrAuthMechanismCallback): void {
    
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
    const finalOrgId = AbxrGetParameter('abxr_orgid', orgId);
    const finalAuthSecret = AbxrGetParameter('abxr_auth_secret', authSecret);
    
    // Generate or retrieve device ID
    const deviceId = AbxrGetOrCreateDeviceId();
    
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
                    AbxrLibInit.set_LibVersion(AbxrGetPackageVersion());
                    
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
                    AbxrLibInit.set_LibVersion(AbxrGetPackageVersion());
                    
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
                            const moduleTargets = Abxr.ExtractModuleTargets(authResponseData?.modules || []);
                            
                            Abxr.NotifyAuthCompleted(true, false, moduleTargets);
                        }
                    } else {
                        // Try to get detailed error message from AbxrLibClient
                        const detailedError = AbxrLibClient.getLastAuthError();
                        const errorMessage = detailedError || `Authentication failed with code ${result}`;
                        
                        // Check if this looks like a CORS/redirect error and try version fallback
                        if (AbxrShouldTryVersionFallback(errorMessage)) {
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

