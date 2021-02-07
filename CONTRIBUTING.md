## Contributing

Unit tests are written in jest and can be run with `npm t`.

Integration tests are written in mocha and can be run from a local webserver using `npm run test:webserver`. They can also be run in Chromium, Webkit, and Firefox using `npm run test:playwright`.

JavaScript/Typescript code is linted using eslint. You can check that all relevant files pass the linting rules by running `npm run lint`.

JavaScript/TypeScript code is formatted using Prettier. You can check that all relevant files are formatted correctly by running `npm run check-formatting`.

The project is built using webpack. You can build the project using `npm run build`. This will create a minified js bundle at `dist/main.js`.
