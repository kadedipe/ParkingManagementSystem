#!/usr/bin/env node

// ============================================================================
// Android xxxhdpi Mipmap Icon Generator
// ============================================================================

/**
 * Script to generate all Android xxxhdpi mipmap app icons
 * 
 * Run: node scripts/generate-xxxhdpi-mipmap-icons.js
 * 
 * Prerequisites:
 * - Install sharp: npm install --save-dev sharp
 * - Place your source logo at: mobile/assets/logo-512x512.png
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// ============================================================================
// Configuration
// ============================================================================

const SOURCE_IMAGE = path.join(__dirname, '../assets/logo-512x512.png');
const OUTPUT_DIR = path.join(__dirname, '../android/app/src/main/res');

// xxxhdpi mipmap icon configurations (192x192)
const XXXHDPI_MIPMAP_CONFIG = {
  'mipmap-xxxhdpi': {
    regular: { size: 192, name: 'ic_launcher.png' },
    round: { size: 192, name: 'ic_launcher_round.png' },
  },
};

// Adaptive xxxhdpi icons (Android 8.0+)
const ADAPTIVE_XXXHDPI = {
  'mipmap-xxxhdpi': {
    size: 432,
    foreground: 'ic_launcher_foreground.png',
    background: 'ic_launcher_background.png',
    foregroundRound: 'ic_launcher_round_foreground.png',
    backgroundRound: 'ic_launcher_round_background.png',
  },
};

// ============================================================================
// SVG Templates
// ============================================================================

const SVG_TEMPLATES = {
  // Regular icon SVG
  regular: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1976d2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#42a5f5;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect x="0" y="0" width="512" height="512" rx="128" fill="url(#iconGradient)" />
  
  <!-- Parking "P" symbol -->
  <rect x="170" y="110" width="172" height="292" rx="36" fill="#ffffff" opacity="0.95" />
  <rect x="210" y="150" width="92" height="100" rx="16" fill="#1976d2" />
  <rect x="210" y="270" width="92" height="100" rx="16" fill="#1976d2" />
  
  <!-- Car symbol -->
  <rect x="100" y="350" width="312" height="60" rx="30" fill="#ffffff" opacity="0.95" />
  <circle cx="170" cy="390" r="32" fill="#1976d2" stroke="#ffffff" stroke-width="6" />
  <circle cx="342" cy="390" r="32" fill="#1976d2" stroke="#ffffff" stroke-width="6" />
</svg>`,

  // Round icon SVG
  round: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="roundGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#42a5f5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1976d2;stop-opacity:1" />
    </radialGradient>
    <clipPath id="roundClip">
      <circle cx="256" cy="256" r="240" />
    </clipPath>
  </defs>
  
  <!-- Round background -->
  <circle cx="256" cy="256" r="240" fill="url(#roundGradient)" />
  
  <!-- Parking "P" symbol -->
  <g clip-path="url(#roundClip)">
    <rect x="170" y="110" width="172" height="292" rx="36" fill="#ffffff" opacity="0.95" />
    <rect x="210" y="150" width="92" height="100" rx="16" fill="#1976d2" />
    <rect x="210" y="270" width="92" height="100" rx="16" fill="#1976d2" />
  </g>
  
  <!-- Car symbol -->
  <g clip-path="url(#roundClip)">
    <rect x="100" y="350" width="312" height="60" rx="30" fill="#ffffff" opacity="0.95" />
    <circle cx="170" cy="390" r="32" fill="#1976d2" stroke="#ffffff" stroke-width="6" />
    <circle cx="342" cy="390" r="32" fill="#1976d2" stroke="#ffffff" stroke-width="6" />
  </g>
</svg>`,
};

// ============================================================================
// Main Function
// ============================================================================

async function generateXxxhdpiMipmapIcons() {
  console.log('🎨 Generating Android xxxhdpi mipmap app icons...');
  console.log('================================================\n');

  // Check if source image exists
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error('❌ Source image not found:', SOURCE_IMAGE);
    console.log('\n📌 Please create a 512x512 PNG logo and place it at:');
    console.log('   ', SOURCE_IMAGE);
    console.log('\n   Alternatively, use the SVG templates provided\n');
    process.exit(1);
  }

  const sourceBuffer = fs.readFileSync(SOURCE_IMAGE);

  // Generate xxxhdpi mipmap icons
  await generateStandardXxxhdpiMipmapIcons(sourceBuffer);
  await generateAdaptiveXxxhdpiIcons(sourceBuffer);
  await generateXxxhdpiXMLFiles();

  console.log('\n🎉 All Android xxxhdpi mipmap icons generated successfully!');
  console.log('================================================');
}

// ============================================================================
// Generate Standard xxxhdpi Mipmap Icons
// ============================================================================

async function generateStandardXxxhdpiMipmapIcons(sourceBuffer) {
  console.log('📱 Generating standard xxxhdpi mipmap icons (192x192)...');

  for (const [density, config] of Object.entries(XXXHDPI_MIPMAP_CONFIG)) {
    const dirPath = path.join(OUTPUT_DIR, density);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Generate regular icon
    const regularPath = path.join(dirPath, config.regular.name);
    await sharp(sourceBuffer)
      .resize(config.regular.size, config.regular.size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
        kernel: sharp.kernel.lanczos3,
      })
      .png({
        compressionLevel: 9,
        quality: 100,
        force: true,
      })
      .toFile(regularPath);
    console.log(`   ✅ ${config.regular.name} (192x192) → ${density}`);

    // Generate round icon
    const roundPath = path.join(dirPath, config.round.name);
    await generateRoundIcon(sourceBuffer, config.round.size, roundPath);
    console.log(`   ✅ ${config.round.name} (192x192) → ${density}`);
  }
}

// ============================================================================
// Generate Round Icon
// ============================================================================

async function generateRoundIcon(sourceBuffer, size, outputPath) {
  // Create circular mask
  const svgMask = `
    <svg width="${size}" height="${size}">
      <defs>
        <clipPath id="circleClip">
          <circle cx="${size/2}" cy="${size/2}" r="${size/2}" />
        </clipPath>
      </defs>
      <rect width="${size}" height="${size}" fill="white" clip-path="url(#circleClip)" />
    </svg>
  `;

  const maskBuffer = await sharp(Buffer.from(svgMask))
    .png()
    .toBuffer();

  await sharp(sourceBuffer)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
      kernel: sharp.kernel.lanczos3,
    })
    .composite([{
      input: maskBuffer,
      blend: 'dest-in',
    }])
    .png({
      compressionLevel: 9,
      quality: 100,
      force: true,
    })
    .toFile(outputPath);
}

// ============================================================================
// Generate Adaptive xxxhdpi Icons
// ============================================================================

async function generateAdaptiveXxxhdpiIcons(sourceBuffer) {
  console.log('\n🎨 Generating adaptive xxxhdpi icons (432x432)...');

  for (const [density, config] of Object.entries(ADAPTIVE_XXXHDPI)) {
    const dirPath = path.join(OUTPUT_DIR, density);
    
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const size = config.size;
    const paddedSize = Math.floor(size * 0.6);
    const padding = Math.floor(size * 0.2);

    // Generate foreground (regular)
    const foregroundPath = path.join(dirPath, config.foreground);
    await sharp(sourceBuffer)
      .resize(paddedSize, paddedSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
        kernel: sharp.kernel.lanczos3,
      })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png({
        compressionLevel: 9,
        quality: 100,
        force: true,
      })
      .toFile(foregroundPath);
    console.log(`   ✅ ${config.foreground} (${size}x${size}) → ${density}`);

    // Generate foreground (round)
    const foregroundRoundPath = path.join(dirPath, config.foregroundRound);
    await generateRoundIconForAdaptive(sourceBuffer, size, foregroundRoundPath);
    console.log(`   ✅ ${config.foregroundRound} (${size}x${size}) → ${density}`);

    // Generate background (regular)
    const backgroundPath = path.join(dirPath, config.background);
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 25, g: 118, b: 210, alpha: 1 },
      },
    })
      .png({
        compressionLevel: 9,
        quality: 100,
        force: true,
      })
      .toFile(backgroundPath);
    console.log(`   ✅ ${config.background} (${size}x${size}) → ${density}`);

    // Generate background (round)
    const backgroundRoundPath = path.join(dirPath, config.backgroundRound);
    await generateRoundBackground(size, backgroundRoundPath);
    console.log(`   ✅ ${config.backgroundRound} (${size}x${size}) → ${density}`);
  }
}

// ============================================================================
// Generate Round Icon for Adaptive
// ============================================================================

async function generateRoundIconForAdaptive(sourceBuffer, size, outputPath) {
  const paddedSize = Math.floor(size * 0.6);
  const padding = Math.floor(size * 0.2);

  // Create circular mask
  const svgMask = `
    <svg width="${size}" height="${size}">
      <defs>
        <clipPath id="circleClip">
          <circle cx="${size/2}" cy="${size/2}" r="${size/2}" />
        </clipPath>
      </defs>
      <rect width="${size}" height="${size}" fill="white" clip-path="url(#circleClip)" />
    </svg>
  `;

  const maskBuffer = await sharp(Buffer.from(svgMask))
    .png()
    .toBuffer();

  await sharp(sourceBuffer)
    .resize(paddedSize, paddedSize, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
      kernel: sharp.kernel.lanczos3,
    })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .composite([{
      input: maskBuffer,
      blend: 'dest-in',
    }])
    .png({
      compressionLevel: 9,
      quality: 100,
      force: true,
    })
    .toFile(outputPath);
}

// ============================================================================
// Generate Round Background
// ============================================================================

async function generateRoundBackground(size, outputPath) {
  const svgMask = `
    <svg width="${size}" height="${size}">
      <defs>
        <clipPath id="circleClip">
          <circle cx="${size/2}" cy="${size/2}" r="${size/2}" />
        </clipPath>
      </defs>
      <rect width="${size}" height="${size}" fill="white" clip-path="url(#circleClip)" />
    </svg>
  `;

  const maskBuffer = await sharp(Buffer.from(svgMask))
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 25, g: 118, b: 210, alpha: 1 },
    },
  })
    .composite([{
      input: maskBuffer,
      blend: 'dest-in',
    }])
    .png({
      compressionLevel: 9,
      quality: 100,
      force: true,
    })
    .toFile(outputPath);
}

// ============================================================================
// Generate XML Files
// ============================================================================

async function generateXxxhdpiXMLFiles() {
  console.log('\n📄 Generating xxxhdpi XML configuration files...');

  const regularXML = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`;

  const roundXML = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_round_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_round_foreground"/>
</adaptive-icon>`;

  const dirPath = path.join(OUTPUT_DIR, 'mipmap-xxxhdpi');
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Write regular adaptive XML
  const regularPath = path.join(dirPath, 'ic_launcher.xml');
  fs.writeFileSync(regularPath, regularXML);
  console.log(`   ✅ ic_launcher.xml → mipmap-xxxhdpi`);

  // Write round adaptive XML
  const roundPath = path.join(dirPath, 'ic_launcher_round.xml');
  fs.writeFileSync(roundPath, roundXML);
  console.log(`   ✅ ic_launcher_round.xml → mipmap-xxxhdpi`);
}

// ============================================================================
// Create SVG Templates
// ============================================================================

function createSVGTemplates() {
  const assetsDir = path.join(__dirname, '../assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // Regular icon SVG
  const regularPath = path.join(assetsDir, 'logo.svg');
  if (!fs.existsSync(regularPath)) {
    fs.writeFileSync(regularPath, SVG_TEMPLATES.regular);
    console.log('✅ Created logo.svg template');
  }

  // Round icon SVG
  const roundPath = path.join(assetsDir, 'logo-round.svg');
  if (!fs.existsSync(roundPath)) {
    fs.writeFileSync(roundPath, SVG_TEMPLATES.round);
    console.log('✅ Created logo-round.svg template');
  }
}

// ============================================================================
// Manual ImageMagick Commands
// ============================================================================

const IMAGEMAGICK_COMMANDS = `
# ============================================================================
# ImageMagick Commands for xxxhdpi Mipmap Icons
# ============================================================================

# 1. Create mipmap-xxxhdpi regular icon (192x192)
convert source.png -resize 192x192 -background none -gravity center \\
  -extent 192x192 -antialias android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

# 2. Create mipmap-xxxhdpi round icon (192x192)
convert source.png -resize 192x192 -background none -gravity center \\
  -extent 192x192 -format png - | \\
  convert - -draw "circle 96,96 96,0" -alpha set -compose copy-opacity -composite \\
  -antialias android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png

# 3. Adaptive xxxhdpi icons (432x432)
# Foreground
convert source.png -resize 260x260 -background none -gravity center \\
  -extent 432x432 -antialias android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png

# Background
convert -size 432x432 xc:#1976d2 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_background.png

# Round foreground
convert source.png -resize 260x260 -background none -gravity center \\
  -extent 432x432 -format png - | \\
  convert - -draw "circle 216,216 216,0" -alpha set -compose copy-opacity -composite \\
  android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round_foreground.png

# Round background
convert -size 432x432 xc:#1976d2 -format png - | \\
  convert - -draw "circle 216,216 216,0" -alpha set -compose copy-opacity -composite \\
  android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round_background.png
`;

// ============================================================================
// Run
// ============================================================================

// Create SVG templates
createSVGTemplates();

// Check if source image exists
if (!fs.existsSync(SOURCE_IMAGE)) {
  console.log('\n📌 Please create a 512x512 PNG logo and place it at:');
  console.log('   ', SOURCE_IMAGE);
  console.log('\n   Steps:');
  console.log('   1. Use the SVG templates in mobile/assets/');
  console.log('   2. Convert SVG to PNG using an online converter');
  console.log('   3. Save as logo-512x512.png\n');
  process.exit(0);
}

// Generate all xxxhdpi mipmap icons
generateXxxhdpiMipmapIcons().catch(console.error);