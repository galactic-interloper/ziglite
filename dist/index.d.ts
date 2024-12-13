import { RouterConfiguration } from './types/Router.types';
import { RouteParametersWithQuery } from './types/Route.types';
/**
 * Set router configuration
 *
 * @param {string|Partial<RouterConfiguration>|undefined} config Configuration object or JSON string
 * @returns {RouterConfiguration} The updated configuration of the router
 */
export declare const configureRouter: (config?: string | Partial<RouterConfiguration>) => RouterConfiguration;
/**
 * Substitutes the given parameters in the URL corresponding to the given route name,
 * and returns the compiled result
 *
 * @param {string} name Route name
 * @param {RouteParametersWithQuery|undefined} [params] Key-value substitutions Object
 * @returns {string} Compiled URL for the specified name
 */
export declare const route: (name: string, params?: RouteParametersWithQuery) => string;
/**
 * Check if this router instance has a route with the given name.
 *
 * @param {string} name Route name
 * @returns {boolean} True if this router instance has a route with the given name, or false otherwise.
 */
export declare const hasRoute: (name: string) => boolean;
export { Router } from './classes/Router';
