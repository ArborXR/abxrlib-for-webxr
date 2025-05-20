"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTDecode = void 0;
function JWTDecode(szToken) {
    if (typeof window !== 'undefined') {
        // Browser environment.
        // You may want to use a library like 'jwt-decode' here
        // For simplicity, we'll use a basic implementation
        const base64Url = szToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.stringify(JSON.parse(atob(base64)));
    }
    else if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        // Node.js environment.
        const jwt = require('jsonwebtoken');
        return JSON.stringify(jwt.decode(szToken));
    }
    else {
        throw new Error('Unsupported environment for JWT decoding');
    }
}
exports.JWTDecode = JWTDecode;
//# sourceMappingURL=JWT.js.map