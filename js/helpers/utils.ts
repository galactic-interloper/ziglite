import type { BriefLocation, LocationAndQuery } from "@/types/utils.types";

/**
 * Checks whether the given value is a string
 */
export const isString = (value: unknown): boolean => {
    return ((typeof value === 'string') || (value instanceof String))
}

/**
 * Coerce the given value into a string and checks if it's a blank string
 */
export const isBlank = (value: unknown): boolean => {
    if ((value === undefined) || value === null)
        return true;

    if (!isString(value))
        value = String(value);

    return (value as string).trim().length === 0;
}

/**
 * Adds a trailing slash to a string if it doesn't have it
 */
export const ensureTrailingSlash = (str: string): string => {
    return str.replace(/\/*$/, '/');
}

/**
 * Removes a trailing slash from a string if it has it
 */
export const ensureNoTrailingSlash = (str: string): string => {
    return str.replace(/\/+$/, '');
}

/**
 * Retrieves the current location if available
 */
export const getCurrentLocation = (): BriefLocation => {
    const location: BriefLocation = {
        host: '',
        pathname: '',
        search: '',
    };

    if (typeof window !== "undefined") {
        location.host = window.location.host;
        location.pathname = window.location.pathname;
        location.search = window.location.search;
    }

    return location;
}

/**
 * Splits the query part of a URL and returns both parts
 */
export const getLocationAndQuery = (url: string): LocationAndQuery => {
    const delimiterIndex = url.indexOf('?');
    const hasDelimiter = (delimiterIndex > -1);

    return {
        location: url.substring(0, hasDelimiter ? delimiterIndex : url.length),
        query: url.substring(hasDelimiter ? delimiterIndex + 1 : url.length)
    };
}
