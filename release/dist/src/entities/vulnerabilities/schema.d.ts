import { z } from 'zod';
export declare const ManageVulnerabilitySchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"dismiss">;
    vulnerability_id: z.ZodCoercedNumber<unknown>;
    comment: z.ZodOptional<z.ZodString>;
    dismissal_reason: z.ZodOptional<z.ZodEnum<{
        ACCEPTABLE_RISK: "ACCEPTABLE_RISK";
        FALSE_POSITIVE: "FALSE_POSITIVE";
        MITIGATING_CONTROL: "MITIGATING_CONTROL";
        USED_IN_TESTS: "USED_IN_TESTS";
        NOT_APPLICABLE: "NOT_APPLICABLE";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"confirm">;
    vulnerability_id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"resolve">;
    vulnerability_id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"revert">;
    vulnerability_id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>], "action">;
export type ManageVulnerabilityInput = z.infer<typeof ManageVulnerabilitySchema>;
