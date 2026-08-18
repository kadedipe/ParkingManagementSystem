#!/bin/bash
# ============================================================================
# Build Script - Shared Types Build
# ============================================================================

# parking-management-system/shared/types/build.sh

#!/bin/bash
set -e

echo "Building shared types package..."

# Clean dist directory
rm -rf dist

# Compile TypeScript
npm run build

# Copy package.json to dist
cp package.json dist/

# Copy README
cp README.md dist/

# Copy LICENSE
cp LICENSE dist/

echo "Build completed successfully!"