type QueryParamValue = string | number | boolean | undefined | null;
type QueryParamArray = string[] | number[];
type QueryParams = Record<string, QueryParamValue | QueryParamArray>;
interface RequestOptions {
    query?: QueryParams;
    body?: Record<string, unknown> | URLSearchParams | FormData;
    contentType?: 'json' | 'form';
    rawResponse?: boolean;
}
export declare const gitlab: {
    get: <T = unknown>(path: string, options?: Omit<RequestOptions, "body" | "contentType">) => Promise<T>;
    post: <T = unknown>(path: string, options?: RequestOptions) => Promise<T>;
    put: <T = unknown>(path: string, options?: RequestOptions) => Promise<T>;
    delete: <T = unknown>(path: string, options?: Omit<RequestOptions, "body" | "contentType">) => Promise<T>;
    patch: <T = unknown>(path: string, options?: RequestOptions) => Promise<T>;
};
export declare const paths: {
    encode: (path: string) => string;
    project: (id: string | number) => string;
    group: (id: string | number) => string;
    namespace: (path: string, entityType: "projects" | "groups") => string;
};
export declare function toQuery<T extends Record<string, unknown>>(options: T, exclude?: (keyof T)[]): QueryParams;
export default gitlab;
