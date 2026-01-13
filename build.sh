#!/bin/bash

# AI Chat Index - Build Script
# Creates distribution packages for Chrome and Firefox

set -e

echo "Building AI Chat Index..."
echo ""

# Clean previous builds
rm -rf dist
mkdir -p dist/chrome
mkdir -p dist/firefox
mkdir -p dist/website

# Copy common files to Chrome
echo "Building Chrome extension..."
cp -r content dist/chrome/
cp -r popup dist/chrome/
cp -r icons dist/chrome/
cp -r onboarding dist/chrome/
cp background.js dist/chrome/
cp manifest.json dist/chrome/

# Copy common files to Firefox
echo "Building Firefox extension..."
cp -r content dist/firefox/
cp -r popup dist/firefox/
cp -r icons dist/firefox/
cp -r onboarding dist/firefox/
cp background.js dist/firefox/
cp _firefox/manifest.json dist/firefox/

# Create zip files
echo "Creating zip files..."
cd dist/chrome && zip -rq ../unifychats-chrome.zip . && cd ../..
cd dist/firefox && zip -rq ../unifychats-firefox.zip . && cd ../..

# Copy website files and zip downloads
echo "Building website..."
cp -r website/* dist/website/
cp dist/unifychats-chrome.zip dist/website/
cp dist/unifychats-firefox.zip dist/website/

echo ""
echo "========================================"
echo "Build complete!"
echo "========================================"
echo ""
echo "Extension files:"
echo "  dist/chrome/                    - Chrome unpacked extension"
echo "  dist/firefox/                   - Firefox unpacked extension"
echo "  dist/unifychats-chrome.zip   - Chrome packaged"
echo "  dist/unifychats-firefox.zip  - Firefox packaged"
echo ""
echo "Website files:"
echo "  dist/website/                   - Ready to deploy website"
echo ""
echo "----------------------------------------"
echo "Quick Start - Load in Chrome:"
echo "----------------------------------------"
echo "  1. Open chrome://extensions"
echo "  2. Enable 'Developer mode' (top-right toggle)"
echo "  3. Click 'Load unpacked'"
echo "  4. Select the dist/chrome folder"
echo ""
echo "----------------------------------------"
echo "Quick Start - Load in Firefox:"
echo "----------------------------------------"
echo "  1. Open about:debugging#/runtime/this-firefox"
echo "  2. Click 'Load Temporary Add-on'"
echo "  3. Select dist/firefox/manifest.json"
echo ""
