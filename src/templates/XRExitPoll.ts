// XR Exit Poll Template
// XR-themed exit poll dialogs for user feedback collection

/**
 * Exit Poll Types matching Unity implementation
 */
export enum ExitPollType {
    Thumbs = 'Thumbs',           // 👍👎 thumbs up/down
    Rating = 'Rating',           // 1-5 star rating
    MultipleChoice = 'MultipleChoice'  // 2-8 custom options
}

/**
 * Exit Poll configuration options
 */
export interface ExitPollOptions {
    customStyle?: {
        colors?: {
            background?: string;     // Dialog background color
            primary?: string;        // Primary accent color (borders, highlights)
            success?: string;        // Success/submit button color
            thumbsUp?: string;       // Thumbs up color
            thumbsDown?: string;     // Thumbs down color
            rating?: string;         // Rating star color
            choice?: string;         // Multiple choice button color
        };
        dialog?: Partial<CSSStyleDeclaration>; // Custom dialog container styling
        overlay?: Partial<CSSStyleDeclaration>; // Custom overlay styling
    };
}

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

/**
 * Generate XR-styled CSS animation styles for exit polls
 */
export function getXRExitPollStyles(): string {
    return `
        @keyframes abxrPollGlow {
            from { box-shadow: 0 0 30px rgba(90, 88, 235, 0.3); }
            to { box-shadow: 0 0 40px rgba(90, 88, 235, 0.6); }
        }
        
        @keyframes abxrPollFadeIn {
            from { opacity: 0; transform: scale(0.9) translateY(-20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        @keyframes abxrPollButtonHover {
            from { transform: scale(1); }
            to { transform: scale(1.05); }
        }
        
        .abxr-poll-button {
            transition: all 0.3s ease;
            cursor: pointer;
            border: none;
            border-radius: 12px;
            font-weight: bold;
            text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }
        
        .abxr-poll-button:hover {
            animation: abxrPollButtonHover 0.2s ease forwards;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }
        
        .abxr-poll-button:active {
            transform: scale(0.95);
        }
    `;
}

/**
 * Generate HTML template for thumbs up/down poll
 */
function getThumbsPollTemplate(prompt: string, colors: any): string {
    return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
            <div style="display: flex; gap: 30px; align-items: center;">
                <button id="abxr-poll-thumbs-up" class="abxr-poll-button" style="
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(145deg, ${colors.thumbsUp || '#05DA98'}, #04B885);
                    color: white;
                    font-size: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                " title="Thumbs Up">👍</button>
                
                <button id="abxr-poll-thumbs-down" class="abxr-poll-button" style="
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(145deg, ${colors.thumbsDown || '#FF6B6B'}, #E55555);
                    color: white;
                    font-size: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                " title="Thumbs Down">👎</button>
            </div>
        </div>
    `;
}

/**
 * Generate HTML template for 1-5 star rating poll
 */
function getRatingPollTemplate(prompt: string, colors: any): string {
    const stars = [1, 2, 3, 4, 5].map(rating => `
        <button id="abxr-poll-rating-${rating}" class="abxr-poll-button" style="
            width: 60px;
            height: 60px;
            background: linear-gradient(145deg, ${colors.rating || '#FFD700'}, #FFA500);
            color: white;
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 5px;
        " title="Rate ${rating} star${rating > 1 ? 's' : ''}">⭐</button>
    `).join('');

    return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
            <div style="display: flex; gap: 10px; align-items: center;">
                ${stars}
            </div>
            <div style="display: flex; gap: 10px; font-size: 12px; color: #888;">
                <span>Poor</span>
                <span>Excellent</span>
            </div>
        </div>
    `;
}

/**
 * Generate HTML template for multiple choice poll
 */
function getMultipleChoicePollTemplate(prompt: string, responses: string[], colors: any): string {
    const buttons = responses.map((response, index) => `
        <button id="abxr-poll-choice-${index}" class="abxr-poll-button" style="
            width: 100%;
            min-height: 50px;
            background: linear-gradient(145deg, ${colors.choice || '#5A58EB'}, #4A46D4);
            color: white;
            font-size: 16px;
            padding: 15px 20px;
            margin: 8px 0;
            text-align: center;
            word-wrap: break-word;
        " data-response="${response}">${response}</button>
    `).join('');

    return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%;">
            ${buttons}
        </div>
    `;
}

/**
 * Generate HTML template for the XR exit poll dialog
 */
export function getXRExitPollTemplate(
    prompt: string, 
    pollType: ExitPollType, 
    responses: string[] = [], 
    options: ExitPollOptions = {}
): string {
    // Merge custom colors with defaults
    const defaultColors = {
        background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
        primary: '#5A58EB',
        success: '#05DA98',
        primaryRgba: 'rgba(90, 88, 235, 0.3)',
        thumbsUp: '#05DA98',
        thumbsDown: '#FF6B6B',
        rating: '#FFD700',
        choice: '#5A58EB'
    };
    
    const colors = {
        ...defaultColors,
        ...(options.customStyle?.colors || {}),
        // Convert primary color to rgba for glow effects
        primaryRgba: options.customStyle?.colors?.primary 
            ? `rgba(${hexToRgb(options.customStyle.colors.primary)}, 0.3)`
            : defaultColors.primaryRgba
    };

    // Generate poll content based on type
    let pollContent = '';
    let dialogWidth = '400px';
    
    switch (pollType) {
        case ExitPollType.Thumbs:
            pollContent = getThumbsPollTemplate(prompt, colors);
            dialogWidth = '350px';
            break;
        case ExitPollType.Rating:
            pollContent = getRatingPollTemplate(prompt, colors);
            dialogWidth = '450px';
            break;
        case ExitPollType.MultipleChoice:
            if (responses.length < 2 || responses.length > 8) {
                throw new Error('Multiple choice poll must have between 2 and 8 responses');
            }
            pollContent = getMultipleChoicePollTemplate(prompt, responses, colors);
            dialogWidth = '400px';
            break;
    }

    return `
        <div id="abxrlib-exit-poll-overlay" style="
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
            z-index: 10001;
            font-family: 'Arial', sans-serif;
            padding: 20px;
            box-sizing: border-box;
            overflow-y: auto;
            animation: abxrPollFadeIn 0.3s ease-out;
        ">
            <div id="abxr-exit-poll-content" style="
                background: ${colors.background};
                color: #ffffff;
                padding: 30px;
                border-radius: 15px;
                border: 2px solid ${colors.primary};
                box-shadow: 0 0 30px ${colors.primaryRgba};
                max-width: ${dialogWidth};
                width: 100%;
                text-align: center;
                animation: abxrPollGlow 2s ease-in-out infinite alternate;
            ">
                <h2 style="
                    margin: 0 0 25px 0; 
                    color: ${colors.primary}; 
                    text-shadow: 0 0 10px ${colors.primaryRgba};
                    font-size: 20px;
                    line-height: 1.3;
                ">
                    ${prompt}
                </h2>
                
                ${pollContent}
                
                <p style="
                    margin: 20px 0 0 0;
                    color: #888;
                    font-size: 12px;
                    font-style: italic;
                ">
                    Use your VR controller or mouse to interact with this poll
                </p>
            </div>
        </div>
    `;
}

/**
 * XR Exit Poll interaction handler
 */
export class XRExitPollHandler {
    private pollType: ExitPollType;
    private responses: string[];
    private callback?: (response: string) => void;
    private overlay: HTMLElement | null = null;

    constructor(pollType: ExitPollType, responses: string[] = [], callback?: (response: string) => void) {
        this.pollType = pollType;
        this.responses = responses;
        this.callback = callback;
    }

    /**
     * Show the exit poll dialog
     */
    show(prompt: string, options: ExitPollOptions = {}): void {
        // Remove any existing poll
        this.hide();

        // Add styles
        this.addStyles();

        // Generate and insert HTML
        const pollHTML = getXRExitPollTemplate(prompt, this.pollType, this.responses, options);
        document.body.insertAdjacentHTML('beforeend', pollHTML);

        // Get overlay reference
        this.overlay = document.getElementById('abxrlib-exit-poll-overlay');

        // Setup event listeners
        this.setupEventListeners(prompt);
    }

    /**
     * Hide the exit poll dialog
     */
    hide(): void {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
    }

    /**
     * Add CSS styles to document
     */
    private addStyles(): void {
        // Check if styles already added
        if (document.getElementById('abxr-exit-poll-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'abxr-exit-poll-styles';
        style.textContent = getXRExitPollStyles();
        document.head.appendChild(style);
    }

    /**
     * Setup event listeners for poll interactions
     */
    private setupEventListeners(prompt: string): void {
        switch (this.pollType) {
            case ExitPollType.Thumbs:
                this.setupThumbsListeners(prompt);
                break;
            case ExitPollType.Rating:
                this.setupRatingListeners(prompt);
                break;
            case ExitPollType.MultipleChoice:
                this.setupMultipleChoiceListeners(prompt);
                break;
        }
    }

    /**
     * Setup thumbs up/down event listeners
     */
    private setupThumbsListeners(prompt: string): void {
        const thumbsUp = document.getElementById('abxr-poll-thumbs-up');
        const thumbsDown = document.getElementById('abxr-poll-thumbs-down');

        if (thumbsUp) {
            thumbsUp.addEventListener('click', () => this.handleResponse(prompt, 'up'));
        }

        if (thumbsDown) {
            thumbsDown.addEventListener('click', () => this.handleResponse(prompt, 'down'));
        }
    }

    /**
     * Setup rating event listeners
     */
    private setupRatingListeners(prompt: string): void {
        for (let rating = 1; rating <= 5; rating++) {
            const button = document.getElementById(`abxr-poll-rating-${rating}`);
            if (button) {
                button.addEventListener('click', () => this.handleResponse(prompt, rating.toString()));
            }
        }
    }

    /**
     * Setup multiple choice event listeners
     */
    private setupMultipleChoiceListeners(prompt: string): void {
        this.responses.forEach((response, index) => {
            const button = document.getElementById(`abxr-poll-choice-${index}`);
            if (button) {
                button.addEventListener('click', () => this.handleResponse(prompt, response));
            }
        });
    }

    /**
     * Handle poll response
     */
    private handleResponse(prompt: string, response: string): void {
        // Call callback if provided
        if (this.callback) {
            this.callback(response);
        }

        // Hide the poll
        this.hide();

        // Dispatch custom event for external handling
        const event = new CustomEvent('abxrExitPollResponse', {
            detail: {
                prompt,
                response,
                pollType: this.pollType
            }
        });
        document.dispatchEvent(event);
    }
}
