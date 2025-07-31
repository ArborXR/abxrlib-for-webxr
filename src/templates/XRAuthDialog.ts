// XR Authentication Dialog Template
// Futuristic, XR-optimized HTML/CSS templates with purple/green brand colors

import { getXRVirtualKeyboardTemplate, XRVirtualKeyboard, defaultKeyboardConfig } from './XRVirtualKeyboard';

/**
 * Convert hex color to RGB values for rgba() usage
 */
function hexToRgb(hex: string): string {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse r, g, b values
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return `${r}, ${g}, ${b}`;
}

export interface AuthDialogData {
    type: string;
    prompt?: string;
    domain?: string;
    [key: string]: any;
}

export interface XRDialogOptions {
    showVirtualKeyboard?: boolean;  // Default: true for XR environments
    hideDialogButtons?: boolean;    // Hide Cancel/Submit buttons when virtual keyboard is shown
    customStyle?: XRDialogCustomStyle; // Custom styling options
}

export interface XRDialogCustomStyle {
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
}

/**
 * Generate XR-styled CSS animation styles
 */
export function getXRDialogStyles(): string {
    return `
        @keyframes abxrGlow {
            from { box-shadow: 0 0 30px rgba(90, 88, 235, 0.3); }
            to { box-shadow: 0 0 40px rgba(90, 88, 235, 0.6); }
        }
    `;
}

/**
 * Generate HTML template for the XR authentication dialog
 */
export function getXRDialogTemplate(authData: AuthDialogData, options: XRDialogOptions = { showVirtualKeyboard: true }): string {
    // Merge custom colors with defaults
    const defaultColors = {
        background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
        primary: '#5A58EB',
        success: '#05DA98',
        primaryRgba: 'rgba(90, 88, 235, 0.3)',
        inputBg: 'rgba(51, 51, 51, 0.8)',
        keyBg: '#333',
        keyText: '#ffffff',
        keyHover: 'rgba(90, 88, 235, 0.3)',
        keyActive: '#5A58EB'
    };
    
    const colors = {
        ...defaultColors,
        ...(options.customStyle?.colors || {}),
        // Convert primary color to rgba for glow effects
        primaryRgba: options.customStyle?.colors?.primary 
            ? `rgba(${hexToRgb(options.customStyle.colors.primary)}, 0.3)`
            : defaultColors.primaryRgba
    };

    const getTitle = () => {
        if (authData.prompt) return authData.prompt;
        if (authData.type === 'email') return 'XR Email Authentication';
        if (authData.type === 'assessmentPin' || authData.type === 'pin') return 'XR PIN Authentication';
        return 'XR Authentication Required';
    };

    const getInputType = () => {
        return (authData.type === 'assessmentPin' || authData.type === 'pin') ? 'password' : 'text';
    };

    const getPlaceholder = () => {
        if (authData.type === 'email') {
            return authData.domain ? 'Enter username' : 'Email address';
        } else if (authData.type === 'assessmentPin' || authData.type === 'pin') {
            return 'Enter PIN';
        }
        return 'Enter value';
    };

    return `
        <div id="abxrlib-xr-dialog-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: 'Arial', sans-serif;
            padding: 20px;
            box-sizing: border-box;
            overflow-y: auto;
        ">
            <div id="abxr-dialog-content" style="
                background: ${colors.background};
                color: #ffffff;
                padding: 30px;
                border-radius: 15px;
                border: 2px solid ${colors.primary};
                box-shadow: 0 0 30px ${colors.primaryRgba};
                max-width: 400px;
                width: 100%;
                text-align: center;
                animation: abxrGlow 2s ease-in-out infinite alternate;
                margin-bottom: ${options.showVirtualKeyboard ? '0' : '0'};
            ">
                <h2 style="margin: 0 0 20px 0; color: ${colors.primary}; text-shadow: 0 0 10px ${colors.primaryRgba};">
                    ${getTitle()}
                </h2>
                <div id="abxrlib-xr-error" style="
                    background: rgba(255, 68, 68, 0.2);
                    border: 1px solid #ff4444;
                    color: #ff6666;
                    padding: 10px;
                    border-radius: 8px;
                    margin-bottom: 15px;
                    display: none;
                    font-size: 12px;
                "></div>
                <div id="abxrlib-xr-input-container" style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 15px 0 20px 0;
                    ${authData.type === 'email' && authData.domain ? 'gap: 5px;' : ''}
                ">
                    <input 
                        type="${getInputType()}"
                        id="abxrlib-xr-input"
                        placeholder="${getPlaceholder()}"
                        style="
                            ${authData.type === 'email' && authData.domain ? 'flex: 1;' : 'width: 100%;'}
                            padding: 15px;
                            border: 2px solid #333;
                            border-radius: 8px;
                            background: ${colors.inputBg};
                            color: #ffffff;
                            font-size: 16px;
                            box-sizing: border-box;
                            outline: none;
                            transition: border-color 0.3s ease;
                        "
                        autocomplete="off"
                    />
                    ${authData.type === 'email' && authData.domain ? 
                        `<span id="abxrlib-xr-domain" style="
                            margin-left: 5px;
                            font-size: 16px;
                            color: #ccc;
                            white-space: nowrap;
                        ">@${authData.domain}</span>` : 
                        ''
                    }
                </div>
                ${!options.hideDialogButtons ? `
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="abxrlib-xr-cancel" style="
                        background: rgba(102, 102, 102, 0.8);
                        color: white;
                        border: 2px solid #666;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.3s ease;
                    ">Cancel</button>
                    <button id="abxrlib-xr-submit" style="
                        background: ${colors.success};
                        color: white;
                        border: 2px solid ${colors.primary};
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.3s ease;
                        box-shadow: 0 0 15px ${colors.primaryRgba};
                    ">Submit</button>
                </div>` : ''}
                <p style="
                    margin: 20px 0 0 0;
                    color: #888;
                    font-size: 10px;
                    font-style: italic;
                ">
                </p>
            </div>
            
            ${options.showVirtualKeyboard ? getXRVirtualKeyboardTemplate(authData.type, {
                colors: {
                    background: colors.background,
                    primary: colors.primary,
                    keyBg: colors.keyBg,
                    keyText: colors.keyText,
                    keyHover: colors.keyHover,
                    keyActive: colors.keyActive,
                    success: colors.success
                }
            }) : ''}
        </div>
    `;
}

/**
 * XR Dialog interaction styles and handlers
 */
export const XRDialogConfig = {
    // Focus/blur effect styles for input
    focusStyle: {
        borderColor: '#5A58EB',
        boxShadow: '0 0 15px rgba(90, 88, 235, 0.3)'
    },
    
    blurStyle: {
        borderColor: '#333',
        boxShadow: 'none'
    },
    
    // Animation and styling constants
    colors: {
        primary: '#5A58EB',        // Brand purple
        success: '#05DA98',        // Success green
        primaryRgba: 'rgba(90, 88, 235, 0.3)',
        background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
        inputBg: 'rgba(51, 51, 51, 0.8)'
    }
};

// Export virtual keyboard class for use in main library
export { XRVirtualKeyboard };