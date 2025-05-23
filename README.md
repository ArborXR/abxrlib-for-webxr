# AbxrLibForWebXR

Welcome to AbxrLibForWebXR, a powerful JavaScript/TypeScript library crafted to seamlessly integrate XR analytics and services into web applications. This library is packed with features that allow developers to supercharge their applications with advanced event tracking, telemetry, and AI integrations, making it a perfect fit for enterprise-level solutions.

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Features](#features)
5. [API Reference](#api-reference)
6. [Authentication](#authentication)
7. [Event Tracking](#event-tracking)
8. [Logging](#logging)
9. [Telemetry](#telemetry)
10. [AI/LLM Integration](#aillm-integration)
11. [Data Storage](#data-storage)
12. [Initial Setup](#initial-setup)
13. [Running the Demo](#running-the-demo)
14. [Best Practices](#best-practices)
15. [Support](#support)
16. [License](#license)

## Introduction

Dive into AbxrLibForWebXR, where integrating XR analytics into your web applications becomes a breeze. From real-time event tracking to AI model interactions, this library enhances the capabilities of web-based XR platforms, ensuring a rich and interactive user experience.

## Installation

Get started with AbxrLibForWebXR by installing the package via npm:

```bash
npm install abxrlibforwebxr
```

## Quick Start

Jump right into using AbxrLibForWebXR with this simple setup:

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

  // Track a user action
  await Abxr.Event('user_action', 'action=click,target=button');

  // Log user progress
  await Abxr.LogInfo('User completed onboarding');

  // Send performance metrics
  await Abxr.Telemetry('performance_metrics', { fps: 60, latency: 20 });
}

main();
```

## Initial Setup

To get started with AbxrLibForWebXR, you'll need to configure your application with the necessary authentication details.

1. On the top menu, choose `AbxrLibForWebXR > Configuration`.
2. Enter the Application ID, Organization ID, and Authorization Secret. These can be retrieved from the [AbxrLibForWebXR Web Application](https://arborxr.com/) which requires a **free account** to continue.
     * Organization ID and Authorization Secret: Available under `Settings > Organization Codes`.
     * Application ID: Available in the Web Dashboard under your application settings. Please use the 'Get Started' tutorial button on the Home page and then choose the 'Content Developer' path for step-by-step instructions.
     * Follow the visual guides below for clarity.

### Organization ID and Authorization Secret Location - Web App
Follow the visual instructions below for clarification on how to get to the Organization ID and Authorization Secret in Settings.
![Visual Tutorial to get to Settings](https://github.com/arborxr/abxrlib-for-webxr/blob/main/READMEFiles/GotoSettings.png?raw=true "Go to Settings")
![Visual Tutorial to get to Organization Codes](https://github.com/arborxr/abxrlib-for-webxr/blob/main/READMEFiles/goToOrganizationCodes.png?raw=true "Go to Organization Codes")

### Application ID Location - Web App
Simply use the provided tutorials with the 'Get Started Button' shown below, and choose the 'Content Developer' path.
![Visual Tutorial to get App ID](https://github.com/arborxr/abxrlib-for-webxr/blob/main/READMEFiles/PubAppTour1.png?raw=true "Press Get Started")

## Features

### Event Tracking
Capture user interactions and system events with ease. Here are some examples of how you can track various events:

```typescript
// Basic event tracking
await Abxr.Event('button_click', 'action=submit,page=checkout');

// Track level start
await Abxr.EventLevelStart('level_1', { difficulty: 'easy' });

// Track level completion
await Abxr.EventLevelComplete('level_1', 100, { time_taken: '120s' });

// Track assessment start
await Abxr.EventAssessmentStart('math_quiz', { topic: 'algebra' });

// Track assessment completion
await Abxr.EventAssessmentComplete('math_quiz', 85, ResultOptions.Pass, { questions_answered: '20' });

// Track objective start
await Abxr.EventObjectiveStart('collect_coins', { total_coins: '50' });

// Track objective completion
await Abxr.EventObjectiveComplete('collect_coins', 45, ResultOptions.Complete, { coins_collected: '45' });

// Track interaction start
await Abxr.EventInteractionStart('npc_dialogue', { npc_name: 'Guide' });

// Track interaction completion
await Abxr.EventInteractionComplete('npc_dialogue', 'Friendly', 'Player chose to help NPC', InteractionType.Select, { dialogue_path: 'friendly' });
```

### Logging
Keep tabs on what happens in your application by logging information, warnings, and errors:

```typescript
await Abxr.LogInfo('User logged in successfully');
await Abxr.LogWarning('Low storage space detected');
await Abxr.LogError('Failed to process payment');
```

### Telemetry
Gather and send performance metrics to analyze and optimize application performance:

```typescript
await Abxr.Telemetry('performance_metrics', { fps: 60, memory_usage: 512 });
```

### AI/LLM Integration
Interact with AI language models to enhance user interaction and system intelligence:

```typescript
const response = await Abxr.AIProxy('Translate "Hello" to French', 'gpt-3.5-turbo');
```

### Data Storage
Effortlessly store and retrieve data on the fly, supporting complex data management needs:

```typescript
await Abxr.StoreData('user_progress', { level: 5, score: 1000 }, 'keepLatest');
const data = await Abxr.GetData({ name: 'user_progress' });
```

## API Reference

For a detailed list of all available methods and their parameters, please refer to the API section in the documentation.

## Authentication

AbxrLibForWebXR simplifies the authentication process by automatically extracting the necessary data from URL parameters. To use this feature, simply include the authentication parameters in the URL when launching your application:

```
http://yourdomain.com/?xrdm_orgid=YOUR_ORG_ID&xrdm_authsecret=YOUR_AUTH_SECRET
```

Replace `YOUR_ORG_ID`, `YOUR_AUTH_SECRET`, and `YOUR_APP_ID` with your actual credentials.

The library will automatically detect and use these parameters to initialize the Abxr instance, making it convenient for scenarios where the application is launched from a web link with pre-provided credentials.

When initializing the Abxr instance in your code, you don't need to manually extract these parameters. Simply call `AbxrInit()` without arguments:

```typescript
import { AbxrInit } from 'abxrlibforwebxr';

async function main() {
  const Abxr = await AbxrInit({
    appId : 'YOUR_APP_ID' 
  });
  // The Abxr instance is now initialized with the credentials from the URL
  // Continue with using Abxr...
}

main();
```

This approach ensures that your application can securely and conveniently initialize user sessions without manual data entry or additional code for parameter extraction.

## Running the Demo

To run the Babylon.js sample included in the `sample-babylon` directory, you have two options:

1. **Using Node.js:**
   Navigate to the `sample-babylon` directory and run:
   ```bash
   npm install
   node server.js
   ```
   This will start the server on `http://localhost:6001`.

2. **Using Docker:**
   In the `sample-babylon` directory, build and run the Docker container:
   ```bash
   docker build -t abxr-sample .
   docker run -p 6001:6001 abxr-sample
   ```

Once the server is running, you can access the demo by navigating to:
```
http://localhost:6001/?xrdm_orgid=YOUR_ORG_ID&xrdm_authsecret=YOUR_AUTH_SECRET
```
Replace `YOUR_ORG_ID` and `YOUR_AUTH_SECRET` with your actual organization ID and authentication secret. 

## Best Practices

- **Early Initialization**: Initialize the Abxr instance as early as possible in your application lifecycle.
- **Meaningful Metadata**: Use meaningful event names and metadata for better analytics and insights.
- **Graceful Error Handling**: Ensure to handle errors gracefully, especially for network-dependent operations.

## Support

Encountered an issue or have a feature request? Please open an issue on our [GitHub repository](https://github.com/your-repo).

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.
