# Contributing

## Testing

Unit tests are written in [Jest](https://jestjs.io/) and can be run with `npm test`.

Integration tests are written in [Mocha](https://mochajs.org/) and can be run from a local webserver using `npm run test:webserver`. They can also be run in [Chromium](https://www.chromium.org/), [WebKit](https://webkit.org/), and [Firefox](https://t.co/uiLRlFZnpI?amp=1) using `npm run test:playwright`.

## Code Quality

JavaScript/TypeScript code is:

- linted using [ESLint](https://eslint.org/), by running `npm run lint`, checking that all relevant files pass the linting rules
- formatted using [Prettier](https://prettier.io/), by running `npm run check-formatting`, checking that all relevant files are formatted correctly

## Assembly

The project is built using [webpack](https://webpack.js.org/). You can build the project using `npm run build`. This will create a [minified](https://en.wikipedia.org/wiki/Minification_(programming)) JS bundle at `dist/main.js`.

## Release process

1. Make sure the tests are passing in CI for the branch you're building
2. Create a new branch for the release, for example `release/1.2.3`
3. Update the [CHANGELOG.md](./CHANGELOG.md) with any customer-affecting changes since the last release and add this to the git index
4. Run `npm version <VERSION_NUMBER> --no-git-tag-version` with the new version and add the changes to the git index
5. Create a PR for the release branch
6. Once the release PR is landed to the `main` branch, checkout the `main` branch locally (remember to pull the remote changes) and run `npm run build`
7. Run `git tag <VERSION_NUMBER>` with the new version and push the tag to git
8. Run `npm publish .` (should require OTP) - publishes to NPM
10. Visit https://github.com/ably/ably-asset-tracking-js/tags and add release notes to the release (you can just copy the entry you added to the CHANGELOG)
