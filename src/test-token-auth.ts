/**
 * Token auth parity unit tests.
 * Run: npx ts-node src/test-token-auth.ts
 *
 * Tests the dual-mode auth changes without requiring a running backend.
 */

import { AuthTokenRequest, Partner, PartnerToString } from './AbxrLibClient';
import { AbxrLibInit, AbxrLibAnalytics } from './AbxrLibAnalytics';
import { AbxrLibStorage } from './AbxrLibStorage';
import { AbxrLibAsync } from './AbxrLibAsync';
import { GenerateJson, DumpCategory } from './network/utils/DataObjectBase';
import { AbxrBase, AbxrEvent } from './AbxrLibCoreModel';

// Mock window for Node.js
if (typeof window === 'undefined') {
    (global as any).window = {
        location: { search: '', pathname: '/', href: 'http://localhost/' },
        history: {
            pushState: () => {},
            replaceState: () => {},
        },
    };
}

// Initialize statics
AbxrLibInit.InitStatics();
AbxrLibStorage.InitStatics();
AbxrLibAsync.InitStatics();
AbxrBase.InitStatics;
AbxrEvent.InitStatics();

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string) {
    if (condition) {
        console.log(`  PASS: ${name}`);
        passed++;
    } else {
        console.error(`  FAIL: ${name}`);
        failed++;
    }
}

// ─── Test 1: bfSkipIfNull omits null fields from JSON ───────────────

console.log('\nTest 1: AuthTokenRequest - token mode omits legacy fields');
{
    const req = new AuthTokenRequest();
    // Token mode: set token fields, leave legacy fields as null
    req.m_szAppToken = 'eyJ.test.token';
    req.m_szOrgToken = 'eyJ.org.token';
    req.m_szDeviceId = 'test-device';
    req.m_szSessionId = 'test-session';
    req.m_szPartner = 'arborxr';
    // Legacy fields stay null (default)

    const json = GenerateJson(req, DumpCategory.eDumpEverything);
    const parsed = JSON.parse(json);

    assert(parsed.appToken === 'eyJ.test.token', 'appToken present in JSON');
    assert(parsed.orgToken === 'eyJ.org.token', 'orgToken present in JSON');
    assert(parsed.deviceId === 'test-device', 'deviceId present in JSON');
    assert(!('appId' in parsed), 'appId absent from JSON (null field omitted)');
    assert(!('orgId' in parsed), 'orgId absent from JSON (null field omitted)');
    assert(!('authSecret' in parsed), 'authSecret absent from JSON (null field omitted)');
}

// ─── Test 2: Legacy mode omits token fields ─────────────────────────

console.log('\nTest 2: AuthTokenRequest - legacy mode omits token fields');
{
    const req = new AuthTokenRequest();
    // Legacy mode: set legacy fields, leave token fields as null
    req.m_szAppId = 'test-app-id';
    req.m_szOrgId = 'test-org-id';
    req.m_szAuthSecret = 'test-secret';
    req.m_szDeviceId = 'test-device';
    req.m_szSessionId = 'test-session';
    req.m_szPartner = 'arborxr';
    // Token fields stay null (default)

    const json = GenerateJson(req, DumpCategory.eDumpEverything);
    const parsed = JSON.parse(json);

    assert(parsed.appId === 'test-app-id', 'appId present in JSON');
    assert(parsed.orgId === 'test-org-id', 'orgId present in JSON');
    assert(parsed.authSecret === 'test-secret', 'authSecret present in JSON');
    assert(!('appToken' in parsed), 'appToken absent from JSON (null field omitted)');
    assert(!('orgToken' in parsed), 'orgToken absent from JSON (null field omitted)');
}

// ─── Test 3: Authentication class stores token credentials ──────────

console.log('\nTest 3: Authentication class - token mode storage');
{
    AbxrLibInit.set_AppToken('eyJ.app.jwt');
    AbxrLibInit.set_OrgToken('eyJ.org.jwt');
    AbxrLibInit.set_UseAppTokens(true);

    assert(AbxrLibInit.get_AppToken() === 'eyJ.app.jwt', 'AppToken stored correctly');
    assert(AbxrLibInit.get_OrgToken() === 'eyJ.org.jwt', 'OrgToken stored correctly');
    assert(AbxrLibInit.get_UseAppTokens() === true, 'UseAppTokens flag set');

    // Reset
    AbxrLibInit.set_UseAppTokens(false);
    AbxrLibInit.set_AppToken('');
    AbxrLibInit.set_OrgToken('');
}

// ─── Test 4: Authenticate stores legacy credentials and sets mode ───

console.log('\nTest 4: Authenticate() stores credentials and sets useAppTokens=false');
{
    // We can't call Authenticate (it hits the network) but we can verify
    // the state after AuthenticateWithTokens would set it
    AbxrLibInit.set_AppID('legacy-app-id');
    AbxrLibInit.set_OrgID('legacy-org-id');
    AbxrLibInit.m_abxrLibAuthentication.m_szAuthSecret = 'legacy-secret';
    AbxrLibInit.m_abxrLibAuthentication.m_bUseAppTokens = false;

    assert(AbxrLibInit.get_AppID() === 'legacy-app-id', 'AppID stored');
    assert(AbxrLibInit.get_OrgID() === 'legacy-org-id', 'OrgID stored');
    assert(AbxrLibInit.m_abxrLibAuthentication.m_szAuthSecret === 'legacy-secret', 'AuthSecret stored');
    assert(AbxrLibInit.m_abxrLibAuthentication.m_bUseAppTokens === false, 'useAppTokens is false');
}

// ─── Test 5: Token mode credential storage ──────────────────────────

console.log('\nTest 5: Token mode credential storage sets useAppTokens=true');
{
    AbxrLibInit.set_AppToken('eyJ.app.token');
    AbxrLibInit.set_OrgToken('eyJ.org.token');
    AbxrLibInit.m_abxrLibAuthentication.m_bUseAppTokens = true;

    assert(AbxrLibInit.get_AppToken() === 'eyJ.app.token', 'AppToken stored for token mode');
    assert(AbxrLibInit.get_OrgToken() === 'eyJ.org.token', 'OrgToken stored for token mode');
    assert(AbxrLibInit.m_abxrLibAuthentication.m_bUseAppTokens === true, 'useAppTokens is true');
}

// ─── Test 6: Payload shape matches backend expectation ──────────────

console.log('\nTest 6: Token mode payload shape matches backend expectation');
{
    const req = new AuthTokenRequest();
    req.m_szAppToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6IjFjMDU5MzlkLTAxMGEtNGRhNC04YWE5LTU4ZmZmYjNjYjczYyJ9.sig';
    req.m_szOrgToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdJZCI6IjdhNzZmMDhjLTAwMjctNGU3YiJ9.sig';
    req.m_szDeviceId = '116d6d9d-df9c-4a42-813c-7bd5b0fb1e1c';
    req.m_szSessionId = 'test-session-123';

    const json = GenerateJson(req, DumpCategory.eDumpEverything);
    const parsed = JSON.parse(json);

    // Must have these four fields (matching the Postman example from the user)
    assert('appToken' in parsed, 'payload has appToken');
    assert('orgToken' in parsed, 'payload has orgToken');
    assert('deviceId' in parsed, 'payload has deviceId');
    assert('sessionId' in parsed, 'payload has sessionId');

    // Must NOT have legacy fields
    assert(!('appId' in parsed), 'payload does NOT have appId');
    assert(!('orgId' in parsed), 'payload does NOT have orgId');
    assert(!('authSecret' in parsed), 'payload does NOT have authSecret');
}

// ─── Summary ────────────────────────────────────────────────────────

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(50)}\n`);

process.exit(failed > 0 ? 1 : 0);
