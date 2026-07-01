import { z } from 'zod';
export declare const vulnerabilityIdField: z.ZodCoercedNumber<unknown>;
export declare const BrowseVulnerabilitiesSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"list">;
    project_id: z.ZodOptional<z.ZodPreprocess<z.ZodCoercedString<unknown>>>;
    group_id: z.ZodOptional<z.ZodPreprocess<z.ZodCoercedString<unknown>>>;
    state: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        DETECTED: "DETECTED";
        CONFIRMED: "CONFIRMED";
        RESOLVED: "RESOLVED";
        DISMISSED: "DISMISSED";
    }>>>;
    severity: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        INFO: "INFO";
        UNKNOWN: "UNKNOWN";
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        HIGH: "HIGH";
        CRITICAL: "CRITICAL";
    }>>>;
    report_type: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        SAST: "SAST";
        DAST: "DAST";
        DEPENDENCY_SCANNING: "DEPENDENCY_SCANNING";
        CONTAINER_SCANNING: "CONTAINER_SCANNING";
        SECRET_DETECTION: "SECRET_DETECTION";
        COVERAGE_FUZZING: "COVERAGE_FUZZING";
        API_FUZZING: "API_FUZZING";
        CLUSTER_IMAGE_SCANNING: "CLUSTER_IMAGE_SCANNING";
        GENERIC: "GENERIC";
    }>>>;
    sort: z.ZodOptional<z.ZodEnum<{
        severity_desc: "severity_desc";
        severity_asc: "severity_asc";
        detected_desc: "detected_desc";
        detected_asc: "detected_asc";
        state_desc: "state_desc";
        state_asc: "state_asc";
        title_desc: "title_desc";
        title_asc: "title_asc";
    }>>;
    first: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    after: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get">;
    vulnerability_id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>], "action">;
export type BrowseVulnerabilitiesInput = z.infer<typeof BrowseVulnerabilitiesSchema>;
