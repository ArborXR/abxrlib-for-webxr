# ABXRLib SDK for WebXR

The name "ABXR" stands for "Analytics Backbone for XR"—a flexible, open-source foundation for capturing and transmitting spatial, interaction, and performance data in XR. When combined with **ArborXR Insights**, ABXR transforms from a lightweight instrumentation layer into a full-scale enterprise analytics solution—unlocking powerful dashboards, LMS/BI integrations, and AI-enhanced insights.

The **ABXRLib SDK for WebXR** is an open-source analytics and data collection library that provides developers with the tools to collect and send XR data to any service of their choice. This library enables scalable event tracking, telemetry, and session-based storage—essential for enterprise and education XR environments.

> 💡 **Quick Start:** Most developers can integrate ABXRLib SDK and log their first event in under **15 minutes**.

**Why Use ABXRLib SDK?**

- **Open-Source** & portable to any backend—no vendor lock-in  
- **Quick integration**—track user interactions in minutes  
- **Secure & scalable**—ready for enterprise use cases  
- **Pluggable with ArborXR Insights**—seamless access to LMS/BI integrations, session replays, AI diagnostics, and more

## Table of Contents
1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Sending Data](#sending-data)
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
4. [Advanced Setup](#advanced-setup)
   - [TypeScript/ES6 Modules](#typescriptes6-modules)
   - [Browser (UMD)](#browser-umd)
5. [Mixpanel Migration & Compatibility](#mixpanel-migration--compatibility)
6. [Advanced Features](#advanced-features)
   - [Module Targets](#module-targets)
   - [Authentication](#authentication)
   - [Session Management](#session-management)
   - [Mixpanel Compatibility](#mixpanel-compatibility)
7. [Support](#support)
   - [Resources](#resources)
   - [FAQ](#faq)
   - [Troubleshooting](#troubleshooting)
   - [Debug Mode](#debug-mode)

## Installation

```bash
npm install abxrlib-for-webxr
```

## Configuration

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
    await Abxr.LogDebug('User clicked button');
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
await Abxr.LogDebug('test message');
```

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
Abxr.EventAssessmentComplete('final_exam', 92, Abxr.EventStatus.ePass);
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

#### Critical Events
```javascript
// Flag critical training events for auto-inclusion in Critical Choices Chart
Abxr.EventCritical(label, meta = null)

// Example Usage
Abxr.EventCritical('safety_check_skipped', {'location': 'entrance', 'severity': 'high'});
Abxr.EventCritical('equipment_misuse', {'equipment': 'power_drill'});
```

### Timed Events

The ABXRLib SDK includes a built-in timing system that allows you to measure the duration of any event. This is useful for tracking how long users spend on specific activities.

```javascript
// JavaScript Timed Event Method Signature
Abxr.StartTimedEvent(eventName)

// Example Usage
Abxr.StartTimedEvent("Table puzzle");
// ... user performs puzzle activity for 20 seconds ...
await Abxr.Event("Table puzzle"); // Duration automatically included: 20 seconds

// Works with all event methods
Abxr.StartTimedEvent("Assessment");
// ... later ...
await Abxr.EventAssessmentComplete("Assessment", 95, Abxr.EventStatus.ePass); // Duration included

// Also works with Mixpanel compatibility methods
Abxr.StartTimedEvent("User Session");
// ... later ...
await Abxr.Track("User Session"); // Duration automatically included
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

// All subsequent events automatically include these properties
await Abxr.Event("button_click"); // Includes user_type, app_version, device_type
await Abxr.EventAssessmentStart("quiz"); // Also includes all super properties
await Abxr.Track("purchase"); // Mixpanel compatibility method also gets super properties

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
```javascript
// JavaScript Method Signatures
async Abxr.LogDebug(message: string, meta?: any): Promise<number>
async Abxr.LogInfo(message: string, meta?: any): Promise<number>
async Abxr.LogWarn(message: string, meta?: any): Promise<number>
async Abxr.LogError(message: string, meta?: any): Promise<number>
async Abxr.LogCritical(message: string, meta?: any): Promise<number>

// Example usage
await Abxr.LogError('Critical error in assessment phase');
await Abxr.LogInfo('User login', {'userId': 12345, 'loginMethod': 'oauth'});
```

### Storage

#### Basic Storage Methods
```javascript
// JavaScript Event Method Signatures
Abxr.StorageSetEntry(data, name = "state", keepLatest = true, origin = null, sessionData = false)
Abxr.StorageGetEntry(name = "state")
Abxr.StorageRemoveEntry(name = "state")

// Example usage
Abxr.StorageSetEntry({'progress': '75%'});
var state = Abxr.StorageGetEntry('state');
```

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
await Abxr.StorageSetEntry('progress', {'level': 5}, Abxr.StorageScope.user, Abxr.StoragePolicy.keepLatest);
const progress = await Abxr.StorageGetEntry('progress', Abxr.StorageScope.user);
```

#### Remove All Storage Entries for Scope
```javascript
// JavaScript Event Method Signatures
Abxr.StorageRemoveMultipleEntries(scope = StorageScope.user)

// Example usage
await Abxr.StorageRemoveMultipleEntries(Abxr.StorageScope.user); // Clear all user data
await Abxr.StorageRemoveMultipleEntries(Abxr.StorageScope.device); // Clear all device data
await Abxr.StorageRemoveMultipleEntries(); // Defaults to user scope
```
**Note:** This is a bulk operation that clears all stored entries at once. Use with caution as this cannot be undone.

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
Abxr.AIProxyWithCallback(prompt, llmProvider, pastMessages = [], callback)

// Background tracking (fire-and-forget)
Abxr.AIProxy('Provide me a randomized greeting that includes common small talk and ends by asking some form of how can I help');

// Planned for future - Immediate response (Unity-style)  
// Abxr.AIProxyWithCallback('What is the weather like today?', 'weather-bot', [], (response) => {
//     console.log('AI Response:', response);
// });
```

**AIProxy Returns:** `Promise<number>` - Request ID for tracking the AI request, or 0 if not authenticated.
**AIProxyWithCallback Returns:** `Promise<void>` - Planned for future release.

**Usage Patterns:**
- `AIProxy`: Currently available - analytics tracking, fire-and-forget requests  
- `AIProxyWithCallback`: Planned for future - immediate responses, chat interfaces, Unity migration

### Exit Polls

Deliver questionnaires to users to gather feedback about their XR experience:

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

**Poll Types:**
- `Abxr.PollType.Thumbs`: Thumbs up/thumbs down interface
- `Abxr.PollType.Rating`: 1-5 star rating interface  
- `Abxr.PollType.MultipleChoice`: Select from custom response options

### Metadata Formats

The ABXRLib SDK supports multiple flexible formats for the `meta` parameter in all event and log methods. You can use whatever format is most convenient for your application:

#### 1. Plain JavaScript Objects (Recommended)
```javascript
// Simple and intuitive - works with any object
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
```javascript
// Perfect for APIs or stored JSON data
Abxr.EventAssessmentStart('Math Quiz', '{"difficulty": "hard", "timeLimit": 300, "attempts": 1}');

Abxr.LogError('API Error', '{"endpoint": "/api/users", "status": 500, "message": "Database timeout"}');
```

#### 3. URL Parameter Strings
```javascript
// Great for form data or query parameters
Abxr.Event('form_submit', 'name=John%20Doe&email=john@example.com&age=25');

await Abxr.LogDebug('Search query', 'query=virtual+reality&category=education&page=2');

// Handles complex values with = signs
Abxr.Event('equation_solved', 'formula=x=y+5&result=10&method=substitution');
```

#### 4. AbxrDictStrings Objects (Advanced)
```javascript
// For advanced users who need precise control
const meta = new Abxr.AbxrDictStrings();
meta.Add('custom_field', 'value');
meta.Add('timestamp', Date.now().toString());
Abxr.Event('custom_event', meta);
```

#### 5. Primitive Values
```javascript
// For simple single-value metadata
Abxr.Event('score_update', 1500);  // Number
Abxr.LogInfo('Feature enabled', true);  // Boolean
Abxr.Event('user_message', 'Hello World');  // String
```

#### 6. No Metadata
```javascript
// Events and logs work fine without metadata
Abxr.Event('app_started');
Abxr.LogInfo('Application initialized');
```

#### Automatic Conversion Examples

The SDK automatically handles conversion and URL decoding:

```javascript
// URL parameters with encoding
'user=John%20Doe&message=Hello%20World'
// Becomes: { user: "John Doe", message: "Hello World" }

// JSON with nested data
'{"user": {"name": "John", "age": 30}, "scores": [95, 87, 92]}'
// Becomes: { user: "John,30", scores: "95,87,92" }

// Mixed formats work seamlessly
Abxr.EventLevelComplete('Level 1', '85', 'score=85&attempts=3&bonus=true');
Abxr.EventAssessmentStart('Quiz', { startTime: Date.now(), difficulty: 'medium' });
```

**All event and log methods support these flexible metadata formats:**
- `Abxr.Event(name, meta?)`
- `Abxr.EventAssessmentStart/Complete(..., meta?)`
- `Abxr.EventObjectiveStart/Complete(..., meta?)`
- `Abxr.EventInteractionStart/Complete(..., meta?)`
- `Abxr.EventLevelStart/Complete(..., meta?)`
- `Abxr.LogDebug/Info/Warn/Error/Critical(message, meta?)`

### Usage Examples

```javascript
// Initialize
Abxr_init('app123', 'org456', 'secret789');

// Assessment with result options
Abxr.EventAssessmentComplete('math_test', 85, Abxr.EventStatus.ePass, { 'time_spent': '30min' });

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
await Abxr.LogDebug('User completed tutorial');

// Store data
Abxr.StorageSetEntry('user_progress', '75%');
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
    await Abxr.LogDebug('User clicked button');
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
await Abxr.LogDebug('User completed tutorial');
```

### Storage API

```javascript
import { Abxr_init, Abxr } from 'abxrlib-for-webxr';

// Initialize
Abxr_init('app123', 'org456', 'secret789');

// Store data
Abxr.StorageSetEntry({'user_progress': '75%'});

// Retrieve data
const entry = Abxr.StorageGetEntry('user_progress');
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

// Send AI proxy request (fire-and-forget)
Abxr.AIProxy('Provide a greeting message', '', 'default');

// Future: get immediate response with callback (planned for future release)
// Abxr.AIProxyWithCallback('Provide a greeting message', 'default', [], (response) => {
//     console.log('AI says:', response);
// });
```

## Mixpanel Migration & Compatibility

**Migrating from Mixpanel?** Super easy! Just replace imports and do simple string replacements.

### 3-Step Migration:

#### Step 1: Replace Import
```javascript
// Before (Mixpanel)
import mixpanel from 'mixpanel-browser';

// After (ABXRLib SDK)
import { Abxr_init, Abxr } from 'abxrlib-for-webxr';
```

#### Step 2: Comment out Mixpanel config
```javascript
// Comment out or remove these lines:
// mixpanel.init('YOUR_PROJECT_TOKEN');
// mixpanel.identify('user123');
// Any other mixpanel configuration...

// Add ABXRLib initialization instead:
Abxr_init('your-app-id');
```

#### Step 3: Simple String Replace
```javascript
// Find and replace throughout your codebase:
// mixpanel.track  ->  Abxr.Track

// Before
mixpanel.track("Sent Message");
mixpanel.track("Plan Selected", { "Plan": "Premium" });

// After (just string replace!)
Abxr.Track("Sent Message");  
Abxr.Track("Plan Selected", { "Plan": "Premium" });
```

#### Bonus: Timed Events Work Too!
```javascript
// Mixpanel timed events work identically:
// Replace: mixpanel.time_event -> Abxr.StartTimedEvent

// Before (Mixpanel)
mixpanel.time_event("Table puzzle");
// ... later ...
mixpanel.track("Table puzzle");

// After (ABXR - identical functionality!)
Abxr.StartTimedEvent("Table puzzle");
// ... later ...  
Abxr.Track("Table puzzle"); // Duration automatically included

// Super Properties (global properties included in all events) 
Abxr.Register("user_type", "premium"); // Same as mixpanel.register()
Abxr.RegisterOnce("device", "quest3");  // Same as mixpanel.register_once()
// All events now include user_type and device automatically!
```

**That's it! Your existing tracking calls will work immediately.**

**Additional Core Features Beyond Mixpanel:**
ABXRLib also includes core [Super Properties](#super-properties) functionality (`Register`, `RegisterOnce`) that works identically to Mixpanel, plus advanced [Timed Events](#timed-events) that work universally across all event types.

### Why Migrate from Mixpanel?

- ✅ **3-Step Migration** - Takes minutes, not hours
- ✅ **XR-Native Analytics** - Purpose-built for immersive experiences  
- ✅ **Enterprise Features** - LMS integrations and AI-powered insights
- ✅ **Built-in Authentication** - No separate user management needed
- ✅ **Open Source** - Deploy anywhere, no vendor lock-in
- ✅ **WebXR Optimized** - Perfect for VR/AR web applications

## Advanced Features

### Module Targets

The **Module Target** feature enables developers to create single applications with multiple modules, where each module can be its own assignment in an LMS. When a learner enters from the LMS for a specific module, the application can automatically direct the user to that module within the application. Individual grades and results are then tracked for that specific assignment in the LMS.

#### Module Target Management

```javascript
// Get the next module target from the queue
const nextTarget = Abxr.GetModuleTarget();
if (nextTarget) {
    console.log(`Processing module: ${nextTarget.moduleTarget}`);
    navigateToModule(nextTarget.moduleTarget);
} else {
    console.log('All modules completed!');
    showCompletionScreen();
}

// Clear all module targets and storage
Abxr.clearModuleTargets();

// Check how many module targets remain
const count = Abxr.getModuleTargetCount();
console.log(`Modules remaining: ${count}`);
```

**Use Cases for clearModuleTargets():**
- **Reset state**: Clear module targets when starting a new experience
- **Error recovery**: Clear corrupted module target data
- **Testing**: Reset module queue during development
- **Session management**: Clean up between different users

### Authentication

The **Authentication Completion** callback feature enables developers to get notified when authentication completes successfully. This is particularly useful for initializing UI components, starting background services, or showing welcome messages after the user has been authenticated.

```javascript
// Subscribe to authentication completion events
Abxr.onAuthCompleted(function(data) {
    console.log('Authentication completed!', data.success);
    
    if (data.success) {
        if (data.isReauthentication) {
            console.log('Welcome back!');
            refreshUserData();
        } else {
            console.log('Welcome! Setting up your experience...');
            initializeUserInterface();
            loadUserPreferences();
        }
        
        // Check if we have a module target from auth
        if (data.moduleTarget) {
            navigateToModule(data.moduleTarget);
        }
    }
});

// Multiple callbacks are supported
Abxr.onAuthCompleted(handleUserSetup);
Abxr.onAuthCompleted(handleAnalyticsInit);

// Initialize ABXRLib - callbacks will fire when auth completes
Abxr_init('your-app-id', 'your-org-id', 'your-auth-secret');
```

#### Callback Management

The authentication system supports multiple subscribers for flexible integration:

```javascript
// Store callback reference for later management
const authCallback = function(data) {
    if (data.success) {
        initializeUserInterface();
        if (data.moduleTarget) {
            navigateToModule(data.moduleTarget);
        }
    }
};

// Subscribe to authentication events
Abxr.onAuthCompleted(authCallback);

// Remove specific callback when no longer needed
Abxr.removeAuthCompletedCallback(authCallback);

// Clear all authentication callbacks
Abxr.clearAuthCompletedCallbacks();

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

#### Session Management

Advanced session management for testing and session control:

```javascript
// Manual reauthentication (primarily for testing)
await Abxr.ReAuthenticate();

// Start new session with fresh session ID  
await Abxr.StartNewSession();

// Example usage
async function testAuthFlow() {
    await Abxr.ReAuthenticate();
    if (Abxr.ConnectionActive()) {
        await Abxr.EventAssessmentStart('test_assessment');
    }
}

async function startFreshExperience() {
    await Abxr.StartNewSession();
    await Abxr.StorageRemoveDefaultEntry(Abxr.StorageScope.user);
    await Abxr.EventAssessmentStart('new_training_session');
}
```

### Mixpanel Compatibility

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

// Enable detailed debug logging
Abxr.setDebugMode(true);   // Turn on debug mode
Abxr.setDebugMode(false);  // Turn off debug mode

// Check current debug state
const isDebugging = Abxr.getDebugMode();
console.log('Debug mode:', isDebugging);

// Conditional setup for development
if (process.env.NODE_ENV === 'development') {
    Abxr.setDebugMode(true);
}
```

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

// Clean up callbacks when components are destroyed (React example)
useEffect(() => {
    const handleAuth = (authData) => {
        if (authData.success) {
            setIsAuthenticated(true);
        }
    };
    
    Abxr.onAuthCompleted(handleAuth);
    
    return () => {
        Abxr.removeAuthCompletedCallback(handleAuth);
    };
}, []);
```

**Getting Help:**
- Enable debug mode: `Abxr.setDebugMode(true)`
- Check browser console for detailed error messages  
- Verify network requests in browser developer tools
- Test authentication flow in isolation before adding complex features