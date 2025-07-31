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
    customCallback?: AuthMechanismCallback;  // Custom callback to use instead
    dialogStyle?: Partial<CSSStyleDeclaration>; // Custom dialog styling
    overlayStyle?: Partial<CSSStyleDeclaration>; // Custom overlay styling
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
    private static dialogOptions: AuthMechanismDialogOptions = { enabled: true };
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
    
    // Create built-in authentication dialog (browser-only)
    private static createAuthDialog(): void {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return; // Not in browser environment
        }
        
        // Check if dialog already exists
        if (document.getElementById('abxr-auth-dialog')) {
            return;
        }
        
        // Create dialog HTML
        const dialogHTML = `
            <div id="abxr-auth-dialog" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000;">
                <div id="abxr-auth-dialog-content" style="background: white; margin: 15% auto; padding: 30px; border-radius: 10px; width: 400px; max-width: 90%; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
                    <h2 id="abxr-auth-title" style="color: #333; margin-top: 0;">Additional Authentication Required</h2>
                    <p id="abxr-auth-prompt" style="color: #666; margin: 15px 0;">Please enter the required authentication information:</p>
                    <div id="abxr-auth-error" style="display: none; color: #dc3545; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 10px; margin: 10px 0; font-size: 14px;"></div>
                    <div id="abxr-auth-input-container" style="display: flex; align-items: center; justify-content: center; margin: 15px 0;">
                        <input type="text" id="abxr-auth-input" style="padding: 12px; border: 2px solid #ddd; border-radius: 5px; font-size: 16px; box-sizing: border-box; flex: 1;" placeholder="Enter value..." />
                        <span id="abxr-auth-domain" style="margin-left: 5px; font-size: 16px; color: #666; display: none;"></span>
                    </div>
                    <div style="margin-top: 20px;">
                        <button id="abxr-auth-submit" style="padding: 12px 25px; margin: 0 10px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; background-color: #007bff; color: white;">Submit</button>
                        <button id="abxr-auth-cancel" style="padding: 12px 25px; margin: 0 10px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; background-color: #6c757d; color: white;">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
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
        
        // Create dialog if it doesn't exist
        this.createAuthDialog();
        
        const dialog = document.getElementById('abxr-auth-dialog');
        const title = document.getElementById('abxr-auth-title');
        const prompt = document.getElementById('abxr-auth-prompt');
        const input = document.getElementById('abxr-auth-input') as HTMLInputElement;
        const domainSpan = document.getElementById('abxr-auth-domain');
        const inputContainer = document.getElementById('abxr-auth-input-container');
        
        if (!dialog || !title || !prompt || !input) {
            console.error('AbxrLib: Auth dialog elements not found');
            return;
        }
        
        // Configure dialog based on auth type
        let promptText = authData.prompt || 'Please enter the required authentication information:';
        let inputType = 'text';
        let placeholder = 'Enter value...';
        
        if (authData.type === 'assessmentPin') {
            inputType = 'password';
            placeholder = 'Enter PIN...';
            title.textContent = 'PIN Required';
        } else if (authData.type === 'email') {
            inputType = 'email';
            placeholder = 'Enter email username';
            title.textContent = 'Email Authentication Required';
        } else {
            title.textContent = 'Authentication Required';
        }
        
        // Set dialog content
        prompt.textContent = promptText;
        input.type = inputType;
        input.placeholder = placeholder;
        input.value = '';
        this.hideAuthError();
        
        // Handle email domain display
        if (authData.type === 'email' && authData.domain && domainSpan && inputContainer) {
            domainSpan.textContent = '@' + authData.domain;
            domainSpan.style.display = 'inline';
            input.style.width = 'auto';
            input.style.flex = '1';
            inputContainer.style.width = '100%';
        } else if (domainSpan && inputContainer) {
            domainSpan.style.display = 'none';
            input.style.width = '100%';
            input.style.flex = 'none';
            inputContainer.style.width = '100%';
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
        
        console.log('AbxrLib: Using built-in authentication dialog for:', authData.type);
        this.showAuthDialog(authData);
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
