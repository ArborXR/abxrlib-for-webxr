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

The **ABXR SDK for Unity** is an open-source analytics and data collection library that provides developers with the tools to collect and send XR data to any service of their choice. This library enables scalable event tracking, telemetry, and session-based storage—essential for enterprise and education XR environments.

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
npm install abxrlibforwebxr
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
```typescript
import { AbxrInit } from 'abxrlib-for-webxr';

async function main() {
  const authData = {
    appId: 'your-app-id',
    orgId: 'your-org-id',
    deviceId: 'web-xr',
    authSecret: 'your-auth-secret'
  };

  const Abxr = await AbxrInit(authData);
  // Your application code here
}

main();
```

#### Alternative for URL-based Authentication:
You can also initialize the SDK using URL parameters:
```
http://yourdomain.com/?xrdm_orgid=YOUR_ORG_ID&xrdm_authsecret=YOUR_AUTH_SECRET
```

Then initialize with just the App ID:
```typescript
const Abxr = await AbxrInit({
  appId: 'YOUR_APP_ID'
});
```

### Using with Other Backend Services
For information on implementing your own backend service or using other compatible services, please refer to the ABXR protocol specification.

---

## Sending Data

### Event Methods
```typescript
// TypeScript Event Method Signatures
await Abxr.Event(name: string);
await Abxr.Event(name: string, meta: Record<string, string>);
await Abxr.Event(name: string, meta: Record<string, string>, location_data: Vector3);

// Example Usage - Basic Event
await Abxr.Event('button_pressed');

// Example Usage - Event with Metadata
await Abxr.Event('item_collected', {
    item_type: 'coin',
    item_value: '100'
});

// Example Usage - Event with Metadata and Location
await Abxr.Event('player_teleported', 
    { destination: 'spawn_point' },
    new Vector3(1.5, 0.0, -3.2)
);
```

### Event Wrappers (for LMS Compatibility)

#### Assessments
```typescript
// TypeScript Event Method Signatures
await Abxr.EventAssessmentStart(assessmentName: string);
await Abxr.EventAssessmentStart(assessmentName: string, meta: Record<string, string>);

await Abxr.EventAssessmentComplete(assessmentName: string, score: number, result: ResultOptions);
await Abxr.EventAssessmentComplete(assessmentName: string, score: number, result: ResultOptions, meta: Record<string, string>);

// Example Usage
await Abxr.EventAssessmentStart('final_exam');
await Abxr.EventAssessmentComplete('final_exam', 92, ResultOptions.Pass);
```

#### Objectives
```typescript
// TypeScript Event Method Signatures
await Abxr.EventObjectiveStart(objectiveName: string);
await Abxr.EventObjectiveStart(objectiveName: string, meta: Record<string, string>);
await Abxr.EventObjectiveStart(objectiveName: string, metaString: string);

// Example Usage
await Abxr.EventObjectiveStart('open_valve');
await Abxr.EventObjectiveComplete('open_valve', 100, ResultOptions.Complete);
```

#### Interactions
```typescript
// TypeScript Event Method Signatures
await Abxr.EventInteractionStart(interactionName: string);

await Abxr.EventInteractionComplete(interactionName: string, result: string);
await Abxr.EventInteractionComplete(interactionName: string, result: string, result_details: string);
await Abxr.EventInteractionComplete(interactionName: string, result: string, result_details: string, type: InteractionType);
await Abxr.EventInteractionComplete(interactionName: string, result: string, result_details: string, type: InteractionType, meta: Record<string, string>);

// Example Usage
await Abxr.EventInteractionStart('select_option_a');
await Abxr.EventInteractionComplete('select_option_a', 'true', 'a', InteractionType.Select);
```

### Logging
```typescript
// TypeScript Event Method Signatures
await Abxr.Log(level: LogLevel, message: string);

// Example usage
await Abxr.Log('Info', 'Module started');

// Severity-specific logging
await Abxr.LogDebug(message: string);
await Abxr.LogInfo(message: string);
await Abxr.LogWarn(message: string);
await Abxr.LogError(message: string);
await Abxr.LogCritical(message: string);

// Example usage
await Abxr.LogError('Critical error in assessment phase');
```

### Storage API
```typescript
// TypeScript Event Method Signatures
await Abxr.SetStorageEntry(data: Record<string, string>, name?: string, keep_latest?: boolean, origin?: string, session_data?: boolean);

// Example usage
await Abxr.SetStorageEntry({ progress: '75%' });

// Retrieve Data
const state = await Abxr.GetStorageEntry(name?: string, origin?: string, tags_any?: string[], tags_all?: string[], user_only?: boolean);

// Remove Storage
await Abxr.RemoveStorageEntry(name?: string);

// Get All Entries
const allEntries = await Abxr.GetAllStorageEntries();
```

### Telemetry
```typescript
// TypeScript Event Method Signatures
await Abxr.Telemetry(name: string, data: Record<string, string>);

// Example usage
await Abxr.Telemetry('headset_position', { x: '1.23', y: '4.56', z: '7.89' });
```

### AI Integration Methods
```typescript
// TypeScript Event Method Signatures
const response = await Abxr.AIProxy(prompt: string, past_messages?: string, bot_id?: string);

// Example usage
const greeting = await Abxr.AIProxy('Provide me a randomized greeting that includes common small talk and ends by asking some form of how can I help');
```

### Authentication Methods
```typescript
// TypeScript Event Method Signatures
await Abxr.SetUserId(userId: string);
await Abxr.SetUserMeta(metaString: string);
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

To use this feature, simply call the storage functions provided in the SDK (`SetStorageEntry`, `GetStorageEntry`, etc.). These entries are automatically synced with ArborXR’s cloud infrastructure, ensuring consistent data across sessions.

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
