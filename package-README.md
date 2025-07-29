# AbxrLib for WebXR

A JavaScript library for WebXR applications, providing tools for XR development, analytics, and client management.

## Installation

```bash
npm install abxrlib-for-webxr
```

## Usage

### TypeScript/ES6 Modules

```typescript
import { Abxr } from 'abxrlib-for-webxr';

// Initialize the library
Abxr.Start();

// Authenticate with your credentials
const authResult = await Abxr.Authenticate(
  'your-app-id',
  'your-org-id', 
  'your-device-id',
  'your-auth-secret'
);

if (authResult === 0) { // AbxrResult.eOk
  // Send events
  await Abxr.Event('user_action');
  
  // Send logs
  await Abxr.LogDebug('User completed tutorial');
  
  // Store data
  await Abxr.SetStorageEntry('user_progress', '75%');
}
```

### Browser (UMD)

```html
<script src="node_modules/abxrlib-for-webxr/index.js"></script>
<script>
  // Set up global scope (optional - only needed for browser usage)
  AbxrLib.Abxr.init();
  
  // Initialize the library
  AbxrLib.Abxr.Start();
  
  // Authenticate
  AbxrLib.Abxr.Authenticate('app-id', 'org-id', 'device-id', 'auth-secret')
    .then(result => {
      if (result === 0) {
        // Send events
        AbxrLib.Abxr.Event('button_click');
        AbxrLib.Abxr.LogDebug('User action completed');
      }
    });
</script>
```

### Alternative Browser Setup (Manual)

If you prefer to set up the global scope manually:

```html
<script src="node_modules/abxrlib-for-webxr/index.js"></script>
<script>
  // Manual setup (equivalent to AbxrLib.Abxr.init())
  Abxr = AbxrLib.Abxr;
  AbxrLibInit = AbxrLib.AbxrLibInit;
  AbxrLibSend = AbxrLib.AbxrLibSend;
  AbxrDictStrings = AbxrLib.AbxrDictStrings;
  
  // Initialize and use
  Abxr.Start();
  Abxr.Authenticate('app-id', 'org-id', 'device-id', 'auth-secret')
    .then(result => {
      if (result === 0) {
        Abxr.Event('button_click');
      }
    });
</script>
```

### Analytics Integration

```typescript
import { Abxr } from 'abxrlib-for-webxr';

// Track events
await Abxr.Event('button_click');

// Send logs
await Abxr.LogDebug('User completed tutorial');
```

### Storage API

```typescript
import { Abxr } from 'abxrlib-for-webxr';

// Store data
await Abxr.SetStorageEntry('user_progress', '75%');

// Retrieve data
const entry = await Abxr.GetStorageEntry('user_progress');
```

### Telemetry

```typescript
import { Abxr } from 'abxrlib-for-webxr';

// Send telemetry data
const data = new Abxr.DictStrings();
data.set('x', '1.23');
data.set('y', '4.56');
data.set('z', '7.89');
await Abxr.Telemetry('headset_position', data);
```

### AI Integration

```typescript
import { Abxr } from 'abxrlib-for-webxr';

// Send AI proxy request
const response = await Abxr.AIProxy(
  'Provide a greeting message',
  '', // past messages
  'default' // bot id
);
```

## API Reference

### Core Methods

- `Abxr.Start()` - Initialize the library
- `Abxr.Authenticate(appId, orgId, deviceId, authSecret)` - Authenticate with the service
- `Abxr.Event(name, meta?)` - Send an event
- `Abxr.LogDebug(message)` - Send a debug log
- `Abxr.LogInfo(message)` - Send an info log
- `Abxr.LogWarn(message)` - Send a warning log
- `Abxr.LogError(message)` - Send an error log
- `Abxr.LogCritical(message)` - Send a critical log

### Storage Methods

- `Abxr.SetStorageEntry(data, keepLatest?, origin?, sessionData?, name?)` - Store data
- `Abxr.GetStorageEntry(name?)` - Retrieve stored data
- `Abxr.RemoveStorageEntry(name?)` - Remove stored data

### Telemetry Methods

- `Abxr.Telemetry(name, data)` - Send telemetry data

### AI Methods

- `Abxr.AIProxy(prompt, pastMessages?, botId?)` - Send AI proxy request

## Configuration

You can customize the library behavior by setting a custom configuration:

```typescript
import { Abxr } from 'abxrlib-for-webxr';

const customConfig = `
<?xml version="1.0" encoding="utf-8" ?>
<configuration>
  <appSettings>
    <add key="REST_URL" value="https://your-backend.com/v1/"/>
    <add key="SendRetriesOnFailure" value="3"/>
    <add key="EventsPerSendAttempt" value="10"/>
  </appSettings>
</configuration>
`;

Abxr.SetAppConfig(customConfig);
```

## License

MIT License - see LICENSE file for details. 