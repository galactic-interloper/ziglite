import { Router } from './Router';
import { RouteCompilationResult, RouteDetails, RouteParametersWithQuery, RouteTokens } from '../types/Route.types';

/**
 * @classdesc A class representing a route.
 */
export declare class Route {
    #private;
    constructor(name: string, details: RouteDetails, router: Router);
    /**
     * Retruns the route's origin
     */
    get origin(): string;
    /**
     * Retruns the route's template
     */
    get template(): string;
    /**
     * Retruns the route's template expected parameters
     */
    get expects(): RouteTokens;
    /**
     * Return the compiled URI for this route, along with an array of substituted tokens.
     */
    compile(params: RouteParametersWithQuery): RouteCompilationResult;
}
