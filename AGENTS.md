# AI instructions – abxrlib-for-webxr

Team-wide instructions are duplicated in sibling ArborXR repos (abxrlib-for-unity, abxrlib-for-unreal); keep shared guidelines in sync when updating.

---

## This repo: ABXRLib SDK for WebXR

JavaScript/TypeScript library for analytics and data collection in WebXR applications. **Standalone only:** it does **not** integrate with ArborInsightsClient (Android-only; WebXR has no need to support it). It talks to ArborXR Insights (or other backends) over the network from the browser.

### Project setup

- **Structure:** `src/` (AbxrLib*.ts, components/, network/, templates/, test/), `testers/` (HTML test pages), npm package with build (webpack), TypeScript.
- **Installation (for app developers):** `npm install abxrlib-for-webxr` or CDN or manual (see README).
- **Key areas:** `AbxrLibClient.ts`, `AbxrLibAnalytics.ts`, `AbxrLibStorage.ts`, auth/network utilities, `components/XRAuthDialog.tsx`.

### How it relates to other projects

- **No ArborInsightsClient:** This SDK runs in the browser and does not use the Android ArborInsightsClient APK or AIDL. Do not add or assume device-service integration.
- **ArborXR Insights:** Can send data to the same cloud/Insights backend as the Unity/Unreal SDKs; protocol and backend alignment matter, not the device service.
- **abxrlib-for-unity / abxrlib-for-unreal:** Same product family and analytics model, but different runtimes; no shared code with the Android service stack.

When editing this repo, treat it as a standalone Web SDK: no references to ArborInsightsClient, AIDL, or Android service deployment.

### Auth and endpoints

- **Init:** Default path uses **app tokens**: `Abxr_init({ appToken, orgToken? })`. Legacy path: `Abxr_init({ appId, orgId?, authSecret? })` or deprecated positional args. orgToken can come from `abxr_org_token` URL param.
- **Data:** Events, logs, and telemetry are batched and sent to the unified **`/v1/collect/data`** endpoint. Storage and other non-batched types use their per-type endpoints.
- **AuthMechanism:** Callback receives normalized type (`"text"` | `"pin"` | `"email"`). Backend may send `assessmentPin` or `assessment_pin`; both normalize to `"pin"`.
- **PIN Auto-Submit:** When orgToken JWT contains a `pin` claim, the SDK auto-submits it on the first assessmentPin auth attempt.

### Troubleshooting

- **CORS errors:** Ensure the backend allows the origin of your WebXR app; configure CORS on the Insights (or custom) backend as needed.
- **Wrong backend URL or auth failures:** Check base URL and auth credentials in config; inspect network tab and console for 4xx/5xx or empty app_id/org_id/auth_secret (legacy) or invalid appToken/orgToken (token path).
- **Init or session failures:** Verify the client is initialized with valid config before calling auth or analytics; check for missing or invalid API keys / secrets. For app-token path, ensure appToken is JWT format (three dot-separated segments).

### Maintaining this file

Update this file when you make changes that affect the documented architecture, key files, integration with other repos, or troubleshooting. Keep the outline and details in sync with the code.
