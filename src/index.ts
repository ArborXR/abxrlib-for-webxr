import { AbxrLibInit } from "./AbxrLibAnalytics";
import { AbxrLibStorage } from "./AbxrLibStorage";
import { AbxrLibAsync } from "./AbxrLibAsync";
import { AbxrLibSend } from "./AbxrLibSend";
import { AbxrLibClient } from "./AbxrLibClient";
import { AbxrLibAnalytics } from "./AbxrLibAnalytics";
import { ConfigurationManager, DateTime, AbxrResult, AbxrDictStrings, StringList, TimeSpan, InteractionType, ResultOptions } from './network/utils/DotNetishTypes';
import { AbxrBase, AbxrEvent, AbxrLog, AbxrStorage, AbxrTelemetry, AbxrAIProxy, LogLevel } from "./AbxrLibCoreModel";
import { Partner } from "./AbxrLibClient";
// Import dialog templates
import { getHTMLDialogTemplate, AuthDialogData as HTMLAuthDialogData } from './templates/HTMLAuthDialog';
import { getXRDialogTemplate, getXRDialogStyles, XRDialogConfig, XRVirtualKeyboard } from './templates/XRAuthDialog';


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

// Utility function to get URL parameters
function getUrlParameter(name: string): string | null {
    if (typeof window === 'undefined') return null;
    
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
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
        console.log(`AbxrLib: Using ${customConfig ? 'user-defined' : 'default'} config`);
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
    LogLevel,
    Partner,
    InteractionType,
    ResultOptions
};

// Types for authMechanism notification
export interface AuthMechanismData {
    type: string;
    prompt?: string;
    domain?: string;
    [key: string]: any; // Allow for additional properties
}

export type AuthMechanismCallback = (data: AuthMechanismData) => void;

// Configuration options for built-in browser dialog
export interface AuthMechanismDialogOptions {
    enabled?: boolean;           // Enable built-in dialog (default: true for browser environments)
    type?: 'html' | 'xr' | 'auto'; // Dialog type: 'html' for DOM, 'xr' for WebXR, 'auto' for auto-detect
    customCallback?: AuthMechanismCallback;  // Custom callback to use instead
    dialogStyle?: Partial<CSSStyleDeclaration>; // Custom dialog styling (HTML dialog only)
    overlayStyle?: Partial<CSSStyleDeclaration>; // Custom overlay styling (HTML dialog only)
    xrFallback?: boolean;        // Use HTML fallback if XR dialog fails (default: true)
}

// Global Abxr class that gets configured by Abxr_init()
export class Abxr {
    private static enableDebug: boolean = false;
    private static isAuthenticated: boolean = false;
    private static requiresFinalAuth: boolean = false;
    private static appConfig: string = '';
    private static authParams: {
        appId?: string;
        orgId?: string;
        authSecret?: string;
    } = {};
    private static authMechanismCallback: AuthMechanismCallback | null = null;
    private static dialogOptions: AuthMechanismDialogOptions = { 
        enabled: true, 
        type: 'auto',
        xrFallback: true 
    };
    private static currentAuthData: AuthMechanismData | null = null;
    
    // Expose commonly used types and enums for easy access
    static readonly ResultOptions = ResultOptions;
    static readonly InteractionType = InteractionType;
    static readonly LogLevel = LogLevel;
    static readonly Partner = Partner;
    static readonly AbxrDictStrings = AbxrDictStrings;
    
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
        event.Construct(name, meta || new AbxrDictStrings());
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
        const dictMeta = meta || new AbxrDictStrings();
        return await AbxrLibSend.EventAssessmentStart(assessmentName, dictMeta);
    }
    
    static async EventAssessmentComplete(assessmentName: string, score: string, resultOptions: ResultOptions, meta?: any): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Assessment complete event not sent - not authenticated');
            }
            return 0;
        }
        const dictMeta = meta || new AbxrDictStrings();
        return await AbxrLibSend.EventAssessmentComplete(assessmentName, score, resultOptions, dictMeta);
    }
    
    // Objective Events
    static async EventObjectiveStart(objectiveName: string, meta?: any): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Objective start event not sent - not authenticated');
            }
            return 0;
        }
        const dictMeta = meta || new AbxrDictStrings();
        return await AbxrLibSend.EventObjectiveStart(objectiveName, dictMeta);
    }
    
    static async EventObjectiveComplete(objectiveName: string, score: string, resultOptions: ResultOptions, meta?: any): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Objective complete event not sent - not authenticated');
            }
            return 0;
        }
        const dictMeta = meta || new AbxrDictStrings();
        return await AbxrLibSend.EventObjectiveComplete(objectiveName, score, resultOptions, dictMeta);
    }
    
    // Interaction Events
    static async EventInteractionStart(interactionName: string, meta?: any): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Interaction start event not sent - not authenticated');
            }
            return 0;
        }
        const dictMeta = meta || new AbxrDictStrings();
        return await AbxrLibSend.EventInteractionStart(interactionName, dictMeta);
    }
    
    static async EventInteractionComplete(interactionName: string, result: string, resultDetails: string, interactionType: InteractionType, meta?: any): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Interaction complete event not sent - not authenticated');
            }
            return 0;
        }
        const dictMeta = meta || new AbxrDictStrings();
        return await AbxrLibSend.EventInteractionComplete(interactionName, result, resultDetails, interactionType, dictMeta);
    }
    
    // Level Events
    static async EventLevelStart(levelName: string, meta?: any): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Level start event not sent - not authenticated');
            }
            return 0;
        }
        const dictMeta = meta || new AbxrDictStrings();
        return await AbxrLibSend.EventLevelStart(levelName, dictMeta);
    }
    
    static async EventLevelComplete(levelName: string, score: string, meta?: any): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Level complete event not sent - not authenticated');
            }
            return 0;
        }
        const dictMeta = meta || new AbxrDictStrings();
        return await AbxrLibSend.EventLevelComplete(levelName, score, dictMeta);
    }
    
    static async LogDebug(message: string): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Log not sent - not authenticated');
            }
            return 0;
        }
        const log = new AbxrLog();
        log.Construct(LogLevel.eDebug, message, new AbxrDictStrings());
        return await AbxrLibSend.AddLog(log);
    }
    
    static async LogInfo(message: string): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Log not sent - not authenticated');
            }
            return 0;
        }
        const log = new AbxrLog();
        log.Construct(LogLevel.eInfo, message, new AbxrDictStrings());
        return await AbxrLibSend.AddLog(log);
    }
    
    static async LogWarn(message: string): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Log not sent - not authenticated');
            }
            return 0;
        }
        const log = new AbxrLog();
        log.Construct(LogLevel.eWarn, message, new AbxrDictStrings());
        return await AbxrLibSend.AddLog(log);
    }
    
    static async LogError(message: string): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Log not sent - not authenticated');
            }
            return 0;
        }
        const log = new AbxrLog();
        log.Construct(LogLevel.eError, message, new AbxrDictStrings());
        return await AbxrLibSend.AddLog(log);
    }
    
    static async LogCritical(message: string): Promise<number> {
        if (!this.isAuthenticated) {
            if (this.enableDebug) {
                console.log('AbxrLib: Log not sent - not authenticated');
            }
            return 0;
        }
        const log = new AbxrLog();
        log.Construct(LogLevel.eCritical, message, new AbxrDictStrings());
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
    static setAuthenticated(authenticated: boolean): void {
        this.isAuthenticated = authenticated;
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
    
    // AuthMechanism callback methods
    static setAuthMechanismCallback(callback: AuthMechanismCallback | null): void {
        this.authMechanismCallback = callback;
    }
    
    static getAuthMechanismCallback(): AuthMechanismCallback | null {
        return this.authMechanismCallback;
    }
    
    // Configure built-in dialog options
    static setDialogOptions(options: AuthMechanismDialogOptions): void {
        this.dialogOptions = { ...this.dialogOptions, ...options };
    }
    
    static getDialogOptions(): AuthMechanismDialogOptions {
        return { ...this.dialogOptions };
    }
    
    // Create built-in authentication dialog using template
    private static createAuthDialog(authData: AuthMechanismData): void {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return; // Not in browser environment
        }
        
        // Check if dialog already exists
        if (document.getElementById('abxr-auth-dialog')) {
            return;
        }
        
        // Generate dialog HTML from template
        const dialogHTML = getHTMLDialogTemplate(authData);
        
        // Insert dialog into DOM
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
        
        // Apply custom styling if provided
        const dialog = document.getElementById('abxr-auth-dialog');
        const content = document.getElementById('abxr-auth-dialog-content');
        
        if (this.dialogOptions.overlayStyle && dialog) {
            Object.assign(dialog.style, this.dialogOptions.overlayStyle);
        }
        
        if (this.dialogOptions.dialogStyle && content) {
            Object.assign(content.style, this.dialogOptions.dialogStyle);
        }
        
        // Add event listeners
        this.setupDialogEventListeners();
    }
    
    // Setup event listeners for dialog
    private static setupDialogEventListeners(): void {
        if (typeof document === 'undefined') return;
        
        const submitBtn = document.getElementById('abxr-auth-submit');
        const cancelBtn = document.getElementById('abxr-auth-cancel');
        const input = document.getElementById('abxr-auth-input') as HTMLInputElement;
        
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.handleDialogSubmit());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideAuthDialog());
        }
        
        if (input) {
            // Handle Enter key
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleDialogSubmit();
                }
            });
            
            // Clear error on input
            input.addEventListener('input', () => this.hideAuthError());
        }
    }
    
    // Show authentication dialog with data
    private static showAuthDialog(authData: AuthMechanismData): void {
        if (typeof document === 'undefined') return;
        
        this.currentAuthData = authData;
        
        // Create dialog with authData (template handles all configuration)
        this.createAuthDialog(authData);
        
        const dialog = document.getElementById('abxr-auth-dialog');
        const input = document.getElementById('abxr-auth-input') as HTMLInputElement;
        const domainSpan = document.getElementById('abxr-auth-domain');
        
        if (!dialog || !input) {
            console.error('AbxrLib: Auth dialog elements not found');
            return;
        }
        
        // Clear any previous values and errors
        input.value = '';
        this.hideAuthError();
        
        // Handle email domain display (template creates the structure, we just show it)
        if (authData.type === 'email' && authData.domain && domainSpan) {
            domainSpan.style.display = 'inline';
        }
        
        // Show dialog and focus input
        dialog.style.display = 'block';
        input.focus();
    }
    
    // Hide authentication dialog
    private static hideAuthDialog(): void {
        if (typeof document === 'undefined') return;
        
        const dialog = document.getElementById('abxr-auth-dialog');
        if (dialog) {
            dialog.style.display = 'none';
        }
        
        this.currentAuthData = null;
    }
    
    // Show error in dialog
    private static showAuthError(message: string): void {
        if (typeof document === 'undefined') return;
        
        const errorDiv = document.getElementById('abxr-auth-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }
    
    // Hide error in dialog
    private static hideAuthError(): void {
        if (typeof document === 'undefined') return;
        
        const errorDiv = document.getElementById('abxr-auth-error');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }
    
    // Handle dialog form submission
    private static async handleDialogSubmit(): Promise<void> {
        if (typeof document === 'undefined' || !this.currentAuthData) return;
        
        const input = document.getElementById('abxr-auth-input') as HTMLInputElement;
        if (!input) return;
        
        const value = input.value.trim();
        if (!value) {
            this.showAuthError('Please enter a value');
            return;
        }
        
        try {
            // Format and submit authentication data
            const authData = this.formatAuthDataForSubmission(value, this.currentAuthData.type, this.currentAuthData.domain);
            
            console.log('AbxrLib: Submitting built-in dialog authentication:', authData);
            
            const success = await this.completeFinalAuth(authData);
            
            if (success) {
                this.hideAuthDialog();
                console.log('AbxrLib: Built-in dialog authentication successful - library ready to use');
            } else {
                const authTypeLabel = this.currentAuthData.type === 'email' ? 'email' : 
                                    this.currentAuthData.type === 'assessmentPin' ? 'PIN' : 'credentials';
                this.showAuthError(`Authentication failed. Please check your ${authTypeLabel} and try again.`);
                input.focus();
                input.select();
            }
        } catch (error: any) {
            console.error('AbxrLib: Built-in dialog authentication error:', error);
            this.showAuthError('Authentication error: ' + error.message);
        }
    }
    
    // Built-in authentication handler (browser-only)
    static builtInAuthMechanismHandler(authData: AuthMechanismData): void {
        if (typeof window === 'undefined') {
            console.warn('AbxrLib: Built-in dialog not available in non-browser environment');
            return;
        }
        
        const options = this.getDialogOptions();
        const dialogType = this.determineDialogType(options);
        
        console.log(`AbxrLib: Using built-in authentication dialog (${dialogType}) for:`, authData.type);
        
        if (dialogType === 'xr') {
            this.showXRDialog(authData);
        } else {
            this.showAuthDialog(authData);
        }
    }
    
    // Determine which dialog type to use based on environment and options
    private static determineDialogType(options: AuthMechanismDialogOptions): 'html' | 'xr' {
        if (options.type === 'html') return 'html';
        if (options.type === 'xr') return 'xr';
        
        // Auto-detect: use XR if WebXR is available and active, otherwise HTML
        if (options.type === 'auto' || !options.type) {
            return this.isXREnvironment() ? 'xr' : 'html';
        }
        
        return 'html';
    }
    
    // Detect if we're in an ACTIVE XR environment (not just XR-capable)
    private static isXREnvironment(): boolean {
        if (typeof window === 'undefined' || !('navigator' in window)) {
            return false;
        }
        
        try {
            // Only return true if we're actually IN an XR session, not just XR-capable
            
            // Check for active WebXR session
            if ('xr' in navigator && (navigator as any).xr) {
                // Note: This would need to be async in real implementation to check for active session
                // For now, we'll be conservative and return false unless explicitly XR
                
                // Check if we have clear indicators of being in XR
                const isInVR = !!(document as any).mozFullScreenElement || 
                              !!(document as any).webkitFullscreenElement ||
                              !!document.fullscreenElement;
                              
                const hasVRDisplay = !!(navigator as any).getVRDisplays;
                const hasActiveVRDisplay = hasVRDisplay && (window as any).VRDisplay;
                
                // Only return true if we have strong evidence of active XR
                return hasActiveVRDisplay && isInVR;
            }
            
            // For now, default to false to prefer HTML dialog
            // This ensures built-in dialog works as expected for regular web usage
            return false;
            
        } catch (error) {
            console.warn('AbxrLib: Error detecting XR environment:', error);
            return false;
        }
    }
    
    // Show XR authentication dialog
    private static showXRDialog(authData: AuthMechanismData): void {
        try {
            // Try to load and show XR dialog
            this.loadXRDialog(authData);
        } catch (error) {
            console.warn('AbxrLib: Failed to show XR dialog, falling back to HTML dialog:', error);
            const options = this.getDialogOptions();
            if (options.xrFallback !== false) {
                this.showAuthDialog(authData);
            } else {
                console.error('AbxrLib: XR dialog failed and fallback is disabled');
            }
        }
    }
    
    // Load and display XR dialog component
    private static async loadXRDialog(authData: AuthMechanismData): Promise<void> {
        // This will be implemented to dynamically load and render the XR dialog
        console.log('AbxrLib: Loading XR dialog for:', authData.type);
        
        // For now, we'll create a simple WebXR-aware interface
        // In a full implementation, this would render the React Three Fiber component
        
        // For now, use the XR-styled DOM fallback
        // Future: When React Three Fiber is properly integrated, this would dynamically
        // import and render the full 3D XR component from src/components/XRAuthDialog.tsx
        
        const handleSubmit = async (value: string) => {
            try {
                const formattedData = this.formatAuthDataForSubmission(value, authData.type, authData.domain);
                console.log('AbxrLib: Submitting XR dialog authentication:', formattedData);
                
                const success = await this.completeFinalAuth(formattedData);
                
                if (success) {
                    this.hideXRDialog();
                    console.log('AbxrLib: XR dialog authentication successful - library ready to use');
                } else {
                    const authTypeLabel = authData.type === 'email' ? 'email' : 
                                        authData.type === 'assessmentPin' ? 'PIN' : 'credentials';
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
        
        const handleCancel = () => {
            this.hideXRDialog();
            console.log('AbxrLib: XR authentication cancelled by user');
        };
        
        // Store current auth data for XR dialog
        this.currentAuthData = authData;
        
        // Use XR-styled DOM fallback (looks great, works everywhere)
        this.showXRDialogFallback(authData, handleSubmit, handleCancel);
    }
    
    // Show XR dialog using template
    private static showXRDialogFallback(
        authData: AuthMechanismData, 
        onSubmit: (value: string) => void, 
        onCancel: () => void
    ): void {
        // Add XR-style glow animation CSS
        const style = document.createElement('style');
        style.textContent = getXRDialogStyles();
        document.head.appendChild(style);
        
        // Generate XR dialog HTML from template (with virtual keyboard for XR environments)
        const dialogHTML = getXRDialogTemplate(authData, { showVirtualKeyboard: true });
        
        // Insert dialog into DOM
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
        
        // Get dialog elements
        const overlay = document.getElementById('abxrlib-xr-dialog-overlay');
        const input = document.querySelector('#abxrlib-xr-input') as HTMLInputElement;
        const submitBtn = document.querySelector('#abxrlib-xr-submit') as HTMLButtonElement;
        const cancelBtn = document.querySelector('#abxrlib-xr-cancel') as HTMLButtonElement;
        
        if (!overlay || !input || !submitBtn || !cancelBtn) {
            console.error('AbxrLib: XR dialog elements not found');
            return;
        }
        
        // Clear any existing error messages
        this.hideXRError();
        
        // Initialize virtual keyboard for XR environments
        const virtualKeyboard = new XRVirtualKeyboard(authData.type);
        virtualKeyboard.initialize(input);
        
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
        
        submitBtn.addEventListener('click', handleSubmitClick);
        cancelBtn.addEventListener('click', onCancel);
        
        // Handle Enter key
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleSubmitClick();
            } else if (e.key === 'Escape') {
                onCancel();
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
        
        if (virtualKeyboard) {
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
        } else if (authType === 'assessmentPin') {
            // For PIN type, use pin field
            authData.pin = inputValue;
        } else {
            // Default fallback - use the type as the field name
            authData[authType || 'value'] = inputValue;
        }
        
        return authData;
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
                console.log('AbxrLib: Final authentication successful');
                this.setAuthenticated(true);
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
        LogLevel,
        Partner,
        AbxrResult,
        Abxr
    };
    // Also expose the global function directly
    (window as any).Abxr_init = Abxr_init;
    console.log('AbxrLib: Loaded into global scope. Use Abxr for simple API or AbxrLib for advanced features.');
}

// Global function for easy access
export function Abxr_init(appId: string, orgId?: string, authSecret?: string, appConfig?: string, authMechanismCallback?: AuthMechanismCallback, dialogOptions?: AuthMechanismDialogOptions): void {
    
    // Validate required appId
    if (!appId) {
        console.error('AbxrLib: appId is required for initialization');
        return;
    }
    
    // Configure dialog options if provided
    if (dialogOptions) {
        Abxr.setDialogOptions(dialogOptions);
    }
    
    // Set up authMechanism handling
    if (authMechanismCallback) {
        // Use custom callback
        Abxr.setAuthMechanismCallback(authMechanismCallback);
    } else {
        // Determine if we should use built-in dialog
        const currentOptions = Abxr.getDialogOptions();
        const isBrowser = typeof window !== 'undefined';
        const shouldUseBuiltIn = currentOptions.enabled !== false && isBrowser;
        
        if (shouldUseBuiltIn) {
            console.log('AbxrLib: Built-in authentication dialog enabled for browser environment');
            Abxr.setAuthMechanismCallback((authData) => Abxr.builtInAuthMechanismHandler(authData));
        } else if (!isBrowser) {
            console.log('AbxrLib: Non-browser environment detected - built-in dialog disabled');
        }
    }
    
    // Try to get orgId and authSecret from URL parameters first, then fall back to function parameters
    const finalOrgId = getUrlParameter('abxr_orgid') || orgId || undefined;
    const finalAuthSecret = getUrlParameter('abxr_auth_secret') || authSecret || undefined;
    
    // Generate or retrieve device ID
    const deviceId = getOrCreateDeviceId();
    
    // Store auth parameters (without deviceId since it's handled internally)
    Abxr.setAuthParams({ appId, orgId: finalOrgId, authSecret: finalAuthSecret });
    
    // If we have all required authentication parameters, attempt to authenticate
    if (appId && finalOrgId && finalAuthSecret) {
        // Set default app config if none provided
        const defaultConfig = '<?xml version="1.0" encoding="utf-8" ?><configuration><appSettings><add key="REST_URL" value="https://lib-backend.xrdm.app/v1/"/></appSettings></configuration>';
        const configToUse = appConfig || defaultConfig;
        
        // Store app config
        Abxr.setAppConfig(configToUse);
        
        try {
            // Configure the library
            AbxrLibBaseSetup.SetAppConfig(configToUse);
            AbxrLibInit.InitStatics();
            AbxrLibInit.Start();
            
            // Attempt initial authentication
            AbxrLibInit.Authenticate(appId, finalOrgId, deviceId, finalAuthSecret, Partner.eArborXR)
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
                            console.log('AbxrLib: Additional authentication required (authMechanism detected)');
                            //console.log('AbxrLib: AuthMechanism data:', authMechanism);
                            
                            // Set the library to require final authentication
                            Abxr.setRequiresFinalAuth(true);
                            
                            // Extract structured authMechanism data
                            const authData = Abxr.extractAuthMechanismData();
                            if (authData) {
                                console.log('AbxrLib: AuthMechanism required:', authData);
                                
                                // Notify the client via callback if one is set
                                const callback = Abxr.getAuthMechanismCallback();
                                if (callback) {
                                    try {
                                        callback(authData);
                                    } catch (error) {
                                        console.error('AbxrLib: Error in authMechanism callback:', error);
                                    }
                                } else {
                                    console.log('AbxrLib: No authMechanism callback set - client should check getRequiresFinalAuth() and call extractAuthMechanismData()');
                                }
                            }
                        } else {
                            console.log('AbxrLib: Authentication complete - no additional auth required');
                            Abxr.setAuthenticated(true);
                        }
                    } else {
                        console.warn(`AbxrLib: Authentication failed with code ${result}`);
                    }
                })
                .catch((error: any) => {
                    console.error('AbxrLib: Authentication error:', error);
                });
        } catch (error: any) {
            console.error('AbxrLib: Configuration error:', error);
        }
    } else {
        console.warn('AbxrLib: Missing authentication parameters. Library will operate in debug mode.');
        if (!finalOrgId) {
            console.warn('AbxrLib: orgId not provided and not found in URL parameter "abxr_orgid"');
        }
        if (!finalAuthSecret) {
            console.warn('AbxrLib: authSecret not provided and not found in URL parameter "abxr_auth_secret"');
        }
    }
}
