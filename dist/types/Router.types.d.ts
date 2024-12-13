import { z } from 'zod';
import { BooleanOptional, IStringifyOptions } from 'qs';
export declare const RouterConfigurationFromJsonSchema: z.ZodObject<{
    base: z.ZodString;
    defaults: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    routes: z.ZodRecord<z.ZodString, z.ZodObject<{
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
    }>>;
}, "strip", z.ZodTypeAny, {
    base: string;
    defaults: Record<string, unknown>;
    routes: Record<string, {
        uri: string;
        domain: string | null;
        wheres: Record<string, unknown>;
    }>;
}, {
    base: string;
    defaults: Record<string, unknown>;
    routes: Record<string, {
        uri: string;
        domain: string | null;
        wheres: Record<string, unknown>;
    }>;
}>;
export type RouterConfigurationFromJson = z.infer<typeof RouterConfigurationFromJsonSchema>;
export type RouterConfiguration = RouterConfigurationFromJson & {
    absolute: boolean;
    strict: boolean;
    qsConfig: IStringifyOptions<BooleanOptional>;
};
