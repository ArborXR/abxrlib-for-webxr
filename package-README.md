# ABXRLib SDK for WebXR

The name "ABXR" stands for "Analytics Backbone for XR"—a flexible, open-source foundation for capturing and transmitting spatial, interaction, and performance data in XR. When combined with **ArborXR Insights**, ABXR transforms from a lightweight instrumentation layer into a full-scale enterprise analytics solution—unlocking powerful dashboards, LMS/BI integrations, and AI-enhanced insights.

The **ABXRLib SDK for WebXR** is an open-source analytics and data collection library that provides developers with the tools to collect and send XR data to any service of their choice. This library enables scalable event tracking, telemetry, and session-based storage—essential for enterprise and education XR environments.

> 💡 **Quick Start:** Most developers can integrate ABXRLib SDK and log their first event in under **15 minutes**.

**Why Use ABXRLib SDK?**

- **Open-Source** & portable to any backend—no vendor lock-in  
- **Quick integration**—track user interactions in minutes  
- **Secure & scalable**—ready for enterprise use cases  
- **Pluggable with ArborXR Insights**—seamless access to LMS/BI integrations, session replays, AI diagnostics, and more

## Installation

```bash
npm install abxrlib-for-webxr
```

## Simple Setup

> **⚠️ Security Note:** For production builds distributed to third parties, avoid compiling `orgId` and `authSecret` directly into your application code. Instead, use URL parameters or environment variables to provide these credentials at runtime. Only compile credentials directly into the build when creating custom applications for specific individual clients.

The easiest way to get started is with a single function call:

```html
<script src="node_modules/abxrlib-for-webxr/index.js"></script>
<script>
    // RECOMMENDED: Use URL parameters for production builds
    // URL: https://yourdomain.com/?abxr_orgid=org456&abxr_auth_secret=secret789
    Abxr_init('app123');
    
    // DEVELOPMENT ONLY: Direct initialization with all parameters
    Abxr_init('app123', 'org456', 'secret789');
    
    // Start using the library immediately
    Abxr.Event('user_action', { action: 'button_click' });
    Abxr.LogDebug('User clicked button');
    
    // Enable debug mode to see when operations are skipped
    Abxr.setDebugMode(true);
</script>
```

### URL Parameter Authentication

You can provide authentication credentials via URL parameters, which take precedence over function parameters:

```html
<script src="node_modules/abxrlib-for-webxr/index.js"></script>
<script>
    // URL: https://yourdomain.com/?abxr_orgid=org456&abxr_auth_secret=secret789
    Abxr_init('app123'); // URL parameters will be automatically detected
    
    // Start using immediately
    Abxr.Event('user_action', { action: 'button_click' });
</script>
```

### Custom Configuration

You can provide custom app configuration:

```html
<script src="node_modules/abxrlib-for-webxr/index.js"></script>
<script>
    const appConfig = '<?xml version="1.0" encoding="utf-8" ?><configuration><appSettings><add key="REST_URL" value="https://your-server.com/v1/"/></appSettings></configuration>';
    
    Abxr_init('app123', 'org456', 'secret789', appConfig);
</script>
```

### Two-Step Authentication (authMechanism)

**NEW:** Zero-code XR-optimized authentication dialogs! Perfect for VR/AR developers:

```html
<script src="node_modules/abxrlib-for-webxr/index.js"></script>
<script>
    // Simple initialization - beautiful XR dialog appears automatically!
    Abxr_init('app123', 'org456', 'secret789');
    
    // That's it! The library handles everything:
    // - Auto-detects XR environments vs regular browsers
    // - Shows beautiful XR-optimized dialogs in VR/AR
    // - Includes virtual keyboards for XR environments
    // - Falls back to HTML dialogs for regular browsers
</script>
```

**Advanced XR Dialog Customization:**

```html
<script>
    // Custom XR dialog styling
    const dialogOptions = {
        enabled: true,
        type: 'xr',           // 'html', 'xr', or 'auto' (default)
        xrFallback: true,     // Fallback to HTML if XR fails
        xrStyle: {
            colors: {
                primary: '#00ffff',     // Cyan accent
                success: '#00ff88',     // Green submit button
                background: 'linear-gradient(135deg, #0a0a0a, #1a1a2e)',
                keyBg: 'rgba(0, 255, 255, 0.1)',  // Virtual keyboard keys
                keyText: '#ffffff',
                keyActive: '#00ffff'
            },
            dialog: {
                borderRadius: '20px',
                border: '3px solid #00ffff',
                boxShadow: '0 0 50px rgba(0, 255, 255, 0.5)'
            }
        }
    };
    
    Abxr_init('app123', 'org456', 'secret789', undefined, dialogOptions);
</script>
```

**Custom Callback (for developers who want their own UI):**

```html
<script>
    // Define custom callback to handle authentication requirements
    function handleAuthMechanism(authData) {
        console.log('Auth required:', authData.type);   // e.g., 'email', 'assessmentPin'
        console.log('Prompt:', authData.prompt);        // e.g., 'Enter your Email'
        
        // Show custom UI to collect user input
        const userInput = prompt(authData.prompt);
        
        // Format and submit authentication data
        const formattedAuthData = Abxr.formatAuthDataForSubmission(userInput, authData.type, authData.domain);
        
        Abxr.completeFinalAuth(formattedAuthData).then(success => {
            if (success) {
                console.log('Authentication complete - library ready to use');
            } else {
                console.log('Authentication failed');
            }
        });
    }
    
    // Initialize with custom callback
    Abxr_init('app123', 'org456', 'secret789', undefined, undefined, handleAuthMechanism);
</script>
```

### Debug Mode

When authentication fails or isn't provided, the library operates in debug mode:

```javascript
Abxr_init('app123'); // Missing orgId and authSecret

Abxr.setDebugMode(true); // Enable debug logging

// These will log debug messages but won't send data
Abxr.Event('test_event');
Abxr.LogDebug('test message');
```

### Configuration Methods

- `Abxr.setDebugMode(enabled)` - Enable/disable debug logging
- `Abxr.getDebugMode()` - Get current debug mode
- `Abxr.isConfigured()` - Check if library is authenticated
- `Abxr.getAuthParams()` - Get authentication parameters (for debugging)

### Available Types and Enums

The `Abxr` class exposes commonly used types and enums for easy access:

```javascript
// Result options for assessments and objectives
Abxr.EventStatus.ePass
Abxr.EventStatus.eFail
Abxr.EventStatus.eIncomplete

// Interaction types
Abxr.InteractionType.eClick
Abxr.InteractionType.eDrag
Abxr.InteractionType.eType

// Log levels
Abxr.LogLevel.eDebug
Abxr.LogLevel.eInfo
Abxr.LogLevel.eWarn
Abxr.LogLevel.eError
Abxr.LogLevel.eCritical

// Dictionary for metadata
Abxr.AbxrDictStrings
```

## Sending Data

### Event Methods
```javascript
// JavaScript Event Method Signatures
Abxr.Event(name)
Abxr.Event(name, meta = null)

// Example Usage - Basic Event
Abxr.Event('button_pressed');

// Example Usage - Event with Metadata
Abxr.Event('item_collected', {
    'item_type': 'coin',
    'item_value': '100'
});
```

**Parameters:**
- `name` (string): The name of the event. Use snake_case for better analytics processing.
- `meta` (object|string|null): Optional. Additional key-value pairs describing the event. Supports multiple formats: plain objects, JSON strings, URL parameter strings, or AbxrDictStrings objects.

### Analytics Event Wrappers (Essential for All Developers)

**These analytics event functions are essential for ALL developers, not just those integrating with LMS platforms.** They provide standardized tracking for key user interactions and learning outcomes that are crucial for understanding user behavior, measuring engagement, and optimizing XR experiences.

**EventAssessmentStart and EventAssessmentComplete should be considered REQUIRED for proper usage** of the ABXRLib SDK, as they provide critical insights into user performance and completion rates.

#### Assessments
```javascript
// JavaScript Event Method Signatures
Abxr.EventAssessmentStart(assessmentName, meta = null)
Abxr.EventAssessmentComplete(assessmentName, score, eventStatus = EventStatus.eComplete, meta = null)

// Example Usage
Abxr.EventAssessmentStart('final_exam');
Abxr.EventAssessmentComplete('final_exam', '92', Abxr.EventStatus.ePass);
```

#### Objectives
```javascript
// JavaScript Event Method Signatures
Abxr.EventObjectiveStart(objectiveName, meta = null)
Abxr.EventObjectiveComplete(objectiveName, score, eventStatus = EventStatus.eComplete, meta = null)

// Example Usage
Abxr.EventObjectiveStart('open_valve');
Abxr.EventObjectiveComplete('open_valve', '100', Abxr.EventStatus.eComplete);
```

#### Interactions
```javascript
// JavaScript Event Method Signatures
Abxr.EventInteractionStart(interactionName, meta = null)
Abxr.EventInteractionComplete(interactionName, interactionType, response = "", meta = null)

// Example Usage
Abxr.EventInteractionStart('select_option_a');
Abxr.EventInteractionComplete('select_option_a', Abxr.InteractionType.eSelect, 'A');
```

### Logging
```javascript
// JavaScript Event Method Signatures
Abxr.LogDebug(message, meta = null)
Abxr.LogInfo(message, meta = null)
Abxr.LogWarn(message, meta = null)
Abxr.LogError(message, meta = null)
Abxr.LogCritical(message, meta = null)

// Example usage
Abxr.LogError('Critical error in assessment phase');
Abxr.LogInfo('User login', {'userId': 12345, 'loginMethod': 'oauth'});
```

### Storage API
```javascript
// JavaScript Event Method Signatures
Abxr.SetStorageEntry(data, name = "state", keepLatest = true, origin = null, sessionData = false)
Abxr.GetStorageEntry(name = "state")
Abxr.RemoveStorageEntry(name = "state")

// Example usage
Abxr.SetStorageEntry({'progress': '75%'});
var state = Abxr.GetStorageEntry('state');
```

### Telemetry
```javascript
// JavaScript Event Method Signatures
Abxr.Telemetry(name, data)

// Example usage
Abxr.Telemetry('headset_position', {'x': '1.23', 'y': '4.56', 'z': '7.89'});
```

### AI Integration
```javascript
// JavaScript Event Method Signatures
Abxr.AIProxy(prompt, pastMessages = "", botId = "")

// Example usage
Abxr.AIProxy('Provide me a randomized greeting that includes common small talk and ends by asking some form of how can I help');
```

## Authentication Completion Callback

Get notified when authentication completes successfully:

```javascript
// Subscribe to authentication completion events
Abxr.onAuthCompleted(function(data) {
    console.log('Authentication completed!', data.success);
    
    if (data.success) {
        if (data.isReauthentication) {
            console.log('Welcome back!');
        } else {
            console.log('Welcome! Setting up your experience...');
            initializeUserInterface();
        }
    }
});

// Initialize ABXRLib - the callback will fire when auth completes
Abxr_init('your-app-id', 'your-org-id', 'your-auth-secret');
```

### Authentication Completion Data

```javascript
interface AuthCompletedData {
    success: boolean;                    // Whether authentication was successful
    userData?: any;                      // Additional user data from authentication response
    userId?: any;                        // User identifier
    userEmail?: string | null;           // User email address
    moduleTarget?: string | null;        // Target module from LMS (if applicable)
    isReauthentication?: boolean;        // Whether this was a reauthentication
}
```

## Module Target Callback (LMS Multi-Module Support)

The **Module Target** feature enables single applications with multiple modules, where each module can be its own assignment in an LMS. When a learner enters from the LMS for a specific module, the application automatically directs the user to that module.

### Quick Setup

```javascript
// Initialize ABXRLib SDK
Abxr_init('your-app-id', 'your-org-id', 'your-auth-secret');

// Subscribe to moduleTarget availability
Abxr.onModuleTargetAvailable(function(data) {
    console.log('ModuleTarget received:', data.moduleTarget);
    
    // Direct user to specific module
    if (data.moduleTarget) {
        loadModule(data.moduleTarget);
        Abxr.EventAssessmentStart(data.moduleTarget);
    } else {
        showMainMenu();
    }
});
```

### Available Methods

```javascript
// Subscribe to module target notifications
Abxr.onModuleTargetAvailable(callback)

// Get module target directly (after authentication)
Abxr.getModuleTarget()
Abxr.getUserId()
Abxr.getUserData()

// Remove callback when no longer needed
Abxr.removeModuleTargetCallback(callback)
```

### Usage Examples

```javascript
// Initialize
Abxr_init('app123', 'org456', 'secret789');

// Enable debug mode
Abxr.setDebugMode(true);

// Assessment with result options
Abxr.EventAssessmentComplete('math_test', '85', Abxr.EventStatus.ePass, { 'time_spent': '30min' });

// Interaction with interaction type
Abxr.EventInteractionComplete('button_click', Abxr.InteractionType.eClick, 'success', {'x': 150, 'y': 200});

// Create metadata dictionary
const meta = new Abxr.AbxrDictStrings();
meta.Add('custom_field', 'value');
Abxr.Event('custom_event', meta);
```

## Advanced Setup

For more control over the initialization process:

### TypeScript/ES6 Modules

```typescript
import { Abxr_init, Abxr } from 'abxrlib-for-webxr';

// Simple initialization with all parameters
Abxr_init('your-app-id', 'your-org-id', 'your-auth-secret');

// Or use URL parameters for orgId and authSecret
// URL: https://yourdomain.com/?abxr_orgid=YOUR_ORG_ID&abxr_auth_secret=YOUR_AUTH_SECRET
Abxr_init('your-app-id');

// Start using immediately
Abxr.Event('user_action', { action: 'button_click' });
Abxr.LogDebug('User completed tutorial');

// Store data
Abxr.SetStorageEntry('user_progress', '75%');
```

## Browser (UMD)

For browser environments, include the bundled JavaScript file and initialize the global scope:

```html
<script src="node_modules/abxrlib-for-webxr/index.js"></script>
<script>
    // Simple initialization with all parameters
    Abxr_init('app123', 'org456', 'secret789');
    
    // Or use URL parameters for orgId and authSecret
    // URL: https://yourdomain.com/?abxr_orgid=org456&abxr_auth_secret=secret789
    Abxr_init('app123');
    
    // Start using the library immediately
    Abxr.Event('user_action', { action: 'button_click' });
    Abxr.LogDebug('User clicked button');
    
    // Enable debug mode to see when operations are skipped
    Abxr.setDebugMode(true);
</script>
```

### URL Parameter Authentication

You can provide authentication credentials via URL parameters, which take precedence over function parameters:

```html
<script src="node_modules/abxrlib-for-webxr/index.js"></script>
<script>
    // URL: https://yourdomain.com/?abxr_orgid=org456&abxr_auth_secret=secret789
    Abxr_init('app123'); // URL parameters will be automatically detected
    
    // Start using immediately
    Abxr.Event('user_action', { action: 'button_click' });
</script>
```

### Custom Configuration

You can provide custom app configuration:

```html
<script src="node_modules/abxrlib-for-webxr/index.js"></script>
<script>
    const appConfig = '<?xml version="1.0" encoding="utf-8" ?><configuration><appSettings><add key="REST_URL" value="https://your-server.com/v1/"/></appSettings></configuration>';
    
    Abxr_init('app123', 'org456', 'secret789', appConfig);
</script>
```

### Analytics Integration

```javascript
import { Abxr_init, Abxr } from 'abxrlib-for-webxr';

// Initialize
Abxr_init('app123', 'org456', 'secret789');

// Track events
Abxr.Event('button_click');

// Send logs
Abxr.LogDebug('User completed tutorial');
```

### Storage API

```javascript
import { Abxr_init, Abxr } from 'abxrlib-for-webxr';

// Initialize
Abxr_init('app123', 'org456', 'secret789');

// Store data
Abxr.SetStorageEntry({'user_progress': '75%'});

// Retrieve data
const entry = Abxr.GetStorageEntry('user_progress');
```

### Telemetry

```javascript
import { Abxr_init, Abxr } from 'abxrlib-for-webxr';

// Initialize
Abxr_init('app123', 'org456', 'secret789');

// Send telemetry data
Abxr.Telemetry('headset_position', {'x': '1.23', 'y': '4.56', 'z': '7.89'});
```

### AI Integration

```javascript
import { Abxr_init, Abxr } from 'abxrlib-for-webxr';

// Initialize
Abxr_init('app123', 'org456', 'secret789');

// Send AI proxy request
Abxr.AIProxy('Provide a greeting message', '', 'default');
```

## API Reference

### Initialization

- `Abxr_init(appId, orgId?, authSecret?, appConfig?, dialogOptions?, authMechanismCallback?)` - Initialize and authenticate the library
  - `appId` (required): Your application ID
  - `orgId` (optional): Your organization ID (can also be provided via URL parameter `abxr_orgid`)
  - `authSecret` (optional): Your authentication secret (can also be provided via URL parameter `abxr_auth_secret`)
  - `appConfig` (optional): Custom XML configuration string
  - `authMechanismCallback` (optional): Callback function to handle two-step authentication requirements
  - `dialogOptions` (optional): Configuration for built-in XR/HTML dialog system (see examples above)

### Core Methods

- `Abxr.Event(name, meta?)` - Send a custom event
- `Abxr.LogDebug(message)` - Send a debug log message
- `Abxr.LogInfo(message)` - Send an info log message
- `Abxr.LogWarn(message)` - Send a warning log message
- `Abxr.LogError(message)` - Send an error log message
- `Abxr.LogCritical(message)` - Send a critical log message

### Specialized Event Methods

#### Assessment Events
- `Abxr.EventAssessmentStart(assessmentName, meta?)` - Start an assessment
- `Abxr.EventAssessmentComplete(assessmentName, score, eventStatus, meta?)` - Complete an assessment

#### Objective Events
- `Abxr.EventObjectiveStart(objectiveName, meta?)` - Start an objective
- `Abxr.EventObjectiveComplete(objectiveName, score, eventStatus, meta?)` - Complete an objective

#### Interaction Events
- `Abxr.EventInteractionStart(interactionName, meta?)` - Start an interaction
- `Abxr.EventInteractionComplete(interactionName, result, resultDetails, interactionType, meta?)` - Complete an interaction

#### Level Events
- `Abxr.EventLevelStart(levelName, meta?)` - Start a level
- `Abxr.EventLevelComplete(levelName, score, meta?)` - Complete a level

### Storage Methods

- `Abxr.SetStorageEntry(data, keepLatest?, origin?, sessionData?, name?)` - Store data
- `Abxr.GetStorageEntry(name?)` - Retrieve stored data
- `Abxr.RemoveStorageEntry(name?)` - Remove stored data

### Telemetry Methods

- `Abxr.Telemetry(name, data)` - Send telemetry data

### AI Integration Methods

- `Abxr.AIProxy(prompt, pastMessages?, botId?)` - Send AI proxy request

### Configuration Methods

- `Abxr.setDebugMode(enabled)` - Enable/disable debug logging
- `Abxr.getDebugMode()` - Get current debug mode
- `Abxr.isConfigured()` - Check if library is authenticated
- `Abxr.getAuthParams()` - Get authentication parameters (for debugging)

### Authentication Methods

- `Abxr.onAuthCompleted(callback)` - Subscribe to authentication completion notifications
- `Abxr.removeAuthCompletedCallback(callback)` - Remove an authentication completion callback
- `Abxr.clearAuthCompletedCallbacks()` - Remove all authentication completion callbacks

### Module Target Methods

- `Abxr.onModuleTargetAvailable(callback)` - Subscribe to module target availability notifications
- `Abxr.removeModuleTargetCallback(callback)` - Remove a module target callback
- `Abxr.getModuleTarget()` - Get the current module target identifier
- `Abxr.getUserId()` - Get the current user ID
- `Abxr.getUserData()` - Get the current user data

### AuthMechanism Methods

- `Abxr.getRequiresFinalAuth()` - Check if additional authentication is required
- `Abxr.extractAuthMechanismData()` - Get structured authentication requirements
- `Abxr.formatAuthDataForSubmission(input, type, domain?)` - Format user input for authentication
- `Abxr.completeFinalAuth(authData)` - Submit final authentication credentials
- `Abxr.setAuthMechanismCallback(callback)` - Set callback for authentication requirements

### Available Types and Enums

The `Abxr` class exposes commonly used types and enums for easy access:

```javascript
// Result options for assessments and objectives
Abxr.EventStatus.ePass
Abxr.EventStatus.eFail
Abxr.EventStatus.eIncomplete

// Interaction types
Abxr.InteractionType.eClick
Abxr.InteractionType.eDrag
Abxr.InteractionType.eType

// Log levels
Abxr.LogLevel.eDebug
Abxr.LogLevel.eInfo
Abxr.LogLevel.eWarn
Abxr.LogLevel.eError
Abxr.LogLevel.eCritical

// Dictionary for metadata
Abxr.AbxrDictStrings
```

### Usage Examples

```javascript
// Initialize
Abxr_init('app123', 'org456', 'secret789');

// Simple debug mode setting
Abxr.debugMode = true;

// Assessment with result options
Abxr.EventAssessmentComplete('math_test', '85', Abxr.EventStatus.ePass, { time_spent: '30min' });

// Interaction with interaction type
Abxr.EventInteractionComplete('button_click', 'success', 'User clicked submit', Abxr.InteractionType.eClick);

// Create metadata dictionary
const meta = new Abxr.AbxrDictStrings();
meta.set('custom_field', 'value');
Abxr.Event('custom_event', meta);
```