# ABXRLib SDK for WebXR

The name "ABXR" stands for "Analytics Backbone for XR"—a flexible, open-source foundation for capturing and transmitting spatial, interaction, and performance data in XR. When combined with **ArborXR Insights**, ABXR transforms from a lightweight instrumentation layer into a full-scale enterprise analytics solution—unlocking powerful dashboards, LMS/BI integrations, and AI-enhanced insights.

## Table of Contents
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Quick Start](#quick-start)
5. [Full Documentation](#full-documentation)
6. [Support](#support)

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

### CDN Installation

```html
<script src="https://cdn.jsdelivr.net/npm/abxrlib-for-webxr@latest/dist/abxrlib-for-webxr.js"></script>
```

### Manual Installation

1. Download the latest release from the GitHub repository.
2. Include the `abxrlib-for-webxr.js` file in your project.
3. Initialize the library in your application.

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

#### Alternative for Managed Devices:
If you're using an ArborXR-managed device, only the App ID is required:
```typescript
Abxr_init('your-app-id');
// orgId and authSecret are automatically provided
```

### Using with Other Backend Services
For information on implementing your own backend service or using other compatible services, please refer to the ABXR protocol specification.

---

## Quick Start

### Essential Event Tracking (Required)

**Assessment events are required** to activate grading dashboards and LMS integration. Send these events to track training completion, scores, and pass/fail status.

```typescript
// When training starts
Abxr.EventAssessmentStart('safety_training');

// When training completes
Abxr.EventAssessmentComplete('safety_training', 92, Abxr.EventStatus.Pass);
// or
Abxr.EventAssessmentComplete('safety_training', 25, Abxr.EventStatus.Fail);
```

**Assessment Complete Parameters:**
- `Score` (second parameter) takes a 0-100 value
- `EventStatus` (third parameter). The `EventStatus` accepts `Pass`, `Fail`, `Complete`, `Incomplete`, `Browsed`, `NotAttempted` values

### Tracking Objectives (Recommended)

For more detailed tracking, you can also track specific objectives within your training:

```typescript
// To mark a specific objective start
Abxr.EventObjectiveStart('open_valve');

// When the objective is complete
Abxr.EventObjectiveComplete('open_valve', 100, Abxr.EventStatus.Complete);
```

---

## Full Documentation

For comprehensive documentation covering all features, advanced topics, and detailed examples, visit:

- **[ArborXR Insights Documentation](https://developers.arborxr.com/docs/insights)** - Main documentation hub
- **[Complete SDK Documentation](https://developers.arborxr.com/docs/insights/full-documentation/)** - Full API reference and feature documentation

The full documentation includes:
- Complete event tracking API (Events, Analytics Event Wrappers, Timed Events)
- Advanced features (Module Targets, Authentication, Session Management)
- Storage, Telemetry, Logging, and AI Integration
- Mixpanel and Cognitive3D compatibility guides
- XR Dialog Customization
- Troubleshooting and best practices
- Platform-specific examples and code samples

---

## Support

### Resources

- **Docs:** [https://help.arborxr.com/](https://help.arborxr.com/)
- **GitHub:** [https://github.com/ArborXR/abxrlib-for-webxr](https://github.com/ArborXR/abxrlib-for-webxr)

### FAQ

#### How do I retrieve my Application ID and Authorization Secret?
Your Application ID can be found in the Web Dashboard under the application details. For the Authorization Secret, navigate to Settings > Organization Codes on the same dashboard.

For more troubleshooting help and detailed FAQs, see the [full documentation](https://developers.arborxr.com/docs/insights/full-documentation/).
