#!/usr/bin/env bash
# Post-build script for OpenNext Cloudflare deployment

set -e

echo "📦 Copying assets to .open-next..."

# Copy _next static assets
if [ -d ".open-next/assets/_next" ]; then
  cp -r .open-next/assets/_next .open-next/_next 2>/dev/null || true
fi

# Copy image assets
if ls .open-next/assets/*.{png,jpg,svg} 1> /dev/null 2>&1; then
  cp .open-next/assets/*.png .open-next/assets/*.jpg .open-next/assets/*.svg .open-next/ 2>/dev/null || true
fi

echo "📁 Creating dist directory..."
mkdir -p dist

echo "📋 Copying .open-next to dist..."
cp -r .open-next/. dist/

echo "⚙️ Renaming worker file..."
if [ -f "dist/worker.js" ]; then
  mv dist/worker.js dist/_worker.js
fi

echo "🛣️ Copying routes configuration..."
cp _routes.json dist/_routes.json

echo "✅ Post-build complete!"
