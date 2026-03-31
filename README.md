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

To use the ABXRLib SDK with ArborXR Insights, configure **app token** and **org token** (recommended)—aligned with the [Unity](https://github.com/ArborXR/abxrlib-for-unity/blob/main/README.md#configuration) and [Unreal](https://github.com/ArborXR/abxrlib-for-unreal/blob/main/README.md#configuration) SDKs.

#### App token and org token (recommended)

##### Get your credentials

1. Go to the ArborXR Portal and log in.
2. Open **Content Library**, choose your app from the **Managed** apps list, then open the **Insights Hub** tab. The **App Token** is shown on this screen. Copy:
   - **App Token** (JWT) — required for new integrations.
   - **Org Token** (JWT) — optional in many flows; required when `buildType` is `"production_custom"` (use your distribution channel when the portal does not provide it).

**Org token:** Leave unset or empty to rely on dynamic org resolution when the runtime provides org context. For **local development**, you can set `orgToken` to the same JWT as `appToken` when you need both values populated.

##### Configure Web application

**Default:** Initialize with `Abxr_init({ appToken, orgToken?, buildType?, ... })`.

```typescript
import { Abxr_init, Abxr } from 'abxrlib-for-webxr';

Abxr_init({
    appToken: 'eyJ...',      // Required (JWT)
    orgToken: 'eyJ...',      // Optional; required when buildType is production_custom
    buildType: 'production', // Optional: 'production' | 'development' | 'production_custom'
});
Abxr.Event('user_action', { action: 'button_click' });
```

**Development / testing:** Pass `appToken`; use `buildType: 'development'` when appropriate.

**Production builds:** Use `appToken` and omit or empty `orgToken` when the deployment supplies org context; set `orgToken` for production_custom per your channel.

> **⚠️ Security Note:** Avoid embedding long-lived org tokens or legacy secrets in client bundles for broad distribution. Prefer runtime configuration, environment variables, or ArborXR-managed deployment. For single-customer builds, follow your security guidelines.

Events, logs, and telemetry are batched and sent via the unified **`/v1/collect/data`** endpoint.

#### Legacy (App ID / Org ID / Auth Secret)

Initialize with app ID / org ID / auth secret. `orgId` and `authSecret` can be provided via URL parameters (`abxr_orgid`, `abxr_auth_secret`).

```typescript
// Legacy: appId (required), orgId and authSecret optional
Abxr_init('your-app-id');
Abxr_init('your-app-id', 'your-org-id', 'your-auth-secret');
```

##### URL parameter authentication (legacy)

You can provide credentials via URL parameters, which take precedence over function parameters:

```
https://yourdomain.com/?abxr_orgid=YOUR_ORG_ID&abxr_auth_secret=YOUR_AUTH_SECRET
```

```typescript
import { Abxr_init, Abxr } from 'abxrlib-for-webxr';

Abxr_init('your-app-id');
Abxr.Event('user_action', { action: 'button_click' });
```

On ArborXR-managed devices with legacy auth, only the App ID may be required in code; org and secret can be supplied by the environment.

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

#### How do I get my App Token and Org Token?
Use **App Token** and **Org Token** (recommended). Copy them from **Content Library** → **Managed** app → **Insights Hub** in the portal, or use values from your distribution channel. Leave **Org Token** empty when the runtime provides org context; for local testing you can set **Org Token** to the same JWT as **App Token** if needed. For legacy setups, Application ID and Authorization Secret are still available under application details and Settings > Organization Codes.

For more troubleshooting help and detailed FAQs, see the [full documentation](https://developers.arborxr.com/docs/insights/full-documentation/).
