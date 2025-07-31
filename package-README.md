# AbxrLib for WebXR

A JavaScript library for WebXR applications, providing tools for XR development, analytics, and client management.

## Installation

```bash
npm install abxrlib-for-webxr
```

## Simple Setup

The easiest way to get started is with a single function call:

```html
<script src="node_modules/abxrlib-for-webxr/index.js"></script>
<script>
    // Initialize and authenticate in one call
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

When your backend requires additional authentication (like PIN or email), use a callback:

```html
<script src="node_modules/abxrlib-for-webxr/index.js"></script>
<script>
    // Define callback to handle authentication requirements
    function handleAuthMechanism(authData) {
        console.log('Auth required:', authData.type);   // e.g., 'email', 'assessmentPin'
        console.log('Prompt:', authData.prompt);        // e.g., 'Enter your Email'
        
        // Show UI to collect user input
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
    
    // Initialize with callback
    Abxr_init('app123', 'org456', 'secret789', undefined, handleAuthMechanism);
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
Abxr.ResultOptions.ePassed
Abxr.ResultOptions.eFailed
Abxr.ResultOptions.eIncomplete

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

// Enable debug mode
Abxr.setDebugMode(true);

// Assessment with result options
Abxr.EventAssessmentComplete('math_test', '85', Abxr.ResultOptions.ePassed, { time_spent: '30min' });

// Interaction with interaction type
Abxr.EventInteractionComplete('button_click', 'success', 'User clicked submit', Abxr.InteractionType.eClick);

// Create metadata dictionary
const meta = new Abxr.AbxrDictStrings();
meta.set('custom_field', 'value');
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

```typescript
import { Abxr_init, Abxr } from 'abxrlib-for-webxr';

// Initialize
Abxr_init('app123', 'org456', 'secret789');

// Track events
Abxr.Event('button_click');

// Send logs
Abxr.LogDebug('User completed tutorial');
```

### Storage API

```typescript
import { Abxr_init, Abxr } from 'abxrlib-for-webxr';

// Initialize
Abxr_init('app123', 'org456', 'secret789');

// Store data
Abxr.SetStorageEntry('user_progress', '75%');

// Retrieve data
const entry = Abxr.GetStorageEntry('user_progress');
```

### Telemetry

```typescript
import { Abxr_init, Abxr } from 'abxrlib-for-webxr';

// Initialize
Abxr_init('app123', 'org456', 'secret789');

// Send telemetry data
const data = new Abxr.AbxrDictStrings();
data.set('x', '1.23');
data.set('y', '4.56');
data.set('z', '7.89');
Abxr.Telemetry('headset_position', data);
```

### AI Integration

```typescript
import { Abxr_init, Abxr } from 'abxrlib-for-webxr';

// Initialize
Abxr_init('app123', 'org456', 'secret789');

// Send AI proxy request
Abxr.AIProxy(
  'Provide a greeting message',
  '', // past messages
  'default' // bot id
);
```

## API Reference

### Initialization

- `Abxr_init(appId, orgId?, authSecret?, appConfig?, authMechanismCallback?)` - Initialize and authenticate the library
  - `appId` (required): Your application ID
  - `orgId` (optional): Your organization ID (can also be provided via URL parameter `abxr_orgid`)
  - `authSecret` (optional): Your authentication secret (can also be provided via URL parameter `abxr_auth_secret`)
  - `appConfig` (optional): Custom XML configuration string
  - `authMechanismCallback` (optional): Callback function to handle two-step authentication requirements

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
- `Abxr.EventAssessmentComplete(assessmentName, score, resultOptions, meta?)` - Complete an assessment

#### Objective Events
- `Abxr.EventObjectiveStart(objectiveName, meta?)` - Start an objective
- `Abxr.EventObjectiveComplete(objectiveName, score, resultOptions, meta?)` - Complete an objective

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
Abxr.ResultOptions.ePassed
Abxr.ResultOptions.eFailed
Abxr.ResultOptions.eIncomplete

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
Abxr.EventAssessmentComplete('math_test', '85', Abxr.ResultOptions.ePassed, { time_spent: '30min' });

// Interaction with interaction type
Abxr.EventInteractionComplete('button_click', 'success', 'User clicked submit', Abxr.InteractionType.eClick);

// Create metadata dictionary
const meta = new Abxr.AbxrDictStrings();
meta.set('custom_field', 'value');
Abxr.Event('custom_event', meta);
```