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
            { key: 'Enter', display: 'Submit', width: '160px' }
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
            { key: 'Enter', display: 'Submit', width: '120px' }
        ];
    }
    
    // Generate keyboard rows HTML
    const rowsHTML = keyboardRows.map(row => `
        <div class="abxr-keyboard-row" style="
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 4px;
            margin: 6px 0;
            box-sizing: border-box;
            padding: 0;
            width: 100%;
        ">
            ${row.map(key => `
                <button class="abxr-key" data-key="${key}" style="
                    min-width: 45px;
                    height: 45px;
                    border: 2px solid transparent;
                    border-radius: 8px;
                    background: ${colors.keyBg};
                    color: ${colors.keyText};
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    user-select: none;
                    margin: 0 !important;
                    padding: 0 !important;
                    box-sizing: border-box;
                ">${key}</button>
            `).join('')}
        </div>
    `).join('');
    
    // Generate special keys HTML
    const specialKeysHTML = `
        <div class="abxr-keyboard-row" style="
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 6px;
            margin: 10px 0;
            flex-wrap: wrap;
            box-sizing: border-box;
            padding: 0;
            width: 100%;
        ">
            ${specialKeys.map(({ key, display, width }) => `
                <button class="abxr-key abxr-special-key" data-key="${key}" style="
                    width: ${width === '60px' ? '70px' : width === '80px' ? '90px' : width === '120px' ? '140px' : width};
                    height: 45px;
                    border: 2px solid transparent;
                    border-radius: 8px;
                    background: ${key === 'Enter' ? colors.success : colors.keyBg};
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
            padding: 0;
            margin: 5px auto;
            user-select: none;
            box-sizing: border-box;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            ${layoutType === 'assessmentPin' || layoutType === 'pin'
                ? 'max-width: 300px; width: 100%; min-width: 250px;'
                : 'max-width: 100%; width: 100%;'}
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
    private onSubmit: (() => void) | null = null;
    
    constructor(layoutType: string = 'full', config: VirtualKeyboardConfig = defaultKeyboardConfig) {
        this.layoutType = layoutType;
        this.config = config;
    }
    
    /**
     * Initialize the virtual keyboard and connect it to an input field
     */
    initialize(inputElement: HTMLInputElement, onCancel?: () => void, onSubmit?: () => void): void {
        this.targetInput = inputElement;
        this.onCancel = onCancel || null;
        this.onSubmit = onSubmit || null;
        this.setupEventListeners();
        this.updateCapsLockState();
        
        // Make debug functions globally accessible for future troubleshooting
        (window as any).abxrForceCleanKeyboard = () => {
            this.forceCleanAllHoverStates();
        };
        (window as any).abxrCheckStuckKeys = () => {
            this.findAndFixStuckKeys();
        };
    }
    
    /**
     * Debug function to check for stuck keys (simplified)
     */
    private debugKeyStates(): void {
        const stuckKeys: string[] = [];
        document.querySelectorAll('.abxr-key').forEach(button => {
            const keyButton = button as HTMLButtonElement;
            const keyLabel = keyButton.dataset.key || keyButton.textContent || 'unknown';
            const bgColor = keyButton.style.background || 'default';
            const borderColor = keyButton.style.borderColor || 'default';
            
            // Check if this key appears to be in hover state
            const isHovering = bgColor.includes(this.config.colors.keyHover) || 
                              bgColor.includes('90, 88, 235') || 
                              borderColor.includes(this.config.colors.primary);
            
            if (isHovering) {
                stuckKeys.push(keyLabel);
            }
        });
        
        if (stuckKeys.length > 0) {
            console.log(`AbxrLib: Stuck keys detected: ${stuckKeys.join(', ')}`);
        }
    }

    /**
     * Find keys that are visually stuck and fix them - for debugging
     */
    public findAndFixStuckKeys(): void {
        let fixedCount = 0;
        
        document.querySelectorAll('.abxr-key').forEach(button => {
            const keyButton = button as HTMLButtonElement;
            const keyLabel = keyButton.dataset.key || keyButton.textContent || 'unknown';
            
            if (!keyButton.classList.contains('abxr-special-key') || keyButton.dataset.key !== 'Enter') {
                const computed = window.getComputedStyle(keyButton);
                const computedBg = computed.backgroundColor;
                const computedBorder = computed.borderColor;
                
                // Check if computed style suggests it's in hover state
                const isVisuallyHovering = computedBg.includes('90, 88, 235') || 
                                          computedBg.includes('rgba(90, 88, 235') ||
                                          computedBorder.includes('90, 88, 235') ||
                                          computedBorder.includes('rgb(90, 88, 235');
                
                if (isVisuallyHovering) {
                    // Force fix it
                    keyButton.style.setProperty('background', this.config.colors.keyBg, 'important');
                    keyButton.style.setProperty('border-color', 'transparent', 'important'); 
                    keyButton.style.setProperty('background-color', this.config.colors.keyBg, 'important');
                    keyButton.offsetHeight; // Force reflow
                    fixedCount++;
                }
            }
        });
        
        console.log(`AbxrLib: Fixed ${fixedCount} stuck keys`);
    }

    /**
     * Force clear all hover states - for debugging
     */
    public forceCleanAllHoverStates(): void {
        let clearedCount = 0;
        
        document.querySelectorAll('.abxr-key').forEach(button => {
            const keyButton = button as HTMLButtonElement;
            
            if (!keyButton.classList.contains('abxr-special-key') || keyButton.dataset.key !== 'Enter') {
                // Force clear with !important
                keyButton.style.setProperty('background', this.config.colors.keyBg, 'important');
                keyButton.style.setProperty('border-color', 'transparent', 'important');
                keyButton.style.setProperty('background-color', this.config.colors.keyBg, 'important');
                keyButton.style.setProperty('transform', 'scale(1)', 'important');
                clearedCount++;
            }
        });
        
        console.log(`AbxrLib: Force cleared ${clearedCount} keys`);
    }

    /**
     * Setup event listeners for all keyboard buttons
     */
    private setupEventListeners(): void {
        // Regular keys and special keys
        document.querySelectorAll('.abxr-key').forEach(button => {
            const keyButton = button as HTMLButtonElement;
            
            // Check if this button already has our listeners (prevent duplicates)
            if ((keyButton as any).__abxrListenersAttached) {
                return;
            }
            
            (keyButton as any).__abxrListenersAttached = true;
            
            // Hover effects
            keyButton.addEventListener('mouseenter', () => {
                if (!keyButton.classList.contains('abxr-special-key') || keyButton.dataset.key !== 'Enter') {
                    // Force apply with !important to prevent CSS cascade issues
                    keyButton.style.setProperty('background', this.config.colors.keyHover, 'important');
                    keyButton.style.setProperty('border-color', this.config.colors.primary, 'important');
                    keyButton.style.setProperty('background-color', this.config.colors.keyHover, 'important');
                }
            });
            
            keyButton.addEventListener('mouseleave', () => {
                if (!keyButton.classList.contains('abxr-special-key') || keyButton.dataset.key !== 'Enter') {
                    // Force clear with !important to prevent CSS cascade issues
                    keyButton.style.setProperty('background', this.config.colors.keyBg, 'important');
                    keyButton.style.setProperty('border-color', 'transparent', 'important');
                    keyButton.style.setProperty('background-color', this.config.colors.keyBg, 'important');
                    
                    // Force repaint to ensure visual update
                    keyButton.offsetHeight;
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
        // Use direct submit handler if available (for when dialog buttons are hidden)
        if (this.onSubmit) {
            this.onSubmit();
        } else {
            // Fallback: trigger submit button click if it exists
            const submitButton = document.getElementById('abxrlib-xr-submit') as HTMLButtonElement;
            if (submitButton) {
                submitButton.click();
            }
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
                capsButton.style.setProperty('background', this.config.colors.primary, 'important');
                capsButton.style.setProperty('border-color', this.config.colors.primary, 'important');
                capsButton.style.setProperty('background-color', this.config.colors.primary, 'important');
            } else {
                capsButton.style.setProperty('background', this.config.colors.keyBg, 'important');
                capsButton.style.setProperty('border-color', 'transparent', 'important');
                capsButton.style.setProperty('background-color', this.config.colors.keyBg, 'important');
            }
        }
        
        // Update letter key labels - show lowercase by default, uppercase when caps is on
        document.querySelectorAll('.abxr-key:not(.abxr-special-key)').forEach(button => {
            const keyButton = button as HTMLButtonElement;
            const key = keyButton.dataset.key;
            if (key && /^[a-z]$/.test(key)) {
                keyButton.textContent = this.capsLock ? key.toUpperCase() : key.toLowerCase();
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