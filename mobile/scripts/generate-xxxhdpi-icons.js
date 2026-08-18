#!/usr/bin/env node

// ============================================================================
// Android xxxhdpi Icon Generator
// ============================================================================

/**
 * Script to generate all Android xxxhdpi app icons
 * 
 * Run: node scripts/generate-xxxhdpi-icons.js
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

// xxxhdpi icon configurations (192x192)
const XXXHDPI_CONFIG = {
  // Drawable icons
  'drawable-xxxhdpi': {
    regular: { size: 192, name: 'ic_launcher.png' },
    round: { size: 192, name: 'ic_launcher_round.png' },
  },
  // Mipmap icons
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
    
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="0.2"/>
    </filter>
    
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background with gradient and subtle glow -->
  <rect x="0" y="0" width="512" height="512" rx="128" fill="url(#iconGradient)" filter="url(#glow)" />
  
  <!-- Inner decorative border -->
  <rect x="20" y="20" width="472" height="472" rx="108" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.1" />
  
  <!-- Parking "P" symbol with shadow -->
  <g filter="url(#shadow)">
    <!-- Main P shape background -->
    <rect x="170" y="110" width="172" height="292" rx="36" fill="#ffffff" opacity="0.95" />
    
    <!-- P vertical bar with gradient -->
    <rect x="210" y="150" width="92" height="100" rx="16" fill="url(#iconGradient)" />
    
    <!-- P horizontal bar -->
    <rect x="210" y="270" width="92" height="100" rx="16" fill="url(#iconGradient)" />
    
    <!-- P inner highlight -->
    <rect x="218" y="158" width="76" height="84" rx="12" fill="#ffffff" opacity="0.2" />
    <rect x="218" y="278" width="76" height="84" rx="12" fill="#ffffff" opacity="0.2" />
  </g>
  
  <!-- Car symbol -->
  <g filter="url(#shadow)">
    <!-- Car body -->
    <rect x="100" y="350" width="312" height="60" rx="30" fill="#ffffff" opacity="0.95" />
    
    <!-- Car top -->
    <rect x="150" y="310" width="212" height="50" rx="25" fill="#ffffff" opacity="0.85" />
    
    <!-- Windows -->
    <rect x="170" y="320" width="60" height="30" rx="8" fill="url(#iconGradient)" opacity="0.3" />
    <rect x="242" y="320" width="60" height="30" rx="8" fill="url(#iconGradient)" opacity="0.3" />
    <rect x="314" y="320" width="30" height="30" rx="8" fill="url(#iconGradient)" opacity="0.3" />
    
    <!-- Wheels -->
    <circle cx="170" cy="390" r="32" fill="url(#iconGradient)" stroke="#ffffff" stroke-width="6" />
    <circle cx="342" cy="390" r="32" fill="url(#iconGradient)" stroke="#ffffff" stroke-width="6" />
    
    <!-- Wheel hubs -->
    <circle cx="170" cy="390" r="12" fill="#ffffff" opacity="0.3" />
    <circle cx="342" cy="390" r="12" fill="#ffffff" opacity="0.3" />
    
    <!-- Headlights -->
    <rect x="95" y="365" width="20" height="10" rx="5" fill="#ffeb3b" opacity="0.9" filter="url(#glow)" />
    <rect x="397" y="365" width="20" height="10" rx="5" fill="#f44336" opacity="0.9" filter="url(#glow)" />
    
    <!-- Tail lights -->
    <rect x="95" y="380" width="8" height="8" rx="4" fill="#f44336" opacity="0.5" />
    <rect x="409" y="380" width="8" height="8" rx="4" fill="#ffeb3b" opacity="0.5" />
  </g>
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
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="0.2"/>
    </filter>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Round background -->
  <circle cx="256" cy="256" r="240" fill="url(#roundGradient)" filter="url(#glow)" />
  
  <!-- Decorative rings -->
  <circle cx="256" cy="256" r="232" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.2" />
  <circle cx="256" cy="256" r="180" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.1" />
  <circle cx="256" cy="256" r="140" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.05" />
  
  <!-- Parking "P" symbol -->
  <g clip-path="url(#roundClip)" filter="url(#shadow)">
    <rect x="170" y="110" width="172" height="292" rx="36" fill="#ffffff" opacity="0.95" />
    <rect x="210" y="150" width="92" height="100" rx="16" fill="url(#roundGradient)" />
    <rect x="210" y="270" width="92" height="100" rx="16" fill="url(#roundGradient)" />
    <rect x="218" y="158" width="76" height="84" rx="12" fill="#ffffff" opacity="0.2" />
    <rect x="218" y="278" width="76" height="84" rx="12" fill="#ffffff" opacity="0.2" />
  </g>
  
  <!-- Car symbol -->
  <g clip-path="url(#roundClip)">
    <rect x="100" y="350" width="312" height="60" rx="30" fill="#ffffff" opacity="0.95" filter="url(#shadow)" />
    <rect x="150" y="310" width="212" height="50" rx="25" fill="#ffffff" opacity="0.85" />
    <rect x="170" y="320" width="60" height="30" rx="8" fill="url(#roundGradient)" opacity="0.3" />
    <rect x="242" y="320" width="60" height="30" rx="8" fill="url(#roundGradient)" opacity="0.3" />
    <rect x="314" y="320" width="30" height="30" rx="8" fill="url(#roundGradient)" opacity="0.3" />
    <circle cx="170" cy="390" r="32" fill="url(#roundGradient)" stroke="#ffffff" stroke-width="6" />
    <circle cx="342" cy="390" r="32" fill="url(#roundGradient)" stroke="#ffffff" stroke-width="6" />
    <circle cx="170" cy="390" r="12" fill="#ffffff" opacity="0.3" />
    <circle cx="342" cy="390" r="12" fill="#ffffff" opacity="0.3" />
    <rect x="95" y="365" width="20" height="10" rx="5" fill="#ffeb3b" opacity="0.9" filter="url(#glow)" />
    <rect x="397" y="365" width="20" height="10" rx="5" fill="#f44336" opacity="0.9" filter="url(#glow)" />
  </g>
</svg>`,
};

// ============================================================================
// Main Function
// ============================================================================

async function generateXxxhdpiIcons() {
  console.log('🎨 Generating Android xxxhdpi app icons...');
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

  // Generate xxxhdpi icons
  await generateStandardXxxhdpiIcons(sourceBuffer);
  await generateAdaptiveXxxhdpiIcons(sourceBuffer);
  await generateXxxhdpiXMLFiles();

  console.log('\n🎉 All Android xxxhdpi icons generated successfully!');
  console.log('================================================');
}

// ============================================================================
// Generate Standard xxxhdpi Icons
// ============================================================================

async function generateStandardXxxhdpiIcons(sourceBuffer) {
  console.log('📱 Generating standard xxxhdpi icons (192x192)...');

  for (const [density, config] of Object.entries(XXXHDPI_CONFIG)) {
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
    await generateHighQualityRoundIcon(sourceBuffer, config.round.size, roundPath);
    console.log(`   ✅ ${config.round.name} (192x192) → ${density}`);
  }
}

// ============================================================================
// Generate High Quality Round Icon
// ============================================================================

async function generateHighQualityRoundIcon(sourceBuffer, size, outputPath) {
  // Create circular mask with anti-aliasing
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
    await generateHighQualityRoundIconForAdaptive(sourceBuffer, size, foregroundRoundPath);
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
    await generateHighQualityRoundBackground(size, backgroundRoundPath);
    console.log(`   ✅ ${config.backgroundRound} (${size}x${size}) → ${density}`);
  }
}

// ============================================================================
// Generate High Quality Round Icon for Adaptive
// ============================================================================

async function generateHighQualityRoundIconForAdaptive(sourceBuffer, size, outputPath) {
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
// Generate High Quality Round Background
// ============================================================================

async function generateHighQualityRoundBackground(size, outputPath) {
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
# ImageMagick Commands for xxxhdpi Icons
# ============================================================================

# 1. Create drawable-xxxhdpi regular icon (192x192)
convert source.png -resize 192x192 -background none -gravity center \\
  -extent 192x192 -antialias android/app/src/main/res/drawable-xxxhdpi/ic_launcher.png

# 2. Create drawable-xxxhdpi round icon (192x192)
convert source.png -resize 192x192 -background none -gravity center \\
  -extent 192x192 -format png - | \\
  convert - -draw "circle 96,96 96,0" -alpha set -compose copy-opacity -composite \\
  -antialias android/app/src/main/res/drawable-xxxhdpi/ic_launcher_round.png

# 3. Create mipmap-xxxhdpi icons
convert source.png -resize 192x192 -background none -gravity center \\
  -extent 192x192 -antialias android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

convert source.png -resize 192x192 -background none -gravity center \\
  -extent 192x192 -format png - | \\
  convert - -draw "circle 96,96 96,0" -alpha set -compose copy-opacity -composite \\
  -antialias android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png

# 4. Adaptive xxxhdpi icons (432x432)
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

// Generate all xxxhdpi icons
generateXxxhdpiIcons().catch(console.error);