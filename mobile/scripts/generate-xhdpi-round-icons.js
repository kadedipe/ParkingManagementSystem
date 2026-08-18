#!/usr/bin/env node

// ============================================================================
// Android xhdpi Round Icon Generator
// ============================================================================

/**
 * Script to generate all Android xhdpi round app icons
 * 
 * Run: node scripts/generate-xhdpi-round-icons.js
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

// xhdpi round icon configurations (96x96)
const XHDPI_ROUND_CONFIG = {
  // Drawable xhdpi round icon
  'drawable-xhdpi': {
    size: 96,
    name: 'ic_launcher_round.png',
  },
  // Mipmap xhdpi round icon
  'mipmap-xhdpi': {
    size: 96,
    name: 'ic_launcher_round.png',
  },
};

// Adaptive xhdpi round icons (Android 8.0+)
const ADAPTIVE_XHDPI_ROUND = {
  'mipmap-xhdpi': {
    size: 216,
    foreground: 'ic_launcher_round_foreground.png',
    background: 'ic_launcher_round_background.png',
  },
};

// ============================================================================
// SVG Template for Round Icon
// ============================================================================

const ROUND_SVG_TEMPLATE = `<!-- ============================================================================
     xhdpi Round App Icon SVG Template (512x512)
     ============================================================================ -->

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="roundGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#42a5f5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1976d2;stop-opacity:1" />
    </radialGradient>
    
    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1976d2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#42a5f5;stop-opacity:1" />
    </linearGradient>
    
    <clipPath id="roundClip">
      <circle cx="256" cy="256" r="240" />
    </clipPath>
    
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="0.2"/>
    </filter>
  </defs>
  
  <!-- Round background with gradient -->
  <circle cx="256" cy="256" r="240" fill="url(#roundGradient)" />
  
  <!-- Subtle white border -->
  <circle cx="256" cy="256" r="232" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.2" />
  
  <!-- Inner glow -->
  <circle cx="256" cy="256" r="200" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.1" />
  
  <!-- Parking "P" symbol -->
  <g clip-path="url(#roundClip)" filter="url(#shadow)">
    <!-- Main P shape background -->
    <rect x="170" y="110" width="172" height="292" rx="36" fill="#ffffff" opacity="0.95" />
    
    <!-- P vertical bar -->
    <rect x="210" y="150" width="92" height="100" rx="16" fill="#1976d2" />
    
    <!-- P horizontal bar -->
    <rect x="210" y="270" width="92" height="100" rx="16" fill="#1976d2" />
    
    <!-- P inner highlight -->
    <rect x="218" y="158" width="76" height="84" rx="12" fill="#42a5f5" opacity="0.3" />
    <rect x="218" y="278" width="76" height="84" rx="12" fill="#42a5f5" opacity="0.3" />
  </g>
  
  <!-- Car symbol -->
  <g clip-path="url(#roundClip)">
    <!-- Car body -->
    <rect x="100" y="350" width="312" height="60" rx="30" fill="#ffffff" opacity="0.95" />
    
    <!-- Car top -->
    <rect x="150" y="310" width="212" height="50" rx="25" fill="#ffffff" opacity="0.8" />
    
    <!-- Windows -->
    <rect x="170" y="320" width="60" height="30" rx="8" fill="#1976d2" opacity="0.3" />
    <rect x="242" y="320" width="60" height="30" rx="8" fill="#1976d2" opacity="0.3" />
    <rect x="314" y="320" width="30" height="30" rx="8" fill="#1976d2" opacity="0.3" />
    
    <!-- Wheels -->
    <circle cx="170" cy="390" r="32" fill="#1976d2" stroke="#ffffff" stroke-width="6" />
    <circle cx="170" cy="390" r="16" fill="#ffffff" opacity="0.3" />
    <circle cx="342" cy="390" r="32" fill="#1976d2" stroke="#ffffff" stroke-width="6" />
    <circle cx="342" cy="390" r="16" fill="#ffffff" opacity="0.3" />
    
    <!-- Headlights -->
    <rect x="95" y="365" width="20" height="10" rx="5" fill="#ffeb3b" opacity="0.8" />
    <rect x="397" y="365" width="20" height="10" rx="5" fill="#f44336" opacity="0.8" />
  </g>
</svg>`;

// ============================================================================
// Main Function
// ============================================================================

async function generateXhdpiRoundIcons() {
  console.log('🎨 Generating Android xhdpi round app icons...');
  console.log('================================================\n');

  // Check if source image exists
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error('❌ Source image not found:', SOURCE_IMAGE);
    console.log('\n📌 Please create a 512x512 PNG logo and place it at:');
    console.log('   ', SOURCE_IMAGE);
    console.log('\n   Alternatively, use the SVG template provided\n');
    process.exit(1);
  }

  const sourceBuffer = fs.readFileSync(SOURCE_IMAGE);

  // Generate standard xhdpi round icons
  await generateStandardXhdpiRoundIcons(sourceBuffer);

  // Generate adaptive xhdpi round icons
  await generateAdaptiveXhdpiRoundIcons(sourceBuffer);

  // Generate XML files
  await generateXhdpiRoundXMLFiles();

  console.log('\n🎉 All Android xhdpi round icons generated successfully!');
  console.log('================================================');
}

// ============================================================================
// Generate Standard xhdpi Round Icons
// ============================================================================

async function generateStandardXhdpiRoundIcons(sourceBuffer) {
  console.log('📱 Generating standard xhdpi round icons (96x96)...');

  for (const [density, config] of Object.entries(XHDPI_ROUND_CONFIG)) {
    const dirPath = path.join(OUTPUT_DIR, density);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const outputPath = path.join(dirPath, config.name);
    
    // Generate circular icon
    await generateCircularIcon(sourceBuffer, config.size, outputPath);
    console.log(`   ✅ ${config.name} (96x96) → ${density}`);
  }
}

// ============================================================================
// Generate Circular Icon
// ============================================================================

async function generateCircularIcon(sourceBuffer, size, outputPath) {
  // Create circular mask
  const svgMask = `
    <svg width="${size}" height="${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white" />
    </svg>
  `;

  const maskBuffer = await sharp(Buffer.from(svgMask))
    .png()
    .toBuffer();

  await sharp(sourceBuffer)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .composite([{
      input: maskBuffer,
      blend: 'dest-in',
    }])
    .png()
    .toFile(outputPath);
}

// ============================================================================
// Generate Adaptive xhdpi Round Icons
// ============================================================================

async function generateAdaptiveXhdpiRoundIcons(sourceBuffer) {
  console.log('\n🎨 Generating adaptive xhdpi round icons (216x216)...');

  for (const [density, config] of Object.entries(ADAPTIVE_XHDPI_ROUND)) {
    const dirPath = path.join(OUTPUT_DIR, density);
    
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const size = config.size;
    const paddedSize = Math.floor(size * 0.6);
    const padding = Math.floor(size * 0.2);

    // Generate foreground (round)
    const foregroundPath = path.join(dirPath, config.foreground);
    await generateCircularAdaptiveForeground(sourceBuffer, size, foregroundPath);
    console.log(`   ✅ ${config.foreground} (${size}x${size}) → ${density}`);

    // Generate background (round)
    const backgroundPath = path.join(dirPath, config.background);
    await generateCircularBackground(size, backgroundPath);
    console.log(`   ✅ ${config.background} (${size}x${size}) → ${density}`);
  }
}

// ============================================================================
// Generate Circular Adaptive Foreground
// ============================================================================

async function generateCircularAdaptiveForeground(sourceBuffer, size, outputPath) {
  const paddedSize = Math.floor(size * 0.6);
  const padding = Math.floor(size * 0.2);

  // Create circular mask
  const svgMask = `
    <svg width="${size}" height="${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white" />
    </svg>
  `;

  const maskBuffer = await sharp(Buffer.from(svgMask))
    .png()
    .toBuffer();

  await sharp(sourceBuffer)
    .resize(paddedSize, paddedSize, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
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
    .png()
    .toFile(outputPath);
}

// ============================================================================
// Generate Circular Background
// ============================================================================

async function generateCircularBackground(size, outputPath) {
  const svgMask = `
    <svg width="${size}" height="${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white" />
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
      background: { r: 25, g: 118, b: 210, alpha: 1 }, // Primary color #1976d2
    },
  })
    .composite([{
      input: maskBuffer,
      blend: 'dest-in',
    }])
    .png()
    .toFile(outputPath);
}

// ============================================================================
// Generate XML Files
// ============================================================================

async function generateXhdpiRoundXMLFiles() {
  console.log('\n📄 Generating xhdpi round XML configuration files...');

  const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_round_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_round_foreground"/>
</adaptive-icon>`;

  const dirPath = path.join(OUTPUT_DIR, 'mipmap-xhdpi');
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const xmlPath = path.join(dirPath, 'ic_launcher_round.xml');
  fs.writeFileSync(xmlPath, xmlContent);
  console.log(`   ✅ ic_launcher_round.xml → mipmap-xhdpi`);
}

// ============================================================================
// Create SVG Template
// ============================================================================

function createSVGTemplate() {
  const assetsDir = path.join(__dirname, '../assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const svgPath = path.join(assetsDir, 'logo-round.svg');
  if (!fs.existsSync(svgPath)) {
    fs.writeFileSync(svgPath, ROUND_SVG_TEMPLATE);
    console.log('✅ Created round SVG template at:', svgPath);
  }
}

// ============================================================================
// Manual ImageMagick Commands
// ============================================================================

const IMAGEMAGICK_COMMANDS = `
# ============================================================================
# ImageMagick Commands for xhdpi Round Icons
# ============================================================================

# 1. Create drawable-xhdpi round icon (96x96)
convert source.png -resize 96x96 -background none -gravity center \\
  -extent 96x96 -format png - | \\
  convert - -draw "circle 48,48 48,0" -alpha set -compose copy-opacity -composite \\
  android/app/src/main/res/drawable-xhdpi/ic_launcher_round.png

# 2. Create mipmap-xhdpi round icon (96x96)
convert source.png -resize 96x96 -background none -gravity center \\
  -extent 96x96 -format png - | \\
  convert - -draw "circle 48,48 48,0" -alpha set -compose copy-opacity -composite \\
  android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png

# 3. Create adaptive xhdpi round foreground (216x216)
convert source.png -resize 130x130 -background none -gravity center \\
  -extent 216x216 -format png - | \\
  convert - -draw "circle 108,108 108,0" -alpha set -compose copy-opacity -composite \\
  android/app/src/main/res/mipmap-xhdpi/ic_launcher_round_foreground.png

# 4. Create adaptive xhdpi round background (216x216)
convert -size 216x216 xc:#1976d2 -format png - | \\
  convert - -draw "circle 108,108 108,0" -alpha set -compose copy-opacity -composite \\
  android/app/src/main/res/mipmap-xhdpi/ic_launcher_round_background.png
`;

// ============================================================================
// Run
// ============================================================================

// Create SVG template
createSVGTemplate();

// Check if source image exists
if (!fs.existsSync(SOURCE_IMAGE)) {
  console.log('\n📌 Please create a 512x512 PNG logo and place it at:');
  console.log('   ', SOURCE_IMAGE);
  console.log('\n   Steps:');
  console.log('   1. Use the SVG template in mobile/assets/logo-round.svg');
  console.log('   2. Convert SVG to PNG using an online converter');
  console.log('   3. Save as logo-512x512.png\n');
  process.exit(0);
}

// Generate all xhdpi round icons
generateXhdpiRoundIcons().catch(console.error);