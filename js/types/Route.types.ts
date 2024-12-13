import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const RouteTokensSchema = z.record(z.string(), z.boolean());
const RouteParameterValueSchema = z.union([z.string(), z.number(), z.boolean()]);
export const RouteParametersSchema = z.record(
	z.unknown(),
    RouteParameterValueSchema,
);

const RouteQueryParametersSchema = z.object({
    _query: z.record(
        RouteParametersSchema.keySchema,
        RouteParametersSchema.valueSchema.or(z.array(RouteParameterValueSchema)),
    ).optional(),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const RouteParametersWithQuerySchema = z.intersection(
    RouteParametersSchema, RouteQueryParametersSchema
);

export const RouteDetailsSchema = z.object({
    uri: z.string(),
    domain: z.string().nullable(),
    wheres: RouteParametersSchema,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const RouteCompilationResultSchema = z.object({
    substituted: z.array(z.string()),
    url: z.string(),
});

export type RouteTokens = z.infer<typeof RouteTokensSchema>;
export type RouteParametersWithQuery = z.infer<typeof RouteParametersWithQuerySchema>;
export type RouteDetails = z.infer<typeof RouteDetailsSchema>;
export type RouteCompilationResult = z.infer<typeof RouteCompilationResultSchema>;
