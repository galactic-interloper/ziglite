# Contributing to Ziglite
Thank you for contributing to Ziglite !\
Contributions are welcome and will be properly credited.\
Please read this contribution guide carefully and follow the outlined guidelines before opening an issue or creating a pull request.

If you need any help with any of this documents guidelines, please do not hesitate to ask.

## Code of Conduct
We ask that you :
- Be civil, Be kind.
- Give people the benefit of doubt and assume good intentions by default.

Harassement will not be tolerated. Thank you.

## Feature requests
While feature requests are always welcome, please consider the scope of the project first.\
Ziglite's *raison d'être* is to be a simple alternative to Ziggy. If you need more advanced features, please consider using [Ziggy](https://github.com/tighten/ziggy).

If you still would like to submit a feature request, please open an issue and select *Feature request*.

## Bug reports
Before sending a bug report, please:
- Check if an issue has not already been opened for the same bug
- Check if a pull request has not already been opened for the same bug

If you still would like to submit a bug report, please open an issue and select *Bug report*, then thoroughly fill the form.\
Please include a [minimal reproducible example](https://en.wikipedia.org/wiki/Minimal_reproducible_example) to avoid your issue being closed.

## Setting Up Your Local Environment
To get started with contributing code, please:
- Fork the repo
- Clone your fork locally
- Run `composer install` to install PHP dependencies
- Run `yarn` to install javascript dependencies
- Run `yarn prepare` to setup your [Husky](https://typicode.github.io/husky/) 🐶 *woof!*

## Pull Requests
Before opening a pull request, please check if a pull request has not already been opened for the same changes. If you would like to submit multiple features or bug fixes, please submit a pull request for each.

Your pull request must also include tests for all the changes you're submitting.\
We use [Pest](https://pestphp.com/) with [Orchestra Testbench](https://packages.tools/testbench.html) to test PHP code, and [Vitest](https://vitest.dev/) to test javascript code.

- Run PHP tests using `vendor/bin/pest` or `yarn test:php`
- Run javascript tests using `yarn test`
- To run all tests, use `yarn test:all`

## Releasing
To release a new version of Ziglite:

- Update the version string in [PackageService](src/Services/PackageService.php#22)
- Update the package version field using [yarn version ](https://yarnpkg.com/cli/version)
- Update the [Changelog](CHANGELOG.md) (following the [keep a changelog](https://keepachangelog.com/en/1.0.0/) format)
- Rebuild the assets `yarn run build`
- Commit and push the changes to the appropriate branch.
- Publish a new release on Github
    - Make sure you create a tag targetting the right branch
    - Make sure the name is the correct version prefixed with `v`

The [npm.yaml](.github/workflows/npm.yaml) workflow will then be triggered to publish the NPM package.

Use an appropriate suffix (i.e. `-beta` in the branch name and version) and mark the GitHub release as a pre-release when creating a beta, RC, or pre-release.\
This will publish the NPM package unde the `next` tag.
