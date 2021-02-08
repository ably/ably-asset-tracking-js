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
