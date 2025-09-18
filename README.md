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
   - [Debug Mode](#debug-mode)
   - [Mixpanel Compatibility](#mixpanel-compatibility)
   - [Cognitive3D Compatibility](#cognitive3d-compatibility)
   - [XR Dialog Customization](#xr-dialog-customization)
6. [Support](#support)
   - [Resources](#resources)
   - [FAQ](#faq)
   - [Troubleshooting](#troubleshooting)

---

## Introduction

### Overview

The **ABXRLib SDK for WebXR** is an open-source analytics and data collection library that provides developers with the tools to collect and send XR data to any service of their choice. This library enables scalable event tracking, telemetry, and session-based storage—essential for enterprise and education XR environments.

> **Quick Start:** Most developers can integrate ABXRLib SDK and log their first event in under **15 minutes**.

**Why Use ABXRLib SDK?**

- **Open-Source** & portable to any backend—no vendor lock-in  
- **Quick integration**—track user interactions in minutes  
- **Secure & scalable**—ready for enterprise use cases  
- **Pluggable with ArborXR Insights**—seamless access to LMS/BI integrations, session replays, AI diagnostics, and more

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

// Example Usage - Event with Metadata
Abxr.Event('player_teleported', {
    'destination': 'spawn_point',
    'method': 'instant'
});
```

**Parameters:**
- `name` (string): The name of the event. Use snake_case for better analytics processing.
- `meta` (object): Optional. Additional key-value pairs describing the event.

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

**These analytics event functions are essential for ALL developers** They provide standardized tracking for key user interactions and learning outcomes that are crucial for understanding user behavior, measuring engagement, and optimizing XR experiences and power the analytics dashboards and reporting features. They also essential for integrations with Learning Management System (LMS) platforms.

**EventAssessmentStart and EventAssessmentComplete are REQUIRED for all ArborXR Insights usage**

#### Assessments, Objectives & Interactions

These three event types work together to provide comprehensive tracking of user progress:

- **Assessment**: Tracks overall performance across an entire experience, course, or curriculum. Think of it as the final score or outcome for a complete learning module. When an Assessment completes, it automatically records and closes out the session in supported LMS platforms.

- **Objective**: Tracks specific learning goals or sub-tasks within an assessment. These represent individual skills, concepts, or milestones that contribute to the overall assessment score.

- **Interaction**: Tracks individual user responses or actions within an objective or assessment. These capture specific user inputs, choices, or behaviors that demonstrate engagement and learning progress.

```javascript
// Status enumeration for all analytics events
Abxr.EventStatus.ePass, Abxr.EventStatus.eFail, Abxr.EventStatus.eComplete, Abxr.EventStatus.eIncomplete, Abxr.EventStatus.eBrowsed

Abxr.InteractionType.eNull, Abxr.InteractionType.eBool, Abxr.InteractionType.eSelect, Abxr.InteractionType.eText, Abxr.InteractionType.eRating, Abxr.InteractionType.eNumber, Abxr.InteractionType.eMatching, Abxr.InteractionType.ePerformance, Abxr.InteractionType.eSequencing

// JavaScript Method Signatures
Abxr.EventAssessmentStart(assessmentName, meta = null)
Abxr.EventAssessmentComplete(assessmentName, score, status, meta = null)
Abxr.EventObjectiveStart(objectiveName, meta = null)
Abxr.EventObjectiveComplete(objectiveName, score, status, meta = null)
Abxr.EventInteractionStart(interactionName, meta = null)
Abxr.EventInteractionComplete(interactionName, type, result, meta = null)

// Assessment tracking (overall course/curriculum performance)
Abxr.EventAssessmentStart('final_exam');
Abxr.EventAssessmentComplete('final_exam', 92, Abxr.EventStatus.ePass);

// Objective tracking (specific learning goals)
Abxr.EventObjectiveStart('open_valve');
Abxr.EventObjectiveComplete('open_valve', 100, Abxr.EventStatus.eComplete);

// Interaction tracking (individual user responses)
Abxr.EventInteractionStart('select_option_a');
Abxr.EventInteractionComplete('select_option_a', Abxr.InteractionType.eSelect, 'true');
```

#### Additional Event Wrappers
```javascript
// JavaScript Method Signatures
Abxr.EventLevelStart(levelName, meta = null)
Abxr.EventLevelComplete(levelName, score, meta = null)
Abxr.EventCritical(eventName, meta = null)

// Level tracking 
Abxr.EventLevelStart('level_1');
Abxr.EventLevelComplete('level_1', 85);

// Critical event flagging (for safety training, high-risk errors, etc.)
Abxr.EventCritical('safety_violation');
```

**Parameters for all Event Wrapper Functions:**
- `levelName/assessmentName/objectiveName/interactionName` (string): The identifier for the assessment, objective, interaction, or level.
- `score` (int): The numerical score achieved. While typically between 1-100, any integer is valid. In metadata, you can also set a minScore and maxScore to define the range of scores for this objective.
- `result` (Interactions): The result for the interaction is based on the InteractionType.
- `result_details` (string): Optional. Additional details about the result. For interactions, this can be a single character or a string. For example: "a", "b", "c" or "correct", "incorrect".
- `type` (InteractionType): Optional. The type of interaction for this event.
- `meta` (object): Optional. Additional key-value pairs describing the event.

**Note:** All complete events automatically calculate duration if a corresponding start event was logged.

### Timed Events

The ABXRLib SDK includes a built-in timing system that allows you to measure the duration of any event. This is useful for tracking how long users spend on specific activities.

```javascript
// JavaScript Timed Event Method Signature
Abxr.StartTimedEvent(eventName)

// Example Usage
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

Global properties automatically included in all events, logs, and telemetry data:

```javascript
// JavaScript Method Signatures
Abxr.Register(key, value)
Abxr.RegisterOnce(key, value)

// Set persistent properties (included in all events, logs, and telemetry)
Abxr.Register("user_type", "premium");
Abxr.Register("app_version", "1.2.3");

// Set only if not already set
Abxr.RegisterOnce("user_tier", "free");

// Management
Abxr.Unregister("device_type");  // Remove specific property
Abxr.Reset();                    // Clear all super properties
```

Perfect for user attributes, app state, and device information that should be included with every event, log entry, and telemetry data point.

### Logging
The Log Methods provide straightforward logging functionality, similar to syslogs. These functions are available to developers by default, even across enterprise users, allowing for consistent and accessible logging across different deployment scenarios.

```javascript
// JavaScript Event Method Signatures
Abxr.Log(message, level = LogLevel.eInfo, meta = null)

// Example usage
Abxr.Log('Module started'); // Defaults to LogLevel.eInfo
Abxr.Log('Module started', Abxr.LogLevel.eInfo);
Abxr.Log('Debug information', Abxr.LogLevel.eDebug);
```

Use standard or severity-specific logging:
```javascript
// JavaScript Method Signatures
Abxr.LogDebug(message, meta = null)
Abxr.LogInfo(message, meta = null)
Abxr.LogWarn(message, meta = null)
Abxr.LogError(message, meta = null)
Abxr.LogCritical(message, meta = null)

// Example usage
Abxr.LogError('Critical error in assessment phase');

// With metadata
Abxr.LogDebug('User interaction', {
    'action': 'button_click',
    'screen': 'main_menu'
});
```

### Storage
The Storage API enables developers to store and retrieve learner/player progress, facilitating the creation of long-form training content. When users log in using ArborXR's facility or the developer's in-app solution, these methods allow users to continue their progress on different headsets, ensuring a seamless learning experience across multiple sessions or devices.

```javascript
// JavaScript Method Signatures
static async StorageSetEntry(name, entry, scope, policy = StoragePolicy.keepLatest): Promise<number>
static async StorageSetDefaultEntry(entry, scope, policy = StoragePolicy.keepLatest): Promise<number>
static async StorageGetEntry(name, scope): Promise<{[key: string]: string}[]>
static async StorageGetDefaultEntry(scope): Promise<{[key: string]: string}[]>
static StorageRemoveEntry(name, scope)

// Save progress data
await Abxr.StorageSetEntry("state", {"progress": "75%"}, Abxr.StorageScope.user);
await Abxr.StorageSetDefaultEntry({"progress": "75%"}, Abxr.StorageScope.user);

// Using StoragePolicy enum explicitly
await Abxr.StorageSetEntry("state", {"progress": "75%"}, Abxr.StorageScope.user, Abxr.StoragePolicy.keepLatest);
await Abxr.StorageSetEntry("history", {"action": "completed_level_1"}, Abxr.StorageScope.user, Abxr.StoragePolicy.appendHistory);

// Retrieve progress data (returns array of dictionaries, matching Unity's List<Dictionary<string, string>>)
const result = await Abxr.StorageGetEntry("state", Abxr.StorageScope.user);
console.log("Retrieved data:", result); // Array of objects: [{"progress": "75%"}]

const defaultResult = await Abxr.StorageGetDefaultEntry(Abxr.StorageScope.user);
console.log("Retrieved default data:", defaultResult); // Array of objects from "state" key

// Process retrieved data (similar to Unity callback pattern)
if (result && result.length > 0) {
    const data = result[0]; // Get the most recent entry
    if (data.progress) {
        console.log("Progress:", data.progress);
    }
}

// Remove storage entries  
Abxr.StorageRemoveEntry("state", Abxr.StorageScope.user);
Abxr.StorageRemoveDefaultEntry(Abxr.StorageScope.user);
Abxr.StorageRemoveMultipleEntries(Abxr.StorageScope.user); // Clear all entries (use with caution)
```

**Parameters:**
- `name` (string): The identifier for this storage entry.
- `entry` (object): The key-value pairs to store as `{[key: string]: string}`.
- `scope` (StorageScope): Store/retrieve from 'device' or 'user' storage.
- `policy` (StoragePolicy): How data should be stored - `StoragePolicy.keepLatest` or `StoragePolicy.appendHistory` (defaults to `StoragePolicy.keepLatest`).

**Return Values:**
- **Set methods**: Return `Promise<number>` - Storage entry ID or 0 if not authenticated.
- **Get methods**: Return `Promise<{[key: string]: string}[]>` - Array of dictionaries matching Unity's `List<Dictionary<string, string>>` format.

### Telemetry
The Telemetry Methods provide comprehensive tracking of the XR environment. By default, they capture headset and controller movements, but can be extended to track any custom objects in the virtual space. These functions also allow collection of system-level data such as frame rates or device temperatures. This versatile tracking enables developers to gain deep insights into user interactions and application performance, facilitating optimization and enhancing the overall XR experience.

```javascript
// JavaScript Method Signatures
Abxr.TelemetryEntry(name, meta)

// Custom telemetry logging
Abxr.TelemetryEntry("headset_position", { 
    "x": "1.23", "y": "4.56", "z": "7.89" 
});
```

**Parameters:**
- `name` (string): The type of telemetry data (e.g., "headset_position", "frame_rate", "battery_level").
- `meta` (object): Key-value pairs of telemetry measurements.

### AI Integration
The AI Integration methods provide access to AI services for enhanced user interactions and experiences within XR environments. WebXR uses a Promise-based approach that allows developers to choose between blocking and non-blocking patterns.

```javascript
// Non-blocking approach - process response when ready
Abxr.AIProxy("How can I help you today?", "gpt-4").then(response => {
    if (response) {
        console.log("AI Response:", response);
        // Process the AI response without blocking
    } else {
        console.log("AI request failed");
    }
});

// Blocking approach - wait for response
const response = await Abxr.AIProxy("What's the weather like?", "gpt-4");
if (response) {
    console.log("Weather:", response);
}

// With conversation history for context
const pastMessages = ["Hello", "Hi there! How can I help?"];
const contextualResponse = await Abxr.AIProxy("What did we just discuss?", "gpt-4", pastMessages);

// Error handling with try/catch
try {
    const aiAdvice = await Abxr.AIProxy("Give me XR development tips", "gpt-4");
    if (aiAdvice) {
        displayAdvice(aiAdvice);
    }
} catch (error) {
    console.error("AI request error:", error);
}
```

**Method Signature:**
```typescript
static AIProxy(prompt: string, llmProvider?: string, pastMessages?: string[]): Promise<string | null>
```

**Parameters:**
- `prompt` (string): The input prompt for the AI system
- `llmProvider` (string, optional): The LLM provider to use (e.g., "gpt-4", "claude", "default")
- `pastMessages` (string[], optional): Previous conversation messages for context

**Returns:**
- `Promise<string | null>`: The AI response string, or null if the request failed

**Platform Differences:**
- **Unity**: Uses coroutines with callbacks - `StartCoroutine(Abxr.AIProxy(prompt, provider, callback))`
- **WebXR**: Uses Promise-based approach - developers can choose `await` (blocking) or `.then()` (non-blocking)

### Exit Polls
Deliver questionnaires to users to gather feedback.
```javascript
// Poll type enumeration
Abxr.PollType.Thumbs, Abxr.PollType.Rating, Abxr.PollType.MultipleChoice

// JavaScript Method Signatures
Abxr.PollUser(question, pollType)

// Poll types: Thumbs, Rating (1-5), MultipleChoice (2-8 options)
Abxr.PollUser("How would you rate this training experience?", Abxr.PollType.Rating);
```

### Metadata Formats

The ABXRLib SDK supports multiple flexible metadata formats. All formats are automatically converted to key-value pairs:

```javascript
// 1. Native JavaScript Objects (most efficient)
Abxr.Event("user_action", {
    "action": "click",
    "userId": "12345"
});

// 2. JSON Strings (auto-converts objects)
Abxr.Track("assessment_complete", '{"score": 95, "completed": true}');

// 3. No metadata
Abxr.Event("app_started");
```

**Key Takeaway:** All event and log methods support these flexible metadata formats

### Automatic Data Collection

The ABXRLib SDK automatically enhances your data with additional context and metadata without requiring explicit configuration:

#### Super Properties Auto-Merge
Super properties are automatically merged into **every** event, log, and telemetry entry's metadata. Data-specific properties take precedence when keys conflict:
```javascript
// Set super properties
Abxr.Register("app_version", "1.2.3");
Abxr.Register("user_type", "premium");

// Every event automatically includes super properties
Abxr.Event("level_complete", {
    "level": "3", 
    "user_type": "trial"  // This overrides the super property
});
// Result includes: app_version=1.2.3, user_type=trial, level=3

// Logs and telemetry also automatically include super properties
Abxr.LogInfo("Player action", { "action": "jump" });
// Result includes: app_version=1.2.3, user_type=premium, action=jump

Abxr.TelemetryEntry("frame_rate", { "fps": "60" });
// Result includes: app_version=1.2.3, user_type=premium, fps=60
```

#### Duration Auto-Calculation
When using timed events or event wrappers, duration is automatically calculated and included:
```javascript
// Manual timed events
Abxr.StartTimedEvent("puzzle_solving");
// ... 30 seconds later ...
Abxr.Event("puzzle_solving"); // Automatically includes {"duration": "30"}

// Event wrapper functions automatically handle duration
Abxr.EventAssessmentStart("final_exam");
// ... 45 seconds later ...
Abxr.EventAssessmentComplete("final_exam", 95, Abxr.EventStatus.Pass); // Automatically includes duration

// Works for all start/complete pairs:
// - EventAssessmentStart/Complete
// - EventObjectiveStart/Complete  
// - EventInteractionStart/Complete
// - EventLevelStart/Complete

// Duration defaults to "0" if no corresponding start event was found
// Timer is automatically removed after the first matching event
```

---

## Advanced Features

### Module Targets

The **Module Target** feature enables developers to create single applications with multiple modules, where each module can be its own assignment in an LMS. When a learner enters from the LMS for a specific module, the application can automatically direct the user to that module within the application. Individual grades and results are then tracked for that specific assignment in the LMS.

#### Getting Module Target Information

You can process module targets sequentially:

```javascript
// Get the next module target from available modules
const nextTarget = Abxr.GetModuleTarget();
if (nextTarget) {
    console.log(`Processing module: ${nextTarget.moduleTarget}`);
    enableModuleFeatures(nextTarget.moduleTarget);
    navigateToModule(nextTarget.moduleTarget);
} else {
    console.log('All modules completed!');
    showCompletionScreen();
}

// Check remaining module count
const remaining = Abxr.GetModuleTargetCount();
console.log(`Modules remaining: ${remaining}`);

// Get current user information
const userId = Abxr.GetUserId();
const userData = Abxr.GetUserData();
const userEmail = Abxr.GetUserEmail();
```

#### Module Target Management

You can manage module progress and access rich module data:

```javascript
// Check remaining modules and preview current
const remaining = Abxr.GetModuleTargetCount();
const nextModule = Abxr.GetModuleTarget();
if (nextModule) {
    console.log(`Next: ${nextModule.moduleTarget} (${remaining} remaining)`);
}

// Get all available modules
const allModules = Abxr.GetModuleTargetList();
console.log(`Total modules: ${allModules.length}`);

// Reset progress or access learner data
Abxr.ClearModuleTargets();
const learnerData = Abxr.GetLearnerData();
```

#### Automatic Module Execution

For applications with multiple modules, the **ExecuteModuleSequence** function provides a convenient way to automatically call module functions based on the authentication response. This feature mirrors the Unity implementation and makes it easy to handle sequential module execution.

```javascript
class TrainingManager {
    constructor() {
        // Set up authentication completion callback to execute modules
        Abxr.OnAuthCompleted((authData) => {
            if (authData.success) {
                console.log('Authentication successful, executing modules...');
                
                // Execute all modules automatically using default "Module_" prefix
                const executedCount = Abxr.ExecuteModuleSequence(this, 'Module_');
                console.log(`Executed ${executedCount} modules`);
            }
        });
    }

    // Define module functions that will be called automatically
    // Pattern: {prefix}{moduleTarget} with dashes/spaces converted to underscores
    Module_b787_baggage_load() {
        console.log('Starting baggage loading module');
        this.loadBaggageSimulation();
    }

    Module_b787_refuel() {
        console.log('Starting refueling module');
        this.loadRefuelSimulation();
    }

    Module_safety_training() {
        console.log('Starting safety training module');
        this.loadSafetyProtocols();
    }
}

// Initialize the training manager
const trainingManager = new TrainingManager();
```

The `ExecuteModuleSequence` function:
- Takes a target object, function prefix (default: ""), and function postfix (default: "")
- Automatically calls methods matching the pattern: `{prefix}{moduleTarget}{postfix}`
- Converts dashes and spaces in module targets to underscores
- Returns the number of modules successfully executed
- Handles errors gracefully and continues with remaining modules

```javascript
// Examples of different prefix patterns
const executedCount1 = Abxr.ExecuteModuleSequence(moduleManager, 'Module_');
const executedCount2 = Abxr.ExecuteModuleSequence(moduleManager, 'training_', '_start');
const executedCount3 = Abxr.ExecuteModuleSequence(moduleManager); // No prefix/postfix
```

**Use Cases:**
- **Reset state**: Reset module progress when starting a new experience
- **Error recovery**: Clear module progress and restart from beginning
- **Testing**: Reset module sequence during development
- **Session management**: Clean up between different users
- **Rich module data**: Access complete module information including names, IDs, and ordering

#### Persistence and Recovery

Module progress is automatically persisted across browser sessions and page reloads:

```javascript
// Module data is automatically retrieved from authentication response
// Module progress is automatically saved when advancing through modules

// When page reloads or browser crashes, module progress is automatically restored
const nextTarget = Abxr.GetModuleTarget(); // Loads progress from storage if needed
```

**Automatic Recovery Features:**
- **Session Persistence**: Module progress survives page refreshes and browser crashes
- **Lazy Loading**: Progress is automatically loaded from storage when first accessed
- **Error Resilience**: Failed storage operations are logged but don't crash the application
- **Cross-Session Continuity**: Users can continue multi-module experiences across browser sessions
- **Rich Data Access**: Complete module information available from authentication response

**Storage Details:**
- Module progress is stored in browser's persistent storage (IndexedDB/localStorage)
- Storage key: `"abxr_module_index"` (handled internally)
- Automatic cleanup when `ClearModuleTargets()` is called
- Uses ABXRLib's storage system for reliability and offline capabilities
- Module data comes directly from authentication response for accuracy

#### Best Practices

1. **Set up auth callback early**: Subscribe to `OnAuthCompleted` before calling `Abxr_init()`
2. **Handle module count**: Check `authData.moduleCount` and use `GetModuleTarget()` to get the next module to process
3. **Use GetModuleTarget() sequentially**: Call after completing each module to get the next one
4. **Validate modules**: Check if requested module exists before navigation
5. **Progress tracking**: Use assessment events to track module completion
6. **Error handling**: Handle cases where navigation fails or module is invalid
7. **User feedback**: Show loading indicators during module transitions
8. **Check completion**: Use `GetModuleTarget()` returning null to detect when all modules are done

### Authentication

The ABXRLib SDK provides comprehensive authentication completion callbacks that deliver detailed user and module information. This enables rich post-authentication workflows including automatic module navigation and personalized user experiences.

#### Authentication Completion Callback

Subscribe to authentication events to receive user information and module targets:

```javascript
// Basic authentication callback
Abxr.OnAuthCompleted((authData) => {
    if (authData.success) {
        console.log(`Welcome ${authData.userEmail}!`);
        
        // Handle initial vs reauthentication
        if (authData.isReauthentication) {
            refreshUserData();
        } else {
            initializeUserInterface();
        }
        
        // Handle modules if available
        if (authData.moduleCount > 0) {
            const moduleData = Abxr.GetModuleTarget();
            if (moduleData) {
                navigateToModule(moduleData.moduleTarget);
            }
        }
    }
});

// Callback management
Abxr.RemoveAuthCompletedCallback(authCallback);  // Remove specific callback
Abxr.ClearAuthCompletedCallbacks();              // Clear all callbacks
```

#### Authentication Data Structure

The callback provides an `AuthCompletedData` object with comprehensive authentication information:

```javascript
interface ModuleData {
    id: string;       // Module unique identifier
    name: string;     // Module display name
    target: string;   // Module target identifier
    order: number;    // Module order/sequence
}

interface AuthCompletedData {
    success: boolean;             // Whether authentication was successful
    token?: string;               // Authentication token
    secret?: string;              // Authentication secret
    userData?: any;               // Complete user data object from authentication response
    userId?: any;                 // User identifier
    userEmail?: string | null;    // User email address (extracted from userData.email)
    appId?: string;               // Application identifier
    modules?: ModuleData[];       // List of available modules
    moduleCount?: number;         // Number of available modules
    isReauthentication?: boolean; // Whether this was a reauthentication (vs initial auth)
    error?: string;               // Error message when success is false
    
    // Method to reconstruct original authentication response
    toJsonString?(): string;
}
```

#### Connection Status Check

You can check if AbxrLib has an active connection to the server at any time:

```javascript
// JavaScript Method Signature
Abxr.ConnectionActive()

// Example usage
// Check app-level connection status  
if (Abxr.ConnectionActive()) {
    console.log("ABXR is connected and ready to send data");
    Abxr.Event("app_ready");
} else {
    console.log("Connection not active - waiting for API authentication");
    Abxr.OnAuthCompleted((authData) => {
        if (authData.success) {
            console.log("Connection established successfully!");
        }
    });
}
```

**Returns:** Boolean indicating if the library has an active connection and can communicate with the server

#### Accessing Learner Data

After authentication completes, you can access comprehensive learner data and preferences:

```javascript
// Get learner data and preferences
const learnerData = Abxr.GetLearnerData();
if (learnerData) {
    const userName = learnerData.name;
    const audioPreference = learnerData.audioPreference;
    
    console.log(`Welcome back, ${userName}!`);
    setAudioLevel(audioPreference);
}

// Check connection status before accessing data
if (Abxr.ConnectionActive()) {
    customizeExperience(Abxr.GetLearnerData());
}
```

**Returns:** Object containing learner data from the authentication response, or null if not authenticated

**Available Data (when provided by authentication response):**
- **User Preferences**: `audioPreference`, `speedPreference`, `textPreference`
- **User Information**: `name`, `email`, `id`, `user_id`
- **Custom Fields**: Any additional data provided in the userData object

**Use Cases:**
- **Personalization**: Customize audio levels, playback speed, and text size based on user preferences
- **Accessibility**: Apply user-specific accessibility settings automatically
- **User Experience**: Greet users by name and show personalized content
- **Analytics**: Track usage patterns based on user preferences
- **Adaptive Content**: Adjust content difficulty or presentation based on user data

### Session Management

The ABXRLib SDK provides comprehensive session management capabilities that allow you to control authentication state and session continuity. These methods are particularly useful for multi-user environments, testing scenarios, and creating seamless user experiences across devices and time.

#### StartNewSession
Start a new session with a fresh session identifier. This method generates a new session ID and performs fresh authentication, making it ideal for starting new training experiences or resetting user context.

```javascript
// JavaScript Method Signature
await Abxr.StartNewSession();
```

#### ReAuthenticate
Trigger manual reauthentication with existing stored parameters. This method is primarily useful for testing authentication flows or recovering from authentication issues.

```javascript
// JavaScript Method Signature
await Abxr.ReAuthenticate();
```

**Note:** All session management methods work asynchronously and will trigger the `OnAuthCompleted` callback when authentication completes, allowing you to respond to success or failure states.

#### Debug Mode

For debugging authentication, network issues, or other problems, enable debug logging:

```javascript
// Check if connection is established with the service
Abxr.ConnectionActive();

// Enable and check debug mode Method Sigantures
Abxr.SetDebugMode(enabled)
Abxr.GetDebugMode()

// Example usage
Abxr.SetDebugMode(true);  // Enable debug logging
Abxr.SetDebugMode(false); // Disable debug logging

const isDebugging = Abxr.GetDebugMode();
console.log('Debug mode:', isDebugging);

// Conditional debug setup for development
if (process.env.NODE_ENV === 'development') {
    Abxr.SetDebugMode(true);
}
```

**Parameters:**
- `enabled` (boolean): Enable or disable debug mode

**Returns:** `GetDebugMode()` returns boolean indicating current debug state

**Debug Mode Benefits:**
- **Detailed error messages**: See exactly what's failing during authentication
- **Network request logging**: Track API calls and responses
- **State information**: Monitor internal library state changes
- **Performance insights**: Identify bottlenecks and timing issues


### Mixpanel Compatibility

The ABXRLib SDK provides full compatibility with Mixpanel's JavaScript SDK, making migration simple and straightforward. You can replace your existing Mixpanel tracking calls with minimal code changes while gaining access to ABXR's advanced XR analytics capabilities.

#### Why Migrate from Mixpanel?

- **XR-Native Analytics**: Purpose-built for spatial computing and immersive experiences
- **Advanced Session Management**: Resume training across devices and sessions  
- **Enterprise Features**: LMS integrations, SCORM/xAPI support, and AI-powered insights
- **Spatial Tracking**: Built-in support for 3D position data and XR interactions
- **Open Source**: No vendor lock-in, deploy to any backend service

**Migration Steps:**
1. Remove Mixpanel references (`import mixpanel from 'mixpanel-browser';`)
2. Remove: mixpanel.init('YOUR_PROJECT_TOKEN');
2. Configure ABXRLib SDK credentials
3. Replace `mixpanel.track` → `Abxr.Track` throughout codebase
4. Replace `mixpanel.register` → `Abxr.Register` throughout codebase for **super properties**


```javascript
// Mixpanel → ABXR migration example
// Before: mixpanel.track("Plan Selected", props);
// After:  Abxr.Track("Plan Selected", props);
```

#### Drop-in Compatibility Methods

```javascript
// JavaScript Method Signatures
Abxr.Track(eventName)
Abxr.Track(eventName, properties)

// Abxr compatibility methods for Mixpanel users
Abxr.Track("user_signup");
Abxr.Track("purchase_completed", { amount: 29.99, currency: "USD" });

// Timed events
Abxr.StartTimedEvent("puzzle_solving");
// ... later ...
Abxr.Track("puzzle_solving"); // Duration automatically included
```

#### Key Advantages Over Mixpanel

| Feature | Mixpanel | ABXRLib SDK |
|---------|----------|-----------|
| **Basic Event Tracking** | ✅ | ✅ |
| **Custom Properties** | ✅ | ✅ |
| **Super Properties** | ✅ | ✅ (Register/RegisterOnce available) |
| **Timed Events** | ✅ | ✅ (StartTimedEvent available) |
| **XR-Specific Events** | ❌ | ✅ (Assessments, Interactions, Objectives) |
| **Session Persistence** | Limited | ✅ (Cross-device, resumable sessions) |
| **Enterprise LMS Integration** | ❌ | ✅ (SCORM, xAPI, major LMS platforms) |
| **Real-time Collaboration** | ❌ | ✅ (Multi-user session tracking) |
| **Open Source** | ❌ | ✅ |

### Cognitive3D Compatibility

The ABXRLib SDK provides full compatibility with Cognitive3D SDK, making migration simple and straightforward for event tracking. You can replace your existing Cognitive3D tracking calls with minimal code changes while gaining access to ABXR's advanced XR analytics capabilities and LMS integrations.

> **Note:** This compatibility guide covers event tracking only. Spatial analytics features of Cognitive3D are not covered as they have different architectures.

#### Why Migrate from Cognitive3D?

- **LMS Integration**: Native LMS platform support with SCORM/xAPI compatibility
- **Advanced Analytics**: Purpose-built dashboards for learning and training outcomes
- **Enterprise Features**: Session management, cross-device continuity, and AI-powered insights
- **Open Source**: No vendor lock-in, deploy to any backend service
- **Structured Events**: Rich event wrappers for assessments, objectives, and interactions

#### Migration Overview

| **Cognitive3D SDK**                          | **Equivalent in AbxrLib SDK**                                                |
| -------------------------------------------- | ---------------------------------------------------------------------------- |
| `new CustomEvent("event_name").Send()`       | `new Abxr.CustomEvent("event_name").Send()` or `Abxr.Event("event_name")`    |
| `Cognitive3D.StartEvent("assessment")`       | `Abxr.StartEvent("assessment")` or `Abxr.EventAssessmentStart("assessment")` |
| `Cognitive3D.EndEvent("assessment", result)` | `Abxr.EndEvent("assessment", result)` or `Abxr.EventAssessmentComplete(...)` |
| `Cognitive3D.SendEvent("event", props)`      | `Abxr.SendEvent("event", props)` or `Abxr.EventObjectiveComplete(...)`       |
| `Cognitive3D.SetSessionProperty(key, val)`   | `Abxr.SetSessionProperty(key, val)` or `Abxr.Register(key, val)`             |
| `Cognitive3D.Log("message")`                 | `Abxr.Log("message")` or `Abxr.LogInfo("message")`                           |

#### Migration Steps

**Step 1: Import and Namespace Updates**
```typescript
// Option 1: Update import statements
// Before: import { CustomEvent } from 'cognitive3d';
// After:   (use Abxr static methods instead)

// Option 2: String replacement approach
// Replace "Cognitive3D." with "Abxr." throughout your codebase for compatibility methods
```

**Step 2: Event Tracking Migration**

```typescript
///// CUSTOM EVENTS /////

// Before (Cognitive3D):
new Cognitive3D.CustomEvent("Pressed Space").Send();

// After (ABXRLib) - Direct replacement:
new Abxr.CustomEvent("Pressed Space").Send();

// After (ABXRLib) - Recommended approach:
Abxr.Event("Pressed Space");

///// START/END EVENTS (Assessment Tracking) /////

// Before (Cognitive3D):
Cognitive3D.StartEvent("final_exam");
Cognitive3D.EndEvent("final_exam", "pass", 95);

// After (ABXRLib) - Direct replacement:
Abxr.StartEvent("final_exam");
Abxr.EndEvent("final_exam", "pass", 95);

// After (ABXRLib) - Recommended approach:
Abxr.EventAssessmentStart("final_exam");
Abxr.EventAssessmentComplete("final_exam", 95, Abxr.EventStatus.ePass);

///// SEND EVENT (Objective Tracking) /////

// Before (Cognitive3D):
Cognitive3D.SendEvent("valve_opened", {
    result: "success",
    score: 100
});

// After (ABXRLib) - Direct replacement:
Abxr.SendEvent("valve_opened", {
    result: "success",
    score: 100
});

// After (ABXRLib) - Recommended approach:
Abxr.EventObjectiveComplete("valve_opened", 100, Abxr.EventStatus.eComplete);

///// SESSION PROPERTIES /////

// Before (Cognitive3D):
Cognitive3D.SetSessionProperty("user_type", "technician");

// After (ABXRLib) - Direct replacement:
Abxr.SetSessionProperty("user_type", "technician");

// After (ABXRLib) - Recommended approach:
Abxr.Register("user_type", "technician");

///// LOGGING /////

// Before (Cognitive3D):
Cognitive3D.Log("Assessment started");

// After (ABXRLib):
Abxr.Log("Assessment started"); // Defaults to LogLevel.eInfo
// Or with specific levels:
Abxr.Log("Assessment started", Abxr.LogLevel.eInfo);
Abxr.Log("Error occurred", Abxr.LogLevel.eError);
```

#### Advanced Migration Features

**Custom Event Properties:**
```typescript
// Cognitive3D approach:
new Cognitive3D.CustomEvent("button_press")
    .SetProperty("button_id", "submit")
    .SetProperty("screen", "main_menu")
    .Send();

// ABXRLib equivalent:
new Abxr.CustomEvent("button_press")
    .SetProperty("button_id", "submit")
    .SetProperty("screen", "main_menu")
    .Send();

// ABXRLib recommended:
Abxr.Event("button_press", {
    button_id: "submit",
    screen: "main_menu"
});
```

**Result Conversion Logic:**

The ABXRLib compatibility layer automatically converts common Cognitive3D result formats:

```typescript
// These Cognitive3D result values...
"pass", "success", "complete", "true", "1" → Abxr.EventStatus.ePass
"fail", "error", "false", "0"              → Abxr.EventStatus.eFail  
"incomplete"                               → Abxr.EventStatus.eIncomplete
"browse"                                   → Abxr.EventStatus.eBrowsed
// All others                              → Abxr.EventStatus.eComplete (default)
```

#### Key Advantages Over Cognitive3D

| Feature | Cognitive3D | ABXRLib SDK |
|---------|-------------|-----------|
| **Basic Event Tracking** | ✅ | ✅ |
| **Custom Properties** | ✅ | ✅ |
| **Session Properties** | ✅ | ✅ (Enhanced with persistence) |
| **LMS Integration** | ❌ | ✅ (SCORM, xAPI, major platforms) |
| **Structured Learning Events** | ❌ | ✅ (Assessments, Objectives, Interactions) |
| **Cross-Device Sessions** | ❌ | ✅ (Resume training across devices) |
| **AI-Powered Insights** | ❌ | ✅ (Content optimization, learner analysis) |
| **Open Source** | ❌ | ✅ |

#### Migration Recommendations

**For Quick Migration:**
1. Use the direct compatibility methods (`Abxr.StartEvent`, `Abxr.EndEvent`, etc.)
2. Perform string replacement: `"Cognitive3D."` → `"Abxr."`
3. Test existing functionality

**For Enhanced Features:**
1. Replace `StartEvent`/`EndEvent` with `EventAssessmentStart`/`EventAssessmentComplete`
2. Replace `SendEvent` with `EventObjectiveComplete` where appropriate
3. Use structured `EventStatus` enum instead of string results
4. Add `InteractionType` tracking for detailed user behavior analysis

**Migration Path:**
```typescript
// Phase 1: Direct replacement (immediate compatibility)
await Abxr.StartEvent("training_module");        // Works immediately
await Abxr.EndEvent("training_module", "pass");  // Automatic conversion

// Phase 2: Enhanced features (recommended)  
await Abxr.EventAssessmentStart("training_module");
await Abxr.EventAssessmentComplete("training_module", 92, Abxr.EventStatus.ePass);
```

#### XR Dialog Customization

The SDK has built in dialogs to support the two-step authentication when the backend requires additional credentials (like a PIN or email). There are multiple approaches to handle this:

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

##### Option 2: Customize styling of Built-in Dialog System 

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

Abxr_init('app123', undefined, undefined, undefined, dialogOptions);
```

**What makes XR dialogs special:**
- 🥽 **VR/AR Optimized**: Beautiful in both desktop browsers and XR headsets
- ⌨️ **Virtual Keyboard**: Built-in keyboard for XR environments (PIN pad for PINs)
- 🎨 **Fully Customizable**: Colors, styling, and behavior - match your brand
- 🔄 **Auto-Detection**: Automatically chooses XR vs HTML dialog based on environment
- 📱 **Universal**: Works everywhere - desktop, mobile, and XR devices


##### Option 3: Custom Callback Approach

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
Abxr_init('app123', undefined,undefined, undefined, undefined, handleAuthMechanism);
```

##### Option 4: Manual Check Approach

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

#### Authentication Issues

**Problem: Library fails to authenticate**
- **Solution**: Verify your App ID, Org ID, and Auth Secret are correct
- **Check**: Ensure URL parameters `abxr_orgid` and `abxr_auth_secret` are properly formatted
- **Debug**: Enable debug mode with `Abxr.SetDebugMode(true)` to see detailed error messages

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
Abxr.OnAuthCompleted(function(authData) {
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
