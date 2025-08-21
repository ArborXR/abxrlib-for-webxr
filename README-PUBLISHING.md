# Publishing Guide

## Quick Start

To publish a new version with automatic changelog generation:

```bash
./publish-with-changelog.sh
```

## Prerequisites

1. **Environment file**: Create `.env` with your npm token:
   ```bash
   NPM_TOKEN=your_npm_access_token_here
   ```

2. **Clean git state**: Commit any pending changes before publishing

3. **Docker**: Ensure Docker and Docker Compose are installed

## What the Script Does

### 1. Pre-flight Checks ✈️
- Verifies you're in a git repository
- Checks for uncommitted changes (warns if found)
- Validates `.env` file exists
- Shows current and next version numbers

### 2. Docker Build & Publish 🐳
- Runs `docker-compose -f docker-compose-publish.yml up --build`
- Builds TypeScript, creates webpack bundle
- Auto-increments patch version (e.g., 1.0.20 → 1.0.21)
- Publishes to npm registry

### 3. Git Operations 🏷️
- Generates changelog from commits since last tag
- Creates git tag `v1.0.21` for the new version
- Commits changelog updates
- Optionally pushes to remote

### 4. Interactive Prompts 💬
- Asks if you want to continue with uncommitted changes
- Asks if you want to push to remote repository
- Shows summary of what was accomplished

## Example Output

```
🚀 Starting AbxrLib publish process...
📦 Checking current published version...
Current published version: 1.0.20
Next version will be: 1.0.21

🐳 Running Docker build and publish...
[Docker build output...]

✅ Successfully published version: 1.0.21
📝 Generating changelog for version 1.0.21...
✅ Changelog updated successfully
📝 Committing changelog updates...
🏷️ Creating git tag v1.0.21...
✅ Git tag v1.0.21 created successfully

🎉 Publish process completed successfully!

📋 Summary:
  • Published version: 1.0.21
  • Git tag created: v1.0.21
  • Changelog updated: ✅

Push changes to remote now? (y/N):
```

## Manual Alternative

If you prefer to handle steps manually:

```bash
# 1. Publish with Docker only
docker-compose -f docker-compose-publish.yml up --build

# 2. Get published version
PUBLISHED_VERSION=$(npm view abxrlib-for-webxr version)

# 3. Generate changelog
npm run changelog:version $PUBLISHED_VERSION

# 4. Create git tag and commit
git add CHANGELOG.md
git commit -m "docs: update changelog for version $PUBLISHED_VERSION"
git tag -a "v$PUBLISHED_VERSION" -m "Release version $PUBLISHED_VERSION"

# 5. Push to remote
git push origin main
git push origin "v$PUBLISHED_VERSION"
```

## Troubleshooting

### "Not in a git repository"
- Run the script from the project root directory
- Ensure `.git` folder exists

### "NPM_TOKEN not found"
- Create `.env` file with your npm access token
- Get token from https://www.npmjs.com/settings/tokens

### "Docker publish failed"
- Check Docker is running
- Verify `.env` file has correct NPM_TOKEN
- Check npm registry connectivity

### "Changelog generation failed"
- Ensure `scripts/generate-changelog.js` exists
- Check Node.js is installed on host system
- Verify git history is available

## Conventional Commits

For better changelog categorization, use conventional commit format:

```bash
feat: add new VR controller support
fix(auth): resolve login timeout issue  
docs: update API documentation
refactor: simplify connection logic
```

See `CONTRIBUTING.md` for full conventional commit guidelines.
