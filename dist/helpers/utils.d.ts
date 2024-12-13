import { BriefLocation, LocationAndQuery } from '../types/utils.types';
/**
 * Checks whether the given value is a string
 */
export declare const isString: (value: unknown) => boolean;
/**
 * Coerce the given value into a string and checks if it's a blank string
 */
export declare const isBlank: (value: unknown) => boolean;
/**
 * Adds a trailing slash to a string if it doesn't have it
 */
export declare const ensureTrailingSlash: (str: string) => string;
/**
 * Removes a trailing slash from a string if it has it
 */
export declare const ensureNoTrailingSlash: (str: string) => string;
/**
 * Retrieves the current location if available
 */
export declare const getCurrentLocation: () => BriefLocation;
/**
 * Splits the query part of a URL and returns both parts
 */
export declare const getLocationAndQuery: (url: string) => LocationAndQuery;
