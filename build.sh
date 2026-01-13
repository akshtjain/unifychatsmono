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
cp firefox-manifest/manifest.json dist/firefox/

# Create zip files
echo "Creating zip files..."
cd dist/chrome && zip -rq ../unifychats-chrome.zip . && cd ../..
cd dist/firefox && zip -rq ../unifychats-firefox.zip . && cd ../..

# Copy zips to website/public for Vercel deployment
echo "Copying zips to website/public..."
cp dist/unifychats-chrome.zip website/public/ai-chat-index-chrome.zip
cp dist/unifychats-firefox.zip website/public/ai-chat-index-firefox.zip

echo ""
echo "========================================"
echo "Build complete!"
echo "========================================"
echo ""
echo "Extension files:"
echo "  dist/chrome/                              - Chrome unpacked (for local testing)"
echo "  dist/firefox/                             - Firefox unpacked (for local testing)"
echo "  dist/unifychats-chrome.zip                - Chrome packaged (for Web Store)"
echo "  dist/unifychats-firefox.zip               - Firefox packaged (for Add-ons)"
echo ""
echo "Website downloads (ready for Vercel):"
echo "  website/public/ai-chat-index-chrome.zip   - Chrome download"
echo "  website/public/ai-chat-index-firefox.zip  - Firefox download"
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
echo "----------------------------------------"
echo "Deploy to Vercel:"
echo "----------------------------------------"
echo "  git add . && git commit -m 'Update extension' && git push"
echo ""
