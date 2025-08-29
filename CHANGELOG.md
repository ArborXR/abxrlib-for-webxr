# Changelog

## [1.0.35] - 2025-08-29

### 🐛 Bug Fixes

- fixed storage uage error ([10fec44](../../commit/10fec44f43c4e440e1dc82ea010b7d4563116398))

## [1.0.34] - 2025-08-29

### ♻️ Refactoring

- updated documentation and synced up a few more functions to better match the Unity model ([7191f29](../../commit/7191f296e7e2c523483fab9b64439130dc34aee1))
- updated the moduleTarget functionality ([8bdab44](../../commit/8bdab44b6dc6db96539081150b6b9e8b0dbcbf07))
- updated readme for the onAuthComplete tweaks ([bd40666](../../commit/bd40666be08617abf99da63d0c6ec4d10227e125))
- updated inline documentation ([809d54f](../../commit/809d54f0a618401c49bb61cf42302784f020a503))
- updated documentation and reorganized some code ([6933ddf](../../commit/6933ddf0036e5de22e919e852e0ce74933eb9360))

### 🔨 Other Changes

- fire and forget for all the send data events, ([cd887eb](../../commit/cd887ebaae28b084182458f4c8db1f750d98b2a1))
- ModuleTargetData to CurrentSessionData ([192fe7c](../../commit/192fe7cb3257c4282e56c0be1f9ba9ee3dc053c0))
- isAuthenticated to connectionActive to avoid confusion ([9e1d364](../../commit/9e1d3646d987836947226935454cfbe4967bfb02))
- NotifyAuthCompleted needs to be private to the class ([31e3f00](../../commit/31e3f00b5aa69ef7ebfd246b43f4e7ddce66e006))
- Removed broken ContinueSession and renamed Storage methods to match Unity SDK ([b270944](../../commit/b2709446358548338b87011170c248cd5f94de1c))
- brought the README files into line with the Unity version ([61b5160](../../commit/61b51605c7ab16885a00060d98d58443ecdfc4c7))
- reorganized some code ([df4fcb4](../../commit/df4fcb47bef3f4fce308a0b0d0848af8c00794f4))
- cleaned up the examples from the inline documentation. Was making it too messy ([4950272](../../commit/4950272d020717f0b63988afd916b223684add77))
- moved log functions up ([cf275df](../../commit/cf275dfdaefe207e8d62105a466d01e0e0ce84b8))

## [1.0.33] - 2025-08-28

### ✨ Features

- Added support for SuperProperties / Register() method and related methods ([83cd033](../../commit/83cd03365478822c5c6a8eba3bd1bead703d5934))
- Added support for StartTimedEvent ([40f6360](../../commit/40f63600ac48670459045c238990da0fb3c5125c))
- Added Mixpanel conversion wrapper function ([111329d](../../commit/111329df8035910439c6e1f8e2f9a1f88c795034))

### ♻️ Refactoring

- updated mixpanel docs ([b1e037d](../../commit/b1e037de167fa1159cbf746bf300dd296e8f3271))
- Updated Track method to be tagged ([f5b84ae](../../commit/f5b84ae816fa21ca4db8bd06246e4403b4bfc4c0))

## [1.0.32] - 2025-08-22

### 🐛 Bug Fixes

- AbxrLibForWebXR, KOTLIN_BACKPORTS:  Tested, fixed escaping. ([e8fffff](../../commit/e8fffffd5d79d25cab9e2315da04c3caf7fc9b92))

### ♻️ Refactoring

- files updated to typescript 5 ([de52204](../../commit/de5220437ee90df4f190037940201e2694a52fe2))

### 🔨 Other Changes

- Merge branch 'ts5' ([13418ab](../../commit/13418abc3b59f197022a14aa9e54fa424e9e9440))
- removed ([26208ab](../../commit/26208ab629c44e0d9cdad5b79ad78356d3764696))
- Merge branch 'KOTLIN_BACKPORTS' ([9e63c2a](../../commit/9e63c2a34c5062b5cf0674cfcba1505d15514b0d))
- Squashed commit of the following: ([22e34db](../../commit/22e34dbf77c6cc9d85f13c8670c48dddf02600b8))
- AbxrLibForWebXR, KOTLIN_BACKPORTS:  Bloody bastard. ([c6cd904](../../commit/c6cd9043c5c4742ed0cc5741c20950c1590d109b))
- AbxrLibForWebXR, KOTLIN_BACKPORTS: <-- Specifically, DataObjectBase.m_dictOutOfBandData and its use (converted LoadFromJson()s to don't trust the backend).  String escaping/unescaping on StringList and AbxrDictStrings. ([5b5ed7f](../../commit/5b5ed7f87a2bb8a174144f4f7ed244ca2c53b167))
- AbxrLibForWebXR, KOTLIN_BACKPORTS:  First of the 'do not trust the backend' code.  Initial push to see if creds on github are sorted out. ([4570393](../../commit/4570393b16836c5f6d1fab8d52c03b06b6d5cadc))

## [1.0.31] - 2025-08-22

### 🔨 Other Changes

- removed package-lock.json from repo ([3979f5a](../../commit/3979f5a1666cfce769a9fcc089d02d97181a7162))
- should not be in github ([03ec0ce](../../commit/03ec0ced6ad7eff64e0c70deb7db73c264dc2082))

## [1.0.30] - 2025-08-22

### 🔨 Other Changes

- Upgraded deprecated packages and moved os detection into diff utils folder ([a86e93a](../../commit/a86e93a8a1e49719dc09e2f671560853c9a4a4aa))
- removed unneeded doc text ([ef06f82](../../commit/ef06f826c33a4cef840fea2174a18ea0b49646b9))

## [1.0.29] - 2025-08-22

### 🔨 Other Changes

- reduced CSP erros ([8674972](../../commit/86749722a5c0677d5a55c852c109ea47d8bb014a))

## [1.0.28] - 2025-08-22

### ✨ Features

- synced up to add support for EventCritical, some storage options and reauth ([f256887](../../commit/f256887107a5bbbeb26806ae12292ffba7fbb512))

### 🐛 Bug Fixes

- several fixes ([d19b604](../../commit/d19b604b39ee0519c52f99b3d9947eeb093912b3))

## [1.0.27] - 2025-08-22

### 🐛 Bug Fixes

- maybe last version fix ([aa22bf2](../../commit/aa22bf2ebf4cb60c502b3f384273b094c3726430))

## [1.0.26] - 2025-08-22

### 🔨 Other Changes

- another version attempt ([bf86a36](../../commit/bf86a36fab74dfff85a6721a447f81c4973cd7b1))

## [1.0.25] - 2025-08-22

### 🐛 Bug Fixes

- trying to fix version issues ([c89ad16](../../commit/c89ad169227d2e700677fc4ba0b68afbaf3feb19))

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### 🔧 Build & CI

- Add automatic changelog generation from git commits
- Add git tagging for published versions
- Add conventional commits support for better categorization

---

*Previous versions (1.0.1 - 1.0.20) were published before changelog automation was implemented. Future versions will have detailed changelogs generated from commit messages.*

*To see changes in previous versions, you can view the git history:*
```bash
git log v1.0.19..v1.0.20 --oneline  # Example for version 1.0.20
```
