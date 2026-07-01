export interface NamespaceTierInfo {
    tier: 'free' | 'premium' | 'ultimate';
    features: Record<string, boolean>;
    cachedAt: Date;
}
export interface OAuthSession {
    id: string;
    mcpAccessToken: string;
    mcpRefreshToken: string;
    mcpTokenExpiry: number;
    gitlabAccessToken: string;
    gitlabRefreshToken: string;
    gitlabTokenExpiry: number;
    gitlabUserId: number;
    gitlabUsername: string;
    gitlabApiUrl?: string;
    instanceLabel?: string;
    clientId: string;
    scopes: string[];
    createdAt: number;
    updatedAt: number;
}
export interface AuthCodeFlowState {
    clientId: string;
    codeChallenge: string;
    codeChallengeMethod: string;
    clientState: string;
    internalState: string;
    clientRedirectUri: string;
    callbackUri: string;
    expiresAt: number;
    selectedInstance?: string;
    selectedInstanceLabel?: string;
}
export interface DeviceFlowState {
    deviceCode: string;
    userCode: string;
    verificationUri: string;
    verificationUriComplete?: string;
    expiresAt: number;
    interval: number;
    clientId: string;
    codeChallenge: string;
    codeChallengeMethod: string;
    state: string;
    redirectUri?: string;
    selectedInstance?: string;
    selectedInstanceLabel?: string;
}
export interface AuthorizationCode {
    code: string;
    sessionId: string;
    clientId: string;
    codeChallenge: string;
    codeChallengeMethod: string;
    redirectUri?: string;
    expiresAt: number;
}
export interface GitLabTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    created_at: number;
    scope?: string;
}
export interface GitLabDeviceResponse {
    device_code: string;
    user_code: string;
    verification_uri: string;
    verification_uri_complete?: string;
    expires_in: number;
    interval: number;
}
export interface TokenContext {
    gitlabToken: string;
    gitlabUserId: number;
    gitlabUsername: string;
    sessionId: string;
    apiUrl: string;
    instanceLabel?: string;
}
export interface GitLabUserInfo {
    id: number;
    username: string;
    name?: string;
    email?: string;
}
export interface MCPTokenResponse {
    access_token: string;
    token_type: 'Bearer';
    expires_in: number;
    refresh_token: string;
    scope: string;
}
export interface OAuthErrorResponse {
    error: string;
    error_description?: string;
}
export type DeviceFlowPollStatus = 'pending' | 'complete' | 'failed' | 'expired';
export interface DeviceFlowPollResponse {
    status: DeviceFlowPollStatus;
    redirect_uri?: string;
    code?: string;
    state?: string;
    error?: string;
}
export interface MCPTokenPayload {
    iss: string;
    sub: string;
    aud: string;
    sid: string;
    scope: string;
    gitlab_user: string;
    iat: number;
    exp: number;
}
