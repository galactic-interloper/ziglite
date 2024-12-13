<?php

namespace Spatian\Ziglite\Services;

use Illuminate\Support\Str;
use Illuminate\Contracts\Foundation\Application;
use Spatian\Ziglite\Interfaces\OutputGeneratorInterface;
use Illuminate\View\Compilers\BladeCompiler;
use Spatian\Ziglite\Generators\JavascriptDataTagGenerator;

final class PackageService {
    private array $composer;
    private string $name;

    public function __construct() {
        $this->composer = json_decode(
            file_get_contents($this->rootDir('composer.json')),
            true,
            512,
            JSON_THROW_ON_ERROR
        );

        $this->name = explode('/', $this->composer['name'])[1];
    }

    public function version(): string {
        return '1.1.0';
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
        return $this->rootDir('dist/' . $sub);
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

    public function setupBladeDirective(
        string $name = null,
        OutputGeneratorInterface $generator = null
    ): void {
        $app = app();
        /** @var Application $app */

        if ($app->resolved('blade.compiler')) {
            $this->registerBladeDirective($app['blade.compiler'], $name, $generator);
        } else {
            $app->afterResolving(
                'blade.compiler',
                fn (BladeCompiler $blade) => $this->registerBladeDirective($blade, $name, $generator)
            );
        }
    }

    private function registerBladeDirective(
        BladeCompiler $blade,
        string $directive = null,
        OutputGeneratorInterface $generator = null,
    ): void {
        $directive = $directive ?? $this->name();
        $class = is_null($generator) ? JavascriptDataTagGenerator::class : $generator::class;
        $blade->directive(
            $directive,
            function (string $expr = '') use ($class) {
                return "<?php echo (new \\{$class}())->make({$expr}); ?>";
            }
        );
    }
}
