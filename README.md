# ArborXR Insights WebXR SDK

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

The **ArborXR Insights SDK for WebXR** empowers developers to seamlessly integrate enterprise-grade XR analytics and data tracking into their web applications. Built on the **AbxrLib** runtime, this open-source library enables scalable event tracking, telemetry, and session-based storage—essential for enterprise and education XR environments.

> **Note:** The name "Abxr" stands for "Analytics Backend for XR" - representing our commitment to establishing an open standard for XR analytics and data collection.

ArborXR Insights enhances product value by offering:
- Seamless LMS & Business Intelligence integrations
- A robust, analytics-driven backend
- Encrypted, cross-session data persistence
- AI-ready event streams

### Core Features

- **Event Tracking:** Monitor user behaviors, interactions, and system events.
- **Spatial & Hardware Telemetry:** Capture headset/controller movement and hardware metrics.
- **Object & System Info:** Track XR objects and environmental state.
- **Storage & Session Management:** Support resumable training and long-form experiences.
- **Logs:** Developer and system-level logs available across sessions.

---

## Installation

### NPM Package Installation

```bash
npm install abxrlibforwebxr
```

---

## Configuration

### Setup & Authentication

#### Use Beta Credentials (**Not** the IDs from the [ArborXR Dashboard](https://app.arborxr.com/)):
1. Go to the ArborXR Insights Beta web app and log in (will require [official beta sign up](https://arborxr.com/insights-beta) & onboarding process to access).
2. Grab these three values from the **View Data** screen of the specific app you are configuring:
- App ID
- Organization ID
- Authentication Secret

#### Update Your Web Application:
```typescript
import { AbxrInit } from 'abxrlibforwebxr';

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

## Backend Integration: ArborXR Insights Storage API

All WebXR data is securely routed to the **ArborXR Insights Storage API**, which:
- Validates authentication via signed JWTs
- Ensures session continuity across user/device
- Persists structured logs into MongoDB Atlas
- Provides async-ready responses for batch telemetry logging

Example endpoints:
- `/v1/collect/event` → Event logging
- `/v1/collect/log` → Developer log ingestion
- `/v1/collect/telemetry` → Positional + hardware data
- `/v1/storage` → Persisted user/device state

---

## Web UI + Insights User API

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
