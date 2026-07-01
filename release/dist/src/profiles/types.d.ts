import { z } from 'zod';
declare const PatAuthSchema: z.ZodObject<{
    type: z.ZodLiteral<"pat">;
    token_env: z.ZodString;
}, z.core.$strip>;
declare const OAuthAuthSchema: z.ZodObject<{
    type: z.ZodLiteral<"oauth">;
    client_id_env: z.ZodString;
    client_secret_env: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const CookieAuthSchema: z.ZodObject<{
    type: z.ZodLiteral<"cookie">;
    cookie_path: z.ZodString;
}, z.core.$strip>;
declare const AuthConfigSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"pat">;
    token_env: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"oauth">;
    client_id_env: z.ZodString;
    client_secret_env: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"cookie">;
    cookie_path: z.ZodString;
}, z.core.$strip>], "type">;
declare const FeatureFlagsSchema: z.ZodOptional<z.ZodObject<{
    wiki: z.ZodOptional<z.ZodBoolean>;
    milestones: z.ZodOptional<z.ZodBoolean>;
    pipelines: z.ZodOptional<z.ZodBoolean>;
    labels: z.ZodOptional<z.ZodBoolean>;
    mrs: z.ZodOptional<z.ZodBoolean>;
    files: z.ZodOptional<z.ZodBoolean>;
    variables: z.ZodOptional<z.ZodBoolean>;
    workitems: z.ZodOptional<z.ZodBoolean>;
    webhooks: z.ZodOptional<z.ZodBoolean>;
    snippets: z.ZodOptional<z.ZodBoolean>;
    integrations: z.ZodOptional<z.ZodBoolean>;
    releases: z.ZodOptional<z.ZodBoolean>;
    refs: z.ZodOptional<z.ZodBoolean>;
    members: z.ZodOptional<z.ZodBoolean>;
    search: z.ZodOptional<z.ZodBoolean>;
    ci_tokens: z.ZodOptional<z.ZodBoolean>;
    environments: z.ZodOptional<z.ZodBoolean>;
    runners: z.ZodOptional<z.ZodBoolean>;
    registry: z.ZodOptional<z.ZodBoolean>;
    access_tokens: z.ZodOptional<z.ZodBoolean>;
    audit_events: z.ZodOptional<z.ZodBoolean>;
    vulnerabilities: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>>;
export declare const ProfileSchema: z.ZodObject<{
    host: z.ZodString;
    api_url: z.ZodOptional<z.ZodString>;
    auth: z.ZodDiscriminatedUnion<[z.ZodObject<{
        type: z.ZodLiteral<"pat">;
        token_env: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"oauth">;
        client_id_env: z.ZodString;
        client_secret_env: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"cookie">;
        cookie_path: z.ZodString;
    }, z.core.$strip>], "type">;
    read_only: z.ZodOptional<z.ZodBoolean>;
    allowed_projects: z.ZodOptional<z.ZodArray<z.ZodString>>;
    allowed_groups: z.ZodOptional<z.ZodArray<z.ZodString>>;
    denied_tools_regex: z.ZodOptional<z.ZodString>;
    allowed_tools: z.ZodOptional<z.ZodArray<z.ZodString>>;
    denied_actions: z.ZodOptional<z.ZodArray<z.ZodString>>;
    features: z.ZodOptional<z.ZodObject<{
        wiki: z.ZodOptional<z.ZodBoolean>;
        milestones: z.ZodOptional<z.ZodBoolean>;
        pipelines: z.ZodOptional<z.ZodBoolean>;
        labels: z.ZodOptional<z.ZodBoolean>;
        mrs: z.ZodOptional<z.ZodBoolean>;
        files: z.ZodOptional<z.ZodBoolean>;
        variables: z.ZodOptional<z.ZodBoolean>;
        workitems: z.ZodOptional<z.ZodBoolean>;
        webhooks: z.ZodOptional<z.ZodBoolean>;
        snippets: z.ZodOptional<z.ZodBoolean>;
        integrations: z.ZodOptional<z.ZodBoolean>;
        releases: z.ZodOptional<z.ZodBoolean>;
        refs: z.ZodOptional<z.ZodBoolean>;
        members: z.ZodOptional<z.ZodBoolean>;
        search: z.ZodOptional<z.ZodBoolean>;
        ci_tokens: z.ZodOptional<z.ZodBoolean>;
        environments: z.ZodOptional<z.ZodBoolean>;
        runners: z.ZodOptional<z.ZodBoolean>;
        registry: z.ZodOptional<z.ZodBoolean>;
        access_tokens: z.ZodOptional<z.ZodBoolean>;
        audit_events: z.ZodOptional<z.ZodBoolean>;
        vulnerabilities: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    timeout_ms: z.ZodOptional<z.ZodNumber>;
    default_project: z.ZodOptional<z.ZodString>;
    default_namespace: z.ZodOptional<z.ZodString>;
    skip_tls_verify: z.ZodOptional<z.ZodBoolean>;
    ssl_cert_path: z.ZodOptional<z.ZodString>;
    ssl_key_path: z.ZodOptional<z.ZodString>;
    ca_cert_path: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ScopeConfigSchema: z.ZodObject<{
    project: z.ZodOptional<z.ZodString>;
    group: z.ZodOptional<z.ZodString>;
    namespace: z.ZodOptional<z.ZodString>;
    projects: z.ZodOptional<z.ZodArray<z.ZodString>>;
    groups: z.ZodOptional<z.ZodArray<z.ZodString>>;
    includeSubgroups: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const PresetSchema: z.ZodObject<{
    description: z.ZodOptional<z.ZodString>;
    read_only: z.ZodOptional<z.ZodBoolean>;
    denied_tools_regex: z.ZodOptional<z.ZodString>;
    allowed_tools: z.ZodOptional<z.ZodArray<z.ZodString>>;
    denied_actions: z.ZodOptional<z.ZodArray<z.ZodString>>;
    scope: z.ZodOptional<z.ZodObject<{
        project: z.ZodOptional<z.ZodString>;
        group: z.ZodOptional<z.ZodString>;
        namespace: z.ZodOptional<z.ZodString>;
        projects: z.ZodOptional<z.ZodArray<z.ZodString>>;
        groups: z.ZodOptional<z.ZodArray<z.ZodString>>;
        includeSubgroups: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    features: z.ZodOptional<z.ZodObject<{
        wiki: z.ZodOptional<z.ZodBoolean>;
        milestones: z.ZodOptional<z.ZodBoolean>;
        pipelines: z.ZodOptional<z.ZodBoolean>;
        labels: z.ZodOptional<z.ZodBoolean>;
        mrs: z.ZodOptional<z.ZodBoolean>;
        files: z.ZodOptional<z.ZodBoolean>;
        variables: z.ZodOptional<z.ZodBoolean>;
        workitems: z.ZodOptional<z.ZodBoolean>;
        webhooks: z.ZodOptional<z.ZodBoolean>;
        snippets: z.ZodOptional<z.ZodBoolean>;
        integrations: z.ZodOptional<z.ZodBoolean>;
        releases: z.ZodOptional<z.ZodBoolean>;
        refs: z.ZodOptional<z.ZodBoolean>;
        members: z.ZodOptional<z.ZodBoolean>;
        search: z.ZodOptional<z.ZodBoolean>;
        ci_tokens: z.ZodOptional<z.ZodBoolean>;
        environments: z.ZodOptional<z.ZodBoolean>;
        runners: z.ZodOptional<z.ZodBoolean>;
        registry: z.ZodOptional<z.ZodBoolean>;
        access_tokens: z.ZodOptional<z.ZodBoolean>;
        audit_events: z.ZodOptional<z.ZodBoolean>;
        vulnerabilities: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    timeout_ms: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const ProfilesConfigSchema: z.ZodObject<{
    profiles: z.ZodRecord<z.ZodString, z.ZodObject<{
        host: z.ZodString;
        api_url: z.ZodOptional<z.ZodString>;
        auth: z.ZodDiscriminatedUnion<[z.ZodObject<{
            type: z.ZodLiteral<"pat">;
            token_env: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"oauth">;
            client_id_env: z.ZodString;
            client_secret_env: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"cookie">;
            cookie_path: z.ZodString;
        }, z.core.$strip>], "type">;
        read_only: z.ZodOptional<z.ZodBoolean>;
        allowed_projects: z.ZodOptional<z.ZodArray<z.ZodString>>;
        allowed_groups: z.ZodOptional<z.ZodArray<z.ZodString>>;
        denied_tools_regex: z.ZodOptional<z.ZodString>;
        allowed_tools: z.ZodOptional<z.ZodArray<z.ZodString>>;
        denied_actions: z.ZodOptional<z.ZodArray<z.ZodString>>;
        features: z.ZodOptional<z.ZodObject<{
            wiki: z.ZodOptional<z.ZodBoolean>;
            milestones: z.ZodOptional<z.ZodBoolean>;
            pipelines: z.ZodOptional<z.ZodBoolean>;
            labels: z.ZodOptional<z.ZodBoolean>;
            mrs: z.ZodOptional<z.ZodBoolean>;
            files: z.ZodOptional<z.ZodBoolean>;
            variables: z.ZodOptional<z.ZodBoolean>;
            workitems: z.ZodOptional<z.ZodBoolean>;
            webhooks: z.ZodOptional<z.ZodBoolean>;
            snippets: z.ZodOptional<z.ZodBoolean>;
            integrations: z.ZodOptional<z.ZodBoolean>;
            releases: z.ZodOptional<z.ZodBoolean>;
            refs: z.ZodOptional<z.ZodBoolean>;
            members: z.ZodOptional<z.ZodBoolean>;
            search: z.ZodOptional<z.ZodBoolean>;
            ci_tokens: z.ZodOptional<z.ZodBoolean>;
            environments: z.ZodOptional<z.ZodBoolean>;
            runners: z.ZodOptional<z.ZodBoolean>;
            registry: z.ZodOptional<z.ZodBoolean>;
            access_tokens: z.ZodOptional<z.ZodBoolean>;
            audit_events: z.ZodOptional<z.ZodBoolean>;
            vulnerabilities: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
        timeout_ms: z.ZodOptional<z.ZodNumber>;
        default_project: z.ZodOptional<z.ZodString>;
        default_namespace: z.ZodOptional<z.ZodString>;
        skip_tls_verify: z.ZodOptional<z.ZodBoolean>;
        ssl_cert_path: z.ZodOptional<z.ZodString>;
        ssl_key_path: z.ZodOptional<z.ZodString>;
        ca_cert_path: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    default_profile: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ProjectPresetSchema: z.ZodObject<{
    description: z.ZodOptional<z.ZodString>;
    scope: z.ZodOptional<z.ZodObject<{
        project: z.ZodOptional<z.ZodString>;
        group: z.ZodOptional<z.ZodString>;
        namespace: z.ZodOptional<z.ZodString>;
        projects: z.ZodOptional<z.ZodArray<z.ZodString>>;
        groups: z.ZodOptional<z.ZodArray<z.ZodString>>;
        includeSubgroups: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    features: z.ZodOptional<z.ZodObject<{
        wiki: z.ZodOptional<z.ZodBoolean>;
        milestones: z.ZodOptional<z.ZodBoolean>;
        pipelines: z.ZodOptional<z.ZodBoolean>;
        labels: z.ZodOptional<z.ZodBoolean>;
        mrs: z.ZodOptional<z.ZodBoolean>;
        files: z.ZodOptional<z.ZodBoolean>;
        variables: z.ZodOptional<z.ZodBoolean>;
        workitems: z.ZodOptional<z.ZodBoolean>;
        webhooks: z.ZodOptional<z.ZodBoolean>;
        snippets: z.ZodOptional<z.ZodBoolean>;
        integrations: z.ZodOptional<z.ZodBoolean>;
        releases: z.ZodOptional<z.ZodBoolean>;
        refs: z.ZodOptional<z.ZodBoolean>;
        members: z.ZodOptional<z.ZodBoolean>;
        search: z.ZodOptional<z.ZodBoolean>;
        ci_tokens: z.ZodOptional<z.ZodBoolean>;
        environments: z.ZodOptional<z.ZodBoolean>;
        runners: z.ZodOptional<z.ZodBoolean>;
        registry: z.ZodOptional<z.ZodBoolean>;
        access_tokens: z.ZodOptional<z.ZodBoolean>;
        audit_events: z.ZodOptional<z.ZodBoolean>;
        vulnerabilities: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    denied_actions: z.ZodOptional<z.ZodArray<z.ZodString>>;
    denied_tools: z.ZodOptional<z.ZodArray<z.ZodString>>;
    read_only: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
export declare const ProjectProfileSchema: z.ZodObject<{
    description: z.ZodOptional<z.ZodString>;
    extends: z.ZodOptional<z.ZodString>;
    features: z.ZodOptional<z.ZodObject<{
        wiki: z.ZodOptional<z.ZodBoolean>;
        milestones: z.ZodOptional<z.ZodBoolean>;
        pipelines: z.ZodOptional<z.ZodBoolean>;
        labels: z.ZodOptional<z.ZodBoolean>;
        mrs: z.ZodOptional<z.ZodBoolean>;
        files: z.ZodOptional<z.ZodBoolean>;
        variables: z.ZodOptional<z.ZodBoolean>;
        workitems: z.ZodOptional<z.ZodBoolean>;
        webhooks: z.ZodOptional<z.ZodBoolean>;
        snippets: z.ZodOptional<z.ZodBoolean>;
        integrations: z.ZodOptional<z.ZodBoolean>;
        releases: z.ZodOptional<z.ZodBoolean>;
        refs: z.ZodOptional<z.ZodBoolean>;
        members: z.ZodOptional<z.ZodBoolean>;
        search: z.ZodOptional<z.ZodBoolean>;
        ci_tokens: z.ZodOptional<z.ZodBoolean>;
        environments: z.ZodOptional<z.ZodBoolean>;
        runners: z.ZodOptional<z.ZodBoolean>;
        registry: z.ZodOptional<z.ZodBoolean>;
        access_tokens: z.ZodOptional<z.ZodBoolean>;
        audit_events: z.ZodOptional<z.ZodBoolean>;
        vulnerabilities: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    additional_tools: z.ZodOptional<z.ZodArray<z.ZodString>>;
    denied_tools: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export interface ProjectConfig {
    configPath: string;
    preset?: ProjectPreset;
    profile?: ProjectProfile;
}
export type PatAuth = z.infer<typeof PatAuthSchema>;
export type OAuthAuth = z.infer<typeof OAuthAuthSchema>;
export type CookieAuth = z.infer<typeof CookieAuthSchema>;
export type AuthConfig = z.infer<typeof AuthConfigSchema>;
export type FeatureFlags = z.infer<typeof FeatureFlagsSchema>;
export type ScopeConfig = z.infer<typeof ScopeConfigSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type Preset = z.infer<typeof PresetSchema>;
export type ProfilesConfig = z.infer<typeof ProfilesConfigSchema>;
export type ProjectPreset = z.infer<typeof ProjectPresetSchema>;
export type ProjectProfile = z.infer<typeof ProjectProfileSchema>;
export interface ProfileInfo {
    name: string;
    host?: string;
    authType?: 'pat' | 'oauth' | 'cookie';
    readOnly: boolean;
    isBuiltIn: boolean;
    isPreset: boolean;
    description?: string;
}
export interface ProfileValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export {};
