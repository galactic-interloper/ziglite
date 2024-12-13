import type { RouteParametersWithQuery } from "@/types/Route.types";
import {
    type RouterConfiguration, RouterConfigurationFromJson,  RouterConfigurationFromJsonSchema
} from "@/types/Router.types";
import { ensureNoTrailingSlash, isString } from "@/helpers/utils";
import { Route } from "@/classes/Route";
import { stringify } from "qs";

const defaultQsConfig = () => ({
    addQueryPrefix: true,
    encoder: (value: unknown, defaultEncoder: CallableFunction, _charset: string, type: string) => {
        if ((type === 'value') && typeof value === 'boolean')
            return value ? 1 : 0;

        return defaultEncoder(value);
    },
    encodeValuesOnly: true,
    skipNulls: true,
});

export const defaultConfig = () => ({
    absolute: false,
    strict: false,
    qsConfig: defaultQsConfig(),

    base: '/',
    defaults: {},
    routes: {},
});

const parseRouterConfig = (config: string): RouterConfigurationFromJson => {
    return RouterConfigurationFromJsonSchema.parse(JSON.parse(config));
};

/**
 * @classdesc Routing helper.
 */
export class Router {
    #config: RouterConfiguration = defaultConfig();

    constructor(config?: string | Partial<RouterConfiguration>) {
        this.config = config ?? {};
    }

    get config(): RouterConfiguration {
        return this.#config;
    }

    set config(value: string | Partial<RouterConfiguration>) {
        value = isString(value) ?
            parseRouterConfig(value as string) :
            (value as Partial<RouterConfiguration>);

        this.#config = {
            ...this.#config,
            ...value,

            qsConfig: {
                ...defaultQsConfig(),
                ... (value?.qsConfig ?? {}),
            },
        };
    }

    get base(): string {
        return ensureNoTrailingSlash(this.#config.base);
    }

    get origin(): string {
        return this.#config.absolute ? this.base : '';
    }

    has(name: string): boolean {
        return Object.hasOwn(this.#config.routes, name);
    }

    compile(name: string, params: RouteParametersWithQuery): string {
        const route = this.getRoute(name);
        const { substituted, url } = route.compile(params);

        const query = params._query ?? {};
        delete params._query;

        for (const key of Object.keys(params)) {
            if (substituted.includes(key))
                continue;

            if (Object.hasOwn(query, key))
                console.warn(`Duplicate "${key}" in params and params.query may cause issues`);

            query[key] = params[key];
        }

        return url + stringify(query, this.#config.qsConfig);
    }

    getRoute(name: string): Route {
        if (!this.has(name))
            throw new Error(`No such route "${name}" in the route list`);
        return new Route(name, this.#config.routes[name], this)
    }
}
