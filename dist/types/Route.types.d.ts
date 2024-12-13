import { z } from 'zod';
declare const RouteTokensSchema: z.ZodRecord<z.ZodString, z.ZodBoolean>;
export declare const RouteParametersSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
declare const RouteParametersWithQuerySchema: z.ZodIntersection<z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodObject<{
    _query: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodUnknown, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>, "many">]>>>;
}, "strip", z.ZodTypeAny, {
    _query?: Record<string, unknown> | undefined;
}, {
    _query?: Record<string, unknown> | undefined;
}>>;
export declare const RouteDetailsSchema: z.ZodObject<{
    uri: z.ZodString;
    domain: z.ZodNullable<z.ZodString>;
    wheres: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    uri: string;
    domain: string | null;
    wheres: Record<string, unknown>;
}, {
    uri: string;
    domain: string | null;
    wheres: Record<string, unknown>;
}>;
declare const RouteCompilationResultSchema: z.ZodObject<{
    substituted: z.ZodArray<z.ZodString, "many">;
    url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    substituted: string[];
    url: string;
}, {
    substituted: string[];
    url: string;
}>;
export type RouteTokens = z.infer<typeof RouteTokensSchema>;
export type RouteParametersWithQuery = z.infer<typeof RouteParametersWithQuerySchema>;
export type RouteDetails = z.infer<typeof RouteDetailsSchema>;
export type RouteCompilationResult = z.infer<typeof RouteCompilationResultSchema>;
export {};
