# AbxrLib for WebXR

A JavaScript library for WebXR applications, providing tools for XR development, analytics, and client management.

## Installation

```bash
npm install abxrlib-for-webxr
```

## Usage

### TypeScript/ES6 Modules

```typescript
import { AbxrLibClient } from 'abxrlib-for-webxr';

// Initialize the client
const client = new AbxrLibClient({
  // your configuration options
});

// Use the client
client.connect();
```

### Browser (Direct)

```html
<script src="node_modules/abxrlib-for-webxr/index.js"></script>
<script>
  // AbxrLib is available globally
  const client = new AbxrLib.AbxrLibClient({
    // your configuration options
  });
</script>
```

### CDN

```html
<script src="https://unpkg.com/abxrlib-for-webxr@latest/index.js"></script>
```

## Main Components

- **AbxrLibClient**: Main client for WebXR applications
- **AbxrLibAnalytics**: Analytics and tracking functionality
- **AbxrLibCoreModel**: Core data models and utilities
- **AbxrLibStorage**: Storage and persistence utilities
- **AbxrLibSend**: Communication and data transmission

## Examples

### Basic Client Setup

```typescript
import { AbxrLibClient } from 'abxrlib-for-webxr';

const client = new AbxrLibClient({
  organizationId: 'your-org-id',
  authorizationSecret: 'your-auth-secret',
  applicationId: 'your-app-id'
});

// Connect to the service
await client.connect();

// Start XR session
await client.startXRSession();
```

### Analytics Integration

```typescript
import { AbxrLibAnalytics } from 'abxrlib-for-webxr';

const analytics = new AbxrLibAnalytics({
  // analytics configuration
});

// Track events
analytics.trackEvent('user_action', {
  action: 'button_click',
  timestamp: Date.now()
});
```

## API Documentation

For detailed API documentation, please visit our [documentation site](https://docs.arborxr.com).

## Support

- **Documentation**: [https://docs.arborxr.com](https://docs.arborxr.com)
- **Issues**: [GitHub Issues](https://github.com/arborxr/abxrlib-for-webxr/issues)
- **Email**: devs@arborxr.com

## License

ISC License - see LICENSE file for details.

## Version

Current version: 1.0.0

---

Made with ❤️ by [ArborXR](https://arborxr.com) 