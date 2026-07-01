"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistryManager = void 0;
const registry_1 = require("./entities/core/registry");
const registry_2 = require("./entities/labels/registry");
const registry_3 = require("./entities/mrs/registry");
const registry_4 = require("./entities/files/registry");
const registry_5 = require("./entities/milestones/registry");
const registry_6 = require("./entities/pipelines/registry");
const registry_7 = require("./entities/variables/registry");
const registry_8 = require("./entities/wiki/registry");
const registry_9 = require("./entities/workitems/registry");
const registry_10 = require("./entities/webhooks/registry");
const registry_11 = require("./entities/snippets/registry");
const registry_12 = require("./entities/integrations/registry");
const registry_13 = require("./entities/releases/registry");
const registry_14 = require("./entities/refs/registry");
const registry_15 = require("./entities/members/registry");
const registry_16 = require("./entities/search/registry");
const registry_17 = require("./entities/context/registry");
const registry_18 = require("./entities/iterations/registry");
const registry_19 = require("./entities/job-token-scope/registry");
const registry_20 = require("./entities/deploy-keys/registry");
const registry_21 = require("./entities/environments/registry");
const registry_22 = require("./entities/container_registry/registry");
const registry_23 = require("./entities/runners/registry");
const registry_24 = require("./entities/audit_events/registry");
const registry_25 = require("./entities/vulnerabilities/registry");
const registry_26 = require("./entities/access_tokens/registry");
const config_1 = require("./config");
const InstanceCapabilities_1 = require("./services/InstanceCapabilities");
const ConnectionManager_1 = require("./services/ConnectionManager");
const HealthMonitor_1 = require("./services/HealthMonitor");
const TokenScopeDetector_1 = require("./services/TokenScopeDetector");
const logger_1 = require("./logger");
const schema_utils_1 = require("./utils/schema-utils");
const description_utils_1 = require("./utils/description-utils");
const url_1 = require("./utils/url");
const token_context_1 = require("./oauth/token-context");
class RegistryManager {
    static instance;
    registries = new Map();
    toolLookupCaches = new Map();
    toolDefinitionsCaches = new Map();
    toolNamesCaches = new Map();
    filterStatsCaches = new Map();
    verifiedContextUrls = new Set();
    descriptionOverrides = new Map();
    readOnlyToolsCache = null;
    constructor() {
        this.initializeRegistries();
        this.loadDescriptionOverrides();
        this.buildToolLookupCache();
    }
    static getInstance() {
        if (!RegistryManager.instance) {
            RegistryManager.instance = new RegistryManager();
        }
        return RegistryManager.instance;
    }
    initializeRegistries() {
        this.registries.set('core', registry_1.coreToolRegistry);
        this.registries.set('context', registry_17.contextToolRegistry);
        if (config_1.USE_LABELS) {
            this.registries.set('labels', registry_2.labelsToolRegistry);
        }
        if (config_1.USE_MRS) {
            this.registries.set('mrs', registry_3.mrsToolRegistry);
        }
        if (config_1.USE_FILES) {
            this.registries.set('files', registry_4.filesToolRegistry);
        }
        if (config_1.USE_MILESTONE) {
            this.registries.set('milestones', registry_5.milestonesToolRegistry);
        }
        if (config_1.USE_PIPELINE) {
            this.registries.set('pipelines', registry_6.pipelinesToolRegistry);
        }
        if (config_1.USE_VARIABLES) {
            this.registries.set('variables', registry_7.variablesToolRegistry);
        }
        if (config_1.USE_GITLAB_WIKI) {
            this.registries.set('wiki', registry_8.wikiToolRegistry);
        }
        if (config_1.USE_WORKITEMS) {
            this.registries.set('workitems', registry_9.workitemsToolRegistry);
        }
        if (config_1.USE_SNIPPETS) {
            this.registries.set('snippets', registry_11.snippetsToolRegistry);
        }
        if (config_1.USE_WEBHOOKS) {
            this.registries.set('webhooks', registry_10.webhooksToolRegistry);
        }
        if (config_1.USE_INTEGRATIONS) {
            this.registries.set('integrations', registry_12.integrationsToolRegistry);
        }
        if (config_1.USE_RELEASES) {
            this.registries.set('releases', registry_13.releasesToolRegistry);
        }
        if (config_1.USE_REFS) {
            this.registries.set('refs', registry_14.refsToolRegistry);
        }
        if (config_1.USE_MEMBERS) {
            this.registries.set('members', registry_15.membersToolRegistry);
        }
        if (config_1.USE_SEARCH) {
            this.registries.set('search', registry_16.searchToolRegistry);
        }
        if (config_1.USE_ITERATIONS) {
            this.registries.set('iterations', registry_18.iterationsToolRegistry);
        }
        if (config_1.USE_CI_TOKENS) {
            this.registries.set('job-token-scope', registry_19.jobTokenScopeToolRegistry);
            this.registries.set('deploy-keys', registry_20.deployKeysToolRegistry);
        }
        if (config_1.USE_ENVIRONMENTS) {
            this.registries.set('environments', registry_21.environmentsToolRegistry);
        }
        if (config_1.USE_REGISTRY) {
            this.registries.set('registry', registry_22.containerRegistryToolRegistry);
        }
        if (config_1.USE_ACCESS_TOKENS) {
            this.registries.set('access_tokens', registry_26.accessTokensToolRegistry);
        }
        if (config_1.USE_RUNNERS) {
            this.registries.set('runners', registry_23.runnersToolRegistry);
        }
        if (config_1.USE_AUDIT_EVENTS) {
            this.registries.set('audit_events', registry_24.auditEventsToolRegistry);
        }
        if (config_1.USE_VULNERABILITIES) {
            this.registries.set('vulnerabilities', registry_25.vulnerabilitiesToolRegistry);
        }
    }
    loadDescriptionOverrides() {
        this.descriptionOverrides = (0, config_1.getToolDescriptionOverrides)();
        if (this.descriptionOverrides.size > 0) {
            (0, logger_1.logDebug)('Loaded tool description overrides', { count: this.descriptionOverrides.size });
            for (const [toolName, description] of this.descriptionOverrides) {
                (0, logger_1.logDebug)('Tool description override', { toolName, description });
            }
        }
    }
    buildReadOnlyToolsList() {
        const readOnlyTools = [];
        readOnlyTools.push(...(0, registry_1.getCoreReadOnlyToolNames)());
        readOnlyTools.push(...(0, registry_17.getContextReadOnlyToolNames)());
        if (config_1.USE_LABELS) {
            readOnlyTools.push(...(0, registry_2.getLabelsReadOnlyToolNames)());
        }
        if (config_1.USE_MRS) {
            readOnlyTools.push(...(0, registry_3.getMrsReadOnlyToolNames)());
        }
        if (config_1.USE_FILES) {
            readOnlyTools.push(...(0, registry_4.getFilesReadOnlyToolNames)());
        }
        if (config_1.USE_GITLAB_WIKI) {
            readOnlyTools.push(...(0, registry_8.getWikiReadOnlyToolNames)());
        }
        if (config_1.USE_MILESTONE) {
            readOnlyTools.push(...(0, registry_5.getMilestonesReadOnlyToolNames)());
        }
        if (config_1.USE_PIPELINE) {
            readOnlyTools.push(...(0, registry_6.getPipelinesReadOnlyToolNames)());
        }
        if (config_1.USE_WORKITEMS) {
            readOnlyTools.push(...(0, registry_9.getWorkitemsReadOnlyToolNames)());
        }
        if (config_1.USE_VARIABLES) {
            readOnlyTools.push(...(0, registry_7.getVariablesReadOnlyToolNames)());
        }
        if (config_1.USE_SNIPPETS) {
            readOnlyTools.push(...(0, registry_11.getSnippetsReadOnlyToolNames)());
        }
        if (config_1.USE_WEBHOOKS) {
            readOnlyTools.push(...(0, registry_10.getWebhooksReadOnlyToolNames)());
        }
        if (config_1.USE_INTEGRATIONS) {
            readOnlyTools.push(...(0, registry_12.getIntegrationsReadOnlyToolNames)());
        }
        if (config_1.USE_RELEASES) {
            readOnlyTools.push(...(0, registry_13.getReleasesReadOnlyToolNames)());
        }
        if (config_1.USE_REFS) {
            readOnlyTools.push(...(0, registry_14.getRefsReadOnlyToolNames)());
        }
        if (config_1.USE_MEMBERS) {
            readOnlyTools.push(...(0, registry_15.getMembersReadOnlyToolNames)());
        }
        if (config_1.USE_SEARCH) {
            readOnlyTools.push(...(0, registry_16.getSearchReadOnlyToolNames)());
        }
        if (config_1.USE_ITERATIONS) {
            readOnlyTools.push(...(0, registry_18.getIterationsReadOnlyToolNames)());
        }
        if (config_1.USE_CI_TOKENS) {
            readOnlyTools.push(...(0, registry_19.getJobTokenScopeReadOnlyToolNames)());
            readOnlyTools.push(...(0, registry_20.getDeployKeysReadOnlyToolNames)());
        }
        if (config_1.USE_ENVIRONMENTS) {
            readOnlyTools.push(...(0, registry_21.getEnvironmentsReadOnlyToolNames)());
        }
        if (config_1.USE_REGISTRY) {
            readOnlyTools.push(...(0, registry_22.getContainerRegistryReadOnlyToolNames)());
        }
        if (config_1.USE_ACCESS_TOKENS) {
            readOnlyTools.push(...(0, registry_26.getAccessTokensReadOnlyToolNames)());
        }
        if (config_1.USE_RUNNERS) {
            readOnlyTools.push(...(0, registry_23.getRunnersReadOnlyToolNames)());
        }
        if (config_1.USE_AUDIT_EVENTS) {
            readOnlyTools.push(...(0, registry_24.getAuditEventsReadOnlyToolNames)());
        }
        if (config_1.USE_VULNERABILITIES) {
            readOnlyTools.push(...(0, registry_25.getVulnerabilitiesReadOnlyToolNames)());
        }
        return readOnlyTools;
    }
    getReadOnlyTools() {
        this.readOnlyToolsCache ??= this.buildReadOnlyToolsList();
        return this.readOnlyToolsCache;
    }
    loadInstanceContext(instanceUrl) {
        let instanceInfo;
        try {
            const info = ConnectionManager_1.ConnectionManager.getInstance().getInstanceInfo(instanceUrl);
            instanceInfo = { tier: info.tier, version: info.version };
        }
        catch (err) {
            if (!isExpectedInitError(err))
                throw err;
        }
        if (instanceInfo) {
            try {
                instanceInfo.adminModeActive =
                    ConnectionManager_1.ConnectionManager.getInstance().getAdminInfo(instanceUrl)?.adminModeActive;
            }
            catch (err) {
                if (!isExpectedInitError(err))
                    throw err;
            }
        }
        let tokenScopes;
        try {
            const scopeInfo = ConnectionManager_1.ConnectionManager.getInstance().getTokenScopeInfo(instanceUrl);
            if (scopeInfo) {
                tokenScopes = scopeInfo.scopes;
            }
        }
        catch (err) {
            if (!isExpectedInitError(err))
                throw err;
        }
        return { instanceInfo, tokenScopes };
    }
    getToolExclusionReason(toolName, tool, ctx) {
        if (config_1.GITLAB_READ_ONLY_MODE && !this.getReadOnlyTools().includes(toolName))
            return 'readOnly';
        if (config_1.GITLAB_DENIED_TOOLS_REGEX?.test(toolName))
            return 'deniedRegex';
        if (ctx.tokenScopes && !(0, TokenScopeDetector_1.isToolAvailableForScopes)(toolName, ctx.tokenScopes))
            return 'scopes';
        const isContextTool = this.registries.get('context')?.has(toolName) ?? false;
        if (!isContextTool && ctx.instanceInfo) {
            if (tool.requirements?.default.requiresAdmin && ctx.instanceInfo.adminModeActive === false)
                return 'admin';
            if (!(0, InstanceCapabilities_1.isToolAvailable)(tool.requirements, ctx.instanceInfo))
                return 'tier';
        }
        const allActions = (0, schema_utils_1.extractActionsFromSchema)(tool.inputSchema);
        if (allActions.length > 0 && (0, schema_utils_1.shouldRemoveTool)(toolName, allActions))
            return 'actionDenial';
        return null;
    }
    buildFilteredTools(ctx) {
        const result = new Map();
        for (const [, registry] of this.registries) {
            for (const [toolName, tool] of registry) {
                const exclusion = this.getToolExclusionReason(toolName, tool, ctx);
                if (exclusion) {
                    (0, logger_1.logDebug)('Tool filtered out', { toolName, reason: exclusion });
                    continue;
                }
                let transformedSchema = (0, schema_utils_1.transformToolSchema)(toolName, tool.inputSchema);
                if (ctx.instanceInfo) {
                    const restrictedParams = (0, InstanceCapabilities_1.getRestrictedParameters)(tool.requirements, ctx.instanceInfo);
                    if (restrictedParams.length > 0) {
                        transformedSchema = (0, schema_utils_1.stripTierRestrictedParameters)(transformedSchema, restrictedParams);
                    }
                }
                const customDescription = this.descriptionOverrides.get(toolName);
                const finalTool = {
                    ...tool,
                    inputSchema: transformedSchema,
                    ...(customDescription && { description: customDescription }),
                };
                if (customDescription) {
                    (0, logger_1.logDebug)('Applied description override', { toolName, customDescription });
                }
                result.set(toolName, finalTool);
            }
        }
        return result;
    }
    postProcessRelatedReferences(cache) {
        const availableToolNames = config_1.GITLAB_CROSS_REFS ? new Set(cache.keys()) : undefined;
        for (const [toolName, tool] of cache) {
            if (this.descriptionOverrides.has(toolName))
                continue;
            const nextDescription = availableToolNames
                ? (0, description_utils_1.resolveRelatedReferences)(tool.description, availableToolNames)
                : (0, description_utils_1.stripRelatedSection)(tool.description);
            if (nextDescription !== tool.description) {
                cache.set(toolName, { ...tool, description: nextDescription });
            }
        }
    }
    resolveCacheUrl(instanceUrl) {
        if (instanceUrl)
            return (0, url_1.normalizeInstanceUrl)(instanceUrl);
        const contextUrl = (0, token_context_1.getGitLabApiUrlFromContext)();
        if (contextUrl)
            return (0, url_1.normalizeInstanceUrl)(contextUrl);
        try {
            const current = ConnectionManager_1.ConnectionManager.getInstance().getCurrentInstanceUrl();
            if (current)
                return (0, url_1.normalizeInstanceUrl)(current);
        }
        catch {
        }
        return (0, url_1.normalizeInstanceUrl)(config_1.GITLAB_BASE_URL);
    }
    resolveCache(instanceUrl) {
        const url = this.resolveCacheUrl(instanceUrl);
        let cache = this.toolLookupCaches.get(url);
        if (!cache) {
            this.buildToolLookupCache(url);
            cache = this.toolLookupCaches.get(url);
        }
        return cache ?? new Map();
    }
    buildToolLookupCache(instanceUrl) {
        const url = this.resolveCacheUrl(instanceUrl);
        let ctx;
        try {
            ctx = this.loadInstanceContext(url);
        }
        catch (err) {
            if (this.verifiedContextUrls.has(url)) {
                (0, logger_1.logError)('Unexpected error loading instance context; preserving previous cache', {
                    error: err instanceof Error ? err.message : String(err),
                    instanceUrl: url,
                });
                return;
            }
            this.toolLookupCaches.delete(url);
            this.toolDefinitionsCaches.delete(url);
            this.toolNamesCaches.delete(url);
            this.filterStatsCaches.delete(url);
            (0, logger_1.logError)('Unexpected error loading instance context; no previous cache available', {
                error: err instanceof Error ? err.message : String(err),
                instanceUrl: url,
            });
            throw err instanceof Error ? err : new Error(String(err));
        }
        const newCache = this.buildFilteredTools(ctx);
        this.postProcessRelatedReferences(newCache);
        this.toolDefinitionsCaches.delete(url);
        this.toolNamesCaches.delete(url);
        this.filterStatsCaches.delete(url);
        this.toolLookupCaches.set(url, newCache);
        if (ctx.instanceInfo) {
            this.verifiedContextUrls.add(url);
        }
        else {
            this.verifiedContextUrls.delete(url);
        }
        (0, logger_1.logDebug)('Registry manager built cache after filtering', {
            toolCount: newCache.size,
            instanceUrl: url,
        });
    }
    invalidateCaches(instanceUrl) {
        const url = this.resolveCacheUrl(instanceUrl);
        this.toolDefinitionsCaches.delete(url);
        this.toolNamesCaches.delete(url);
        this.buildToolLookupCache(url);
    }
    getTool(toolName, instanceUrl) {
        return this.resolveCache(instanceUrl).get(toolName) ?? null;
    }
    async executeTool(toolName, args, instanceUrl) {
        const tool = this.getTool(toolName, instanceUrl);
        if (!tool) {
            throw new Error(`Tool '${toolName}' not found in any registry`);
        }
        return await tool.handler(args);
    }
    refreshCache(instanceUrl) {
        this.invalidateCaches(instanceUrl);
    }
    getAllToolDefinitions(instanceUrl) {
        const url = this.resolveCacheUrl(instanceUrl);
        const cache = this.resolveCache(instanceUrl);
        const unreachableMode = this.isUnreachableFor(instanceUrl);
        const cachedDefs = this.toolDefinitionsCaches.get(url);
        if (cachedDefs === undefined || unreachableMode) {
            const contextTools = unreachableMode ? this.registries.get('context') : null;
            const defs = [];
            for (const tool of cache.values()) {
                if (contextTools && !contextTools.has(tool.name))
                    continue;
                defs.push({
                    name: tool.name,
                    description: tool.description,
                    inputSchema: tool.inputSchema,
                });
            }
            if (unreachableMode) {
                return defs;
            }
            this.toolDefinitionsCaches.set(url, defs);
            return defs;
        }
        return cachedDefs;
    }
    getToolCatalog(instanceUrl) {
        const url = this.resolveCacheUrl(instanceUrl);
        const cache = this.resolveCache(instanceUrl);
        const cachedDefs = this.toolDefinitionsCaches.get(url);
        if (cachedDefs !== undefined) {
            return cachedDefs;
        }
        const defs = [];
        for (const tool of cache.values()) {
            defs.push({
                name: tool.name,
                description: tool.description,
                inputSchema: tool.inputSchema,
            });
        }
        this.toolDefinitionsCaches.set(url, defs);
        return defs;
    }
    getAllToolDefinitionsTierless() {
        const allTools = [];
        const isReadOnly = process.env.GITLAB_READ_ONLY_MODE === 'true';
        const deniedRegex = process.env.GITLAB_DENIED_TOOLS_REGEX
            ? new RegExp(process.env.GITLAB_DENIED_TOOLS_REGEX)
            : undefined;
        const useLabels = process.env.USE_LABELS !== 'false';
        const useMrs = process.env.USE_MRS !== 'false';
        const useFiles = process.env.USE_FILES !== 'false';
        const useMilestone = process.env.USE_MILESTONE !== 'false';
        const usePipeline = process.env.USE_PIPELINE !== 'false';
        const useVariables = process.env.USE_VARIABLES !== 'false';
        const useWiki = process.env.USE_GITLAB_WIKI !== 'false';
        const useWorkitems = process.env.USE_WORKITEMS !== 'false';
        const useSnippets = process.env.USE_SNIPPETS !== 'false';
        const useWebhooks = process.env.USE_WEBHOOKS !== 'false';
        const useIntegrations = process.env.USE_INTEGRATIONS !== 'false';
        const useReleases = process.env.USE_RELEASES !== 'false';
        const useRefs = process.env.USE_REFS !== 'false';
        const useMembers = process.env.USE_MEMBERS !== 'false';
        const useSearch = process.env.USE_SEARCH !== 'false';
        const useIterations = process.env.USE_ITERATIONS !== 'false';
        const useCiTokens = process.env.USE_CI_TOKENS !== 'false';
        const useEnvironments = process.env.USE_ENVIRONMENTS !== 'false';
        const useRegistry = process.env.USE_REGISTRY !== 'false';
        const useAccessTokens = process.env.USE_ACCESS_TOKENS !== 'false';
        const useRunners = process.env.USE_RUNNERS !== 'false';
        const useAuditEvents = process.env.USE_AUDIT_EVENTS !== 'false';
        const useVulnerabilities = process.env.USE_VULNERABILITIES !== 'false';
        const registriesToUse = new Map();
        registriesToUse.set('core', registry_1.coreToolRegistry);
        registriesToUse.set('context', registry_17.contextToolRegistry);
        if (useLabels)
            registriesToUse.set('labels', registry_2.labelsToolRegistry);
        if (useMrs)
            registriesToUse.set('mrs', registry_3.mrsToolRegistry);
        if (useFiles)
            registriesToUse.set('files', registry_4.filesToolRegistry);
        if (useMilestone)
            registriesToUse.set('milestones', registry_5.milestonesToolRegistry);
        if (usePipeline)
            registriesToUse.set('pipelines', registry_6.pipelinesToolRegistry);
        if (useVariables)
            registriesToUse.set('variables', registry_7.variablesToolRegistry);
        if (useWiki)
            registriesToUse.set('wiki', registry_8.wikiToolRegistry);
        if (useWorkitems)
            registriesToUse.set('workitems', registry_9.workitemsToolRegistry);
        if (useSnippets)
            registriesToUse.set('snippets', registry_11.snippetsToolRegistry);
        if (useWebhooks)
            registriesToUse.set('webhooks', registry_10.webhooksToolRegistry);
        if (useIntegrations)
            registriesToUse.set('integrations', registry_12.integrationsToolRegistry);
        if (useReleases)
            registriesToUse.set('releases', registry_13.releasesToolRegistry);
        if (useRefs)
            registriesToUse.set('refs', registry_14.refsToolRegistry);
        if (useMembers)
            registriesToUse.set('members', registry_15.membersToolRegistry);
        if (useSearch)
            registriesToUse.set('search', registry_16.searchToolRegistry);
        if (useIterations)
            registriesToUse.set('iterations', registry_18.iterationsToolRegistry);
        if (useCiTokens) {
            registriesToUse.set('job-token-scope', registry_19.jobTokenScopeToolRegistry);
            registriesToUse.set('deploy-keys', registry_20.deployKeysToolRegistry);
        }
        if (useEnvironments)
            registriesToUse.set('environments', registry_21.environmentsToolRegistry);
        if (useRegistry)
            registriesToUse.set('registry', registry_22.containerRegistryToolRegistry);
        if (useAccessTokens)
            registriesToUse.set('access_tokens', registry_26.accessTokensToolRegistry);
        if (useRunners)
            registriesToUse.set('runners', registry_23.runnersToolRegistry);
        if (useAuditEvents)
            registriesToUse.set('audit_events', registry_24.auditEventsToolRegistry);
        if (useVulnerabilities)
            registriesToUse.set('vulnerabilities', registry_25.vulnerabilitiesToolRegistry);
        const descOverrides = (0, config_1.getToolDescriptionOverrides)();
        for (const registry of registriesToUse.values()) {
            for (const [toolName, tool] of registry) {
                if (isReadOnly && !this.getReadOnlyTools().includes(toolName)) {
                    continue;
                }
                if (deniedRegex?.test(toolName)) {
                    continue;
                }
                const allActions = (0, schema_utils_1.extractActionsFromSchema)(tool.inputSchema);
                if (allActions.length > 0 && (0, schema_utils_1.shouldRemoveTool)(toolName, allActions)) {
                    continue;
                }
                const transformedSchema = (0, schema_utils_1.transformToolSchema)(toolName, tool.inputSchema);
                const customDescription = descOverrides.get(toolName);
                const finalTool = {
                    ...tool,
                    inputSchema: transformedSchema,
                    ...(customDescription && { description: customDescription }),
                };
                allTools.push(finalTool);
            }
        }
        const crossRefsEnabled = process.env.GITLAB_CROSS_REFS !== 'false';
        if (crossRefsEnabled) {
            const availableToolNames = new Set(allTools.map((t) => t.name));
            for (let i = 0; i < allTools.length; i++) {
                const tool = allTools[i];
                if (descOverrides.has(tool.name))
                    continue;
                const resolved = (0, description_utils_1.resolveRelatedReferences)(tool.description, availableToolNames);
                if (resolved !== tool.description) {
                    allTools[i] = { ...tool, description: resolved };
                }
            }
        }
        else {
            for (let i = 0; i < allTools.length; i++) {
                const tool = allTools[i];
                if (descOverrides.has(tool.name))
                    continue;
                const stripped = (0, description_utils_1.stripRelatedSection)(tool.description);
                if (stripped !== tool.description) {
                    allTools[i] = { ...tool, description: stripped };
                }
            }
        }
        return allTools;
    }
    getAllToolDefinitionsUnfiltered() {
        const allTools = [];
        const allRegistries = [
            registry_1.coreToolRegistry,
            registry_17.contextToolRegistry,
            registry_2.labelsToolRegistry,
            registry_3.mrsToolRegistry,
            registry_4.filesToolRegistry,
            registry_5.milestonesToolRegistry,
            registry_6.pipelinesToolRegistry,
            registry_7.variablesToolRegistry,
            registry_8.wikiToolRegistry,
            registry_9.workitemsToolRegistry,
            registry_11.snippetsToolRegistry,
            registry_10.webhooksToolRegistry,
            registry_12.integrationsToolRegistry,
            registry_13.releasesToolRegistry,
            registry_14.refsToolRegistry,
            registry_15.membersToolRegistry,
            registry_16.searchToolRegistry,
            registry_18.iterationsToolRegistry,
            registry_19.jobTokenScopeToolRegistry,
            registry_20.deployKeysToolRegistry,
            registry_21.environmentsToolRegistry,
            registry_22.containerRegistryToolRegistry,
            registry_26.accessTokensToolRegistry,
            registry_23.runnersToolRegistry,
            registry_24.auditEventsToolRegistry,
            registry_25.vulnerabilitiesToolRegistry,
        ];
        for (const registry of allRegistries) {
            for (const [, tool] of registry) {
                allTools.push(tool);
            }
        }
        return allTools;
    }
    hasToolHandler(toolName, instanceUrl) {
        return this.resolveCache(instanceUrl).has(toolName);
    }
    getAvailableToolNames(instanceUrl) {
        const url = this.resolveCacheUrl(instanceUrl);
        const cache = this.resolveCache(instanceUrl);
        const unreachableMode = this.isUnreachableFor(instanceUrl);
        const cachedNames = this.toolNamesCaches.get(url);
        if (cachedNames === undefined || unreachableMode) {
            const contextTools = unreachableMode ? this.registries.get('context') : null;
            const names = Array.from(cache.keys()).filter((name) => !contextTools || contextTools.has(name));
            if (unreachableMode) {
                return names;
            }
            this.toolNamesCaches.set(url, names);
            return names;
        }
        return cachedNames;
    }
    isUnreachableFor(instanceUrl) {
        const healthMonitor = HealthMonitor_1.HealthMonitor.getInstance();
        if (instanceUrl) {
            try {
                return (!healthMonitor.isInstanceReachable(instanceUrl) &&
                    healthMonitor.getState(instanceUrl) !== 'connecting');
            }
            catch {
                return false;
            }
        }
        return (healthMonitor.getMonitoredInstances().length > 0 && !healthMonitor.isAnyInstanceHealthy());
    }
    aggregateFilterCounters(ctx, contextTools) {
        const counts = {
            available: 0,
            byReadOnly: 0,
            byDeniedRegex: 0,
            byScopes: 0,
            byTier: 0,
            byActionDenial: 0,
            byAdmin: 0,
        };
        const counterByReason = {
            readOnly: 'byReadOnly',
            deniedRegex: 'byDeniedRegex',
            scopes: 'byScopes',
            tier: 'byTier',
            actionDenial: 'byActionDenial',
            admin: 'byAdmin',
        };
        for (const registry of this.registries.values()) {
            for (const [toolName, tool] of registry) {
                if (contextTools && !contextTools.has(toolName))
                    continue;
                const reason = this.getToolExclusionReason(toolName, tool, ctx);
                if (!reason) {
                    counts.available++;
                }
                else {
                    const key = counterByReason[reason];
                    if (key)
                        counts[key]++;
                }
            }
        }
        return counts;
    }
    getFilterStats(instanceUrl) {
        const url = this.resolveCacheUrl(instanceUrl);
        const unreachableMode = this.isUnreachableFor(instanceUrl);
        const contextTools = unreachableMode ? this.registries.get('context') : null;
        let totalTools = 0;
        for (const registry of this.registries.values()) {
            for (const [toolName] of registry) {
                if (contextTools && !contextTools.has(toolName))
                    continue;
                totalTools++;
            }
        }
        if (unreachableMode) {
            const { available, byReadOnly, byDeniedRegex, byActionDenial } = this.aggregateFilterCounters({}, contextTools);
            return {
                available,
                total: totalTools,
                filteredByScopes: 0,
                filteredByReadOnly: byReadOnly,
                filteredByTier: 0,
                filteredByDeniedRegex: byDeniedRegex,
                filteredByActionDenial: byActionDenial,
                filteredByAdmin: 0,
            };
        }
        let ctx;
        try {
            ctx = this.loadInstanceContext(url);
        }
        catch (err) {
            (0, logger_1.logError)('Unexpected error loading instance context for filter stats; using cached stats', {
                error: err instanceof Error ? err.message : String(err),
                instanceUrl: url,
            });
            const filteredTotal = totalTools;
            return (this.filterStatsCaches.get(url) ?? {
                available: 0,
                total: filteredTotal,
                filteredByScopes: filteredTotal,
                filteredByReadOnly: 0,
                filteredByTier: 0,
                filteredByDeniedRegex: 0,
                filteredByActionDenial: 0,
                filteredByAdmin: 0,
            });
        }
        const { available: availableTools, byReadOnly: filteredByReadOnly, byDeniedRegex: filteredByDeniedRegex, byScopes: filteredByScopes, byTier: filteredByTier, byActionDenial: filteredByActionDenial, byAdmin: filteredByAdmin, } = this.aggregateFilterCounters(ctx, contextTools);
        const stats = {
            available: availableTools,
            total: totalTools,
            filteredByScopes,
            filteredByReadOnly,
            filteredByTier,
            filteredByDeniedRegex,
            filteredByActionDenial,
            filteredByAdmin,
        };
        this.filterStatsCaches.set(url, stats);
        return stats;
    }
}
exports.RegistryManager = RegistryManager;
function isExpectedInitError(err) {
    const msg = err instanceof Error ? err.message : String(err);
    return (msg.includes('not initialized') ||
        msg.includes('not available') ||
        msg.includes('No connection'));
}
//# sourceMappingURL=registry-manager.js.map