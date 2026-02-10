# AI instructions – abxrlib-for-webxr

Team-wide instructions are duplicated in sibling ArborXR repos (abxrlib-for-unity, abxrlib-for-unreal); keep shared guidelines in sync when updating.

---

## This repo: ABXRLib SDK for WebXR

JavaScript/TypeScript library for analytics and data collection in WebXR applications. **Standalone only:** it does **not** integrate with ArborInsightService (the Android device service). It talks to ArborXR Insights (or other backends) over the network from the browser.

### Project setup

- **Structure:** `src/` (AbxrLib*.ts, components/, network/, templates/, test/), `testers/` (HTML test pages), npm package with build (webpack), TypeScript.
- **Installation (for app developers):** `npm install abxrlib-for-webxr` or CDN or manual (see README).
- **Key areas:** `AbxrLibClient.ts`, `AbxrLibAnalytics.ts`, `AbxrLibStorage.ts`, auth/network utilities, `components/XRAuthDialog.tsx`.

### How it relates to other projects

- **No ArborInsightService:** This SDK runs in the browser and does not use the Android ArborInsightService APK or AIDL. Do not add or assume device-service integration.
- **ArborXR Insights:** Can send data to the same cloud/Insights backend as the Unity/Unreal SDKs; protocol and backend alignment matter, not the device service.
- **abxrlib-for-unity / abxrlib-for-unreal:** Same product family and analytics model, but different runtimes; no shared code with the Android service stack.

When editing this repo, treat it as a standalone Web SDK: no references to ArborInsightService, AIDL, or Android service deployment.
