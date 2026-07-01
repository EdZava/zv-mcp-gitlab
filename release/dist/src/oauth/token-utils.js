"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJWT = createJWT;
exports.verifyJWT = verifyJWT;
exports.verifyMCPToken = verifyMCPToken;
exports.generateCodeVerifier = generateCodeVerifier;
exports.generateCodeChallenge = generateCodeChallenge;
exports.verifyCodeChallenge = verifyCodeChallenge;
exports.generateRandomString = generateRandomString;
exports.generateUUID = generateUUID;
exports.generateAuthorizationCode = generateAuthorizationCode;
exports.generateSessionId = generateSessionId;
exports.generateRefreshToken = generateRefreshToken;
exports.isTokenExpiringSoon = isTokenExpiringSoon;
exports.calculateTokenExpiry = calculateTokenExpiry;
const crypto = __importStar(require("crypto"));
function createJWT(payload, secret, expiresIn) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = {
        ...payload,
        iat: now,
        exp: now + expiresIn,
    };
    const headerB64 = base64UrlEncode(JSON.stringify(header));
    const payloadB64 = base64UrlEncode(JSON.stringify(fullPayload));
    const signature = crypto
        .createHmac('sha256', secret)
        .update(`${headerB64}.${payloadB64}`)
        .digest('base64url');
    return `${headerB64}.${payloadB64}.${signature}`;
}
function verifyJWT(token, secret) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        const [headerB64, payloadB64, signature] = parts;
        const expectedSig = crypto
            .createHmac('sha256', secret)
            .update(`${headerB64}.${payloadB64}`)
            .digest('base64url');
        if (signature !== expectedSig) {
            return null;
        }
        const payload = JSON.parse(base64UrlDecode(payloadB64));
        const exp = payload.exp;
        if (exp && exp < Math.floor(Date.now() / 1000)) {
            return null;
        }
        return payload;
    }
    catch {
        return null;
    }
}
function verifyMCPToken(token, secret) {
    const payload = verifyJWT(token, secret);
    if (!payload) {
        return null;
    }
    if (typeof payload.iss !== 'string' ||
        typeof payload.sub !== 'string' ||
        typeof payload.aud !== 'string' ||
        typeof payload.sid !== 'string' ||
        typeof payload.scope !== 'string' ||
        typeof payload.gitlab_user !== 'string' ||
        typeof payload.iat !== 'number' ||
        typeof payload.exp !== 'number') {
        return null;
    }
    return payload;
}
function generateCodeVerifier() {
    return crypto.randomBytes(32).toString('base64url');
}
function generateCodeChallenge(verifier) {
    return crypto.createHash('sha256').update(verifier).digest('base64url');
}
function verifyCodeChallenge(verifier, challenge, method) {
    if (method !== 'S256') {
        return false;
    }
    return generateCodeChallenge(verifier) === challenge;
}
function generateRandomString(length = 32) {
    const byteLength = Math.ceil((length * 3) / 4);
    return crypto.randomBytes(byteLength).toString('base64url').slice(0, length);
}
function generateUUID() {
    return crypto.randomUUID();
}
function generateAuthorizationCode() {
    return generateRandomString(32);
}
function generateSessionId() {
    return generateUUID();
}
function generateRefreshToken() {
    return generateRandomString(64);
}
function base64UrlEncode(str) {
    return Buffer.from(str, 'utf-8').toString('base64url');
}
function base64UrlDecode(str) {
    return Buffer.from(str, 'base64url').toString('utf-8');
}
function isTokenExpiringSoon(expiryMs, bufferMs = 5 * 60 * 1000) {
    return Date.now() + bufferMs >= expiryMs;
}
function calculateTokenExpiry(expiresIn) {
    return Date.now() + expiresIn * 1000;
}
//# sourceMappingURL=token-utils.js.map