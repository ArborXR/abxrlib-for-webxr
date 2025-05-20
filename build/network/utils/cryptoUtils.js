"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtDecode = exports.SHA256 = exports.sha256 = void 0;
async function sha256(message) {
    if (typeof window !== 'undefined' && window.crypto) {
        // Browser environment.
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return btoa(String.fromCharCode.apply(null, hashArray));
    }
    else if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        // Node.js environment.
        const crypto = require('crypto'); // Type is Crypto.
        return crypto.createHash('sha256').update(message).digest('base64');
    }
    else {
        throw new Error('Unsupported environment for SHA-256 hashing');
    }
}
exports.sha256 = sha256;
async function SHA256(message) {
    if (typeof window !== 'undefined' && window.crypto) {
        // Browser environment.
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Buffer.from(new Uint8Array(hashBuffer));
        return hashArray;
    }
    else if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        // Node.js environment.
        const crypto = require('crypto'); // Type is Crypto.
        return crypto.createHash('sha256').update(message).digest('binary');
    }
    else {
        throw new Error('Unsupported environment for SHA-256 hashing');
    }
}
exports.SHA256 = SHA256;
function jwtDecode(token) {
    if (typeof window !== 'undefined') {
        // Browser environment.
        // You may want to use a library like 'jwt-decode' here.
        // For simplicity, we'll use a basic implementation.
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    }
    else if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        // Node.js environment.
        const jwt = require('jsonwebtoken');
        return jwt.decode(token);
    }
    else {
        throw new Error('Unsupported environment for JWT decoding');
    }
}
exports.jwtDecode = jwtDecode;
//# sourceMappingURL=cryptoUtils.js.map