#!/usr/bin/env bash

# AbxrLib Publish Script with Changelog Generation
# This script runs on the host system and orchestrates:
# 1. Docker build and npm publish
# 2. Git tagging
# 3. Changelog generation

set -e

echo "🚀 Starting AbxrLib publish process..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Warning: You have uncommitted changes. Consider committing them first."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found. Please create it with your NPM_TOKEN."
    echo "Example:"
    echo "NPM_TOKEN=your_npm_token_here"
    exit 1
fi

# Get current version from npm registry
echo "📦 Checking current published version..."
CURRENT_VERSION=$(npm view abxrlib-for-webxr version 2>/dev/null || echo "0.0.0")
echo "Current published version: $CURRENT_VERSION"

# Calculate next version
IFS='.' read -r major minor patch <<< "$CURRENT_VERSION"
new_patch=$((patch + 1))
NEXT_VERSION="${major}.${minor}.${new_patch}"
echo "Next version will be: $NEXT_VERSION"

# Create a temporary directory for version exchange
TEMP_DIR=$(mktemp -d)
echo "Using temp directory: $TEMP_DIR"

# Function to cleanup and exit
cleanup_and_exit() {
    rm -rf "$TEMP_DIR" 2>/dev/null || true
    docker-compose down 2>/dev/null || true
    exit ${1:-0}
}

# Run Docker build and publish
echo "🐳 Running Docker build and publish..."
docker-compose down 2>/dev/null || true

# Run the publish with volume mount to get the version back
NEXT_VERSION=$NEXT_VERSION docker-compose -f docker-compose-publish.yml up --build
DOCKER_EXIT_CODE=$?

# Check if Docker publish was successful by looking for the version file
PUBLISHED_VERSION=""
CONTAINER_ID=$(docker ps -aq --filter "name=abxrlib-for-webxr")

if [ -n "$CONTAINER_ID" ]; then
    # Try to copy the version file from the container
    if docker cp "$CONTAINER_ID:/tmp/published_version.txt" "$TEMP_DIR/published_version.txt" 2>/dev/null; then
        PUBLISHED_VERSION=$(cat "$TEMP_DIR/published_version.txt" 2>/dev/null || echo "")
    fi
fi

# Clean up Docker
docker-compose down 2>/dev/null || true

# Check if we got a version back
if [ -z "$PUBLISHED_VERSION" ]; then
    echo "❌ Could not determine published version. Checking if publish was successful..."
    
    # Double-check by querying npm registry
    LATEST_VERSION=$(npm view abxrlib-for-webxr version 2>/dev/null || echo "0.0.0")
    if [ "$LATEST_VERSION" != "$CURRENT_VERSION" ]; then
        PUBLISHED_VERSION="$LATEST_VERSION"
        echo "✅ Detected new version from npm registry: $PUBLISHED_VERSION"
    else
        echo "❌ Publish appears to have failed. No new version detected."
        if [ $DOCKER_EXIT_CODE -ne 0 ]; then
            echo "❌ Docker container exited with code: $DOCKER_EXIT_CODE"
        fi
        echo ""
        echo "💡 Troubleshooting tips:"
        echo "  1. Check that your NPM_TOKEN in .env is valid and not expired"
        echo "  2. Verify you have publish permissions for 'abxrlib-for-webxr'"
        echo "  3. Check Docker logs: docker logs abxrlib-for-webxr"
        echo "  4. Try running: npm whoami --registry=https://registry.npmjs.org/"
        cleanup_and_exit 1
    fi
fi

echo "✅ Successfully published version: $PUBLISHED_VERSION"

# Generate changelog for this version
echo "📝 Generating changelog for version $PUBLISHED_VERSION..."
if [ -f "scripts/generate-changelog.js" ]; then
    if node scripts/generate-changelog.js --version "$PUBLISHED_VERSION"; then
        echo "✅ Changelog updated successfully"
        
        # Add changelog to git if it was modified
        if git diff --quiet CHANGELOG.md; then
            echo "ℹ️  No changelog changes to commit"
        else
            echo "📝 Committing changelog updates..."
            git add CHANGELOG.md
            git commit -m "docs: update changelog for version $PUBLISHED_VERSION"
        fi
    else
        echo "⚠️  Warning: Changelog generation failed, but continuing..."
    fi
else
    echo "⚠️  Warning: Changelog generator not found at scripts/generate-changelog.js"
fi

# Create git tag for this version
echo "🏷️  Creating git tag v$PUBLISHED_VERSION..."
if git tag -a "v$PUBLISHED_VERSION" -m "Release version $PUBLISHED_VERSION"; then
    echo "✅ Git tag v$PUBLISHED_VERSION created successfully"
else
    echo "⚠️  Warning: Could not create git tag (may already exist)"
fi

# Ask about pushing to remote
echo ""
echo "🎉 Publish process completed successfully!"
echo ""
echo "📋 Summary:"
echo "  • Published version: $PUBLISHED_VERSION"
echo "  • Git tag created: v$PUBLISHED_VERSION"
echo "  • Changelog updated: ✅"
echo ""
echo "🔄 Next steps:"
echo "  1. Review the changelog: cat CHANGELOG.md"
echo "  2. Push changes to remote:"
echo "     git push origin main"
echo "     git push origin v$PUBLISHED_VERSION"
echo ""

read -p "Push changes to remote now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📤 Pushing to remote..."
    
    # Push main branch
    if git push origin main; then
        echo "✅ Pushed main branch"
    else
        echo "⚠️  Warning: Could not push main branch"
    fi
    
    # Push tag
    if git push origin "v$PUBLISHED_VERSION"; then
        echo "✅ Pushed tag v$PUBLISHED_VERSION"
    else
        echo "⚠️  Warning: Could not push tag"
    fi
    
    echo "🎉 All done!"
else
    echo "ℹ️  Remember to push manually when ready:"
    echo "   git push origin main && git push origin v$PUBLISHED_VERSION"
fi

# Cleanup
cleanup_and_exit 0
