// XR Virtual Keyboard Template
// XR-themed virtual keyboard for headset environments without physical keyboards

export interface VirtualKeyboardConfig {
    colors: {
        primary: string;      // #5A58EB
        success: string;      // #05DA98  
        background: string;   // Dark gradient
        keyBg: string;        // Key background
        keyHover: string;     // Key hover state
        keyActive: string;    // Key press state
        keyText: string;      // Key text color
    };
}

export const defaultKeyboardConfig: VirtualKeyboardConfig = {
    colors: {
        primary: '#5A58EB',
        success: '#05DA98',
        background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
        keyBg: 'rgba(51, 51, 51, 0.9)',
        keyHover: 'rgba(90, 88, 235, 0.3)',
        keyActive: '#5A58EB',
        keyText: '#ffffff'
    }
};

/**
 * Generate the XR virtual keyboard HTML
 */
export function getXRVirtualKeyboardTemplate(layoutType: string = 'full', config: VirtualKeyboardConfig = defaultKeyboardConfig): string {
    const { colors } = config;
    
    // Define keyboard layouts based on type
    let keyboardRows: string[][];
    let specialKeys: Array<{key: string, display: string, width: string}>;
    
    if (layoutType === 'assessmentPin' || layoutType === 'pin') {
        // PIN pad layout: 3x3 number grid
        keyboardRows = [
            ['1', '2', '3'],
            ['4', '5', '6'], 
            ['7', '8', '9']
        ];
        
        specialKeys = [
            { key: 'Backspace', display: '⌫', width: '80px' },
            { key: '0', display: '0', width: '80px' },
            { key: 'Enter', display: 'Submit', width: '80px' },
            { key: 'Cancel', display: 'Cancel', width: '80px' }
        ];
    } else {
        // Full QWERTY keyboard layout
        keyboardRows = [
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
            ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
            ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '@'],
            ['z', 'x', 'c', 'v', 'b', 'n', 'm', '.', '-','_']
        ];
        
        specialKeys = [
            { key: 'CapsLock', display: 'Caps', width: '60px' },
            { key: 'Backspace', display: '⌫', width: '80px' },
            { key: ' ', display: 'Space', width: '120px' },
            { key: 'Enter', display: 'Submit', width: '80px' },
            { key: 'Cancel', display: 'Cancel', width: '80px' }
        ];
    }
    
    // Generate keyboard rows HTML
    const rowsHTML = keyboardRows.map(row => `
        <div class="abxr-keyboard-row" style="
            display: flex;
            justify-content: center;
            gap: 8px;
            margin: 6px 0;
            box-sizing: border-box;
            padding: 0;
        ">
            ${row.map(key => `
                <button class="abxr-key" data-key="${key}" style="
                    min-width: 40px;
                    height: 45px;
                    border: 2px solid #333;
                    border-radius: 8px;
                    background: ${colors.keyBg};
                    color: ${colors.keyText};
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-transform: uppercase;
                    user-select: none;
                    margin: 0 !important;
                    padding: 0 !important;
                    box-sizing: border-box;
                ">${key.toUpperCase()}</button>
            `).join('')}
        </div>
    `).join('');
    
    // Generate special keys HTML
    const specialKeysHTML = `
        <div class="abxr-keyboard-row" style="
            display: flex;
            justify-content: center;
            gap: 8px;
            margin: 10px 0;
            flex-wrap: wrap;
            box-sizing: border-box;
            padding: 0;
        ">
            ${specialKeys.map(({ key, display, width }) => `
                <button class="abxr-key abxr-special-key" data-key="${key}" style="
                    width: ${width};
                    height: 45px;
                    border: 2px solid #333;
                    border-radius: 8px;
                    background: ${key === 'Enter' ? colors.success : 
                                key === 'Cancel' ? 'rgba(102, 102, 102, 0.8)' : colors.keyBg};
                    color: ${colors.keyText};
                    font-size: 14px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    user-select: none;
                    margin: 0 !important;
                    padding: 0 !important;
                    box-sizing: border-box;
                ">${display}</button>
            `).join('')}
        </div>
    `;
    
    return `
        <div id="abxr-virtual-keyboard" style="
            background: ${colors.background};
            border: 2px solid ${colors.primary};
            border-radius: 15px;
            padding: 20px;
            margin-top: 20px;
            box-shadow: 0 0 30px rgba(90, 88, 235, 0.3);
            animation: abxrGlow 2s ease-in-out infinite alternate;
            user-select: none;
            box-sizing: border-box;
            position: relative;
            ${layoutType === 'assessmentPin' || layoutType === 'pin'
                ? 'max-width: 300px; width: 100%; min-width: 250px;'
                : 'max-width: 550px; width: 100%; min-width: 450px;'}
        ">
            <div style="
                text-align: center;
                color: ${colors.primary};
                font-size: 12px;
                margin-bottom: 15px;
                text-shadow: 0 0 10px rgba(90, 88, 235, 0.5);
            ">
            </div>
            
            ${rowsHTML}
            ${specialKeysHTML}

        </div>
    `;
}

/**
 * XR Virtual Keyboard interaction handlers
 */
export class XRVirtualKeyboard {
    private targetInput: HTMLInputElement | null = null;
    private capsLock: boolean = false;
    private config: VirtualKeyboardConfig;
    private layoutType: string;
    private onCancel: (() => void) | null = null;
    
    constructor(layoutType: string = 'full', config: VirtualKeyboardConfig = defaultKeyboardConfig) {
        this.layoutType = layoutType;
        this.config = config;
    }
    
    /**
     * Initialize the virtual keyboard and connect it to an input field
     */
    initialize(inputElement: HTMLInputElement, onCancel?: () => void): void {
        this.targetInput = inputElement;
        this.onCancel = onCancel || null;
        this.setupEventListeners();
        this.updateCapsLockState();
    }
    
    /**
     * Setup event listeners for all keyboard buttons
     */
    private setupEventListeners(): void {
        // Regular keys and special keys
        document.querySelectorAll('.abxr-key').forEach(button => {
            const keyButton = button as HTMLButtonElement;
            
            // Hover effects
            keyButton.addEventListener('mouseenter', () => {
                if (!keyButton.classList.contains('abxr-special-key') || keyButton.dataset.key !== 'Enter') {
                    keyButton.style.background = this.config.colors.keyHover;
                    keyButton.style.borderColor = this.config.colors.primary;
                }
            });
            
            keyButton.addEventListener('mouseleave', () => {
                if (!keyButton.classList.contains('abxr-special-key') || keyButton.dataset.key !== 'Enter') {
                    keyButton.style.background = this.config.colors.keyBg;
                    keyButton.style.borderColor = '#333';
                }
            });
            
            // Click effects
            keyButton.addEventListener('mousedown', () => {
                keyButton.style.background = this.config.colors.keyActive;
                keyButton.style.transform = 'scale(0.95)';
            });
            
            keyButton.addEventListener('mouseup', () => {
                setTimeout(() => {
                    keyButton.style.transform = 'scale(1)';
                }, 100);
            });
            
            // Key press handling
            keyButton.addEventListener('click', (e) => {
                e.preventDefault();
                const key = keyButton.dataset.key;
                if (key) {
                    this.handleKeyPress(key);
                }
            });
        });
        
        // Handle special keys that need custom behavior
        const specialKeyButtons = document.querySelectorAll('.abxr-special-key');
        specialKeyButtons.forEach(button => {
            const key = button.getAttribute('data-key');
            if (key === 'CapsLock') {
                button.addEventListener('click', () => this.toggleCapsLock());
            }
        });
    }
    
    /**
     * Handle key press from virtual keyboard
     */
    private handleKeyPress(key: string): void {
        if (!this.targetInput) return;
        
        switch (key) {
            case 'Backspace':
                this.handleBackspace();
                break;
            case 'Enter':
                this.handleEnter();
                break;
            case 'Cancel':
                this.handleCancel();
                break;
            case ' ':
                this.insertText(' ');
                break;
            case 'CapsLock':
                // CapsLock is handled by its own event listener, don't insert text
                break;
            default:
                const text = this.capsLock ? key.toUpperCase() : key.toLowerCase();
                this.insertText(text);
                break;
        }
        
        // Trigger input event for any listeners
        this.targetInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    /**
     * Insert text at cursor position
     */
    private insertText(text: string): void {
        if (!this.targetInput) return;
        
        const start = this.targetInput.selectionStart || 0;
        const end = this.targetInput.selectionEnd || 0;
        const currentValue = this.targetInput.value;
        
        this.targetInput.value = currentValue.substring(0, start) + text + currentValue.substring(end);
        this.targetInput.setSelectionRange(start + text.length, start + text.length);
        this.targetInput.focus();
    }
    
    /**
     * Handle backspace key
     */
    private handleBackspace(): void {
        if (!this.targetInput) return;
        
        const start = this.targetInput.selectionStart || 0;
        const end = this.targetInput.selectionEnd || 0;
        const currentValue = this.targetInput.value;
        
        if (start !== end) {
            // Delete selection
            this.targetInput.value = currentValue.substring(0, start) + currentValue.substring(end);
            this.targetInput.setSelectionRange(start, start);
        } else if (start > 0) {
            // Delete one character before cursor
            this.targetInput.value = currentValue.substring(0, start - 1) + currentValue.substring(start);
            this.targetInput.setSelectionRange(start - 1, start - 1);
        }
        
        this.targetInput.focus();
    }
    
    /**
     * Handle enter key (submit form)
     */
    private handleEnter(): void {
        // Trigger submit button click
        const submitButton = document.getElementById('abxrlib-xr-submit') as HTMLButtonElement;
        if (submitButton) {
            submitButton.click();
        }
    }
    
    /**
     * Handle cancel key (cancel dialog)
     */
    private handleCancel(): void {
        if (this.onCancel) {
            this.onCancel();
        }
    }
    
    /**
     * Toggle caps lock state
     */
    private toggleCapsLock(): void {
        this.capsLock = !this.capsLock;
        this.updateCapsLockState();
    }
    
    /**
     * Update caps lock button appearance and key labels
     */
    private updateCapsLockState(): void {
        // Find caps lock button in special keys row
        const capsButton = document.querySelector('.abxr-special-key[data-key="CapsLock"]') as HTMLElement;
        if (capsButton) {
            if (this.capsLock) {
                capsButton.style.background = this.config.colors.primary;
                capsButton.style.borderColor = this.config.colors.primary;
            } else {
                capsButton.style.background = this.config.colors.keyBg;
                capsButton.style.borderColor = '#333';
            }
        }
        
        // Update letter key labels
        document.querySelectorAll('.abxr-key:not(.abxr-special-key)').forEach(button => {
            const keyButton = button as HTMLButtonElement;
            const key = keyButton.dataset.key;
            if (key && /^[a-z]$/.test(key)) {
                keyButton.textContent = this.capsLock ? key.toUpperCase() : key.toUpperCase();
            }
        });
    }
    
    /**
     * Remove the virtual keyboard from DOM
     */
    destroy(): void {
        const keyboard = document.getElementById('abxr-virtual-keyboard');
        if (keyboard) {
            keyboard.remove();
        }
    }
}