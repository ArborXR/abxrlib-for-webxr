# ABXRLib SDK for WebXR

The name "ABXR" stands for "Analytics Backbone for XR"—a flexible, open-source foundation for capturing and transmitting spatial, interaction, and performance data in XR. When combined with **ArborXR Insights**, ABXR transforms from a lightweight instrumentation layer into a full-scale enterprise analytics solution—unlocking powerful dashboards, LMS/BI integrations, and AI-enhanced insights.

## Table of Contents
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Sending Data](#sending-data)
5. [FAQ](#faq)
6. [Troubleshooting](#troubleshooting)
7. [Contact](#contact)

---

## Introduction

### Overview

The **ABXRLib SDK for WebXR** is an open-source analytics and data collection library that provides developers with the tools to collect and send XR data to any service of their choice. This library enables scalable event tracking, telemetry, and session-based storage—essential for enterprise and education XR environments.

**Why Use ABXRLib SDK?**

- **Open-Source** & portable to any backend—no vendor lock-in  
- **Quick integration**—track user interactions in minutes  
- **Secure & scalable**—ready for enterprise use cases  
- **Pluggable with ArborXR Insights**—seamless access to LMS/BI integrations, session replays, AI diagnostics, and more

> 💡 **Quick Start:** Most developers can integrate ABXRLib SDK and log their first event in under **15 minutes**.

### Core Features

The ABXRLib SDK provides:
- **Event Tracking:** Monitor user behaviors, interactions, and system events.
- **Spatial & Hardware Telemetry:** Capture headset/controller movement and hardware metrics.
- **Object & System Info:** Track XR objects and environmental state.
- **Storage & Session Management:** Support resumable training and long-form experiences.
- **Logs:** Developer and system-level logs available across sessions.

### Backend Services

The ABXRLib SDK is designed to work with any backend service that implements the ABXR protocol. Currently supported services include:

#### ArborXR Insights
When paired with [**ArborXR Insights**](https://arborxr.com/insights), ABXR becomes a full-service platform offering:
- Seamless data pipeline from headset to dashboard
- End-to-end session tracking, analysis, and replay
- AI-driven insights for content quality, learner performance, and device usage
- One-click LMS and BI integrations for scalable deployments

#### Custom Implementations
Developers can implement their own backend services by following the ABXR protocol specification. This allows for complete control over data storage, processing, and visualization.

---

## Installation

### NPM Package Installation

```bash
npm install abxrlib-for-webxr
```

---

## Configuration

### Using with ArborXR Insights Early Access

To use the ABXRLib SDK with ArborXR Insights Early Access program:

#### Get Early Access Credentials
1. Go to the ArborXR Insights Early Access web app and log in (will require [official Early Access sign up](https://arborxr.com/insights-early-access) & onboarding process to access).
2. Grab these three values from the **View Data** screen of the specific app you are configuring:
- App ID
- Organization ID
- Authentication Secret

#### Configure Web Application

The ABXRLib SDK now provides a simplified initialization API. The `appId` is required, while `orgId` and `authSecret` are optional and can be provided via URL parameters.

```typescript
import { Abxr_init, Abxr } from 'abxrlib-for-webxr';

// Simple initialization with all parameters
Abxr_init('your-app-id', 'your-org-id', 'your-auth-secret');

// Or use URL parameters for orgId and authSecret
// URL: https://yourdomain.com/?abxr_orgid=YOUR_ORG_ID&abxr_auth_secret=YOUR_AUTH_SECRET
Abxr_init('your-app-id');

// With custom app configuration
const appConfig = '<?xml version="1.0" encoding="utf-8" ?><configuration><appSettings><add key="REST_URL" value="https://your-server.com/v1/"/></appSettings></configuration>';
Abxr_init('your-app-id', 'your-org-id', 'your-auth-secret', appConfig);

// Now you can use the Abxr class
Abxr.Event('user_action', { action: 'button_click' });
Abxr.LogDebug('Debug message');
```

#### URL Parameter Authentication

You can provide authentication credentials via URL parameters, which take precedence over function parameters:

```
https://yourdomain.com/?abxr_orgid=YOUR_ORG_ID&abxr_auth_secret=YOUR_AUTH_SECRET
```

Then initialize with just the App ID:
```typescript
import { Abxr_init, Abxr } from 'abxrlib-for-webxr';

// URL parameters will be automatically detected
Abxr_init('your-app-id');

// Now you can use the Abxr class
Abxr.Event('user_action', { action: 'button_click' });
```

#### Device ID Management

The SDK automatically handles device ID generation and persistence:
- **Browser environments**: Device ID is stored in localStorage and persists across sessions
- **Non-browser environments**: A new GUID is generated for each initialization

#### Two-Step Authentication (authMechanism)

The SDK supports two-step authentication when the backend requires additional credentials (like a PIN or email). There are multiple approaches to handle this:

##### Option 1: Built-in Dialog System (Recommended)

**NEW:** Zero-code authentication with beautiful, XR-optimized dialogs! Perfect for VR/AR developers:

```typescript
import { Abxr_init } from 'abxrlib-for-webxr';

// Simple initialization - XR dialog appears automatically when needed
Abxr_init('app123', 'org456', 'secret789');

// That's it! The library handles everything:
// - Auto-detects XR environments vs regular browsers
// - Shows beautiful XR-optimized dialogs in VR/AR
// - Includes virtual keyboards for XR environments
// - Falls back to HTML dialogs for regular browsers
// - Handles all auth types (email, PIN, etc.) automatically
```

**Advanced XR Dialog Customization:**

```typescript
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
        },
        overlay: {
            background: 'radial-gradient(circle, rgba(0, 255, 255, 0.2) 0%, rgba(0, 0, 0, 0.9) 100%)'
        }
    }
};

Abxr_init('app123', 'org456', 'secret789', undefined, dialogOptions);
```

**What makes XR dialogs special:**
- 🥽 **VR/AR Optimized**: Beautiful in both desktop browsers and XR headsets
- ⌨️ **Virtual Keyboard**: Built-in keyboard for XR environments (PIN pad for PINs)
- 🎨 **Fully Customizable**: Colors, styling, and behavior - match your brand
- 🔄 **Auto-Detection**: Automatically chooses XR vs HTML dialog based on environment
- 📱 **Universal**: Works everywhere - desktop, mobile, and XR devices

##### Option 2: Custom Callback Approach

For developers who want to provide their own authentication UI:

```typescript
import { Abxr_init, Abxr, AuthMechanismData } from 'abxrlib-for-webxr';

// Define callback to handle authentication requirements
function handleAuthMechanism(authData: AuthMechanismData) {
    console.log('Auth required:', authData.type); // e.g., 'email', 'assessmentPin'
    console.log('Prompt:', authData.prompt);      // e.g., 'Enter your Email'
    console.log('Domain:', authData.domain);      // e.g., 'acme.com' (for email type)
    
    // Show UI to collect user input
    const userInput = prompt(authData.prompt);
    
    // Format and submit authentication data
    const formattedAuthData = Abxr.formatAuthDataForSubmission(userInput, authData.type, authData.domain);
    
    Abxr.completeFinalAuth(formattedAuthData).then(success => {
        if (success) {
            console.log('Authentication complete');
        } else {
            console.log('Authentication failed');
        }
    });
}

// Initialize with callback
Abxr_init('app123', 'org456', 'secret789', undefined, undefined, handleAuthMechanism);
```

##### Option 3: Manual Check Approach

Check for additional authentication requirements manually (for advanced use cases):

```typescript
import { Abxr_init, Abxr } from 'abxrlib-for-webxr';

// Step 1: Initial authentication
Abxr_init('app123', 'org456', 'secret789');

// Step 2: Check if additional authentication is required
if (Abxr.getRequiresFinalAuth()) {
    console.log('Additional authentication required');
    
    // Extract structured auth data
    const authData = Abxr.extractAuthMechanismData();
    if (authData) {
        console.log('Auth type:', authData.type);     // e.g., 'email', 'assessmentPin'
        console.log('Prompt:', authData.prompt);      // e.g., 'Enter your Email'
        console.log('Domain:', authData.domain);      // e.g., 'acme.com'
        
        // Get user input
        const userInput = prompt(authData.prompt);
        
        // Format and submit
        const formattedData = Abxr.formatAuthDataForSubmission(userInput, authData.type, authData.domain);
        const success = await Abxr.completeFinalAuth(formattedData);
        
        if (success) {
            console.log('Authentication complete');
        }
    }
}
```

##### AuthMechanism Types

The SDK supports various authentication types:
- **`email`**: Email-based authentication with domain support
- **`assessmentPin`**: PIN-based authentication for assessments
- **Custom types**: As defined by your backend service

##### Helper Methods

- `Abxr.extractAuthMechanismData()` - Get structured auth requirements
- `Abxr.formatAuthDataForSubmission(input, type, domain?)` - Format user input for submission
- `Abxr.getRequiresFinalAuth()` - Check if additional auth is required
- `Abxr.completeFinalAuth(authData)` - Submit final authentication credentials

#### Import Options

You have several options for importing the library:

**Option 1: Import both initialization and main class**
```typescript
import { Abxr_init, Abxr } from 'abxrlib-for-webxr';
```

**Option 2: Import everything**
```typescript
import { Abxr_init, Abxr, AbxrLib } from 'abxrlib-for-webxr';
```

**Option 3: Browser global scope (no import needed)**
```html
<script src="node_modules/abxrlib-for-webxr/index.js"></script>
<script>
    // Abxr_init and Abxr are available globally
    Abxr_init('app123', 'org456', 'secret789');
    Abxr.Event('user_action', { action: 'button_click' });
</script>
```

### Using with Other Backend Services
For information on implementing your own backend service or using other compatible services, please refer to the ABXR protocol specification.

---

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

// Example Usage - Event with Multiple Metadata Formats
Abxr.Event('player_teleported', {
    'destination': 'spawn_point',
    'method': 'instant'
});
```

**Parameters:**
- `name` (string): The name of the event. Use snake_case for better analytics processing.
- `meta` (object|string|null): Optional. Additional key-value pairs describing the event. Supports multiple formats: plain objects, JSON strings, URL parameter strings, or AbxrDictStrings objects.

Logs a named event with optional metadata and spatial context. Timestamps and origin (`user` or `system`) are automatically appended.

### Metadata Formats

The ABXRLib SDK supports multiple flexible formats for the `meta` parameter in all event and log methods. You can use whatever format is most convenient for your application:

#### 1. Plain JavaScript Objects (Recommended)
```typescript
// Simple and intuitive - works with any object
await Abxr.Event('user_action', { 
    action: 'click', 
    timestamp: new Date().toISOString(),
    userId: 12345,
    completed: true
});

await Abxr.LogInfo('User login', {
    username: 'john_doe',
    loginMethod: 'oauth',
    deviceType: 'mobile'
});
```

#### 2. JSON Strings
```typescript
// Perfect for APIs or stored JSON data
await Abxr.EventAssessmentStart('Math Quiz', '{"difficulty": "hard", "timeLimit": 300, "attempts": 1}');

await Abxr.LogError('API Error', '{"endpoint": "/api/users", "status": 500, "message": "Database timeout"}');
```

#### 3. URL Parameter Strings
```typescript
// Great for form data or query parameters
await Abxr.Event('form_submit', 'name=John%20Doe&email=john@example.com&age=25');

await Abxr.LogDebug('Search query', 'query=virtual+reality&category=education&page=2');

// Handles complex values with = signs
await Abxr.Event('equation_solved', 'formula=x=y+5&result=10&method=substitution');
```

#### 4. AbxrDictStrings Objects (Advanced)
```typescript
// For advanced users who need precise control
const meta = new Abxr.AbxrDictStrings();
meta.Add('custom_field', 'value');
meta.Add('timestamp', Date.now().toString());
await Abxr.Event('custom_event', meta);
```

#### 5. Primitive Values
```typescript
// For simple single-value metadata
await Abxr.Event('score_update', 1500);  // Number
await Abxr.LogInfo('Feature enabled', true);  // Boolean
await Abxr.Event('user_message', 'Hello World');  // String
```

#### 6. No Metadata
```typescript
// Events and logs work fine without metadata
await Abxr.Event('app_started');
await Abxr.LogInfo('Application initialized');
```

#### Automatic Conversion Examples

The SDK automatically handles conversion and URL decoding:

```typescript
// URL parameters with encoding
'user=John%20Doe&message=Hello%20World'
// Becomes: { user: "John Doe", message: "Hello World" }

// JSON with nested data
'{"user": {"name": "John", "age": 30}, "scores": [95, 87, 92]}'
// Becomes: { user: "John,30", scores: "95,87,92" }

// Mixed formats work seamlessly
await Abxr.EventLevelComplete('Level 1', '85', 'score=85&attempts=3&bonus=true');
await Abxr.EventAssessmentStart('Quiz', { startTime: Date.now(), difficulty: 'medium' });
```

**All event and log methods support these flexible metadata formats:**
- `Abxr.Event(name, meta?)`
- `Abxr.EventAssessmentStart/Complete(..., meta?)`
- `Abxr.EventObjectiveStart/Complete(..., meta?)`
- `Abxr.EventInteractionStart/Complete(..., meta?)`
- `Abxr.EventLevelStart/Complete(..., meta?)`
- `Abxr.LogDebug/Info/Warn/Error/Critical(message, meta?)`

### Event Wrappers (for LMS Compatibility)

The LMS Event Functions are specialized versions of the Event method, tailored for common scenarios in XR experiences. These functions help enforce consistency in event logging across different parts of the application and are crucial for powering integrations with Learning Management System (LMS) platforms. By using these standardized wrapper functions, developers ensure that key events like starting or completing levels, assessments, or interactions are recorded in a uniform format. This consistency not only simplifies data analysis but also facilitates seamless communication with external educational systems, enhancing the overall learning ecosystem.

#### Assessments
Assessments are intended to track the overall performance of a learner across multiple Objectives and Interactions. 
* Think of it as the learner's score for a specific course or curriculum.
* When the Assessment is complete, it will automatically record and close out the Assessment in the various LMS platforms we support.

```javascript
// JavaScript Event Method Signatures
Abxr.EventAssessmentStart(assessmentName, meta = null)
Abxr.EventAssessmentComplete(assessmentName, score, eventStatus = EventStatus.eComplete, meta = null)

// Example Usage
Abxr.EventAssessmentStart('final_exam');
Abxr.EventAssessmentComplete('final_exam', '92', Abxr.EventStatus.ePass);

// With metadata - multiple formats supported
Abxr.EventAssessmentStart('final_exam', {
    'difficulty': 'hard',
    'timeLimit': 1800,
    'attempts': 1
});

Abxr.EventAssessmentComplete('final_exam', '92', Abxr.EventStatus.ePass, {
    'timeSpent': 1650,
    'questionsCorrect': 23,
    'questionsTotal': 25
});
```

#### Objectives
```javascript
// JavaScript Event Method Signatures
Abxr.EventObjectiveStart(objectiveName, meta = null)
Abxr.EventObjectiveComplete(objectiveName, score, eventStatus = EventStatus.eComplete, meta = null)

// Example Usage
Abxr.EventObjectiveStart('open_valve');
Abxr.EventObjectiveComplete('open_valve', '100', Abxr.EventStatus.eComplete);

// With metadata
Abxr.EventObjectiveStart('open_valve', {
    'location': 'engine_room',
    'tool': 'wrench',
    'difficulty': 'medium'
});

Abxr.EventObjectiveComplete('open_valve', '100', Abxr.EventStatus.eComplete, {
    'attempts': 1,
    'time': 45,
    'hints': 0
});
```

#### Interactions
```javascript
// JavaScript Event Method Signatures
Abxr.EventInteractionStart(interactionName, meta = null)
Abxr.EventInteractionComplete(interactionName, interactionType, response = "", meta = null)

// Example Usage
Abxr.EventInteractionStart('select_option_a');
Abxr.EventInteractionComplete('select_option_a', Abxr.InteractionType.eSelect, 'A');

// With metadata
Abxr.EventInteractionStart('select_option_a', {
    'options': 'A,B,C,D',
    'question': 'What is the correct answer?',
    'timeLimit': 30
});

Abxr.EventInteractionComplete('select_option_a', Abxr.InteractionType.eSelect, 'A', {
    'correct': true,
    'timeSpent': 15,
    'confidence': 'high'
});
```

### Logging
The Log Methods provide straightforward logging functionality, similar to syslogs. These functions are available to developers by default, even across enterprise users, allowing for consistent and accessible logging across different deployment scenarios.

```javascript
// JavaScript Event Method Signatures
Abxr.Log(level, message, meta = null)

// Example usage
Abxr.Log(Abxr.LogLevel.eInfo, 'Module started');
```

Use standard or severity-specific logging:
```javascript
// JavaScript Event Method Signatures
Abxr.LogDebug(message, meta = null)
Abxr.LogInfo(message, meta = null)
Abxr.LogWarn(message, meta = null)
Abxr.LogError(message, meta = null)
Abxr.LogCritical(message, meta = null)

// Example usage
Abxr.LogError('Critical error in assessment phase');

// With metadata - all formats supported
Abxr.LogInfo('User login', {
    'userId': 12345,
    'loginMethod': 'oauth',
    'ipAddress': '192.168.1.100'
});

Abxr.LogError('API Error', 'endpoint=/api/users&status=500&timeout=5000');
```

### Storage API
The Storage API enables developers to store and retrieve learner/player progress, facilitating the creation of long-form training content. When users log in using ArborXR's facility or the developer's in-app solution, these methods allow users to continue their progress on different headsets, ensuring a seamless learning experience across multiple sessions or devices.

#### Save Progress
```javascript
// JavaScript Event Method Signatures
Abxr.SetStorageEntry(data, name = "state", keepLatest = true, origin = null, sessionData = false)

// Example usage
Abxr.SetStorageEntry({'progress': '75%'});

// With more options
Abxr.SetStorageEntry({'progress': '75%', 'level': 'intermediate'}, 'user_progress', true, 'game', false);
```
**Parameters:**
- `data` (object): The key-value pairs to store.
- `name` (string): Optional. The identifier for this storage entry. Default is "state".
- `keepLatest` (bool): Optional. If true, only the most recent entry is kept. If false, entries are appended. Default is true.
- `origin` (string): Optional. The source of the data (e.g., "system").
- `sessionData` (bool): Optional. If true, the data is specific to the current session. Default is false.

#### Retrieve Data
```javascript
// JavaScript Event Method Signatures
Abxr.GetStorageEntry(name = "state", origin = null, tagsAny = null, tagsAll = null, userOnly = false)

// Example usage
var state = Abxr.GetStorageEntry('state');
```
**Parameters:**
- `name` (string): Optional. The identifier of the storage entry to retrieve. Default is "state".
- `origin` (string): Optional. Filter entries by their origin ("system", "user", or "admin").
- `tagsAny` (array): Optional. Retrieve entries matching any of these tags.
- `tagsAll` (array): Optional. Retrieve entries matching all of these tags.
- `userOnly` (bool): Optional. If true, retrieve data for the current user across all devices for this app. Default is false.

**Returns:** An object containing the retrieved storage entry.

#### Remove Storage
```javascript
// JavaScript Event Method Signatures
Abxr.RemoveStorageEntry(name = "state")

// Example usage
Abxr.RemoveStorageEntry('state');
```
**Parameters:**
- `name` (string): Optional. The identifier of the storage entry to remove. Default is "state".

#### Get All Entries
```javascript
// JavaScript Event Method Signatures
Abxr.GetAllStorageEntries()

// Example usage
var allEntries = Abxr.GetAllStorageEntries();
```
**Returns:** An object containing all storage entries for the current user/device.

### Telemetry
The Telemetry Methods provide comprehensive tracking of the XR environment. By default, they capture headset and controller movements, but can be extended to track any custom objects in the virtual space. These functions also allow collection of system-level data such as frame rates or device temperatures. This versatile tracking enables developers to gain deep insights into user interactions and application performance, facilitating optimization and enhancing the overall XR experience.

To log spatial or system telemetry:
```javascript
// JavaScript Event Method Signatures
Abxr.Telemetry(name, data)

// Example usage
Abxr.Telemetry('headset_position', {'x': '1.23', 'y': '4.56', 'z': '7.89'});
```

**Parameters:**
- `name` (string): The type of telemetry data (e.g., "OS_Version", "Battery_Level", "RAM_Usage").
- `data` (object): Key-value pairs of telemetry data.

### AI Integration Methods
The Integration Methods offer developers access to additional services, enabling customized experiences for enterprise users. Currently, this includes access to GPT services through the AIProxy method, allowing for advanced AI-powered interactions within the XR environment. More integration services are planned for future releases, further expanding the capabilities available to developers for creating tailored enterprise solutions.

#### AIProxy
```javascript
// JavaScript Event Method Signatures
Abxr.AIProxy(prompt, pastMessages = "", botId = "")

// Example usage
Abxr.AIProxy('Provide me a randomized greeting that includes common small talk and ends by asking some form of how can I help');
```

**Parameters:**
- `prompt` (string): The input prompt for the AI.
- `pastMessages` (string): Optional. Previous conversation history for context.
- `botId` (string): Optional. An identifier for a specific pre-defined chatbot.

**Returns:** The AI-generated response as a string.

**Note:** AIProxy calls are processed immediately and bypass the cache system. However, they still respect the SendRetriesOnFailure and SendRetryInterval settings.

### Authentication Methods

#### SetUserId
```javascript
// JavaScript Event Method Signatures
Abxr.SetUserId(userId)
```

#### SetUserMeta
```javascript
// JavaScript Event Method Signatures
Abxr.SetUserMeta(metaString)
```

**Parameters:**
- `userId` (string): The User ID used during authentication (setting this will trigger re-authentication).
- `metaString` (string): A string of key-value pairs in JSON format.

### Other Event Wrappers
#### Levels
```javascript
// JavaScript Event Method Signatures
Abxr.EventLevelStart(levelName) 
Abxr.EventLevelComplete(levelName, score, meta = null)

// Example Usage
Abxr.EventLevelStart('level_1');
Abxr.EventLevelComplete('level_1', 85);

// For flagging critical training events (e.g., skipped safety checks, high-risk errors) for auto-inclusion in the Critical Choices Chart
Abxr.EventCritical(label, meta = null)
```

**Parameters for all Event Wrapper Functions:**
- `levelName/assessmentName/objectiveName/interactionName` (string): The identifier for the assessment, objective, interaction, or level.
- `score` (int): The numerical score achieved. While typically between 1-100, any integer is valid. In metadata, you can also set a minScore and maxScore to define the range of scores for this objective.
- `result` (EventStatus for Assessment and Objective): The basic result of the assessment or objective.
- `result` (Interactions): The result for the interaction is based on the InteractionType.
- `resultDetails` (string): Optional. Additional details about the result. For interactions, this can be a single character or a string. For example: "a", "b", "c" or "correct", "incorrect".
- `type` (InteractionType): Optional. The type of interaction for this event.
- `meta` (object|string): Optional. Additional key-value pairs describing the event.

**Note:** All complete events automatically calculate duration if a corresponding start event was logged.

---

## Module Target Callback (LMS Multi-Module Support)

The **Module Target** feature enables developers to create single applications with multiple modules, where each module can be its own assignment in an LMS. When a learner enters from the LMS for a specific module, the application can automatically direct the user to that module within the application. Individual grades and results are then tracked for that specific assignment in the LMS.

### Why Use Module Target?

- **Multi-Module Applications**: Build one XR app with multiple learning modules or chapters
- **LMS Integration**: Each module becomes a separate assignment in your LMS
- **Automatic Navigation**: Direct users to specific modules based on LMS entry point
- **Granular Tracking**: Individual grades and progress per module/assignment
- **Popular Feature**: Requested by many developers building large educational XR applications

### Setting Up Module Target Callback

```javascript
// Subscribe to moduleTarget availability
Abxr.onModuleTargetAvailable(function(data) {
    console.log('ModuleTarget received:', data.moduleTarget);
    console.log('User ID:', data.userId);
    console.log('User Data:', data.userData);
    console.log('Is Authenticated:', data.isAuthenticated);
    
    // Direct user to specific module based on moduleTarget
    switch(data.moduleTarget) {
        case 'module_1_basics':
            navigateToBasicsModule();
            break;
        case 'module_2_advanced':
            navigateToAdvancedModule();
            break;
        case 'module_3_assessment':
            navigateToAssessmentModule();
            break;
        default:
            showModuleSelectionMenu();
    }
});

// Example navigation functions
function navigateToBasicsModule() {
    // Your app logic to show Module 1
    console.log('Loading Basics Module...');
    // Start module-specific tracking
    Abxr.EventAssessmentStart('basics_module');
}

function navigateToAdvancedModule() {
    // Your app logic to show Module 2
    console.log('Loading Advanced Module...');
    Abxr.EventAssessmentStart('advanced_module');
}
```

### Module Target Data Structure

The callback receives a `ModuleTargetData` object with the following properties:

```javascript
interface ModuleTargetData {
    moduleTarget: string | null;  // The specific module identifier from LMS
    userData?: any;               // Additional user data from authentication
    userId?: any;                 // User identifier
    isAuthenticated: boolean;     // Authentication status
}
```

### Getting Module Target Information

You can also retrieve module target information directly:

```javascript
// Check if user is authenticated and get module target
if (Abxr.isConfigured()) {
    const moduleTarget = Abxr.getModuleTarget();
    const userId = Abxr.getUserId();
    const userData = Abxr.getUserData();
    
    if (moduleTarget) {
        console.log('User should be directed to module:', moduleTarget);
    }
}
```

### Removing Module Target Callbacks

```javascript
// Store callback reference to remove later
const myCallback = function(data) {
    console.log('Module target:', data.moduleTarget);
};

// Subscribe
Abxr.onModuleTargetAvailable(myCallback);

// Unsubscribe when no longer needed
Abxr.removeModuleTargetCallback(myCallback);
```

### Best Practices

1. **Set up callback early**: Subscribe to `onModuleTargetAvailable` before or immediately after `Abxr_init()`
2. **Handle all cases**: Provide fallback behavior when `moduleTarget` is null or unexpected
3. **Module-specific tracking**: Use different assessment/objective names for each module
4. **Error handling**: Wrap callback logic in try-catch blocks
5. **User experience**: Show loading indicators while determining module target

### Example: Complete Multi-Module Setup

```javascript
// Initialize ABXRLib SDK
Abxr_init('your-app-id', 'your-org-id', 'your-auth-secret');

// Set up module target handling
Abxr.onModuleTargetAvailable(function(data) {
    if (!data.isAuthenticated) {
        console.log('User not authenticated yet');
        return;
    }
    
    const moduleTarget = data.moduleTarget;
    
    if (moduleTarget) {
        console.log(`Directing user to module: ${moduleTarget}`);
        
        // Start module-specific assessment tracking
        Abxr.EventAssessmentStart(moduleTarget, {
            'user_id': data.userId,
            'entry_method': 'lms_direct'
        });
        
        // Navigate to specific module
        loadModule(moduleTarget);
    } else {
        console.log('No specific module target - showing main menu');
        showMainMenu();
    }
});

// Your module loading logic
function loadModule(moduleId) {
    // Hide main menu, show specific module
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById(moduleId).style.display = 'block';
    
    // Track module start
    Abxr.Event('module_started', {'module_id': moduleId});
}
```

---

## FAQ

### Q: How do I retrieve my Application ID and Authorization Secret?
A: Your Application ID can be found in the Web Dashboard under the application details. For the Authorization Secret, navigate to Settings > Organization Codes on the same dashboard.

### Q: How do I enable object tracking?
A: Object tracking can be enabled by adding the Track Object component to any GameObject in your scene via the Unity Inspector.

## Troubleshooting

---

## Persisting User State with ArborXR Insights

The ABXRLib SDK includes a built-in storage interface that enables persistent session data across XR devices. This is ideal for applications with long-form content, resumable training, or user-specific learning paths.

When integrated with **ArborXR Insights**, session state data is securely stored and can be retrieved from any device, enabling users to resume exactly where they left off. 

### Benefits of Using ArborXR Insights for Storage:
- Cross-device continuity and resuming sessions
- Secure, compliant storage (GDPR, HIPAA-ready)
- Configurable behaviors (e.g., `keepLatest`, append history)
- Seamless AI and analytics integration for stored user states

To use this feature, simply call the storage functions provided in the SDK (`AddStorage`, `GetStorageEntry`, etc.). These entries are automatically synced with ArborXR's cloud infrastructure, ensuring consistent data across sessions.

---

## ArborXR Insights Web Portal & API

For dashboards, analytics queries, impersonation, and integration management, use the **ArborXR Insights User API**, accessible through the platform's admin portal.

Example features:
- Visualize training completion & performance by cohort
- Export SCORM/xAPI-compatible results
- Query trends in interaction data

Endpoints of note:
- `/v1/analytics/dashboard`
- `/v1/admin/system/organization/{org_id}`
- `/v1/analytics/data`

---

## Support

- **Docs:** [https://help.arborxr.com/](https://help.arborxr.com/)
- **GitHub:** [https://github.com/ArborXR/abxrlib-for-webxr](https://github.com/ArborXR/abxrlib-for-webxr)

---

## Building from Source

### Using Docker

To build the package using Docker:

1. Build the Docker container:
```bash
docker build -t abxrlib-for-webxr .
```

2. Run the container:
```bash
docker run -p 6001:6001 abxrlib-for-webxr
```

This will start the development server on `http://localhost:6001`.

### Using Node.js

Alternatively, you can build and run the package using Node.js:

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The server will be available at `http://localhost:6001`.

### Testing the Build

Once the server is running, you can test the build by navigating to:
```
http://localhost:6001/?xrdm_orgid=YOUR_ORG_ID&xrdm_authsecret=YOUR_AUTH_SECRET
```

Replace `YOUR_ORG_ID` and `YOUR_AUTH_SECRET` with your actual organization ID and authentication secret.

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

// Enable debug mode
Abxr.setDebugMode(true);

// Assessment with flexible metadata formats
Abxr.EventAssessmentComplete('math_test', '85', Abxr.EventStatus.ePass, { 
    timeSpent: 1800, 
    questionsCorrect: 17, 
    questionsTotal: 20 
});

// Interaction with URL parameter metadata
Abxr.EventInteractionComplete('button_click', Abxr.InteractionType.eClick, 'success', 'x=150&y=200&button=submit');

// Event with JSON string metadata
Abxr.Event('custom_event', '{"user": "john_doe", "level": 5, "score": 1250}');

// Log with simple object metadata
Abxr.LogInfo('User action', { action: 'login', timestamp: Date.now() });

// Traditional AbxrDictStrings still works
const meta = new Abxr.AbxrDictStrings();
meta.Add('custom_field', 'value');
Abxr.Event('legacy_event', meta);
```

## API Reference

### Initialization

- `Abxr_init(appId, orgId?, authSecret?, appConfig?, dialogOptions?, authMechanismCallback?)` - Initialize and authenticate the library
  - `appId` (required): Your application ID
  - `orgId` (optional): Your organization ID (can also be provided via URL parameter `abxr_orgid`)
  - `authSecret` (optional): Your authentication secret (can also be provided via URL parameter `abxr_auth_secret`)
  - `appConfig` (optional): Custom XML configuration string
  - `authMechanismCallback` (optional): Callback function to handle two-step authentication requirements
  - `dialogOptions` (optional): Configuration for built-in dialog system (see XR Dialog examples above)

### Core Methods

- `Abxr.Event(name, meta?)` - Send a custom event with optional metadata
- `Abxr.LogDebug(message, meta?)` - Send a debug log message with optional metadata
- `Abxr.LogInfo(message, meta?)` - Send an info log message with optional metadata
- `Abxr.LogWarn(message, meta?)` - Send a warning log message with optional metadata
- `Abxr.LogError(message, meta?)` - Send an error log message with optional metadata
- `Abxr.LogCritical(message, meta?)` - Send a critical log message with optional metadata

**Note:** The `meta` parameter supports multiple formats: plain JavaScript objects, JSON strings, URL parameter strings, AbxrDictStrings objects, primitive values, or can be omitted entirely. See [Metadata Formats](#metadata-formats) for details.

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

**Note:** All specialized event methods support the same flexible metadata formats as the core methods. See [Metadata Formats](#metadata-formats) for examples and supported formats.

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

### Module Target Methods

- `Abxr.onModuleTargetAvailable(callback)` - Subscribe to module target availability notifications
- `Abxr.removeModuleTargetCallback(callback)` - Remove a module target callback
- `Abxr.getModuleTarget()` - Get the current module target identifier
- `Abxr.getUserId()` - Get the current user ID
- `Abxr.getUserData()` - Get the current user data
