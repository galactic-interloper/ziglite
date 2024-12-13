<?php

namespace Spatian\Ziglite\Routes;

use Illuminate\Support\Str;
use Illuminate\Routing\Router;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\App;
use JsonSerializable;
use stdClass;

final class Manifest implements JsonSerializable {
    private const UNFILTERED = 'default';

    protected static array $cache = [];
    private string $base;
    private array $filters;
    private string $filters_hash;
    private array $routes;
    private array $defaults;

    public function __construct(
        array|string $filters = [],
        string $base = null
    ) {
        $url = App::make('url');

        $base = Str::of($base);
        $this->base = rtrim($base->isEmpty() ? $url->to('/') : $base, '/');

        $this->processFilters(Arr::wrap($filters));

        $this->defaults = method_exists($url, 'getDefaultParameters') ?
            $url->getDefaultParameters() : [];

        if (!array_key_exists($this->filters_hash, self::$cache))
            $this->routes = $this->applyFilters();

        $this->routes = self::$cache[$this->filters_hash];
    }

    public static function clearRoutes() {
        static::$cache = [];
    }

    public function jsonSerialize(): array {
        return $this->toArray();
    }

    public function toArray(): array {
        $cls = new stdClass();
        return [
            'base' => $this->base,
            'routes' => (count($this->routes) > 0) ? $this->routes : $cls,
            'defaults' => (count($this->defaults) > 0) ? $this->defaults : $cls,
        ];
    }

    /**
     * @throws \JsonException
     * */
    public function toJson(int $options = 0): string {
        return json_encode($this, JSON_THROW_ON_ERROR | $options);
    }

    private function processFilters(array $filters): void {
        $this->filters_hash = (count($filters) > 0) ?
            $this->filters_hash = md5(implode('|', $filters)) :
            $this->filters_hash = self::UNFILTERED;

        array_walk($filters, function (mixed &$pattern, int $i) {
            $pattern = Str::of($pattern);
            $exclude = $pattern->startsWith('!');
            $pattern = (string) ($exclude ? $pattern->substr(1) : $pattern);
            $pattern = compact('pattern', 'exclude');
        });

        $this->filters = $filters;
    }

    private function applyFilters(): array {
        if (!array_key_exists(self::UNFILTERED, self::$cache))
            self::$cache[self::UNFILTERED] = $this->namedRoutes();

        self::$cache[$this->filters_hash] = [];
        foreach (self::$cache[self::UNFILTERED] as $name => $details) {
            $pass = false;

            foreach ($this->filters as ['pattern' => $pattern, 'exclude' => $exclude]) {
                if (!Str::is($pattern, $name))
                    continue;

                $pass = !$exclude;
                if ($exclude)
                    break;
            }

            if (!$pass)
                continue;

            self::$cache[$this->filters_hash][$name] = $details;
        }
        return self::$cache[$this->filters_hash];
    }

    private function namedRoutes(): array {
        $router = App::make('router');
        /** @var Router $router */

        $cls = new stdClass();
        $routes = [];
        $fallback = [];
        foreach ($router->getRoutes()->getRoutesByName() as $name => $route) {
            if (Str::of($name)->isEmpty())
                continue;

            if ($route->isFallback) {
                $fallback[$name] = $route;
                continue;
            }

            $routes[$name] = [
                'uri' => $route->uri,
                'domain' => $route->domain(),
                'wheres' => (count($route->wheres) > 0) ? $route->wheres : $cls,
            ];
        }

        foreach ($fallback as $name => $route) {
            $routes[$name] = [
                'uri' => $route->uri,
                'domain' => $route->domain(),
                'wheres' => (count($route->wheres) > 0) ? $route->wheres : $cls,
            ];
        }

        return $routes;
    }
}
