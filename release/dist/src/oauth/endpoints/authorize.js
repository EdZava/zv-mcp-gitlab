"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeHandler = authorizeHandler;
exports.pollHandler = pollHandler;
const config_1 = require("../config");
const session_store_1 = require("../session-store");
const gitlab_device_flow_1 = require("../gitlab-device-flow");
const token_utils_1 = require("../token-utils");
const metadata_1 = require("./metadata");
const config_2 = require("../../config");
const logger_1 = require("../../logger");
const request_logger_1 = require("../../utils/request-logger");
async function authorizeHandler(req, res) {
    const config = (0, config_1.loadOAuthConfig)();
    if (!config) {
        sendError(req, res, 500, 'server_error', 'OAuth not configured');
        return;
    }
    const { client_id, redirect_uri, response_type, state, code_challenge, code_challenge_method } = req.query;
    if (response_type !== 'code') {
        sendError(req, res, 400, 'unsupported_response_type', 'Only "code" response type is supported');
        return;
    }
    if (!client_id) {
        sendError(req, res, 400, 'invalid_request', 'client_id is required');
        return;
    }
    if (!code_challenge) {
        sendError(req, res, 400, 'invalid_request', 'code_challenge is required (PKCE)');
        return;
    }
    if (code_challenge_method !== 'S256') {
        sendError(req, res, 400, 'invalid_request', 'code_challenge_method must be "S256"');
        return;
    }
    if (redirect_uri) {
        await handleAuthorizationCodeFlow(req, res, config, {
            clientId: client_id,
            redirectUri: redirect_uri,
            state: state ?? '',
            codeChallenge: code_challenge,
            codeChallengeMethod: code_challenge_method,
        });
    }
    else {
        await handleDeviceFlow(req, res, config, {
            clientId: client_id,
            state: state ?? '',
            codeChallenge: code_challenge,
            codeChallengeMethod: code_challenge_method,
        });
    }
}
async function handleAuthorizationCodeFlow(req, res, config, params) {
    const baseUrl = (0, metadata_1.getBaseUrl)(req);
    const callbackUri = `${baseUrl}/oauth/callback`;
    const internalState = (0, token_utils_1.generateRandomString)(32);
    session_store_1.sessionStore.storeAuthCodeFlow(internalState, {
        clientId: params.clientId,
        codeChallenge: params.codeChallenge,
        codeChallengeMethod: params.codeChallengeMethod,
        clientState: params.state,
        internalState: internalState,
        clientRedirectUri: params.redirectUri,
        callbackUri: callbackUri,
        expiresAt: Date.now() + 10 * 60 * 1000,
    });
    const gitlabAuthUrl = (0, gitlab_device_flow_1.buildGitLabAuthUrl)(config, callbackUri, internalState);
    (0, logger_1.logInfo)('Authorization Code Flow initiated, redirecting to GitLab', {
        internalState: (0, logger_1.truncateId)(internalState),
        clientRedirectUri: params.redirectUri,
    });
    res.redirect(gitlabAuthUrl);
}
async function handleDeviceFlow(req, res, config, params) {
    try {
        const deviceResponse = await (0, gitlab_device_flow_1.initiateDeviceFlow)(config);
        const flowState = (0, token_utils_1.generateRandomString)(32);
        session_store_1.sessionStore.storeDeviceFlow(flowState, {
            deviceCode: deviceResponse.device_code,
            userCode: deviceResponse.user_code,
            verificationUri: deviceResponse.verification_uri,
            verificationUriComplete: deviceResponse.verification_uri_complete,
            expiresAt: Date.now() + deviceResponse.expires_in * 1000,
            interval: deviceResponse.interval,
            clientId: params.clientId,
            codeChallenge: params.codeChallenge,
            codeChallengeMethod: params.codeChallengeMethod,
            state: params.state,
            redirectUri: undefined,
        });
        (0, logger_1.logInfo)('Device flow initiated for authorization', {
            flowState: (0, logger_1.truncateId)(flowState),
            userCode: deviceResponse.user_code,
        });
        const baseUrl = (0, metadata_1.getBaseUrl)(req);
        const html = getDeviceFlowHTML({
            userCode: deviceResponse.user_code,
            verificationUri: deviceResponse.verification_uri,
            verificationUriComplete: deviceResponse.verification_uri_complete,
            flowState,
            pollUrl: `${baseUrl}/oauth/poll`,
            expiresIn: deviceResponse.expires_in,
        });
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    }
    catch (error) {
        (0, logger_1.logError)('Failed to initiate device flow', { err: error });
        sendError(req, res, 500, 'server_error', 'Failed to initiate authentication');
    }
}
async function pollHandler(req, res) {
    const config = (0, config_1.loadOAuthConfig)();
    if (!config) {
        res.status(500).json({ error: 'server_error' });
        return;
    }
    const { flow_state } = req.query;
    if (!flow_state) {
        res.status(400).json({ status: 'failed', error: 'Missing flow_state' });
        return;
    }
    const flow = session_store_1.sessionStore.getDeviceFlow(flow_state);
    if (!flow) {
        res.status(400).json({ status: 'expired', error: 'Flow not found' });
        return;
    }
    if (Date.now() > flow.expiresAt) {
        session_store_1.sessionStore.deleteDeviceFlow(flow_state);
        res.status(400).json({ status: 'expired', error: 'Device code expired' });
        return;
    }
    try {
        const tokenResponse = await (0, gitlab_device_flow_1.pollDeviceFlowOnce)(flow.deviceCode, config);
        if (tokenResponse) {
            const userInfo = await (0, gitlab_device_flow_1.getGitLabUser)(tokenResponse.access_token);
            const sessionId = (0, token_utils_1.generateSessionId)();
            const now = Date.now();
            const authCode = (0, token_utils_1.generateAuthorizationCode)();
            session_store_1.sessionStore.storeAuthCode({
                code: authCode,
                sessionId,
                clientId: flow.clientId,
                codeChallenge: flow.codeChallenge,
                codeChallengeMethod: flow.codeChallengeMethod,
                redirectUri: flow.redirectUri,
                expiresAt: now + 10 * 60 * 1000,
            });
            session_store_1.sessionStore.createSession({
                id: sessionId,
                mcpAccessToken: '',
                mcpRefreshToken: '',
                mcpTokenExpiry: 0,
                gitlabAccessToken: tokenResponse.access_token,
                gitlabRefreshToken: tokenResponse.refresh_token,
                gitlabTokenExpiry: (0, token_utils_1.calculateTokenExpiry)(tokenResponse.expires_in),
                gitlabUserId: userInfo.id,
                gitlabUsername: userInfo.username,
                gitlabApiUrl: flow.selectedInstance ?? config_2.GITLAB_BASE_URL,
                instanceLabel: flow.selectedInstanceLabel,
                clientId: flow.clientId,
                scopes: ['mcp:tools', 'mcp:resources'],
                createdAt: now,
                updatedAt: now,
            });
            session_store_1.sessionStore.deleteDeviceFlow(flow_state);
            (0, logger_1.logInfo)('Device flow authorization completed', {
                sessionId: (0, logger_1.truncateId)(sessionId),
                userId: userInfo.id,
                username: userInfo.username,
            });
            const response = {
                status: 'complete',
                redirect_uri: flow.redirectUri,
                code: authCode,
                state: flow.state ? flow.state : undefined,
            };
            res.json(response);
        }
        else {
            res.json({ status: 'pending' });
        }
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        if (message.includes('expired') || message.includes('denied') || message.includes('invalid')) {
            session_store_1.sessionStore.deleteDeviceFlow(flow_state);
            res.json({ status: 'failed', error: message });
        }
        else {
            (0, logger_1.logWarn)('Device flow poll error', { err: error });
            res.json({ status: 'pending' });
        }
    }
}
function sendError(req, res, status, error, description) {
    (0, logger_1.logWarn)('OAuth authorize request failed', {
        event: 'oauth_error',
        endpoint: '/authorize',
        ip: (0, request_logger_1.getIpAddress)(req),
        error,
        description,
    });
    const response = {
        error,
        error_description: description,
    };
    res.status(status).json(response);
}
function getDeviceFlowHTML(params) {
    const linkUrl = params.verificationUriComplete ?? params.verificationUri;
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GitLab MCP - Authentication</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f5f5f5;
      min-height: 100vh;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      margin-bottom: 20px;
      font-size: 24px;
    }
    p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    .code-container {
      background: #f8f9fa;
      border: 2px dashed #ddd;
      border-radius: 8px;
      padding: 24px;
      margin: 24px 0;
      text-align: center;
    }
    .code {
      font-size: 36px;
      font-weight: bold;
      letter-spacing: 6px;
      color: #333;
      font-family: 'Courier New', monospace;
    }
    .code-label {
      font-size: 12px;
      color: #888;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .link-button {
      display: inline-block;
      background: #fc6d26;
      color: white;
      padding: 14px 28px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      margin: 16px 0;
      transition: background 0.2s;
    }
    .link-button:hover {
      background: #e24329;
    }
    .status {
      padding: 16px;
      border-radius: 8px;
      margin: 24px 0;
      font-weight: 500;
    }
    .status.pending {
      background: #fff3cd;
      color: #856404;
      border: 1px solid #ffeeba;
    }
    .status.success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    .status.error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    .instructions {
      background: #e8f4fd;
      border-left: 4px solid #0366d6;
      padding: 16px;
      margin: 24px 0;
      border-radius: 0 8px 8px 0;
    }
    .instructions ol {
      margin-left: 20px;
    }
    .instructions li {
      margin: 8px 0;
      color: #444;
    }
    .timer {
      font-size: 14px;
      color: #888;
      margin-top: 16px;
    }
    .gitlab-logo {
      width: 40px;
      height: 40px;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <svg class="gitlab-logo" viewBox="0 0 380 380" xmlns="http://www.w3.org/2000/svg">
      <path d="M190.2 350.2l62.5-192.5H127.7l62.5 192.5z" fill="#e24329"/>
      <path d="M190.2 350.2l-62.5-192.5H38.4l151.8 192.5z" fill="#fc6d26"/>
      <path d="M38.4 157.7L9.1 247.6c-2.7 8.2.1 17.2 6.9 22.5l174.2 126.6L38.4 157.7z" fill="#fca326"/>
      <path d="M38.4 157.7h89.3L91.4 48.5c-3.3-10.2-17.8-10.2-21.1 0L38.4 157.7z" fill="#e24329"/>
      <path d="M190.2 350.2l62.5-192.5h89.3L190.2 350.2z" fill="#fc6d26"/>
      <path d="M342 157.7l29.3 89.9c2.7 8.2-.1 17.2-6.9 22.5L190.2 396.7 342 157.7z" fill="#fca326"/>
      <path d="M342 157.7h-89.3l36.3-109.2c3.3-10.2 17.8-10.2 21.1 0L342 157.7z" fill="#e24329"/>
    </svg>

    <h1>Authenticate with GitLab</h1>

    <p>To complete authentication, visit GitLab and enter the code below:</p>

    <div class="code-container">
      <div class="code-label">Your Code</div>
      <div class="code">${params.userCode}</div>
    </div>

    <div style="text-align: center;">
      <a href="${linkUrl}" target="_blank" rel="noopener" class="link-button">
        Open GitLab Authentication Page
      </a>
    </div>

    <div class="instructions">
      <strong>Instructions:</strong>
      <ol>
        <li>Click the button above to open GitLab</li>
        <li>Sign in to your GitLab account if needed</li>
        <li>Enter the code shown above</li>
        <li>Click "Authorize" to grant access</li>
        <li>Return here - you'll be redirected automatically</li>
      </ol>
    </div>

    <div id="status" class="status pending">
      Waiting for authentication...
    </div>

    <div class="timer" id="timer">
      Code expires in <span id="countdown">${params.expiresIn}</span> seconds
    </div>
  </div>

  <script>
    const pollUrl = '${params.pollUrl}?flow_state=${params.flowState}';
    const pollInterval = 5000; // 5 seconds
    let countdown = ${params.expiresIn};

    // Update countdown timer
    const countdownEl = document.getElementById('countdown');
    const timerInterval = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(timerInterval);
        document.getElementById('status').className = 'status error';
        document.getElementById('status').textContent = 'Code expired. Please refresh to try again.';
        document.getElementById('timer').style.display = 'none';
      } else {
        countdownEl.textContent = countdown;
      }
    }, 1000);

    // Poll for completion
    async function poll() {
      try {
        const response = await fetch(pollUrl);
        const data = await response.json();

        const statusEl = document.getElementById('status');

        if (data.status === 'complete') {
          clearInterval(timerInterval);
          statusEl.className = 'status success';
          statusEl.textContent = 'Authentication successful! Redirecting...';

          // Build redirect URL with authorization code
          if (data.redirect_uri) {
            const redirectUrl = new URL(data.redirect_uri);
            redirectUrl.searchParams.set('code', data.code);
            if (data.state) {
              redirectUrl.searchParams.set('state', data.state);
            }

            // Redirect after a brief delay
            setTimeout(() => {
              window.location.href = redirectUrl.toString();
            }, 1000);
          }
          return;
        }

        if (data.status === 'failed' || data.status === 'expired') {
          clearInterval(timerInterval);
          statusEl.className = 'status error';
          statusEl.textContent = 'Authentication failed: ' + (data.error || 'Unknown error');
          document.getElementById('timer').style.display = 'none';
          return;
        }

        // Still pending, continue polling
        setTimeout(poll, pollInterval);

      } catch (error) {
        console.error('Poll error:', error);
        // Continue polling on transient errors
        setTimeout(poll, pollInterval);
      }
    }

    // Start polling
    setTimeout(poll, pollInterval);
  </script>
</body>
</html>`;
}
//# sourceMappingURL=authorize.js.map