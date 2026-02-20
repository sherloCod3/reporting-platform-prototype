import { z } from 'zod';

const ComponentStyleSchema = z
  .object({
    fontFamily: z.string().optional(),
    fontSize: z.number().optional(),
    fontWeight: z.union([z.string(), z.number()]).optional(),
    fontStyle: z.string().optional(),
    textAlign: z.enum(['left', 'center', 'right', 'justify']).optional(),
    color: z.string().optional(),
    backgroundColor: z.string().optional(),
    borderColor: z.string().optional(),
    borderWidth: z.number().optional(),
    borderRadius: z.number().optional(),
    opacity: z.number().optional()
  })
  .optional();

const ComponentSchema = z.object({
  id: z.number(),
  type: z.enum(['text', 'table', 'chart', 'image', 'shape']).or(z.string()),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number().optional(),
  content: z.string().optional(),
  sqlQuery: z.string().optional(),
  style: ComponentStyleSchema,
  // sqlResult nao e persistido, usado apenas em tempo de execucao
  sqlResult: z.any().optional()
});

export const ReportSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  sqlQuery: z.string().optional(),
  components: z.array(ComponentSchema)
});

export type CreateReportDto = z.infer<typeof ReportSchema>;
const ReportUpdateSchema = ReportSchema.partial();
export type UpdateReportDto = z.infer<typeof ReportUpdateSchema>;
