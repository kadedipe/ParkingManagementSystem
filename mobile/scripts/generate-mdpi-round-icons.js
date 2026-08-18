#!/usr/bin/env node

// ============================================================================
// Android mdpi Round Icon Generator
// ============================================================================

/**
 * Script to generate all Android mdpi round app icons
 * 
 * Run: node scripts/generate-mdpi-round-icons.js
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

// mdpi round icon configurations (48x48)
const MDPI_ROUND_CONFIG = {
  // Drawable mdpi round icon
  'drawable-mdpi': {
    size: 48,
    name: 'ic_launcher_round.png',
  },
  // Mipmap mdpi round icon
  'mipmap-mdpi': {
    size: 48,
    name: 'ic_launcher_round.png',
  },
};

// Adaptive mdpi round icons (Android 8.0+)
const ADAPTIVE_MDPI_ROUND = {
  'mipmap-mdpi': {
    size: 108,
    foreground: 'ic_launcher_round_foreground.png',
    background: 'ic_launcher_round_background.png',
  },
};

// ============================================================================
// SVG Template for Round Icon
// ============================================================================

const ROUND_SVG_TEMPLATE = `<!-- ============================================================================
     mdpi Round App Icon SVG Template (512x512)
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
  
  <!-- Parking "P" symbol -->
  <g clip-path="url(#roundClip)" filter="url(#shadow)">
    <!-- Main P shape background -->
    <rect x="170" y="110" width="172" height="292" rx="36" fill="#ffffff" opacity="0.95" />
    
    <!-- P vertical bar -->
    <rect x="210" y="150" width="92" height="100" rx="16" fill="#1976d2" />
    
    <!-- P horizontal bar -->
    <rect x="210" y="270" width="92" height="100" rx="16" fill="#1976d2" />
  </g>
  
  <!-- Car symbol -->
  <g clip-path="url(#roundClip)">
    <!-- Car body -->
    <rect x="100" y="350" width="312" height="60" rx="30" fill="#ffffff" opacity="0.95" />
    
    <!-- Wheels -->
    <circle cx="170" cy="390" r="32" fill="#1976d2" stroke="#ffffff" stroke-width="6" />
    <circle cx="342" cy="390" r="32" fill="#1976d2" stroke="#ffffff" stroke-width="6" />
  </g>
</svg>`;

// ============================================================================
// Main Function
// ============================================================================

async function generateMdpiRoundIcons() {
  console.log('🎨 Generating Android mdpi round app icons...');
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

  // Generate standard mdpi round icons
  await generateStandardMdpiRoundIcons(sourceBuffer);

  // Generate adaptive mdpi round icons
  await generateAdaptiveMdpiRoundIcons(sourceBuffer);

  // Generate XML files
  await generateMdpiRoundXMLFiles();

  console.log('\n🎉 All Android mdpi round icons generated successfully!');
  console.log('================================================');
}

// ============================================================================
// Generate Standard mdpi Round Icons
// ============================================================================

async function generateStandardMdpiRoundIcons(sourceBuffer) {
  console.log('📱 Generating standard mdpi round icons (48x48)...');

  for (const [density, config] of Object.entries(MDPI_ROUND_CONFIG)) {
    const dirPath = path.join(OUTPUT_DIR, density);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const outputPath = path.join(dirPath, config.name);
    
    // Generate circular icon
    await generateCircularIcon(sourceBuffer, config.size, outputPath);
    console.log(`   ✅ ${config.name} (48x48) → ${density}`);
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
// Generate Adaptive mdpi Round Icons
// ============================================================================

async function generateAdaptiveMdpiRoundIcons(sourceBuffer) {
  console.log('\n🎨 Generating adaptive mdpi round icons (108x108)...');

  for (const [density, config] of Object.entries(ADAPTIVE_MDPI_ROUND)) {
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

async function generateMdpiRoundXMLFiles() {
  console.log('\n📄 Generating mdpi round XML configuration files...');

  const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_round_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_round_foreground"/>
</adaptive-icon>`;

  const dirPath = path.join(OUTPUT_DIR, 'mipmap-mdpi');
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const xmlPath = path.join(dirPath, 'ic_launcher_round.xml');
  fs.writeFileSync(xmlPath, xmlContent);
  console.log(`   ✅ ic_launcher_round.xml → mipmap-mdpi`);
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
# ImageMagick Commands for mdpi Round Icons
# ============================================================================

# 1. Create drawable-mdpi round icon (48x48)
convert source.png -resize 48x48 -background none -gravity center \\
  -extent 48x48 -format png - | \\
  convert - -draw "circle 24,24 24,0" -alpha set -compose copy-opacity -composite \\
  android/app/src/main/res/drawable-mdpi/ic_launcher_round.png

# 2. Create mipmap-mdpi round icon (48x48)
convert source.png -resize 48x48 -background none -gravity center \\
  -extent 48x48 -format png - | \\
  convert - -draw "circle 24,24 24,0" -alpha set -compose copy-opacity -composite \\
  android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png

# 3. Create adaptive mdpi round foreground (108x108)
convert source.png -resize 65x65 -background none -gravity center \\
  -extent 108x108 -format png - | \\
  convert - -draw "circle 54,54 54,0" -alpha set -compose copy-opacity -composite \\
  android/app/src/main/res/mipmap-mdpi/ic_launcher_round_foreground.png

# 4. Create adaptive mdpi round background (108x108)
convert -size 108x108 xc:#1976d2 -format png - | \\
  convert - -draw "circle 54,54 54,0" -alpha set -compose copy-opacity -composite \\
  android/app/src/main/res/mipmap-mdpi/ic_launcher_round_background.png
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

// Generate all mdpi round icons
generateMdpiRoundIcons().catch(console.error);