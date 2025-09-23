#!/usr/bin/env bash

do_build=true
do_publish=false
do_serve=false

# Loop through the command-line arguments
for arg in "$@"; do
    case $arg in
        --publish)
            do_build=true
            do_publish=true
			do_serve=false
            ;;
        --build)
            do_build=true
            do_publish=false
			do_serve=false
            ;;
        --serve)
            do_build=true
            do_publish=false
            do_serve=true
            ;;
        *)
            echo "Unknown option: $arg (ignored)"
            ;;
    esac
done


if $do_build; then
	# Clean build and dist directories for fresh build
	echo "Cleaning up previous build..."
	[ -d "build" ] && rm -rf build/*
	[ -d "dist" ] && rm -rf dist/*
	[ -d "abxrlib-for-webxr" ] && rm -rf abxrlib-for-webxr/*

	echo "building js files..."
	npm run build
	if [ $? -ne 0 ]; then
		echo "An error occurred while running build."
		# Handle the error, e.g., log it, take alternative action, or exit
		# exit 1
	fi
	echo "\n\nwebpacking js files...\n\n"
	npx webpack
	if [ $? -ne 0 ]; then
		echo "An error occurred while running webpack."
		# Handle the error, e.g., log it, take alternative action, or exit
		# exit 1
	fi
	
	# Copy built JS file to testers/dist for easy access
	echo "Copying built JS file to testers/dist..."
	mkdir -p testers/dist
	cp dist/abxrlib-for-webxr.js testers/dist/abxrlib-for-webxr.js
	echo "Built file copied to testers/dist/abxrlib-for-webxr.js"
fi

if $do_publish; then
	#ABXRLIB-FOR-WEBXR PUBLISH SCRIPT
	echo "publishing to npm..."

	# Exit immediately if a command exits with a non-zero status
	set -e

	# Function to check if a command exists
	command_exists() {
		command -v "$1" >/dev/null 2>&1
	}

	# Check if necessary commands are available
	if ! command_exists npm; then
		echo "Error: npm is not installed. Please install npm and try again."
		exit 1
	fi

	# Function to get the latest published version
	get_latest_version() {
		local package_name="$1"
		npm view "$package_name" version 2>/dev/null || echo "0.0.0"
	}

	# Find the correct package.json file (not in node_modules)
	PACKAGE_JSON_PATH=$(find /opt/arborxr -maxdepth 2 -name package.json | grep -v "node_modules" | head -n 1)

	if [ -z "$PACKAGE_JSON_PATH" ]; then
		echo "Error: package.json not found"
		exit 1
	fi

	# Get the directory containing package.json
	PACKAGE_DIR=$(dirname "$PACKAGE_JSON_PATH")

	# Change to the directory containing package.json
	cd "$PACKAGE_DIR"

	# Get the package name from package.json
	PACKAGE_NAME=$(node -p "require('./package.json').name")

	# Verify the package name
	if [ "$PACKAGE_NAME" != "abxrlib-for-webxr" ]; then
		echo "Error: Expected package name 'abxrlib-for-webxr', but found '$PACKAGE_NAME'"
		echo "Please correct the package name in package.json"
		exit 1
	fi

	# Get the latest published version
	LATEST_VERSION=$(get_latest_version "$PACKAGE_NAME")

	# Parse the version components
	IFS='.' read -r major minor patch <<< "$LATEST_VERSION"

	# Increment the patch version
	new_patch=$((patch + 1))

	# Construct the new version
	NEW_VERSION="${major}.${minor}.${new_patch}"

	echo "New version will be: $NEW_VERSION"

	# Clean up previous build
	echo "Cleaning up previous build..."
	if [ -d "abxrlib-for-webxr" ]; then
		rm -rf abxrlib-for-webxr/* 2>/dev/null || true
		rm -rf abxrlib-for-webxr/.* 2>/dev/null || true
	fi

	# Run TypeScript compiler and copy files
	echo "Compiling TypeScript and copying files..."
	npm run build

	# Create a new directory for the package
	echo "Creating package directory..."
	mkdir -p abxrlib-for-webxr

	# Copy necessary files to the package directory
	echo "Copying package files..."
	cp dist/abxrlib-for-webxr.js abxrlib-for-webxr/Abxr.js
	# Copy all TypeScript declaration files to root (standard npm practice)
	cp build/*.d.ts abxrlib-for-webxr/
	# Copy main Abxr.d.ts (this will be the main entry point)
	cp build/Abxr.d.ts abxrlib-for-webxr/Abxr.d.ts
	cp -R build/network abxrlib-for-webxr/
	cp package.json LICENSE abxrlib-for-webxr/
	cp README.md abxrlib-for-webxr/README.md

	# Build directory cleanup is handled by volume mount

	# Update package.json in the new directory
	echo "Updating package.json for distribution..."
	node -e "
		const pkg = require('./abxrlib-for-webxr/package.json');
		delete pkg.devDependencies;
		delete pkg.scripts;
		pkg.main = 'Abxr.js';
		pkg.module = 'Abxr.js';
		pkg.browser = 'Abxr.js';
		pkg.types = 'Abxr.d.ts';
		pkg.files = ['Abxr.js', 'Abxr.d.ts', '*.d.ts', 'network/**/*', 'README.md', 'LICENSE'];
		pkg.version = '$NEW_VERSION';
		require('fs').writeFileSync('./abxrlib-for-webxr/package.json', JSON.stringify(pkg, null, 2));
	"

	# Check for NPM_TOKEN environment variable
	if [ -z "$NPM_TOKEN" ]; then
		echo "Error: NPM_TOKEN environment variable is not set."
		echo "Please set it with your npm access token before running this script."
		exit 1
	fi

	# Use token-based authentication
	echo "Using npm access token for authentication..."
	npm config set //registry.npmjs.org/:_authToken="${NPM_TOKEN}"

	# Navigate to package directory
	cd abxrlib-for-webxr

	# Create a tarball of the package
	echo "Creating package tarball..."
	npm pack

	# Get the name of the created tarball
	TARBALL_NAME=$(ls *.tgz)

	# Publish the package
	echo "Publishing version $NEW_VERSION to npm..."
	npm publish $TARBALL_NAME --access public

	# Clean up - remove the token from npm config
	npm config delete //registry.npmjs.org/:_authToken

	# Return to original directory
	cd ..

	echo "Package published successfully!"
	echo "Published version: $NEW_VERSION"
	
	# Write version to a file that can be read by host
	echo "$NEW_VERSION" > /tmp/published_version.txt

fi

if $do_serve; then
	# Configure nginx to serve testers folder as document root
	echo "Configuring nginx..."
	echo 'server { listen 8000; location / { root /opt/arborxr/testers; index index.html; } }' > /etc/nginx/sites-available/default
	nginx -g "daemon off;" &

	# Keep container running
	echo "Container is running. Access testers at:"
	echo "  http://localhost:8000/index.html (default)"
	echo "  http://localhost:8000/advanced.html"
	echo "  http://localhost:8000/webxr.html"
	sleep infinity
fi