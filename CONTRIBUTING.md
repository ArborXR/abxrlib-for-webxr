# Contributing to AbxrLib for WebXR

## Commit Message Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/) to automatically generate changelogs and determine semantic version bumps.

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files

### Examples

```bash
feat: add virtual keyboard support for WebXR
fix(auth): resolve authentication timeout issue
docs: update README with new installation instructions
style: format code according to prettier rules
refactor(client): simplify connection logic
perf: optimize rendering performance in VR mode
test: add unit tests for authentication flow
build: update webpack configuration
ci: add automated testing workflow
chore: update dependencies
```

### Scopes (Optional)

Common scopes in this project:
- `auth`: Authentication related changes
- `client`: AbxrLibClient changes
- `analytics`: Analytics functionality
- `storage`: Storage utilities
- `network`: Network layer changes
- `ui`: User interface components
- `vr`: VR-specific functionality
- `webxr`: WebXR API integration

## Changelog Generation

The changelog is automatically generated from commit messages when publishing new versions. The script categorizes commits based on their type:

- **✨ Features**: `feat` commits
- **🐛 Bug Fixes**: `fix` commits  
- **⚡ Performance**: `perf` commits
- **♻️ Refactoring**: `refactor` commits
- **📚 Documentation**: `docs` commits
- **🔧 Build & CI**: `build`, `ci` commits
- **🔨 Other Changes**: `chore`, `style`, `test` commits

## Manual Changelog Generation

You can generate a changelog manually using:

```bash
# Generate full changelog
npm run changelog

# Generate changelog for a specific version
npm run changelog:version 1.0.21
```

## Publishing Process

### Automated Publishing with Changelog

Use the new automated publish script that handles the complete workflow:

```bash
./publish-with-changelog.sh
```

This script:
1. **Checks prerequisites** (git repo, .env file, uncommitted changes)
2. **Runs Docker build and publish** (increments patch version automatically)
3. **Generates changelog** from git commits since last tag
4. **Creates git tag** for the new version
5. **Commits changelog** if changes were made
6. **Optionally pushes** to remote repository

### Manual Docker Publishing (Legacy)

You can still use the Docker-only approach, but you'll need to handle git operations manually:

```bash
docker-compose -f docker-compose-publish.yml up --build
```

After Docker publish completes, manually:
```bash
# Get the published version
PUBLISHED_VERSION=$(npm view abxrlib-for-webxr version)

# Generate changelog
npm run changelog:version $PUBLISHED_VERSION

# Create git tag
git tag -a "v$PUBLISHED_VERSION" -m "Release version $PUBLISHED_VERSION"

# Commit and push
git add CHANGELOG.md
git commit -m "docs: update changelog for version $PUBLISHED_VERSION"
git push origin main
git push origin "v$PUBLISHED_VERSION"
```

## Git Tagging

Each published version is automatically tagged in git with the format `v{version}` (e.g., `v1.0.21`). This allows the changelog generator to determine what commits belong to each release.

To push tags to remote after publishing:
```bash
git push origin v1.0.21  # Replace with actual version
```
