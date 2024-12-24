# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v1.2.0] - 2024-12-12

### Added
- Vue 3 plugin.

## [v1.1.0] - 2024-12-12

### Added
- Added `matches()` in the `Route` class [Route.ts#141](js/classes/Route.ts#141)
- Added `getCurrentLocation()` \([utils.ts#40](js/helpers/utils.ts#40)\) and `getLocationAndQuery()` \([utils.ts#40](js/helpers/utils.ts#40)\) in `utils`.
### Changed
- `getRoute()` in the `Router` class is now public [Router.ts#95](js/classes/Router.ts#95)
- Fixed various typos and mistakes in comments.

## [v1.0.1] - 2024-04-01

### Added
- Added binding `ziglite` for `PackageService` into service container

### Changed
- Moved `setupBladeDirective()` from `ZigliteServiceProvider` to `PackageService`
- Changed the JS build to exclude external dependencies.
- Updated the readme to reflect changes
- Updated the contribution guide with local environment setup

### Removed
- Removed binding of `ZigliteServiceProvider` into service container

## [v1.0.0] - 2024-03-31

### Added

- First release.
