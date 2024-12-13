import { beforeEach, describe, expect, test, vi } from 'vitest';
import defaultJson from 'tests/fixtures/default.json';
import minimalJson from 'tests/fixtures/minimal.json';
import { RouterConfiguration } from '@/types/Router.types';

beforeEach(() => {
    vi.resetModules();
});

describe('Package Exports', () => {
    describe('configureRouter()', () => {
        test('Correctly parses configuration from a valid JSON string', async () => {
            const { configureRouter } = await import('@/index');
            expect(configureRouter(minimalJson)).toMatchObject({
                base: 'http://ziglite.test',
                defaults: {},
                routes: {
                    home: {
                        uri: '/',
                        domain: null,
                        wheres: {}
                    },
                },
            });
        });

        test('Correctly parses configuration from a valid configuration object', async () => {
            const { configureRouter } = await import('@/index');
            const config: RouterConfiguration = {
                absolute: true,
                strict: true,
                qsConfig: {
                    addQueryPrefix: false,
                    encodeValuesOnly: false,
                    strictNullHandling: true,
                    skipNulls: false,
                },
                base: 'http://ziglite.local',
                defaults: {
                    foo: 'bar',
                },
                routes: {
                    dashboard: {
                        uri: '/dashboard',
                        domain: null,
                        wheres: {}
                    },
                },
            };
            expect(configureRouter(config)).toMatchObject(config);
        });
    });

    describe('route()', () => {
        test('Generates a relative URL with no parameters', async () => {
            const { route, configureRouter } = await import('@/index');
            configureRouter(defaultJson);
            expect(route('home')).toBe('/');
        });

        test('Generates an absolute URL with no parameters', async () => {
            const { route, configureRouter } = await import('@/index');
            configureRouter(defaultJson);
            configureRouter({ absolute: true });
            expect(route('home')).toBe('http://ziglite.test');
        });

        test('Generates a URL with a string', async () => {
            const { route, configureRouter } = await import('@/index');
            configureRouter(defaultJson);
            expect(route('users.delete', {
                user: 'username',
            })).toBe('/users/delete/username');
        });

        test('Generates a URL with an integer', async () => {
            const { route, configureRouter } = await import('@/index');
            configureRouter(defaultJson);
            expect(route('users.delete', {
                user: 1,
            })).toBe('/users/delete/1');
        });

        test('Generates a URL with a boolean', async () => {
            const { route, configureRouter } = await import('@/index');
            configureRouter(defaultJson);
            expect(route('users.delete', {
                user: true,
            })).toBe('/users/delete/1');
        });

        test('Generates a URL with required parameters', async () => {
            const { route, configureRouter } = await import('@/index');
            configureRouter(defaultJson);
            expect(route('posts.comments.show', {
                post: 5,
                comment: 9,
            })).toBe('/posts/5/comments/9');

            expect(route('markdown', {
                file: 'readme',
            })).toBe('/readme.md');
        });

        test('Throws an error if a required parameter is not provided', async () => {
            const { route, configureRouter } = await import('@/index');
            configureRouter(defaultJson);
            expect(() => route('users.edit')).toThrow(
                'Missing required parameter "user" for route "users.edit"'
            );
        });

        test('Generates a URL with omitted optional parameters', async () => {
            const { route, configureRouter } = await import('@/index');
            configureRouter(defaultJson);
            expect(route('posts.archives.restore')).toBe('/posts/archives/restore');
        });

        test('Generates a URL with provided optional parameters', async () => {
            const { route, configureRouter } = await import('@/index');
            configureRouter(defaultJson);
            expect(route('posts.archives.restore', {
                post: 5,
            })).toBe('/posts/archives/restore/5');
        });

        test('Generates a URL with default parameters', async () => {
            const { route, configureRouter } = await import('@/index');
            configureRouter(defaultJson);
            expect(route('defaults')).toBe('/defaults/bar');
        });

        test('Generates a URL with overriden default parameters', async () => {
            const { route, configureRouter } = await import('@/index');
            configureRouter(defaultJson);
            expect(route('defaults', {
                foo: 'foo'
            })).toBe('/defaults/foo');
        });

        test('Generates a URL for a route with a domain', async () => {
            const { route, configureRouter } = await import('@/index');
            configureRouter(defaultJson);
            expect(route('regions.map', {
                region: 'east',
            })).toBe('http://east.domain.test/map');
        });

        test('Throws an error if a parameter does not match it\'s "where()" format', async () => {
            const { route, configureRouter } = await import('@/index');
            configureRouter(defaultJson);
            expect(() => route('regions.map', {
                region: 'nyc.east',
            })).toThrow(
                'Parameter "region" for route "regions.map" does not match format "[a-zA-Z0-9]+"'
            );
        });

        test('Generates a URL for a route with a nested sub-domain', async () => {
            const { route, configureRouter } = await import('@/index');
            configureRouter(defaultJson);
            expect(route('regions.nested', {
                region: 'nyc.east',
            })).toBe('http://nyc.east.domain.test/nested');
        });

        test('Generates a URL for a route with a nested sub-domain using separate parts', async () => {
            const { route, configureRouter } = await import('@/index');
            configureRouter(defaultJson);
            expect(route('regions.parts', {
                city: 'nyc',
                region: 'east',
            })).toBe('http://nyc.east.domain.test/parts');
        });

        test('Generates a URL with extra query parameters', async () => {
            const { route, configureRouter } = await import('@/index');
            configureRouter(defaultJson);

            expect(route('posts.show', {
                post: 5,
                foo: 'bar',
                _query: {
                    post: 'bar',
                    array: [1, 2],
                    bool: true,
                    obj: {
                        ab: 'cd',
                        ef: 'gh',
                    },
                },
            })).toBe('/posts/5?post=bar&array[0]=1&array[1]=2&bool=1&obj[ab]=cd&obj[ef]=gh&foo=bar');
        });

        test('Encodes parameter values in generated URL', async () => {
            const { route, configureRouter } = await import('@/index');
            const value = '$&+,/:;=?@|#%';

            configureRouter(defaultJson);

            expect(route('posts.show', {
                post: value,
                foo: value,
            })).toBe('/posts/%24%26%2B%2C%2F%3A%3B%3D%3F%40%7C%23%25?foo=%24%26%2B%2C%2F%3A%3B%3D%3F%40%7C%23%25');
        });
    });

    describe('hasRoute()', () => {
        test('Returns true if a route with the given name exists', async () => {
            const { configureRouter, hasRoute } = await import('@/index');
            configureRouter(defaultJson);
            expect(hasRoute('users.addresses.update')).toBe(true);
        });
        test('Returns false if a route with the given name does not exist', async () => {
            const { configureRouter, hasRoute } = await import('@/index');
            configureRouter();
            expect(hasRoute('inexistant')).toBe(false);
        });
    });
});
