export type QueryType = 'email' | 'username' | 'name';
export interface QueryPattern {
    type: QueryType;
    hasTransliteration: boolean;
    originalQuery: string;
    transliteratedQuery?: string;
}
export interface UserSearchParams {
    username?: string;
    public_email?: string;
    search?: string;
    active?: boolean;
    humans?: boolean;
    without_project_bots?: boolean;
    [key: string]: unknown;
}
export interface SmartSearchResult {
    users: unknown[];
    searchMetadata: {
        query: string;
        pattern: QueryPattern;
        searchPhases: Array<{
            phase: string;
            params: UserSearchParams;
            resultCount: number;
        }>;
        totalApiCalls: number;
    };
}
export declare function transliterateText(text: string): string;
export declare function hasNonLatin(text: string): boolean;
export declare function analyzeQuery(query: string): QueryPattern;
export declare function smartUserSearch(query: string, additionalParams?: Partial<UserSearchParams>): Promise<SmartSearchResult>;
