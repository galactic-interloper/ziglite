import { RouteParametersWithQuery } from '../types/Route.types';
import { RouterConfiguration } from '../types/Router.types';
import { Route } from './Route';
export declare const defaultConfig: () => {
    absolute: boolean;
    strict: boolean;
    qsConfig: {
        addQueryPrefix: boolean;
        encoder: (value: unknown, defaultEncoder: CallableFunction, _charset: string, type: string) => any;
        encodeValuesOnly: boolean;
        skipNulls: boolean;
    };
    base: string;
    defaults: {};
    routes: {};
};
/**
 * @classdesc Routing helper.
 */
export declare class Router {
    #private;
    constructor(config?: string | Partial<RouterConfiguration>);
    get config(): RouterConfiguration;
    set config(value: string | Partial<RouterConfiguration>);
    get base(): string;
    get origin(): string;
    has(name: string): boolean;
    compile(name: string, params: RouteParametersWithQuery): string;
    getRoute(name: string): Route;
}
