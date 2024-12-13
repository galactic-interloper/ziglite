import { describe, expect, test, vi } from 'vitest';
import { ensureNoTrailingSlash, ensureTrailingSlash, getCurrentLocation, getLocationAndQuery, isBlank, isString } from '@/helpers/utils';
import { location } from 'tests/fixtures/window.ts';

describe.concurrent('Utilities', () => {
    describe.concurrent('isString()', () => {
        test('Returns true when provided with a native string', async () => {
            expect(isString('abcd')).toBe(true);
            expect(isString(String('abcd'))).toBe(true);
        });

        test('Returns false when provided with something other than a string', async () => {
            expect(isString(123)).toBe(false);
            expect(isString([])).toBe(false);
            expect(isString({})).toBe(false);
        });
    });

    describe.concurrent('isBlank()', () => {
        test('Returns true when provided with a blank-ish value', async () => {
            expect(isBlank('')).toBe(true);
            expect(isBlank('    ')).toBe(true);
            expect(isBlank(String(''))).toBe(true);
            expect(isBlank([])).toBe(true);
            expect(isBlank(undefined)).toBe(true);
            expect(isBlank(null)).toBe(true);
        });

        test('Returns false when provided with something other than a blank-ish value', async () => {
            expect(isBlank(123)).toBe(false);
            expect(isBlank(' s')).toBe(false);
            expect(isBlank(String(' s'))).toBe(false);
            expect(isBlank({})).toBe(false);
            expect(isBlank('undefined')).toBe(false);
            expect(isBlank('null')).toBe(false);
        });
    });

    describe.concurrent('ensureTrailingSlash()', () => {
        test('Adds a trailing slash when it is missing', async () => {
            expect(ensureTrailingSlash('')).toBe('/');
            expect(ensureTrailingSlash('test.url')).toBe('test.url/');
            expect(ensureTrailingSlash(String('test.url'))).toBe('test.url/');
        });

        test('Returns the same value when a trailing slash is present', async () => {
            expect(ensureTrailingSlash('/')).toBe('/');
            expect(ensureTrailingSlash('test.url/')).toBe('test.url/');
            expect(ensureTrailingSlash(String('test.url/'))).toBe('test.url/');
        });
    });

    describe.concurrent('ensureNoTrailingSlash()', () => {
        test('Removes a trailing slash when it is present', async () => {
            expect(ensureNoTrailingSlash('/')).toBe('');
            expect(ensureNoTrailingSlash('test.url/')).toBe('test.url');
            expect(ensureNoTrailingSlash(String('test.url/'))).toBe('test.url');
        });

        test('Returns the same value when a trailing slash is missing', async () => {
            expect(ensureNoTrailingSlash('')).toBe('');
            expect(ensureNoTrailingSlash('test.url')).toBe('test.url');
            expect(ensureNoTrailingSlash(String('test.url'))).toBe('test.url');
        });
    });

    describe.concurrent('getCurrentLocation()', () => {
        test('Returns the correct location when it is available', async () => {
            vi.stubGlobal('window', location(
                'http', 'localhost', 8000, 'test', 'myParam=1', 'hash'
            ));

            expect(getCurrentLocation()).toMatchObject({
                host: "localhost:8000",
                pathname: "/test",
                search: "?myParam=1",
            });

            vi.unstubAllGlobals();
        });

        test('Returns an empty BriefLocation when location is not available', async () => {
            expect(getCurrentLocation()).toMatchObject({
                host: "",
                pathname: "",
                search: "",
            });
        });
    });

    describe.concurrent('getLocationAndQuery()', () => {
        test('Returns the correct location and query', async () => {
            expect(
                getLocationAndQuery('http://ziglite.test')
            ).toMatchObject({
                location: "http://ziglite.test",
                query: ""
            });

            expect(
                getLocationAndQuery('http://ziglite.test/?')
            ).toMatchObject({
                location: "http://ziglite.test/",
                query: ""
            });

            expect(
                getLocationAndQuery('http://ziglite.test/?foo=bar')
            ).toMatchObject({
                location: "http://ziglite.test/",
                query: "foo=bar"
            });

            expect(
                getLocationAndQuery('http://ziglite.test/posts/1/')
            ).toMatchObject({
                location: "http://ziglite.test/posts/1/",
                query: ""
            });

            expect(
                getLocationAndQuery('http://ziglite.test/posts/1/?foo=bar')
            ).toMatchObject({
                location: "http://ziglite.test/posts/1/",
                query: "foo=bar"
            });

            expect(
                getLocationAndQuery('http://ziglite.test/posts/1/??foo=bar')
            ).toMatchObject({
                location: "http://ziglite.test/posts/1/",
                query: "?foo=bar"
            });

            expect(
                getLocationAndQuery('http://ziglite.test/posts/1?foo?bar=???')
            ).toMatchObject({
                location: "http://ziglite.test/posts/1",
                query: "foo?bar=???"
            });

            expect(
                getLocationAndQuery('/posts/1/')
            ).toMatchObject({
                location: "/posts/1/",
                query: ""
            });

            expect(
                getLocationAndQuery('posts/1/')
            ).toMatchObject({
                location: "posts/1/",
                query: ""
            });

            expect(
                getLocationAndQuery('/posts/1/?foo=bar')
            ).toMatchObject({
                location: "/posts/1/",
                query: "foo=bar"
            });

            expect(
                getLocationAndQuery('posts/1/?foo=bar')
            ).toMatchObject({
                location: "posts/1/",
                query: "foo=bar"
            });
        });
    });
});
