import { z } from 'zod';
export declare const ManageReleaseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"create">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    tag_name: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    ref: z.ZodOptional<z.ZodString>;
    tag_message: z.ZodOptional<z.ZodString>;
    milestones: z.ZodOptional<z.ZodArray<z.ZodString>>;
    released_at: z.ZodOptional<z.ZodString>;
    assets: z.ZodOptional<z.ZodObject<{
        links: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
            direct_asset_path: z.ZodOptional<z.ZodString>;
            link_type: z.ZodOptional<z.ZodEnum<{
                image: "image";
                other: "other";
                runbook: "runbook";
                package: "package";
            }>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"update">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    tag_name: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    milestones: z.ZodOptional<z.ZodArray<z.ZodString>>;
    released_at: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"delete">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    tag_name: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"create_link">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    tag_name: z.ZodString;
    name: z.ZodString;
    url: z.ZodString;
    direct_asset_path: z.ZodOptional<z.ZodString>;
    link_type: z.ZodOptional<z.ZodEnum<{
        image: "image";
        other: "other";
        runbook: "runbook";
        package: "package";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"delete_link">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    tag_name: z.ZodString;
    link_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>], "action">;
export type ManageReleaseInput = z.infer<typeof ManageReleaseSchema>;
