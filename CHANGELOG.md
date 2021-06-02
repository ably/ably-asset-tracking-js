# Change log

## [1.0.0-beta.2](https://github.com/ably/ably-asset-tracking-js/tree/1.0.0-beta.2)

[Full Changelog](https://github.com/ably/ably-asset-tracking-js/compare/v1.0.0-beta.1...1.0.0-beta.2)

**Implemented enhancements:**

- Channel Namespace [\#41](https://github.com/ably/ably-asset-tracking-js/issues/41)
- Accept skipped locations from the Publisher [\#33](https://github.com/ably/ably-asset-tracking-js/issues/33)

**Fixed bugs:**

- Change names of client type values from presence data [\#34](https://github.com/ably/ably-asset-tracking-js/issues/34)

**Closed issues:**

- Remove battery level from location / location update API [\#46](https://github.com/ably/ably-asset-tracking-js/issues/46)
- Unify the way of parsing enums sent over Ably channels across all platforms [\#32](https://github.com/ably/ably-asset-tracking-js/issues/32)
- Add battery level property to location update type [\#30](https://github.com/ably/ably-asset-tracking-js/issues/30)
- API differs from Android/Cocoa SDKs [\#10](https://github.com/ably/ably-asset-tracking-js/issues/10)

**Merged pull requests:**

- Remove batteryLevel from typings [\#48](https://github.com/ably/ably-asset-tracking-js/pull/48) ([owenpearson](https://github.com/owenpearson))
- Set 'tracking' channel namespace [\#45](https://github.com/ably/ably-asset-tracking-js/pull/45) ([owenpearson](https://github.com/owenpearson))
- Bump postcss from 8.2.4 to 8.2.15 [\#44](https://github.com/ably/ably-asset-tracking-js/pull/44) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump lodash from 4.17.20 to 4.17.21 [\#43](https://github.com/ably/ably-asset-tracking-js/pull/43) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump hosted-git-info from 2.8.8 to 2.8.9 [\#42](https://github.com/ably/ably-asset-tracking-js/pull/42) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump url-parse from 1.4.7 to 1.5.1 [\#40](https://github.com/ably/ably-asset-tracking-js/pull/40) ([dependabot[bot]](https://github.com/apps/dependabot))
- Links to Asset Tracking content - ably-asset-tracking-js [\#39](https://github.com/ably/ably-asset-tracking-js/pull/39) ([ramiro-nd](https://github.com/ramiro-nd))
- updating google example and index page to have ably branding and styles. [\#38](https://github.com/ably/ably-asset-tracking-js/pull/38) ([thisisjofrank](https://github.com/thisisjofrank))
- Accept skipped locations from publisher [\#37](https://github.com/ably/ably-asset-tracking-js/pull/37) ([owenpearson](https://github.com/owenpearson))
- use SCREAMING\_SNAKE\_CASE enum encoding for accuracy [\#35](https://github.com/ably/ably-asset-tracking-js/pull/35) ([owenpearson](https://github.com/owenpearson))
- Add batteryLevel to location update type [\#31](https://github.com/ably/ably-asset-tracking-js/pull/31) ([owenpearson](https://github.com/owenpearson))

## [1.0.0-beta.1](https://github.com/ably/ably-asset-tracking-js/tree/v1.0.0-beta.1)

[Full Changelog](https://github.com/ably/ably-asset-tracking-js/compare/v1.0.0-preview.2...v1.0.0-beta.1)

**Closed issues:**

- Add detail to README.md [\#23](https://github.com/ably/ably-asset-tracking-js/issues/23)
- Add JSDoc annotations [\#22](https://github.com/ably/ably-asset-tracking-js/issues/22)
- Accept new `LocationUpdate` format on the Subscriber side [\#14](https://github.com/ably/ably-asset-tracking-js/issues/14)

**Merged pull requests:**

- Rename AssetSubscriber to Subscriber [\#27](https://github.com/ably/ably-asset-tracking-js/pull/27) ([owenpearson](https://github.com/owenpearson))
- Fix deploy workflow [\#26](https://github.com/ably/ably-asset-tracking-js/pull/26) ([owenpearson](https://github.com/owenpearson))
- Improve readme and add contributing.md [\#25](https://github.com/ably/ably-asset-tracking-js/pull/25) ([owenpearson](https://github.com/owenpearson))
- Add jsdoc annotations [\#24](https://github.com/ably/ably-asset-tracking-js/pull/24) ([owenpearson](https://github.com/owenpearson))
- Respond to 'present' event [\#21](https://github.com/ably/ably-asset-tracking-js/pull/21) ([owenpearson](https://github.com/owenpearson))
- Use new location update format [\#20](https://github.com/ably/ably-asset-tracking-js/pull/20) ([owenpearson](https://github.com/owenpearson))
- Use force push to Heroku app [\#18](https://github.com/ably/ably-asset-tracking-js/pull/18) ([owenpearson](https://github.com/owenpearson))
- Automatically deploy example app [\#17](https://github.com/ably/ably-asset-tracking-js/pull/17) ([owenpearson](https://github.com/owenpearson))
- Add integration tests [\#16](https://github.com/ably/ably-asset-tracking-js/pull/16) ([owenpearson](https://github.com/owenpearson))
- Add maintainers file [\#15](https://github.com/ably/ably-asset-tracking-js/pull/15) ([niksilver](https://github.com/niksilver))
- Example app: add change resolution example [\#13](https://github.com/ably/ably-asset-tracking-js/pull/13) ([owenpearson](https://github.com/owenpearson))
- Add unit tests [\#12](https://github.com/ably/ably-asset-tracking-js/pull/12) ([owenpearson](https://github.com/owenpearson))

## [1.0.0-preview.2](https://github.com/ably/ably-asset-tracking-js/tree/v1.0.0-preview.2)

[Full Changelog](https://github.com/ably/ably-asset-tracking-js/compare/v1.0.0-preview.1...v1.0.0-preview.2)

**Merged pull requests:**

- Example app: Prompt users for map provider API keys in the interface. [\#7] ([OwenPearson](https://github.com/owenpearson))
- Broadcasting of requested resolution [\#8](https://github.com/ably/ably-asset-tracking-js/pull/8) ([OwenPearson](https://github.com/owenpearson))

## [1.0.0-preview.1](https://github.com/ably/ably-asset-tracking-js/tree/v1.0.0-preview.1)

**Merged pull requests:**

- Update link in the Readme [\#6](https://github.com/ably/ably-asset-tracking-js/pull/6) ([IvanKavalerov](https://github.com/kavalerov))
- Add mapbox demo [\#5](https://github.com/ably/ably-asset-tracking-js/pull/5) ([OwenPearson](https://github.com/owenpearson))
- Add mapbox demo [\#4](https://github.com/ably/ably-asset-tracking-js/pull/4) ([OwenPearson](https://github.com/owenpearson))
- Initial implementation of AssetSubscriber class [\#1](https://github.com/ably/ably-asset-tracking-js/pull/1) ([OwenPearson](https://github.com/owenpearson))
