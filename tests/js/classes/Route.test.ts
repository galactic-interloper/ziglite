import { beforeEach, describe, expect, test, vi } from 'vitest';
import defaultJson from 'tests/fixtures/default.json';
import { RouteParametersWithQuery } from '@/types/Route.types.ts';
import { RouterConfiguration } from '@/types/Router.types.ts';

beforeEach(() => {
    vi.resetModules();
});

describe('Route class', () => {
    describe('matches()', () => {
        test.each([
            [
                'a relative URL with no parameters',
                null,
                'home', '/', {
                    _query: {}
                },
            ],
            [
                'an absolute URL with no parameters',
                { absolute: true },
                'home', 'http://ziglite.test', {
                    _query: {}
                },
            ],
            [
                'a URL with required parameters',
                null,
                'posts.comments.show', '/posts/5/comments/9', {
                    post: "5",
                    comment: "9",
                    _query: {}
                },
            ],
            [
                'a URL with required parameters',
                null,
                'markdown', '/readme.md', {
                    file: "readme",
                    _query: {}
                },
            ],
            [
                'a URL with omitted optional parameters',
                null,
                'posts.archives.restore', '/posts/archives/restore', {
                    post: undefined,
                    _query: {}
                },
            ],
            [
                'a URL with provided optional parameters',
                null,
                'posts.archives.restore', '/posts/archives/restore/5', {
                    post: "5",
                    _query: {}
                },
            ],
            [
                'a URL with default parameters',
                null,
                'defaults', '/defaults/bar', {
                    foo: "bar",
                    _query: {}
                },
            ],
            [
                'a URL with overriden default parameters',
                null,
                'defaults', '/defaults/foo', {
                    foo: "foo",
                    _query: {}
                },
            ],
            [
                'a URL for a route with a domain',
                null,
                'regions.map', 'http://east.domain.test/map', {
                    region: "east",
                    _query: {}
                },
            ],
            [
                'a URL for a route with a nested sub-domain',
                null,
                'regions.nested', 'http://nyc.east.domain.test/nested', {
                    region: "nyc.east",
                    _query: {}
                },
            ],
            [
                'a URL for a route with a nested sub-domain using separate parts',
                null,
                'regions.parts', 'http://nyc.east.domain.test/parts', {
                    city: "nyc",
                    region: "east",
                    _query: {}
                },
            ],
            [
                'a URL with extra query parameters',
                null, 'posts.show',
                '/posts/5?post=bar&array[0]=1&array[1]=2&bool=1&obj[ab]=cd&obj[ef]=gh&foo=bar', {
                    post: "5",
                    _query: {
                        post: "bar",
                        array: ["1", "2"],
                        bool: "1",
                        obj: {
                            ab: 'cd',
                            ef: 'gh',
                        },
                        foo: "bar",
                    },
                },
            ],
            [
                'a URL with encoded query parameters',
                null, 'posts.show',
                '/posts/%24%26%2B%2C%2F%3A%3B%3D%3F%40%7C%23%25?foo=%24%26%2B%2C%2F%3A%3B%3D%3F%40%7C%23%25', {
                    post: "$&+,/:;=?@|#%",
                    _query: {
                        foo: "$&+,/:;=?@|#%",
                    },
                },
            ],
        ])('Matches %s', async (
            _: string, cfg: null | Partial<RouterConfiguration>, route: string,
            url: string, e: RouteParametersWithQuery
        ) => {
            const { Router } = await import('@/classes/Router');
            const router = new Router(defaultJson);
            if (cfg !== null)
                router.config = cfg;
            expect(router.getRoute(route).matches(url)).toStrictEqual(e);
        });

        test.each([
            [
                'a relative URL with no parameters',
                null, 'home', '/not-home'
            ],
            [
                'a relative URL with no parameters',
                null, 'markdown', '/'
            ],
            [
                'an absolute URL with no parameters',
                { absolute: true }, 'markdown', 'http://ziglite.test/'
            ],
            [
                'an absolute URL with no parameters',
                { absolute: true }, 'home', 'http://ziglite.test/not-home'
            ],
            [
                'a URL with required parameters',
                null, 'posts.comments.show', '/images/5/comments/9'
            ],
            [
                'a URL with required parameters',
                null, 'markdown', '/readme.md/foo'
            ],
            [
                'a URL with omitted optional parameters',
                null,
                'posts.archives.restore', '/posts/archives/reset'
            ],
            [
                'a URL with provided optional parameters',
                null,
                'posts.archives.restore', '/posts/archives/reset/5'
            ],
            [
                'a URL with default parameters',
                null, 'defaults', '/defaults/bar/foo'
            ],
            [
                'a URL with overriden default parameters',
                null, 'defaults', '/defaults/foo/bar'
            ],
            [
                'a URL for a route with a domain',
                null,
                'regions.map', 'http://east.wrong.test/map'
            ],
            [
                'a URL for a route with a domain that does not match it\'s "where()" format',
                null,
                'regions.map', 'http://nyc.east.domain.test/map'
            ],
            [
                'a URL for a route with a nested sub-domain',
                null,
                'regions.nested', 'http://nyc.east.domain.test/foo'
            ],
            [
                'a URL for a route with a nested sub-domain using separate parts',
                null, 'regions.parts', 'http://nyc.east.domain.test/foo'
            ],
            [
                'a URL for a route with a nested sub-domain using separate parts that do not match it\'s "where()" format',
                null, 'regions.parts', 'http://ny-city.east.domain.test/parts'
            ],
            [
                'a URL with extra query parameters', null, 'posts.show',
                '/comments/5?post=bar&array[0]=1&array[1]=2&bool=1&obj[ab]=cd&obj[ef]=gh&foo=bar'
            ],
            [
                'a URL with encoded query parameters', null, 'posts.show',
                '/entries/%24%26%2B%2C%2F%3A%3B%3D%3F%40%7C%23%25?foo=%24%26%2B%2C%2F%3A%3B%3D%3F%40%7C%23%25'
            ],
        ])('Does not match %s', async (
            _: string, cfg: null | Partial<RouterConfiguration>, route: string,
            url: string
        ) => {
            const { Router } = await import('@/classes/Router');
            const router = new Router(defaultJson);
            if (cfg !== null)
                router.config = cfg;
            expect(router.getRoute(route).matches(url)).toBe(false);
        });
    });
});
