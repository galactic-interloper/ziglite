# Ziglite - A Laravel route name translator for Javascript
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/spatian-dev/ziglite/test.yaml?label=Build&branch=1.x)
![Packagist Version](https://img.shields.io/packagist/v/spatian-dev/ziglite?label=Packagist)
![Packagist Downloads](https://img.shields.io/packagist/dt/spatian-dev/ziglite?label=Packagist%20downloads)
![NPM Version](https://img.shields.io/npm/v/ziglite?label=NPM)
![NPM Downloads](https://img.shields.io/npm/d18m/ziglite?label=NPM%20downloads)

## What is Ziglite?
[Ziglite](https://ziglite.spatian.dev) provides a way for Laravel developers to use their route names in the front end.\
This package is inspired by, and a lightweight minimalistic alternative to, the excellent and feature-rich [Ziggy](https://github.com/tighten/ziggy) by [Tighten.co](https://tighten.com/).

- **[Quick Start](#quick-start)**
- **[Why Ziglite?](#why-ziglite)**
- **[Route Filtering](#route-filtering)**
- **[The Routes Manifest](#the-routes-manifest)**
    - [Filters](#filters)
    - [Custom Origin](#custom-origin)
    - [Caching](#caching)
    - [Serializing to JSON](#serializing-to-json)
- **[The Blade Directive](#the-blade-directive)**
    - [Custom Directives and Custom Generators](#custom-directives-and-custom-generators)
- **[The Front-end Helpers](#the-front-end-helpers)**
    - [The `configureRouter()` helper](#the-configurerouter-helper)
    - [The `route()` and `hasRoute()` helpers](#the-route-and-hasroute-helpers)
    - [Default Parameters](#default-parameters)
    - [Generating Absolute URLs](#generating-absolute-urls)
    - [Extra Query Parameters](#extra-query-parameters)
    - [The Router Class](#the-router-class)
    - [Strict Mode](#strict-mode)
- **[Contributing](#contributing)**
- **[Credits](#credits)**
- **[License](#license)**

## Quick Start
Install Ziglite in your Laravel application or package with Composer:
```shell
composer require spatian-dev/ziglite
npm install --save-dev ziglite
```

Include the default directive in your Blade `@ziglite("*")`:
> **⚠️Warning:** This will expose all the named routes and their parameters in your application to the front-end, which may not be desirable.\
> See [Route filtering](#route-filtering) to learn about including and excluding routes.

Configure the javascript helpers:
```javascript
import { configureRouter } from 'ziglite';
configureRouter(ziglite_data);
```

Use the `route()` helper to translate named routes to URLs:
```javascript
import { route } from 'ziglite';
route('users.update', {user: 5});
```
> **⚠️Warning:** Ziglite does not support [Encoded Forward Slashes](https://laravel.com/docs/11.x/routing#parameters-encoded-forward-slashes). See [strict mode](#strict-mode) for more information.

## Why Ziglite?
Ziglite intentionally forgoes some of the more advanced features of Ziggy in favor of a concise feature set, and an easier integration for Laravel Package developers.
For example, Ziglite's filtering is simplified, and more restrictive by default.\
It is also easier to integrate into a Laravel package, allowing the developer to define custom aliases to the default Blade directive, to use custom output generators, and to have greater control of filtering.

## Route Filtering
Ziglite only includes named routes that match explicitly provided filters. The filtering is based on [pattern-matching capabilities provided by Laravel's Str helper](https://laravel.com/docs/11.x/strings#method-str-is).

Exclusion can be defined by starting the pattern with a `!`
> **ℹ️** Exclusions patterns are always prioritized over inclusion patterns, regardless of the order in which they are defined.

For example:
- `*` will include all named routes
- `!users.*` will exclude all named routes starting with `users.`
- `!*.index` will exclude all named routes ending with `.index`
- `home` will include the route named `home`

You can provide as many inclusion or exclusion patterns as necessary
```PHP
use Spatian\Ziglite\Routes\Manifest;

new Manifest(["*", "!admin.*", "!api.*"]);

// in blade
@ziglite(["*", "!admin.*", "!api.*"]);
```

## The Routes Manifest
The core of Ziglite revolves around the [`\Spatian\Ziglite\Routes\Manifest`](src/Routes/Manifest.php) class. This class collects and caches your application's named routes, and generates a list of named routes that match the provided filters.

### Filters
By default, a `Manifest` instance will only include named routes that match the provided filters. If no filters are provided, then no routes are included.\
Filtering patterns can be provided as the first argument to the constructor. 
```PHP
use Spatian\Ziglite\Routes\Manifest;

new Manifest(); // No routes included

new Manifest("*"); // A single pattern
new Manifest(["*", "!admin.*", "!api.*"]); // A list of patterns
```
See [Route filtering](#route-filtering) to learn more about filtering.

### Custom Origin
You can specify a custom origin to be included in the manifest.
```PHP
use Spatian\Ziglite\Routes\Manifest;

new Manifest(base: 'https://example.test');
```

### Caching
The `Manifest` class caches previously generated manifests for the duration of a request. Subsequent calls with the same filtering patterns simply return the previously calculated result.\
If this is not desirable, you can clear this cache using :
```PHP
use Spatian\Ziglite\Routes\Manifest;

Manifest::clearRoutes();
```

### Serializing to JSON
The `Manifest` class implements [`JsonSerializable`](https://www.php.net/manual/en/class.jsonserializable.php) and a `toJson()` function to simplify serializing to JSON.
```PHP
use Spatian\Ziglite\Routes\Manifest;

json_encode(new Manifest());
(new Manifest())->toJson();
```

## The Blade Directive
By default, Ziglite defines a `@ziglite` blade directive. This directive uses the default [`JavascriptDataTagGenerator`](src/Generators/JavascriptDataTagGenerator.php) to include a manifest as a JSON object in a blade.\
The JSON object is assigned to a `ziglite_data` variable on the `window` global.

```PHP
@ziglite("*")
```

```javascript
console.log(ziglite_data);
```
### Custom Directives and Custom Generators
You can define your custom generators by implementing the [`OutputGeneratorInterface`](src/Interfaces/OutputGeneratorInterface.php). This requires implementing a `make()` function that generates the output as a string.

```PHP
make(array|string $filters = [], string $base = null, string $nonce = ''): string
```

- `$filters` pattern or list of patterns for [filtering](#route-filtering)
- `$base` [custom origin](#custom-origin) to be included in the output
- `$nonce` a [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) nonce to be included in the output.

You can also define a custom blade directive that uses your custom generator using the `setupBladeDirective()` function from the [`ZigliteServiceProvider`](src/Providers/ZigliteServiceProvider.php). In your `AppServiceProvider`:
```PHP
use Spatian\Ziglite\Providers\ZigliteServiceProvider;

app(ZigliteServiceProvider::class)->setupBladeDirective('mydirective', new MyCustomOutputGenerator());
```

## The Front-end Helpers
By default, Ziglite does not globally import its javascript helpers. Instead, it defers to the developer to include them and use them as they see fit.\
For your convenience, the javascript library is both included in the PHP package installed through Composer, and published to a separate NPM package.

> **ℹ️** The examples shown below show the usage of the NPM package.\
> However if you're using the javascript library from the composer package, you will need to adjust your import statements.\
> Additionally, if you're using typescript, you might need to include the path to Ziglite in your `vendor` folder to your `compilerOptions` for types to be detected properly.

The library does however include a default instance of [the `Router` class](#the-router-class). You can interact with this instance through the helper functions below.

### The `configureRouter()` helper
Use this function to set the configuration for the default `Router` instance. 
```javascript
import { configureRouter } from 'ziglite';

configureRouter(ziglite_data);

configureRouter({
    strict: false,
    absolute: true,
    base: 'https://example.test',
});
```

### The `route()` and `hasRoute()` helpers
The `route()` function translates a named route to a URL using the default `Router` instance. This function works similarly to Laravel's `route()`.

```javascript
import { route } from 'ziglite';

route('home');

route('users.show', {user: 5});
```

The `hasRoute()` function checks if the default `Router` instance has a configured route that matches the given name.

```javascript
import { hasRoute } from 'ziglite';

hasRoute('home');   // assuming a route named 'home' exits, return true;
hasRoute('inexistant');   // assuming no route named 'inexistant' exits, return false;
```

### Default Parameters
Ziglite supports [Laravel's default parameters](https://laravel.com/docs/11.x/urls#default-values).

```javascript
import { route } from 'ziglite';
/*
    Given a route named 'users.show' defined as /{locale}/users/{user},
    and configured route default ['locale' => 'en']
*/
route('users.show', {user: 5}); // https://example.test/en/users/5
```

### Generating Absolute URLs
By default, Ziglite will generate relative URLs. To generate absolute URLs instead, set the `absolute` configuration to `true`;

```javascript
import { configureRouter, route } from 'ziglite';

configureRouter({
    absolute: true,
    base: 'https://example.test',
    // ...
});

route('users.show', {user: 5}); // https://example.test/users/5
```

### Extra Query Parameters
Ziglite will automatically add any unmatched parameters as a query string to the resulting URL:

```javascript
import { route } from 'ziglite';

route('users.show', {user: 5, extra: 2}); // https://example.test/users/5?extra=2
```

If you need to add query-string parameters that have the same name as your route's parameter, you can do so under a `_query` object:
```javascript
import { route } from 'ziglite';

route('users.show', {
    user: 5,
    extra: 2,
    _query: {
        user: 'Tony'
    },
}); // https://example.test/users/5?extra=2&user=Tony
```

By default, booleans are converted to integers
```javascript
import { route } from 'ziglite';

route('users.show', {
    user: 5,
    locked: true,
}); // https://example.test/users/5?locked=1
```

### The Router Class
The [`Router`](js/classes/Router.ts) provides the core of Ziglite's javascript functionality.\
If you would like to use Ziglite's features without modifying the default instance, you might create your own `Router` instance:

```javascript
import { Router } from 'ziglite';

const config = {
    absolute: true,
    base: 'https://example.test',
    defaults: {
        locale: 'en',
    },
    routes: [ /* ... */],
};

const myRouter = new Router();
myRouter.config = config;

// or
const myRouter = new Router(config);

// check if the given named route exists
myRouter.has('home');

// translate the given named route and parameters to a URL
myRouter.compile('users.show', {user: 5}); // https://example.test/users/5
```

### Strict Mode
Ziglite does not support [Encoded Forward Slashes](https://laravel.com/docs/11.x/routing#parameters-encoded-forward-slashes). This has historically been buggy, inconsistent and overall not a reliable feature to implement.\
By default, Ziglite will issue a warning in your console if it encounters a forward slash, plain (`/`) or encoded (`%2F`), in a parameter value.\
If you enable strict mode, Ziglite will throw an error instead.

```javascript
import { configureRouter, route } from 'ziglite';

configureRouter({
    strict: true,
    // ...
});

route('users.show', {user: 'test/test'}); // throws
```

## Contributing
Please consult the [contribution guide](CONTRIBUTING.md).

## Credits
- This package is heavily inspired by the excellent and feature-rich [Ziggy](https://github.com/tighten/ziggy) by [Tighten.co](https://tighten.com/). Shout out to them.
- [Saad Sidqui](https://github.com/saadsidqui)
- [All the contributors](https://github.com/spatian-dev/ziglite/graphs/contributors)

## License
Ziglite is free and open-source software released under the Apache 2.0 license. See [LICENSE](LICENSE) for more information.
