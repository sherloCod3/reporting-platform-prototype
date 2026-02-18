import { z } from "zod";

const ComponentStyleSchema = z.object({
    fontFamily: z.string().optional(),
    fontSize: z.number().optional(),
    fontWeight: z.union([ z.string(), z.number() ]).optional(),
    fontStyle: z.string().optional(),
    textAlign: z.enum([ "left", "center", "right", "justify" ]).optional(),
    color: z.string().optional(),
    backgroundColor: z.string().optional(),
    borderColor: z.string().optional(),
    borderWidth: z.number().optional(),
    borderRadius: z.number().optional(),
    opacity: z.number().optional(),
}).optional();

const ComponentSchema = z.object({
    id: z.number(),
    // Allow other types if they exist, but at least these are known
    type: z.enum([ "text", "table", "chart", "image", "shape" ]).or(z.string()),
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
    rotation: z.number().optional(),
    content: z.string().optional(),
    sqlQuery: z.string().optional(),
    style: ComponentStyleSchema,
    // Allow sqlResult to be passed through or ignored (it's usually computed on frontend or fetched separately)
    // For saving, we usually don't need to save the result data if it's dynamic
    sqlResult: z.any().optional(),
});

export const ReportSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    sqlQuery: z.string().optional(), // Metadata SQL for the whole report if applicable
    components: z.array(ComponentSchema),
});

export type CreateReportDto = z.infer<typeof ReportSchema>;
const ReportUpdateSchema = ReportSchema.partial();
export type UpdateReportDto = z.infer<typeof ReportUpdateSchema>;
