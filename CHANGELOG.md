# Changelog

## [1.0.45] - 2025-09-26

### ✨ Features

- enhance analytics API with user-friendly enums and automatic module execution ([517be87](../../commit/517be87d126b577ca28a22bd012c8c8237f4f981))

### ♻️ Refactoring

- readme updates ([67a6d77](../../commit/67a6d7733a2c9f5ecaff442dba33de476d34e1c9))
- updated Cognitive3D compatibility details ([70fceda](../../commit/70fceda8994ae2281db48e934a24b91489f6bb11))

## [1.0.44] - 2025-09-24

### ✨ Features

- switched Modules support from method execution to event based like we have in Unity. Added anchors/bookmark model to match deep links in Android ([a27ac61](../../commit/a27ac61d51fbfaa18b090ccb2a0f0be20d22407c))

### 🐛 Bug Fixes

- poll fix ([08e9e09](../../commit/08e9e09c1514a2dc0e919f0ac1b9a1e8902e5ebc))
- fixed quit handler assessment status ([5bdb5f4](../../commit/5bdb5f4db1a25dd3f57dffa89419ae682c0e5a19))

### ♻️ Refactoring

- many organizational improvements ([49d6350](../../commit/49d63503fe92b3338eff525eb3d7ccb9b6364312))

### 🔨 Other Changes

- organization in sync with unity code ([f6248bc](../../commit/f6248bcceb22f71824bc64b30e14e284826e5ef5))
- Renaming and re-organzing to sync up with the unity code ([a62886f](../../commit/a62886fcfe214b12fd207758480408f2b15bf301))
- Super properties to Super MetaData and renamed index.ts to Abxr.ts ([866d977](../../commit/866d977be6c63e16b73d89bfd6d7e4f89124c0ec))
- Promoting use of Abxr.OnAuthCompleted ([33efad9](../../commit/33efad96c550a8eafc51799fe105f820d984dda3))

## [1.0.43] - 2025-09-18

### ✨ Features

- Added ExecuteModuleSequence and updated tester and readme files for that and for better navigation between pages ([55fc395](../../commit/55fc3950519148dbea8e7f8a09ed42bc84f3bf67))

## [1.0.42] - 2025-09-16

### 🐛 Bug Fixes

- bug fix for the missing type value ([c32700d](../../commit/c32700d53df733c00e42a2221aad9e20a1319854))
- Fixed some timeout detection settings ([0307791](../../commit/030779162b3d652e19b984c9ed89bdad9df49c95))

### 🔨 Other Changes

- cleanup ExtractModuleTargets ([45a216f](../../commit/45a216f774001d0147264862730a72afbaa60991))

## [1.0.41] - 2025-09-11

### 🐛 Bug Fixes

- fixed console output to all have the correct prefix ([4113e09](../../commit/4113e09b735bcbf4470039b9d5fe3ef872d71b3d))

## [1.0.40] - 2025-09-11

### 🔨 Other Changes

- upper and lowercase is represented better ([3ea8db7](../../commit/3ea8db750f09091c81cd78737e8f6d8e1ad6fb92))
- Merged keyboard and prompt into a single window ([0be3d60](../../commit/0be3d60386ebb2230cc2bad88943bd8e978a6512))

## [1.0.39] - 2025-09-10

### 🐛 Bug Fixes

- should fix zombie events issue ([513c157](../../commit/513c157ec1a84ea0a597b338400f019e175401d7))

## [1.0.38] - 2025-09-10

### ✨ Features

- added support for packageName in auth response ([04facdd](../../commit/04facdd81b70db7b0de5d68c4403dc48917c5311))

### 🐛 Bug Fixes

- Fixed PIN problem with leading zeros, added QuitHandler feature ([c8a9067](../../commit/c8a9067119d6083a1f4ff4a7b4afa4263381f00b))

## [1.0.37] - 2025-09-09

### 🔨 Other Changes

- Squashed commit of the following: ([b28863f](../../commit/b28863f827a0c7b4f287bb7bed7fe706ad4459a3))
- Squashed commit of the following: ([882ef84](../../commit/882ef846d262bbee623757263e45e0a9f57b1fea))

## [1.0.36] - 2025-09-04

### ✨ Features

- added C3D compatibility functions ([10ddda5](../../commit/10ddda54a71fdec9e9c1c12058b39c9a4aba17a6))
- added appid and modules support ([b2e8f0a](../../commit/b2e8f0a8589f65c9e562b014e6d001894bc0d6e9))
- Added some missing details to the README ([2cc307d](../../commit/2cc307d319316872b84b6a2f24558e69d43bbfe3))
- README updates to re-added and improve Method Signatures ([4187c8b](../../commit/4187c8b8f01480f92432faadea0098c46c4de038))

### 🐛 Bug Fixes

- fixed Log() function siganture ([f3c8efb](../../commit/f3c8efb0ac46127ecd4aa35cd6fa9c4de3a3bc07))
- Readme edit to move Debug Mode content ([bf5290f](../../commit/bf5290f57e6344504d4bb12e5d680f4b68c4fce3))

### 🔨 Other Changes

- more README edits ([0b3dcda](../../commit/0b3dcda687251dc68d4c281a2d020408533a27a5))
- removed package-README in favor of just the one README and shortened the README as well ([e40ece2](../../commit/e40ece25453923f1784439852948dd0c0550838d))
- cleaned up documentation ([86b514f](../../commit/86b514f81d5fe61f39f081da1362d75dc78d8dba))

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
