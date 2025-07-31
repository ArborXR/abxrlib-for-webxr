# ABXR SDK for WebXR

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

The **ABXR SDK for WebXR** is an open-source analytics and data collection library that provides developers with the tools to collect and send XR data to any service of their choice. This library enables scalable event tracking, telemetry, and session-based storage—essential for enterprise and education XR environments.

**Why Use ABXR SDK?**

- **Open-Source** & portable to any backend—no vendor lock-in  
- **Quick integration**—track user interactions in minutes  
- **Secure & scalable**—ready for enterprise use cases  
- **Pluggable with ArborXR Insights**—seamless access to LMS/BI integrations, session replays, AI diagnostics, and more

> 💡 **Quick Start:** Most developers can integrate ABXR SDK and log their first event in under **15 minutes**.

### Core Features

The ABXR SDK provides:
- **Event Tracking:** Monitor user behaviors, interactions, and system events.
- **Spatial & Hardware Telemetry:** Capture headset/controller movement and hardware metrics.
- **Object & System Info:** Track XR objects and environmental state.
- **Storage & Session Management:** Support resumable training and long-form experiences.
- **Logs:** Developer and system-level logs available across sessions.

### Backend Services

The ABXR SDK is designed to work with any backend service that implements the ABXR protocol. Currently supported services include:

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

To use the ABXR SDK with ArborXR Insights Early Access program:

#### Get Early Access Credentials
1. Go to the ArborXR Insights Early Access web app and log in (will require [official Early Access sign up](https://arborxr.com/insights-early-access) & onboarding process to access).
2. Grab these three values from the **View Data** screen of the specific app you are configuring:
- App ID
- Organization ID
- Authentication Secret

#### Configure Web Application

The ABXR SDK now provides a simplified initialization API. The `appId` is required, while `orgId` and `authSecret` are optional and can be provided via URL parameters.

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

Abxr_init('app123', 'org456', 'secret789', undefined, undefined, dialogOptions);
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
Abxr_init('app123', 'org456', 'secret789', undefined, handleAuthMechanism);
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
```typescript
import { Abxr } from 'abxrlib-for-webxr';

// Send a simple event
await Abxr.Event('button_pressed');

// Send an event with metadata
const meta = new Abxr.DictStrings();
meta.set('item_type', 'coin');
meta.set('item_value', '100');
await Abxr.Event('item_collected', meta);
```

### Event Wrappers (for LMS Compatibility)

#### Assessments
```typescript
import { Abxr, ResultOptions } from 'abxrlib-for-webxr';

// Start assessment
const startMeta = new Abxr.DictStrings();
startMeta.set('assessment_name', 'final_exam');
await Abxr.Event('assessment_start', startMeta);

// Complete assessment
const completeMeta = new Abxr.DictStrings();
completeMeta.set('assessment_name', 'final_exam');
completeMeta.set('score', '92');
completeMeta.set('result', ResultOptions.Pass.toString());
await Abxr.Event('assessment_complete', completeMeta);
```

#### Objectives
```typescript
import { Abxr, ResultOptions } from 'abxrlib-for-webxr';

// Start objective
const startMeta = new Abxr.DictStrings();
startMeta.set('objective_name', 'open_valve');
await Abxr.Event('objective_start', startMeta);

// Complete objective
const completeMeta = new Abxr.DictStrings();
completeMeta.set('objective_name', 'open_valve');
completeMeta.set('score', '100');
completeMeta.set('result', ResultOptions.Complete.toString());
await Abxr.Event('objective_complete', completeMeta);
```

#### Interactions
```typescript
import { Abxr, InteractionType } from 'abxrlib-for-webxr';

// Start interaction
const startMeta = new Abxr.DictStrings();
startMeta.set('interaction_name', 'select_option_a');
await Abxr.Event('interaction_start', startMeta);

// Complete interaction
const completeMeta = new Abxr.DictStrings();
completeMeta.set('interaction_name', 'select_option_a');
completeMeta.set('result', 'true');
completeMeta.set('result_details', 'a');
completeMeta.set('type', InteractionType.Select.toString());
await Abxr.Event('interaction_complete', completeMeta);
```

### Logging
```typescript
import { Abxr } from 'abxrlib-for-webxr';

// Send logs with different levels
await Abxr.LogDebug('Debug message');
await Abxr.LogInfo('Info message');
await Abxr.LogWarn('Warning message');
await Abxr.LogError('Error message');
await Abxr.LogCritical('Critical error');

// Or use the generic Log method
await Abxr.Log(LogLevel.Info, 'Module started');
```

### Storage API
```typescript
import { Abxr } from 'abxrlib-for-webxr';

// Store data
await Abxr.SetStorageEntry('user_progress', '75%');

// Store data with more options
const data = new Abxr.DictStrings();
data.set('progress', '75%');
data.set('level', 'intermediate');
await Abxr.SetStorageEntry(data, true, 'game', false, 'user_progress');

// Retrieve data
const entry = await Abxr.GetStorageEntry('user_progress');

// Remove storage entry
await Abxr.RemoveStorageEntry('user_progress');
```

### Telemetry
```typescript
import { Abxr } from 'abxrlib-for-webxr';

// Send telemetry data
const telemetryData = new Abxr.DictStrings();
telemetryData.set('x', '1.23');
telemetryData.set('y', '4.56');
telemetryData.set('z', '7.89');
await Abxr.Telemetry('headset_position', telemetryData);
```

### AI Integration Methods
```typescript
import { Abxr } from 'abxrlib-for-webxr';

// Send AI proxy request
const response = await Abxr.AIProxy(
  'Provide me a randomized greeting that includes common small talk and ends by asking some form of how can I help',
  '', // past messages
  'default' // bot id
);
```

### Authentication Methods
```typescript
import { Abxr } from 'abxrlib-for-webxr';

// Set user ID
Abxr.set_UserId('user123');

// Set user metadata
Abxr.m_dssCurrentData = { 
  user_role: 'student',
  user_level: 'intermediate'
};
```

## FAQ

### Q: How do I retrieve my Application ID and Authorization Secret?
A: Your Application ID can be found in the Web Dashboard under the application details. For the Authorization Secret, navigate to Settings > Organization Codes on the same dashboard.

### Q: How do I enable object tracking?
A: Object tracking can be enabled by adding the Track Object component to any GameObject in your scene via the Unity Inspector.

## Troubleshooting

---

## Persisting User State with ArborXR Insights

The ABXR SDK includes a built-in storage interface that enables persistent session data across XR devices. This is ideal for applications with long-form content, resumable training, or user-specific learning paths.

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

## API Reference

### Initialization

- `Abxr_init(appId, orgId?, authSecret?, appConfig?, authMechanismCallback?, dialogOptions?)` - Initialize and authenticate the library
  - `appId` (required): Your application ID
  - `orgId` (optional): Your organization ID (can also be provided via URL parameter `abxr_orgid`)
  - `authSecret` (optional): Your authentication secret (can also be provided via URL parameter `abxr_auth_secret`)
  - `appConfig` (optional): Custom XML configuration string
  - `authMechanismCallback` (optional): Callback function to handle two-step authentication requirements
  - `dialogOptions` (optional): Configuration for built-in dialog system (see XR Dialog examples above)

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
