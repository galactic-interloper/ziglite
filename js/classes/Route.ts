import type {
    RouteCompilationResult, RouteDetails, RouteParametersWithQuery, RouteTokens
} from "@/types/Route.types";
import type { Router } from "@/classes/Router";

import { ensureNoTrailingSlash, getLocationAndQuery, isBlank } from "@/helpers/utils.js";
import { parse } from "qs";

/**
 * @classdesc A class representing a route.
 */
export class Route {
    #name: string;
    #details: RouteDetails;
    #router: Router;

    constructor(name: string, details: RouteDetails, router: Router) {
        this.#name = name;
        this.#details = details;
        this.#router = router;
    }

    /**
     * Retruns the route's origin
     */
    get origin(): string {
        const hasDomain = !isBlank(this.#details.domain);

        // if route has a domain, always return an absolute origin.
        if (hasDomain) {
            const scheme = this.#router.base.match(/^(http|https):\/\//);
            return ensureNoTrailingSlash((scheme?.[0] ?? '') + this.#details.domain);
        }

        if (!this.#router.config.absolute)
            return '';

        // no domain, return absolute origin.
        return ensureNoTrailingSlash(this.#router.origin);
    }

    /**
     * Retruns the route's template
     */
    get template(): string {
        const template = ensureNoTrailingSlash(`${this.origin}/${this.#details.uri}`);
        return isBlank(template) ? '/' : template;
    }

    /**
     * Retruns the route's template expected parameters
     */
    get expects(): RouteTokens {
        const tokens: RouteTokens = {};
        const matches = this.template.match(/{\w+\??}/g) ?? [];
        for (const m of matches) {
            const name = m.replace(/\W/g, '');
            // if this parameter name appears more than once in the template
            // make sure to mark it as required if it is required in all of
            // the template occurences.
            tokens[name] = m.includes('?') || (tokens[name] ?? false);
        }
        return tokens;
    }

    /**
     * Return the compiled URI for this route, along with an array of substituted tokens.
     */
    compile(params: RouteParametersWithQuery): RouteCompilationResult {
        const substituted = new Array<string>();

        const tokens = this.expects;
        const tokenKeys = Object.keys(tokens);
        if (tokenKeys.length < 1)
            return { substituted, url: this.template };

        let template = this.template;

        for (const token of tokenKeys) {
            const optional = tokens[token]

            let paramValue = params?.[token] ?? this.#router.config.defaults?.[token] ?? '';
            if (typeof paramValue == 'boolean') {
                paramValue = paramValue ? 1 : 0;
            }
            const replacement = String(paramValue);

            if (!optional) {
                if (isBlank(replacement)) {
                    throw new Error(
                        `Missing required parameter "${token}" for route "${this.#name}"`
                    );
                }

                if (Object.hasOwn(this.#details.wheres, token)) {
                    const where = this.#details.wheres[token];
                    const matches = new RegExp(`^${where}$`).test(replacement);
                    if (!matches) {
                        throw new Error(
                            `Parameter "${token}" for route "${this.#name}" ` +
                            `does not match format "${where}"`
                        );
                    }
                }
            }

            const re = new RegExp(`{${token}\\??}`, 'g');
            if (re.test(template)) {
                const encoded = encodeURIComponent(replacement);
                template = ensureNoTrailingSlash(template.replace(re, encoded));
                substituted.push(token);

                /**
                 * Not too sure what to do about this.
                 * For now we will encode everything and warn (or error if strict mode),
                 * if a parameter contains slashes.
                 * @see https://github.com/laravel/framework/issues/22125
                 * @see https://github.com/laravel/framework/blob/11.x/src/Illuminate/Routing/RouteUrlGenerator.php#L36
                 * @see https://github.com/tighten/ziggy/pull/662
                 */
                if (/\/|%2F/g.test(encoded)) {
                    const message = `Character "/" or sequence "%2F" in parameter "${token}" for ` +
                        `route "${this.#name}" might cause routing issues.`;
                    if (this.#router.config.strict) {
                        throw new Error(
                            message +
                            '\n\tAn error was thrown because you enabled strict mode.\n'
                        );
                    } else {
                        console.warn(message);
                    }
                }
            }
        }
        return { substituted, url: template };
    }

    /**
     * Determine if the current route template matches the given URL.
     */
    matches(url: string): RouteParametersWithQuery | false {
        const schemeRegex = /^[a-z]*:\/\//i;
        let template = this.template;

        // if this URL has no domain or has a domain that doesn not expect parameters
        // then remove the origin part from the incoming URL as we do not need to match against it
        if (!this.#details.domain?.includes('{')) {
            url = url.replace(/^[a-z]*:\/\/([a-z]*\.?)*/i, '');
            url += url.startsWith('/') ? '' : '/';

            template = template.replace(/^[a-z]*:\/\/([a-z]*\.?)*/i, '');
            template += template.startsWith('/') ? '' : '/';
        } else {
            url = url.replace(schemeRegex, '');
        }

        const { location, query } = getLocationAndQuery(url);

        const escape_regex = /[/\\^$.|?*+()[\]{}]/g;
        const token_regex = /\\{(\w+)(\\\?)?\\}/g;

        const template_regex = template
            .replace(schemeRegex, '')
            .replace(escape_regex, '\\$&')
            .replace(token_regex, (_, token, isOptional) => {
                const tokenMatcher =
                    this.#details.wheres[token] ?? '[^/]+';
                return `${isOptional ? '?' : ''}(?<${token}>${tokenMatcher})${isOptional ? '?' : ''}`
            });

        const match = new RegExp(`^${template_regex}/?$`).exec(location);

        if (match === null)
            return false;

        for (const token in match.groups) {
            if (Object.hasOwn(match.groups, token)) {
                if (match.groups[token] === undefined)
                    continue;
                match.groups[token] = decodeURIComponent(match.groups[token]);
            }
        }

        return {
            ...match.groups,
            _query: parse(query),
        };
    }
}
