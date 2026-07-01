import type { GitLabTier, GitLabFeatures } from './GitLabVersionDetector';
import type { GitLabScope } from './TokenScopeDetector';
import type { ToolRequirement, ToolRequirements } from '../types';
export interface InstanceCapabilities {
    version: string;
    tier: GitLabTier;
    features: GitLabFeatures;
    scopes: GitLabScope[];
    isAdmin?: boolean;
    adminModeActive?: boolean;
}
export type CapabilityGate = Pick<InstanceCapabilities, 'version' | 'tier' | 'adminModeActive'>;
export declare function resolveRequirement(reqs: ToolRequirements, action?: string): ToolRequirement;
export declare function meetsRequirement(req: ToolRequirement, caps: CapabilityGate): boolean;
export declare function isToolAvailable(reqs: ToolRequirements | undefined, caps: CapabilityGate, action?: string): boolean;
export declare function getRestrictedParameters(reqs: ToolRequirements | undefined, caps: CapabilityGate): string[];
export declare function getUnmetReason(reqs: ToolRequirements | undefined, caps: CapabilityGate, action?: string): string | null;
export declare function getHighestTier(reqs: ToolRequirements | undefined): GitLabTier;
