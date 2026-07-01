import { z } from 'zod';
export declare const projectIdField: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
export declare const groupIdField: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
export declare const auditEventIdField: z.ZodCoercedNumber<unknown>;
export declare const BrowseAuditEventsSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"list_instance">;
    entity_type: z.ZodOptional<z.ZodString>;
    entity_id: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    created_after: z.ZodOptional<z.ZodString>;
    created_before: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"list_group">;
    group_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    created_after: z.ZodOptional<z.ZodString>;
    created_before: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"list_project">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    created_after: z.ZodOptional<z.ZodString>;
    created_before: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get">;
    audit_event_id: z.ZodCoercedNumber<unknown>;
    project_id: z.ZodOptional<z.ZodPreprocess<z.ZodCoercedString<unknown>>>;
    group_id: z.ZodOptional<z.ZodPreprocess<z.ZodCoercedString<unknown>>>;
}, z.core.$strip>], "action">;
export type BrowseAuditEventsInput = z.infer<typeof BrowseAuditEventsSchema>;
