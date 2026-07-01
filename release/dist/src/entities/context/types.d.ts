import { ProfileInfo, Preset, ScopeConfig } from '../../profiles/types';
export interface RuntimeScope {
    type: 'project' | 'group';
    path: string;
    additionalPaths?: string[];
    includeSubgroups: boolean;
    detected: boolean;
}
export interface SessionContext {
    host: string;
    apiUrl: string;
    profileName?: string;
    presetName?: string;
    readOnly: boolean;
    scope?: RuntimeScope;
    oauthMode: boolean;
    initialContext?: Omit<SessionContext, 'initialContext'>;
}
export interface SetScopeResult {
    success: boolean;
    scope: RuntimeScope;
    message: string;
}
export interface SwitchResult {
    success: boolean;
    previous?: string;
    current: string;
    message: string;
}
export interface ResetResult {
    success: boolean;
    message: string;
    context: SessionContext;
}
export interface PresetInfo {
    name: string;
    description?: string;
    readOnly: boolean;
    isBuiltIn: boolean;
    scope?: ScopeConfig;
    features?: Record<string, boolean>;
}
export interface ContextState {
    currentPreset?: Preset;
    currentPresetName?: string;
    currentScope?: ScopeConfig;
    initialState?: ContextState;
}
export type { ProfileInfo };
export type WhoamiTokenType = 'personal_access_token' | 'project_access_token' | 'group_access_token' | 'oauth' | 'unknown';
export interface WhoamiUserInfo {
    id: number;
    username: string;
    name: string;
    email?: string;
    avatarUrl?: string;
    isAdmin?: boolean;
    adminModeActive?: boolean;
    state: 'active' | 'blocked' | 'deactivated';
}
export interface WhoamiTokenInfo {
    type: WhoamiTokenType;
    name: string | null;
    scopes: string[];
    expiresAt: string | null;
    daysUntilExpiry: number | null;
    isValid: boolean;
    hasGraphQLAccess: boolean;
    hasWriteAccess: boolean;
}
export interface WhoamiServerInfo {
    host: string;
    apiUrl: string;
    version: string;
    tier: 'free' | 'premium' | 'ultimate' | 'unknown';
    edition: 'EE' | 'CE' | 'unknown';
    readOnlyMode: boolean;
    oauthEnabled: boolean;
}
export interface WhoamiCapabilities {
    canBrowse: boolean;
    canManage: boolean;
    canAccessGraphQL: boolean;
    availableToolCount: number;
    totalToolCount: number;
    filteredByScopes: number;
    filteredByReadOnly: number;
    filteredByTier: number;
    filteredByDeniedRegex: number;
    filteredByActionDenial: number;
    filteredByAdmin: number;
}
export type WhoamiRecommendationAction = 'create_new_token' | 'add_scope' | 'enable_oauth' | 'contact_admin' | 'enable_admin_mode' | 'renew_token';
export interface WhoamiRecommendation {
    action: WhoamiRecommendationAction;
    message: string;
    url?: string;
    priority: 'high' | 'medium' | 'low';
}
export interface WhoamiContextInfo {
    activePreset: string | null;
    activeProfile: string | null;
    scope: RuntimeScope | null;
}
export interface WhoamiResult {
    user: WhoamiUserInfo | null;
    token: WhoamiTokenInfo | null;
    server: WhoamiServerInfo;
    capabilities: WhoamiCapabilities;
    context: WhoamiContextInfo;
    warnings: string[];
    recommendations: WhoamiRecommendation[];
    scopesRefreshed: boolean;
}
