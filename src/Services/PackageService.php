<?php

namespace Spatian\Ziglite\Services;

use Illuminate\Support\Str;

final class PackageService {
    private array $composer;
    private string $name;

    public function __construct() {
        $this->composer = json_decode(
            file_get_contents($this->rootDir('composer.json')),
            true, 512, JSON_THROW_ON_ERROR
        );

        $this->name = explode('/', $this->composer['name'])[1];

    }

    public function version(): string {
        return '1.0.0-rc';
    }

    public function name(): string {
        return $this->name;
    }

    public function website(): string {
        return $this->composer['homepage'] ?? '';
    }

    public function displayName(): string {
        return 'Ziglite';
    }

    public function rootDir(string $sub = null): string {
        return __DIR__ . '/../../' . ($sub ?? '');
    }

    public function distDir(string $sub = null): string {
        return $this->rootDir('dist');
    }

    public function configFile(): string {
        return $this->rootDir('config/config.php');
    }

    public function envPropName(string $name): string {
        return Str::upper($this->name() . '_' . $name);
    }

    public function config(string $name, mixed $default = null): string {
        return config($this->name() . '.' . $name, $default);
    }
}
