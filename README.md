# ABXRLib SDK for WebXR

The name "ABXR" stands for "Analytics Backbone for XR"—a flexible, open-source foundation for capturing and transmitting spatial, interaction, and performance data in XR. When combined with **ArborXR Insights**, ABXR transforms from a lightweight instrumentation layer into a full-scale enterprise analytics solution—unlocking powerful dashboards, LMS/BI integrations, and AI-enhanced insights.

## Table of Contents
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Sending Data](#sending-data)
   - [Events](#events)
   - [Analytics Event Wrappers](#analytics-event-wrappers-essential-for-all-developers)
   - [Timed Events](#timed-events)
   - [Super Properties](#super-properties)
   - [Logging](#logging)
   - [Storage](#storage)
   - [Telemetry](#telemetry)
   - [AI Integration](#ai-integration)
   - [Exit Polls](#exit-polls)
   - [Metadata Formats](#metadata-formats)
5. [Advanced Features](#advanced-features)
   - [Module Targets](#module-targets)
   - [Authentication](#authentication)
   - [Session Management](#session-management)
   - [Mixpanel Compatibility](#mixpanel-compatibility)
6. [Configuration](#configuration)
   - [Configuration Status](#configuration-status)
7. [Support](#support)
   - [Resources](#resources)
   - [FAQ](#faq)
   - [Troubleshooting](#troubleshooting)
   - [Debug Mode](#debug-mode)

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

### Using with ArborXR Insights

To use the ABXRLib SDK with ArborXR Insights:

#### Get Your Credentials
1. Go to the ArborXR Insights web app and log in.
2. Grab these three values from the **View Data** screen of the specific app you are configuring:
- App ID
- Organization ID
- Authentication Secret

#### Configure Web Application

The ABXRLib SDK now provides a simplified initialization API. The `appId` is required, while `orgId` and `authSecret` are optional and can be provided via URL parameters.

> **⚠️ Security Note:** For production builds distributed to third parties, avoid compiling `orgId` and `authSecret` directly into your application code. Instead, use URL parameters or environment variables to provide these credentials at runtime. Only compile credentials directly into the build when creating custom applications for specific individual clients.

```typescript
import { Abxr_init, Abxr } from 'abxrlib-for-webxr';

// RECOMMENDED: Use URL parameters for production builds
// URL: https://yourdomain.com/?abxr_orgid=YOUR_ORG_ID&abxr_auth_secret=YOUR_AUTH_SECRET
Abxr_init('your-app-id');

// DEVELOPMENT ONLY: Direct initialization with all parameters
Abxr_init('your-app-id', 'your-org-id', 'your-auth-secret');

// With custom app configuration
const appConfig = '<?xml version="1.0" encoding="utf-8" ?><configuration><appSettings><add key="REST_URL" value="https://your-server.com/v1/"/></appSettings></configuration>';
Abxr_init('your-app-id', 'your-org-id', 'your-auth-secret', appConfig);

// Now you can use the Abxr class (no await needed - runs in background!)
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

### Events
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
// Simple and intuitive - works with any object (runs in background)
Abxr.Event('user_action', { 
    action: 'click', 
    timestamp: new Date().toISOString(),
    userId: 12345,
    completed: true
});

Abxr.LogInfo('User login', {
    username: 'john_doe',
    loginMethod: 'oauth',
    deviceType: 'mobile'
});
```

#### 2. JSON Strings
```typescript
// Perfect for APIs or stored JSON data (runs in background)
Abxr.EventAssessmentStart('Math Quiz', '{"difficulty": "hard", "timeLimit": 300, "attempts": 1}');

Abxr.LogError('API Error', '{"endpoint": "/api/users", "status": 500, "message": "Database timeout"}');
```

#### 3. URL Parameter Strings
```typescript
// Great for form data or query parameters (runs in background)
Abxr.Event('form_submit', 'name=John%20Doe&email=john@example.com&age=25');

Abxr.LogDebug('Search query', 'query=virtual+reality&category=education&page=2');

// Handles complex values with = signs
Abxr.Event('equation_solved', 'formula=x=y+5&result=10&method=substitution');
```

#### 4. AbxrDictStrings Objects (Advanced)
```typescript
// For advanced users who need precise control (runs in background)
const meta = new Abxr.AbxrDictStrings();
meta.Add('custom_field', 'value');
meta.Add('timestamp', Date.now().toString());
Abxr.Event('custom_event', meta);
```

#### 5. Primitive Values
```typescript
// For simple single-value metadata (runs in background)
Abxr.Event('score_update', 1500);  // Number
Abxr.LogInfo('Feature enabled', true);  // Boolean
Abxr.Event('user_message', 'Hello World');  // String
```

#### 6. No Metadata
```typescript
// Events and logs work fine without metadata (runs in background)
Abxr.Event('app_started');
Abxr.LogInfo('Application initialized');
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

// Mixed formats work seamlessly (runs in background)
Abxr.EventLevelComplete('Level 1', 85, 'score=85&attempts=3&bonus=true');
Abxr.EventAssessmentStart('Quiz', { startTime: Date.now(), difficulty: 'medium' });
```

**All event and log methods support these flexible metadata formats:**
- `Abxr.Event(name, meta?)`
- `Abxr.EventAssessmentStart/Complete(..., meta?)`
- `Abxr.EventObjectiveStart/Complete(..., meta?)`
- `Abxr.EventInteractionStart/Complete(..., meta?)`
- `Abxr.EventLevelStart/Complete(..., meta?)`
- `Abxr.LogDebug/Info/Warn/Error/Critical(message, meta?)`

### Analytics Event Wrappers (Essential for All Developers)

**These analytics event functions are essential for ALL developers, not just those integrating with LMS platforms.** They provide standardized tracking for key user interactions and learning outcomes that are crucial for understanding user behavior, measuring engagement, and optimizing XR experiences.

**EventAssessmentStart and EventAssessmentComplete should be considered REQUIRED for proper usage** of the ABXRLib SDK, as they provide critical insights into user performance and completion rates.

The Analytics Event Functions are specialized versions of the Event method, tailored for common scenarios in XR experiences. These functions help enforce consistency in event logging across different parts of the application and provide valuable data for analytics, user experience optimization, and business intelligence. While they also power integrations with Learning Management System (LMS) platforms, their benefits extend far beyond educational use cases.

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
Abxr.EventAssessmentComplete('final_exam', 92, Abxr.EventStatus.ePass);

// With metadata - multiple formats supported
Abxr.EventAssessmentStart('final_exam', {
    'difficulty': 'hard',
    'timeLimit': 1800,
    'attempts': 1
});

Abxr.EventAssessmentComplete('final_exam', 92, Abxr.EventStatus.ePass, {
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

### Other Event Wrappers
#### Levels
```javascript
// JavaScript Event Method Signatures
Abxr.EventLevelStart(levelName) 
Abxr.EventLevelComplete(levelName, score, meta = null)

// Example Usage
Abxr.EventLevelStart('level_1');
Abxr.EventLevelComplete('level_1', 85);
```

#### Critical Events
```javascript
// JavaScript Event Method Signatures  
Abxr.EventCritical(label, meta = null)

// Example Usage - Flag critical training events for auto-inclusion in the Critical Choices Chart
Abxr.EventCritical('safety_check_skipped', {'location': 'entrance', 'severity': 'high'});
Abxr.EventCritical('equipment_misuse', {'equipment': 'power_drill'});

// Use for high-risk errors, safety violations, or critical decision points
Abxr.EventCritical('emergency_protocol_activated');
```

**Parameters for all Event Wrapper Functions:**
- `levelName/assessmentName/objectiveName/interactionName` (string): The identifier for the assessment, objective, interaction, or level.
- `score` (number | string): The numerical score achieved. Automatically validated to be within 0-100 range. Invalid values are clamped to the valid range, and non-numeric values default to 0.
- `result` (EventStatus for Assessment and Objective): The basic result of the assessment or objective.
- `result` (Interactions): The result for the interaction is based on the InteractionType.
- `resultDetails` (string): Optional. Additional details about the result. For interactions, this can be a single character or a string. For example: "a", "b", "c" or "correct", "incorrect".
- `type` (InteractionType): Optional. The type of interaction for this event.
- `meta` (object|string): Optional. Additional key-value pairs describing the event.

**Note:** All complete events automatically calculate duration if a corresponding start event was logged.

### Timed Events

The ABXRLib SDK includes a built-in timing system that allows you to measure the duration of any event. This is useful for tracking how long users spend on specific activities.

```javascript
// JavaScript Timed Event Method Signature
Abxr.StartTimedEvent(eventName)

// Example Usage (fire-and-forget - runs in background)
Abxr.StartTimedEvent("Table puzzle");
// ... user performs puzzle activity for 20 seconds ...
Abxr.Event("Table puzzle"); // Duration automatically included: 20 seconds

// Works with all event methods  
Abxr.StartTimedEvent("Assessment");
// ... later ...
Abxr.EventAssessmentComplete("Assessment", 95, Abxr.EventStatus.ePass); // Duration included

// Also works with Mixpanel compatibility methods
Abxr.StartTimedEvent("User Session");
// ... later ...
Abxr.Track("User Session"); // Duration automatically included
```

**Parameters:**
- `eventName` (string): The name of the event to start timing. Must match the event name used later.

**Note:** The timer automatically adds a `duration` field (in seconds) to any subsequent event with the same name. The timer is automatically removed after the first matching event.

### Super Properties

Super Properties are global event properties that are automatically included in all events. They persist across browser sessions and are perfect for setting user attributes, application state, or any data you want included in every event.

```javascript
// JavaScript Super Properties Method Signatures
Abxr.Register(key, value)
Abxr.RegisterOnce(key, value)  
Abxr.Unregister(key)
Abxr.Reset()
Abxr.GetSuperProperties()

// Example Usage
// Set user properties that will be included in all events
Abxr.Register("user_type", "premium");
Abxr.Register("app_version", "1.2.3");
Abxr.Register("device_type", "quest3");

// All subsequent events automatically include these properties (background execution)
Abxr.Event("button_click"); // Includes user_type, app_version, device_type
Abxr.EventAssessmentStart("quiz"); // Also includes all super properties
Abxr.Track("purchase"); // Mixpanel compatibility method also gets super properties

// Set default values that won't overwrite existing super properties
Abxr.RegisterOnce("user_tier", "free"); // Only sets if not already set
Abxr.RegisterOnce("user_tier", "premium"); // Ignored - "free" remains

// Manage super properties
Abxr.Unregister("device_type"); // Remove specific super property
const props = Abxr.GetSuperProperties(); // Get all current super properties
Abxr.Reset(); // Remove all super properties (matches mixpanel.reset())
```

**Key Features:**
- **Automatic Inclusion**: Super properties are automatically added to every event
- **Persistent Storage**: Super properties persist across browser sessions using localStorage
- **No Overwriting**: Super properties don't overwrite event-specific properties with the same name
- **Universal**: Works with all event methods (Event, Track, EventAssessmentStart, etc.)

**Use Cases:**
- User attributes (subscription type, user level, demographics)
- Application state (app version, build number, feature flags)
- Device information (device type, browser, screen size)
- Session context (session ID, experiment groups, A/B test variants)

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
// JavaScript Method Signatures  
async Abxr.LogDebug(message: string, meta?: any): Promise<number>
async Abxr.LogInfo(message: string, meta?: any): Promise<number>
async Abxr.LogWarn(message: string, meta?: any): Promise<number>
async Abxr.LogError(message: string, meta?: any): Promise<number>
async Abxr.LogCritical(message: string, meta?: any): Promise<number>

// Example usage (fire-and-forget - runs in background)
Abxr.LogError('Critical error in assessment phase');

// With metadata - all formats supported
Abxr.LogInfo('User login', {
    'userId': 12345,
    'loginMethod': 'oauth',
    'ipAddress': '192.168.1.100'
});

Abxr.LogError('API Error', 'endpoint=/api/users&status=500&timeout=5000');
```

### Storage
The Storage API enables developers to store and retrieve learner/player progress, facilitating the creation of long-form training content. When users log in using ArborXR's facility or the developer's in-app solution, these methods allow users to continue their progress on different headsets, ensuring a seamless learning experience across multiple sessions or devices.

#### Save Progress
```javascript
// JavaScript Event Method Signatures
Abxr.StorageSetEntry(data, name = "state", keepLatest = true, origin = null, sessionData = false)

// Example usage
Abxr.StorageSetEntry({'progress': '75%'});

// With more options
Abxr.StorageSetEntry({'progress': '75%', 'level': 'intermediate'}, 'user_progress', true, 'game', false);
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
Abxr.StorageGetEntry(name = "state", origin = null, tagsAny = null, tagsAll = null, userOnly = false)

// Example usage
var state = Abxr.StorageGetEntry('state');
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

#### Remove All Storage Entries for Scope
```javascript
// JavaScript Event Method Signatures
Abxr.StorageRemoveMultipleEntries(scope = StorageScope.user)

// Example usage (fire-and-forget - runs in background)
Abxr.StorageRemoveMultipleEntries(Abxr.StorageScope.user); // Clear all user data
Abxr.StorageRemoveMultipleEntries(Abxr.StorageScope.device); // Clear all device data
Abxr.StorageRemoveMultipleEntries(); // Defaults to user scope
```
**Parameters:**
- `scope` (StorageScope): Optional. Remove all from 'device' or 'user' storage. Default is 'user'.

**Returns:** Promise<number> Operation result code or 0 if not authenticated.

**Note:** This is a bulk operation that clears all stored entries at once. Use with caution as this cannot be undone.

#### Enhanced Storage Methods **NEW**
```javascript
// Enhanced storage with scope and policy control
Abxr.StorageSetEntry(name, data, scope = StorageScope.user, policy = StoragePolicy.keepLatest)
Abxr.StorageGetEntry(name = "state", scope = StorageScope.user)
Abxr.StorageRemoveEntry(name = "state", scope = StorageScope.user)

// Storage scopes and policies
Abxr.StorageScope.user      // User data across devices  
Abxr.StorageScope.device    // Device-specific data
Abxr.StoragePolicy.keepLatest     // Keep only latest
Abxr.StoragePolicy.appendHistory  // Append to history

// Example usage
Abxr.StorageSetEntry('progress', {'level': 5}, Abxr.StorageScope.user, Abxr.StoragePolicy.keepLatest); // Fire-and-forget
const progress = await Abxr.StorageGetEntry('progress', Abxr.StorageScope.user); // Need await for return value
```

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

### AI Integration
The Integration Methods offer developers access to additional services, enabling customized experiences for enterprise users. Currently, this includes access to GPT services through the AIProxy method, allowing for advanced AI-powered interactions within the XR environment. More integration services are planned for future releases, further expanding the capabilities available to developers for creating tailored enterprise solutions.

#### AIProxy
```javascript
// JavaScript Event Method Signatures
Abxr.AIProxy(prompt, pastMessages = "", botId = "")
Abxr.AIProxyWithCallback(prompt, llmProvider, pastMessages = [], callback)

// Example usage - Background tracking (default approach)
Abxr.AIProxy('Provide me a randomized greeting that includes common small talk and ends by asking some form of how can I help');

// Or with await to get request ID
const requestId = await Abxr.AIProxy('What is the weather like today?', '', 'weather-bot');

// Planned for future release - Immediate response (Unity-style)
// Abxr.AIProxyWithCallback('What is the weather like today?', 'weather-bot', [], (response) => {
//     if (response) {
//         console.log('AI Response:', response);
//     } else {
//         console.log('AI request failed');
//     }
// });
```

**AIProxy Parameters:**
- `prompt` (string): The input prompt for the AI.
- `pastMessages` (string): Optional. Previous conversation history for context.
- `botId` (string): Optional. An identifier for a specific pre-defined chatbot.

**AIProxy Returns:** `Promise<number>` - Request ID for tracking the AI request, or 0 if not authenticated. The AI response is processed on the backend and can be retrieved via polling or webhooks.

**AIProxyWithCallback Parameters:** *(Planned for future release)*
- `prompt` (string): The input prompt for the AI.
- `llmProvider` (string): The LLM provider/bot ID to use.
- `pastMessages` (string[]): Optional. Array of previous conversation messages for context.
- `callback` (function): Function called with AI response (string) or null on error.

**AIProxyWithCallback Returns:** `Promise<void>` - Response provided via callback function. *(Currently returns null - not yet implemented)*

**Usage Guidelines:**
- **Use `AIProxy`** for fire-and-forget requests with backend tracking (recommended for current use)
- **`AIProxyWithCallback`** is planned for future release to provide Unity-style immediate responses
- Both methods will bypass the cache system and respect SendRetriesOnFailure/SendRetryInterval settings

#### Platform Comparison & Migration

**Unity vs WebXR AI Integration:**

| **Aspect** | **Unity (C#)** | **WebXR (JavaScript/TypeScript)** |
|------------|----------------|------------------------------------|
| **Method Pattern** | `IEnumerator` with callback | Two approaches: `Promise<number>` or callback |
| **Immediate Response** | `AIProxy(prompt, llmProvider, callback)` | `AIProxyWithCallback(prompt, llmProvider, pastMessages, callback)` |
| **Background Tracking** | Not available | `AIProxy(prompt, pastMessages, botId)` → returns request ID |
| **Past Messages** | `List<string>` parameter | String array or comma-separated string |
| **Response Handling** | Direct callback with AI response | Callback with AI response OR request ID for polling |

**Migration from Unity:**

```javascript
// Unity C# pattern:
// StartCoroutine(Abxr.AIProxy("Hello AI", "gpt-4", result => {
//     Debug.Log("AI Response: " + result);
// }));

// Current WebXR pattern (analytics tracking):
const requestId = await Abxr.AIProxy("Hello AI", "", "gpt-4");
console.log("Request submitted with ID:", requestId);

// Future WebXR pattern (planned - Unity-style immediate response):
// Abxr.AIProxyWithCallback("Hello AI", "gpt-4", [], (result) => {
//     console.log("AI Response: " + result);
// });
```

**When to Use Each Approach:**

- **`AIProxy`** (WebXR): Currently available - best for analytics, fire-and-forget requests, or when you need request tracking
- **`AIProxyWithCallback`** (WebXR): Planned for future release - will be best for immediate response handling, chat interfaces, or when migrating from Unity
- **Unity `AIProxy`**: Callback-based, immediate response (equivalent to planned WebXR `AIProxyWithCallback`)

### Exit Polls

Deliver questionnaires to users to gather feedback about their XR experience.

```javascript
// JavaScript Event Method Signatures
Abxr.PollUser(prompt, pollType, responses = null, callback = null)

// Example Usage - Thumbs Up/Down Poll  
Abxr.PollUser("How would you rate this training experience?", Abxr.PollType.Thumbs);

// Example Usage - Rating Poll (1-5 stars)
Abxr.PollUser("Rate the difficulty of this module", Abxr.PollType.Rating);

// Example Usage - Multiple Choice Poll
Abxr.PollUser("What was the most challenging aspect?", 
    Abxr.PollType.MultipleChoice, 
    ["Navigation", "Controls", "Content", "Technical Issues"]);

// Example Usage - With Callback
Abxr.PollUser("Overall satisfaction?", Abxr.PollType.Rating, null, function(response) {
    console.log("User rated:", response);
    // Handle response (e.g., adjust difficulty, show follow-up content)
});
```

**Parameters:**
- `prompt` (string): The question to ask the user
- `pollType` (PollType): Type of poll interface to show
- `responses` (array): Optional. For MultipleChoice, array of answer options (2-8 strings)
- `callback` (function): Optional. Function called when user responds

**Poll Types:**
- `Abxr.PollType.Thumbs`: Thumbs up/thumbs down interface
- `Abxr.PollType.Rating`: 1-5 star rating interface  
- `Abxr.PollType.MultipleChoice`: Select from custom response options

**Use Cases:**
- Post-training satisfaction surveys
- Difficulty assessment and content optimization
- User experience feedback collection
- A/B testing and feature validation
- Content quality measurement



## Advanced Features

### Module Targets

The **Module Target** feature enables developers to create single applications with multiple modules, where each module can be its own assignment in an LMS. When a learner enters from the LMS for a specific module, the application can automatically direct the user to that module within the application. Individual grades and results are then tracked for that specific assignment in the LMS.

Module targets are delivered via the `OnAuthCompleted` callback (first target) and subsequent targets are retrieved using the `GetModuleTarget()` method for sequential processing.

**TypeScript Interface:**
```typescript
export interface CurrentSessionData {
    moduleTarget: string | null;    // The target module identifier from LMS
    userData?: any;                 // Additional user data from authentication  
    userId?: any;                   // User identifier
    userEmail?: string | null;      // User email address
}
```

#### Getting Module Target Information

You can process module targets sequentially using the pull-based approach:

```javascript
// Get the next module target from the queue
const nextTarget = Abxr.GetModuleTarget();
if (nextTarget) {
    console.log(`Processing module: ${nextTarget.moduleTarget}`);
    enableModuleFeatures(nextTarget.moduleTarget);
    navigateToModule(nextTarget.moduleTarget);
} else {
    console.log('All modules completed!');
    showCompletionScreen();
}

// Get current user information
const userId = Abxr.getUserId();
const userData = Abxr.getUserData();
const userEmail = Abxr.getUserEmail();
```

#### Module Target Management

You can also manage the module target queue directly:

```javascript
// Check how many module targets remain
const count = Abxr.getModuleTargetCount();
console.log(`Modules remaining: ${count}`);

// Clear all module targets and storage
Abxr.clearModuleTargets();
```

**Use Cases:**
- **Reset state**: Clear module targets when starting a new experience
- **Error recovery**: Clear corrupted module target data
- **Testing**: Reset module queue during development
- **Session management**: Clean up between different users

#### Best Practices

1. **Set up auth callback early**: Subscribe to `onAuthCompleted` before calling `Abxr_init()`
2. **Handle first module**: Process the first module target from `authData.moduleTarget`
3. **Use GetModuleTarget() sequentially**: Call after completing each module to get the next one
4. **Validate modules**: Check if requested module exists before navigation
5. **Progress tracking**: Use assessment events to track module completion
6. **Error handling**: Handle cases where navigation fails or module is invalid
7. **User feedback**: Show loading indicators during module transitions
8. **Check completion**: Use `GetModuleTarget()` returning null to detect when all modules are done

#### Data Structures

The module target callback provides a `CurrentSessionData` object with the following properties:

```cpp
public class CurrentSessionData
{
    public string moduleTarget;     // The target module identifier from LMS
    public object userData;         // Additional user data from authentication
    public object userId;           // User identifier
    public string userEmail;        // User email address
}
```

### Authentication

The **Authentication Completion** callback feature enables developers to get notified when authentication completes successfully. This is particularly useful for initializing UI components, starting background services, or showing welcome messages after the user has been authenticated.

To subscribe to authentication success or failure, use the following method:

```javascript
// JavaScript Method Signature
Abxr.onAuthCompleted(callback)

// Example Usage
Abxr.onAuthCompleted(function(authData) {
    console.log('Authentication completed!', authData.success);
    console.log('User ID:', authData.userId);
    console.log('User Email:', authData.userEmail);
    console.log('Module Target:', authData.moduleTarget);
    console.log('Is Reauthentication:', authData.isReauthentication);
    
    if (authData.success) {
        // Authentication was successful
        if (authData.isReauthentication) {
            // User reauthenticated - maybe just refresh data
            console.log('Welcome back!');
            refreshUserData();
        } else {
            // Initial authentication - full setup
            console.log('Welcome! Setting up your experience...');
            initializeUserInterface();
            loadUserPreferences();
        }
        
        // Check if we have a module target from auth
        if (authData.moduleTarget) {
            navigateToModule(authData.moduleTarget);
        }
    }
});
```

#### Authentication Data Structure

The callback receives an `AuthCompletedData` object with the following properties:

```javascript
interface AuthCompletedData {
    success: boolean;                    // Whether authentication was successful
    userData?: any;                      // Additional user data from authentication response
    userId?: any;                        // User identifier
    userEmail?: string | null;           // User email address
    moduleTarget?: string | null;        // Target module from LMS (if applicable)
    isReauthentication?: boolean;        // Whether this was a reauthentication (vs initial auth)
}
```

#### Callback Management

```javascript
// Remove callback when no longer needed
Abxr.removeAuthCompletedCallback(callback);

// Or clear all authentication callbacks
Abxr.clearAuthCompletedCallbacks();
```

#### Session Management

The ABXRLib SDK provides comprehensive session management capabilities that allow you to control authentication state and session continuity. These methods are particularly useful for multi-user environments, testing scenarios, and creating seamless user experiences across devices and time.

```javascript
// Start a new session with fresh session ID
await Abxr.StartNewSession();

// Manually trigger reauthentication (primarily for testing)
await Abxr.ReAuthenticate();
```

##### Session Management Examples

```javascript
// Testing authentication flows
async function testReauth() {
    console.log('Testing reauthentication...');
    await Abxr.ReAuthenticate();
    
    if (Abxr.ConnectionActive()) {
        console.log('Reauthentication successful');
        // Continue with authenticated operations
        await Abxr.Event('reauth_test_passed');
    }
}

// Starting fresh sessions for new experiences
async function startNewExperience() {
    console.log('Starting new training experience...');
    await Abxr.StartNewSession();
    
    // Clear any cached data for fresh start
    await Abxr.StorageRemoveDefaultEntry(Abxr.StorageScope.user);
    
    // Begin new assessment
    await Abxr.EventAssessmentStart('fresh_training_assessment');
}


```

### Mixpanel Compatibility

The ABXRLib SDK for WebXR provides full compatibility with Mixpanel's JavaScript SDK, making migration simple and straightforward. You can replace your existing Mixpanel tracking calls with minimal code changes while gaining access to ABXRLib's advanced XR analytics capabilities.

#### Why Migrate from Mixpanel?

- **XR-Native Analytics**: Purpose-built for spatial computing and immersive experiences
- **Advanced Session Management**: Resume training across devices and sessions  
- **Enterprise Features**: LMS integrations, SCORM/xAPI support, and AI-powered insights
- **Spatial Tracking**: Built-in support for 3D position data and XR interactions
- **Open Source**: No vendor lock-in, deploy to any backend service

#### 3-Step Migration:

##### Step 1: Remove Mixpanel References
```javascript
// Remove or comment out these lines:
// import mixpanel from 'mixpanel-browser';
// mixpanel.init('YOUR_PROJECT_TOKEN');

// ABXRLib SDK is already imported
import { Abxr_init, Abxr } from 'abxrlib-for-webxr';
```

##### Step 2: Configure ABXRLib SDK
Follow the [Configuration](#configuration) section to set up your App ID, Org ID, and Auth Secret.

##### Step 3: Simple String Replace
```javascript
// Find and replace throughout your codebase:
// mixpanel.track  ->  Abxr.Track

// Before (Mixpanel)
mixpanel.track('Sent Message');
mixpanel.track('Plan Selected', {
    'Plan': 'Premium',
    'Amount': 29.99
});

// After (just string replace!)
Abxr.Track('Sent Message');
Abxr.Track('Plan Selected', {
    'Plan': 'Premium',
    'Amount': 29.99
});
```

#### Mixpanel Compatibility Methods

The ABXRLib SDK includes `Track`, `StartTimedEvent` and `Register` methods that match Mixpanel's API:

```javascript
// JavaScript Track Method Signatures  
Abxr.StartTimedEvent(eventName)
Abxr.Track(eventName)
Abxr.Track(eventName, properties)

// Example Usage - Drop-in Replacement
Abxr.Track('user_signup');
Abxr.Track('purchase_completed', { amount: 29.99, currency: 'USD' });

// Timed Events (matches Mixpanel exactly!)
Abxr.StartTimedEvent('Table puzzle');
// ... 20 seconds later ...
Abxr.Track('Table puzzle'); // Duration automatically added: 20 seconds

// Super Properties (global properties included in all events)
Abxr.Register('user_type', 'premium'); // Same as mixpanel.register()
Abxr.RegisterOnce('device', 'quest3');  // Same as mixpanel.register_once()
// All events now include user_type and device automatically!
```

#### Key Differences & Advantages

| Feature | Mixpanel | ABXRLib SDK |
|---------|----------|-------------|
| **Basic Event Tracking** | ✅ | ✅ |
| **Custom Properties** | ✅ | ✅ |
| **Super Properties** | ✅ | ✅ (Register/RegisterOnce available) |
| **Timed Events** | ✅ | ✅ (StartTimedEvent available) |
| **3D Spatial Data** | ❌ | ✅ (Built-in position support) |
| **XR-Specific Events** | ❌ | ✅ (Assessments, Interactions, Objectives) |
| **Session Persistence** | Limited | ✅ (Cross-device, resumable sessions) |
| **Enterprise LMS Integration** | ❌ | ✅ (SCORM, xAPI, major LMS platforms) |
| **Real-time Collaboration** | ❌ | ✅ (Multi-user session tracking) |
| **Open Source** | ❌ | ✅ |

#### Migration Summary

**Migration Time: ~10 minutes for most projects**

1. **Install ABXRLib SDK** - Follow [Installation](#installation) guide
2. **Configure credentials** - Set App ID, Org ID, Auth Secret via config or URL params  
3. **String replace** - `mixpanel.track` → `Abxr.Track` throughout your code
4. **Remove Mixpanel** - Comment out Mixpanel imports and config code
5. **Done!** - All your existing tracking calls now work with ABXRLib

**Optional:** Add XR-specific features beyond Mixpanel capabilities:
```javascript
// Enhanced XR tracking beyond Mixpanel capabilities  
Abxr.Event('object_grabbed', { position: '1.2,3.4,5.6' });  // Include 3D position
Abxr.EventAssessmentStart('safety_training');                // LMS-compatible assessments
```

**Additional Core Features Beyond Mixpanel:**
ABXRLib also includes core [Super Properties](#super-properties) functionality (`Register`, `RegisterOnce`) that works identically to Mixpanel, plus advanced [Timed Events](#timed-events) that work universally across all event types.

## Configuration

### Connection Status

Check if AbxrLib has an active connection to the server:

```javascript
// JavaScript Method Signatures
Abxr.ConnectionActive()

// Example usage
if (Abxr.ConnectionActive()) {
    console.log('AbxrLib is connected and ready to send data');
    Abxr.Event('app_ready');
} else {
    console.log('Connection not active - waiting for authentication...');
    // Set up authentication completion callback
    Abxr.onAuthCompleted(function(authData) {
        if (authData.success) {
            console.log('Connection established!');
        }
    });
}
```

**Returns:** Boolean indicating if the library can communicate with the server

**Use Cases:**
- **Conditional logic**: Only send events when connection is active
- **UI state management**: Show online/offline status indicators
- **Error prevention**: Check connection before making API calls
- **Feature gating**: Enable/disable features that require server communication

## Support

### Resources

- **Docs:** [https://help.arborxr.com/](https://help.arborxr.com/)
- **GitHub:** [https://github.com/ArborXR/abxrlib-for-webxr](https://github.com/ArborXR/abxrlib-for-webxr)

### FAQ

#### How do I retrieve my Application ID and Authorization Secret?
Your Application ID can be found in the Web Dashboard under the application details. For the Authorization Secret, navigate to Settings > Organization Codes on the same dashboard.

#### How do I enable object tracking?
Object tracking can be enabled by adding the Track Object component to any GameObject in your scene via the Unity Inspector.

### Troubleshooting

#### Debug Mode

For debugging authentication, network issues, or other problems, enable debug logging:

```javascript
// Check if connection is established with the service
Abxr.ConnectionActive();

// Enable and check debug mode Method Sigantures
Abxr.setDebugMode(enabled)
Abxr.getDebugMode()

// Example usage
Abxr.setDebugMode(true);  // Enable debug logging
Abxr.setDebugMode(false); // Disable debug logging

const isDebugging = Abxr.getDebugMode();
console.log('Debug mode:', isDebugging);

// Conditional debug setup for development
if (process.env.NODE_ENV === 'development') {
    Abxr.setDebugMode(true);
}
```

**Parameters:**
- `enabled` (boolean): Enable or disable debug mode

**Returns:** `getDebugMode()` returns boolean indicating current debug state

**Debug Mode Benefits:**
- **Detailed error messages**: See exactly what's failing during authentication
- **Network request logging**: Track API calls and responses
- **State information**: Monitor internal library state changes
- **Performance insights**: Identify bottlenecks and timing issues

#### Authentication Issues

**Problem: Library fails to authenticate**
- **Solution**: Verify your App ID, Org ID, and Auth Secret are correct
- **Check**: Ensure URL parameters `abxr_orgid` and `abxr_auth_secret` are properly formatted
- **Debug**: Enable debug mode with `Abxr.setDebugMode(true)` to see detailed error messages

**Problem: Two-step authentication not triggering**
- **Solution**: Check that your callback is properly set before calling `Abxr_init()`
- **Check**: Verify the `authMechanism` data is being returned by the server
- **Debug**: Use `Abxr.extractAuthMechanismData()` to inspect authentication requirements

#### CORS and Network Issues

**Problem: CORS errors or network failures**
- **Solution**: The library automatically attempts version fallback for common CORS issues
- **Check**: Ensure your REST URL is correct and accessible
- **Manual Fix**: Try adding `/v1/` to your REST URL manually

**Problem: Library doesn't work in development vs production**
- **Solution**: Use URL parameters for credentials in production builds
- **Check**: Avoid hardcoding `orgId` and `authSecret` in distributed applications

#### Event and Data Issues

**Problem: Events not being sent**
- **Solution**: Check connection status with `Abxr.ConnectionActive()`
- **Debug**: Enable debug logging to see why events are being blocked
- **Check**: Verify your event names use snake_case format for best processing

**Problem: Super Properties not persisting**
- **Solution**: Check that localStorage is available in your browser
- **Debug**: Use `Abxr.GetSuperProperties()` to inspect current super properties
- **Fix**: Ensure you're calling `Abxr.Register()` after authentication completes

#### Session Management Issues

**Problem: Sessions not resuming properly**
- **Solution**: Check that the session ID is valid and not expired
- **Debug**: Use session management callbacks to track session state changes
- **Check**: Verify authentication credentials are still valid for session continuation

#### Common Integration Patterns

**Best Practices:**
```javascript
// Always set up callbacks before initialization
Abxr.onAuthCompleted(function(authData) {
    if (authData.success) {
        // Initialize your app components here
        initializeApp();
    } else {
        console.error('Authentication failed');
    }
});

// Then initialize
Abxr_init('your-app-id');
```

**Getting Help:**
- See [Debug Mode](#debug-mode) for detailed logging and troubleshooting
- Check browser console for detailed error messages  
- Verify network requests in browser developer tools
- Test authentication flow in isolation before adding complex features
