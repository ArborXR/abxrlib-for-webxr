// HTML Authentication Dialog Template
// Clean, maintainable HTML/CSS templates for the standard web dialog

export interface AuthDialogData {
    type: string;
    prompt?: string;
    domain?: string;
    [key: string]: any;
}

export interface DialogStyleOptions {
    overlayStyle?: Partial<CSSStyleDeclaration>;
    dialogStyle?: Partial<CSSStyleDeclaration>;
}

/**
 * Generate HTML template for the authentication dialog
 */
export function getHTMLDialogTemplate(authData: AuthDialogData): string {
    const getTitle = () => {
        if (authData.prompt) return authData.prompt;
        if (authData.type === 'assessmentPin') return 'PIN Required';
        if (authData.type === 'email') return 'Email Authentication Required';
        return 'Authentication Required';
    };

    const getInputType = () => {
        if (authData.type === 'assessmentPin') return 'password';
        if (authData.type === 'email') return 'email';
        return 'text';
    };

    const getPlaceholder = () => {
        if (authData.type === 'assessmentPin') return 'Enter PIN...';
        if (authData.type === 'email') {
            return authData.domain ? 'Enter email username' : 'Enter email address';
        }
        return 'Enter value...';
    };

    const getPromptText = () => {
        return authData.prompt || 'Please enter the required authentication information:';
    };

    return `
        <div id="abxr-auth-dialog" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000;">
            <div id="abxr-auth-dialog-content" style="background: white; margin: 15% auto; padding: 30px; border-radius: 10px; width: 400px; max-width: 90%; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
                <h2 id="abxr-auth-title" style="color: #333; margin-top: 0;">${getTitle()}</h2>
                <p id="abxr-auth-prompt" style="color: #666; margin: 15px 0;">${getPromptText()}</p>
                <div id="abxr-auth-error" style="display: none; color: #dc3545; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 10px; margin: 10px 0; font-size: 14px;"></div>
                <div id="abxr-auth-input-container" style="display: flex; align-items: center; justify-content: center; margin: 15px 0;">
                    <input type="${getInputType()}" id="abxr-auth-input" style="padding: 12px; border: 2px solid #ddd; border-radius: 5px; font-size: 16px; box-sizing: border-box; flex: 1;" placeholder="${getPlaceholder()}" />
                    <span id="abxr-auth-domain" style="margin-left: 5px; font-size: 16px; color: #666; display: none;"></span>
                </div>
                <div style="margin-top: 20px;">
                    <button id="abxr-auth-submit" style="padding: 12px 25px; margin: 0 10px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; background-color: #007bff; color: white;">Submit</button>
                    <button id="abxr-auth-cancel" style="padding: 12px 25px; margin: 0 10px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; background-color: #6c757d; color: white;">Cancel</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Default dialog style options
 */
export const defaultDialogStyles: DialogStyleOptions = {
    overlayStyle: {},
    dialogStyle: {}
};