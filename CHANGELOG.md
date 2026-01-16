# Changelog

All notable changes to this project will be documented in this file. See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.2.0](https://github.com/gvart/rose-portal/compare/v1.1.0...v1.2.0) (2026-01-16)


### Features

* migrate to quasar ([#6](https://github.com/gvart/rose-portal/issues/6)) ([615d21e](https://github.com/gvart/rose-portal/commit/615d21eb21892b6cd67a2de72a385ab8af7403e8))
* **pwa:** fix auto-auth, deeplinks, reminders, and drag-and-drop ([51337ed](https://github.com/gvart/rose-portal/commit/51337ed671999a72393e3bc8b14f1e8282f837f6))

## [1.1.0](https://github.com/gvart/rose-portal/compare/v1.0.2...v1.1.0) (2026-01-15)


### Features

* **pwa:** enable numeric keyboard for invitation code input ([32d3c0b](https://github.com/gvart/rose-portal/commit/32d3c0b8b85bf1191da9f4cd430edf9485bf2116))

## [1.0.2](https://github.com/gvart/rose-portal/compare/v1.0.1...v1.0.2) (2026-01-15)


### Bug Fixes

* **ci:** checkout main branch in release workflow for environment protection ([5f90d10](https://github.com/gvart/rose-portal/commit/5f90d108f7b68dfc65c48dd79da1ea1da3c254d2))

## [1.0.1](https://github.com/gvart/rose-portal/compare/v1.0.0...v1.0.1) (2026-01-15)


### Bug Fixes

* **ci:** change release workflow trigger from push:tags to release:published ([a72fbae](https://github.com/gvart/rose-portal/commit/a72fbaeef03692391d85694eaf5a5e7849559dcf))

## 1.0.0 (2026-01-15)


### ⚠ BREAKING CHANGES

* Deployment no longer happens on every commit to main. Deployments now require merging a Release PR which creates a version tag.

### Features

* add clothing recommendation feature to weather app ([ae8e5e9](https://github.com/gvart/rose-portal/commit/ae8e5e9e512ada0b4f69e2a503308b97d1113854))
* add collapse/minimize functionality to timer floating pill ([bd7680b](https://github.com/gvart/rose-portal/commit/bd7680b39c5da46d47af4a57215d69ed10fc6019))
* add commit message display in PWA update notifications ([07905df](https://github.com/gvart/rose-portal/commit/07905df9fc4e6d1f0e96f4239717fd14acf0960f))
* add deep linking and auto-login for PWA ([fa3ba54](https://github.com/gvart/rose-portal/commit/fa3ba5427ed3defda39daf1e0a695f67e9e45c51))
* add drag handle to chores cards and improve PWA setup flow ([0e9d2ea](https://github.com/gvart/rose-portal/commit/0e9d2ea5415e5947b093975ae351038d4028c4c3))
* add PWA storage migration and multi-user auth system ([5828ccb](https://github.com/gvart/rose-portal/commit/5828ccb5f6fb50e702eed411439c4688fadd6ed5))
* add screensaver with hexagon particles and idle detection ([71e8f02](https://github.com/gvart/rose-portal/commit/71e8f02e75d80799e86bdc3767e10f8c70c8924a))
* add Timer mini app with countdown, stopwatch, and pomodoro ([da69f44](https://github.com/gvart/rose-portal/commit/da69f440aec9811969cee6ec2c79bdfe1c0d9aea))
* add Weather mini app with forecast and alerts ([9392987](https://github.com/gvart/rose-portal/commit/939298737457a326e77801caa554e2191363412a))
* fetch project users from dedicated API endpoint ([31f2062](https://github.com/gvart/rose-portal/commit/31f20624d3aa78ccd07e2d9be01a240b491882fc))
* implement enhanced manual PWA update system ([c88189f](https://github.com/gvart/rose-portal/commit/c88189fdabff8dae10c7ad3e88b5490496fdfc44))
* implement push notification system and improve notes editor ([ead24ee](https://github.com/gvart/rose-portal/commit/ead24eeebdb58acb86c33ff7ec78b79cf55cd649))
* improve PWA installation flow with project-based setup ([76c9819](https://github.com/gvart/rose-portal/commit/76c9819c48b1278dcebe3d7891a288cc9e4fce77))
* initial commit with GitHub Pages deployment ([580c4f2](https://github.com/gvart/rose-portal/commit/580c4f2481ae66e107119aa2f8e0f7cc8e96ad9d))
* persist swipe action buttons and add custom delete confirmation ([a624552](https://github.com/gvart/rose-portal/commit/a6245521063db3c6674dd289c8307d74f94c967a))
* replace swipe actions with long press context menu ([abc8019](https://github.com/gvart/rose-portal/commit/abc8019aaf2339d247ed01cfc92f20d915c8f270))
* restrict onboarding to PWA and enable drag-and-drop on web only ([5020a9c](https://github.com/gvart/rose-portal/commit/5020a9cc30e346f5fd173b3bbcf873c598232dde))


### Bug Fixes

* add 404.html redirect for GitHub Pages SPA routing ([fad1c0e](https://github.com/gvart/rose-portal/commit/fad1c0e51a7c3e143cd09eef409f2a2e26653698))
* add CNAME file for custom domain deployment ([3178ea9](https://github.com/gvart/rose-portal/commit/3178ea95eae7d4a6d2137e67d72e863115873e98))
* auto-login timing issue for single user in PWA ([0512642](https://github.com/gvart/rose-portal/commit/051264200b4241349d3e477fce0cbc1a47c64c52))
* ci ([f878040](https://github.com/gvart/rose-portal/commit/f8780400c8cd6e74ce179c4fbd9586f49a55bef6))
* enable touch scrolling on timer mini app expanded view ([aeca5df](https://github.com/gvart/rose-portal/commit/aeca5df85015ccf38078ce230c9e8e47284867ee))
* ensure service worker has only one __WB_MANIFEST reference for build ([7c08d4f](https://github.com/gvart/rose-portal/commit/7c08d4f19554a01157336ace8495799eeb58155c))
* improve auth flow and make Vosk URL optional ([1c0b148](https://github.com/gvart/rose-portal/commit/1c0b148e790d9b3874dda320259f3b9a6a6da55b))
* improve chores mobile UX - disable drag, fix column scroll, reduce padding ([0103fae](https://github.com/gvart/rose-portal/commit/0103fae941ba3cc351d5b57f023a83c72057b904))
* iOS PWA deep linking with absolute URLs ([557927a](https://github.com/gvart/rose-portal/commit/557927adeeeac50844a0cbd93b27f5d382965ee6))
* prevent config modal from showing during install flow ([438347b](https://github.com/gvart/rose-portal/commit/438347bd75aab72c266adfd9d4bb0c6d9d54d902))
* prevent migration modal from showing after auto-configuration ([29825c6](https://github.com/gvart/rose-portal/commit/29825c67777a6751a2684ea44fcd98219e226334))
* prevent Safari native swipe-back gesture in PWA mode ([b3b6345](https://github.com/gvart/rose-portal/commit/b3b6345cf2c15fabd965d48bf2be78f2a8dc9e67))
* redirect to install page when action=install query param is present ([7af7567](https://github.com/gvart/rose-portal/commit/7af7567e4daabb252a6d12d1dbc47f5e470aabe7))
* resolve 404 error for direct /install access via QR code ([ffff7f8](https://github.com/gvart/rose-portal/commit/ffff7f86caf5c5cd083243ad0de3776c0260cd71))
* restore vertical scrolling and add theme switcher to settings ([ed57625](https://github.com/gvart/rose-portal/commit/ed576257aa69f1b8f4e347f1448da681e1f5895f))
* update vue-tsc and build script for CI compatibility ([ff2c1ca](https://github.com/gvart/rose-portal/commit/ff2c1ca4f1c69c3585e0bd3ed555eceb21150dcf))
* use ConfirmDialog for card details delete action ([663e784](https://github.com/gvart/rose-portal/commit/663e784cb978078cc8c066c34b010a6f1e787578))


### Continuous Integration

* implement semantic versioning with two-stage deployment pipeline ([99d4793](https://github.com/gvart/rose-portal/commit/99d4793195770e8f10b928ae626eeb9f4165dadd))

## 1.0.0 (2026-01-15)

### Features

* Initial release of ROSE Smart Hub PWA
* Recipe finder with AI recommendations and meal planning
* Plant monitor with device tracking and health monitoring
* Calendar with event management and reminders
* Timer with interval support and notifications
* Weather dashboard with forecasts
* Notes app with rich text editor and markdown support
* Chores tracker with kanban board and assignment system
* System monitor for Raspberry Pi resource tracking

### Bug Fixes

* Add 404.html redirect for GitHub Pages SPA routing ([fad1c0e](https://github.com/gvart/rose-portal/commit/fad1c0e))
* Prevent Safari native swipe-back gesture in PWA mode ([b3b6345](https://github.com/gvart/rose-portal/commit/b3b6345))
* iOS PWA deep linking with absolute URLs ([557927a](https://github.com/gvart/rose-portal/commit/557927a))
* Auto-login timing issue for single user in PWA ([0512642](https://github.com/gvart/rose-portal/commit/0512642))
