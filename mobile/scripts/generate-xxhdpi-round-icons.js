#!/usr/bin/env node

// ============================================================================
// Android xxhdpi Round Icon Generator
// ============================================================================

/**
 * Script to generate all Android xxhdpi round app icons
 * 
 * Run: node scripts/generate-xxhdpi-round-icons.js
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

// xxhdpi round icon configurations (144x144)
const XXHDPI_ROUND_CONFIG = {
  // Drawable xxhdpi round icon
  'drawable-xxhdpi': {
    size: 144,
    name: 'ic_launcher_round.png',
  },
  // Mipmap xxhdpi round icon
  'mipmap-xxhdpi': {
    size: 144,
    name: 'ic_launcher_round.png',
  },
};

// Adaptive xxhdpi round icons (Android 8.0+)
const ADAPTIVE_XXHDPI_ROUND = {
  'mipmap-xxhdpi': {
    size: 324,
    foreground: 'ic_launcher_round_foreground.png',
    background: 'ic_launcher_round_background.png',
  },
};

// ============================================================================
// SVG Template for Round Icon
// ============================================================================

const ROUND_SVG_TEMPLATE = `<!-- ============================================================================
     xxhdpi Round App Icon SVG Template (512x512)
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
    
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Round background with gradient -->
  <circle cx="256" cy="256" r="240" fill="url(#roundGradient)" />
  
  <!-- Outer glow -->
  <circle cx="256" cy="256" r="232" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.3" filter="url(#glow)" />
  
  <!-- Inner decorative rings -->
  <circle cx="256" cy="256" r="180" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.1" />
  <circle cx="256" cy="256" r="140" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.05" />
  
  <!-- Parking "P" symbol -->
  <g clip-path="url(#roundClip)" filter="url(#shadow)">
    <!-- Main P shape background with rounded corners -->
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
  <g clip-path="url(#roundClip)">
    <!-- Car body with shadow -->
    <rect x="100" y="350" width="312" height="60" rx="30" fill="#ffffff" opacity="0.95" filter="url(#shadow)" />
    
    <!-- Car top -->
    <rect x="150" y="310" width="212" height="50" rx="25" fill="#ffffff" opacity="0.85" />
    
    <!-- Windows with gradient -->
    <rect x="170" y="320" width="60" height="30" rx="8" fill="url(#iconGradient)" opacity="0.3" />
    <rect x="242" y="320" width="60" height="30" rx="8" fill="url(#iconGradient)" opacity="0.3" />
    <rect x="314" y="320" width="30" height="30" rx="8" fill="url(#iconGradient)" opacity="0.3" />
    
    <!-- Window reflections -->
    <rect x="175" y="325" width="50" height="4" rx="2" fill="#ffffff" opacity="0.5" />
    <rect x="247" y="325" width="50" height="4" rx="2" fill="#ffffff" opacity="0.5" />
    
    <!-- Wheels with inner detail -->
    <circle cx="170" cy="390" r="32" fill="url(#iconGradient)" stroke="#ffffff" stroke-width="6" />
    <circle cx="170" cy="390" r="20" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.3" />
    <circle cx="170" cy="390" r="8" fill="#ffffff" opacity="0.3" />
    
    <circle cx="342" cy="390" r="32" fill="url(#iconGradient)" stroke="#ffffff" stroke-width="6" />
    <circle cx="342" cy="390" r="20" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.3" />
    <circle cx="342" cy="390" r="8" fill="#ffffff" opacity="0.3" />
    
    <!-- Headlights with glow -->
    <rect x="95" y="365" width="20" height="10" rx="5" fill="#ffeb3b" opacity="0.9" filter="url(#glow)" />
    <rect x="397" y="365" width="20" height="10" rx="5" fill="#f44336" opacity="0.9" filter="url(#glow)" />
    
    <!-- Tail lights -->
    <rect x="95" y="380" width="8" height="8" rx="4" fill="#f44336" opacity="0.5" />
    <rect x="409" y="380" width="8" height="8" rx="4" fill="#ffeb3b" opacity="0.5" />
  </g>
</svg>`;

// ============================================================================
// Main Function
// ============================================================================

async function generateXxhdpiRoundIcons() {
  console.log('🎨 Generating Android xxhdpi round app icons...');
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

  // Generate standard xxhdpi round icons
  await generateStandardXxhdpiRoundIcons(sourceBuffer);

  // Generate adaptive xxhdpi round icons
  await generateAdaptiveXxhdpiRoundIcons(sourceBuffer);

  // Generate XML files
  await generateXxhdpiRoundXMLFiles();

  console.log('\n🎉 All Android xxhdpi round icons generated successfully!');
  console.log('================================================');
}

// ============================================================================
// Generate Standard xxhdpi Round Icons
// ============================================================================

async function generateStandardXxhdpiRoundIcons(sourceBuffer) {
  console.log('📱 Generating standard xxhdpi round icons (144x144)...');

  for (const [density, config] of Object.entries(XXHDPI_ROUND_CONFIG)) {
    const dirPath = path.join(OUTPUT_DIR, density);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const outputPath = path.join(dirPath, config.name);
    
    // Generate circular icon with high quality
    await generateHighQualityCircularIcon(sourceBuffer, config.size, outputPath);
    console.log(`   ✅ ${config.name} (144x144) → ${density}`);
  }
}

// ============================================================================
// Generate High Quality Circular Icon
// ============================================================================

async function generateHighQualityCircularIcon(sourceBuffer, size, outputPath) {
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
      kernel: sharp.kernel.lanczos3, // High quality resampling
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
// Generate Adaptive xxhdpi Round Icons
// ============================================================================

async function generateAdaptiveXxhdpiRoundIcons(sourceBuffer) {
  console.log('\n🎨 Generating adaptive xxhdpi round icons (324x324)...');

  for (const [density, config] of Object.entries(ADAPTIVE_XXHDPI_ROUND)) {
    const dirPath = path.join(OUTPUT_DIR, density);
    
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const size = config.size;
    const paddedSize = Math.floor(size * 0.6);
    const padding = Math.floor(size * 0.2);

    // Generate foreground (round) with high quality
    const foregroundPath = path.join(dirPath, config.foreground);
    await generateHighQualityCircularAdaptiveForeground(sourceBuffer, size, foregroundPath);
    console.log(`   ✅ ${config.foreground} (${size}x${size}) → ${density}`);

    // Generate background (round) with gradient
    const backgroundPath = path.join(dirPath, config.background);
    await generateGradientCircularBackground(size, backgroundPath);
    console.log(`   ✅ ${config.background} (${size}x${size}) → ${density}`);
  }
}

// ============================================================================
// Generate High Quality Circular Adaptive Foreground
// ============================================================================

async function generateHighQualityCircularAdaptiveForeground(sourceBuffer, size, outputPath) {
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
// Generate Gradient Circular Background
// ============================================================================

async function generateGradientCircularBackground(size, outputPath) {
  // Create SVG with gradient background
  const svgBackground = `
    <svg width="${size}" height="${size}">
      <defs>
        <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#42a5f5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1976d2;stop-opacity:1" />
        </radialGradient>
        <clipPath id="circleClip">
          <circle cx="${size/2}" cy="${size/2}" r="${size/2}" />
        </clipPath>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#bgGradient)" clip-path="url(#circleClip)" />
    </svg>
  `;

  await sharp(Buffer.from(svgBackground))
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

async function generateXxhdpiRoundXMLFiles() {
  console.log('\n📄 Generating xxhdpi round XML configuration files...');

  const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_round_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_round_foreground"/>
</adaptive-icon>`;

  const dirPath = path.join(OUTPUT_DIR, 'mipmap-xxhdpi');
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const xmlPath = path.join(dirPath, 'ic_launcher_round.xml');
  fs.writeFileSync(xmlPath, xmlContent);
  console.log(`   ✅ ic_launcher_round.xml → mipmap-xxhdpi`);
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
# ImageMagick Commands for xxhdpi Round Icons
# ============================================================================

# 1. Create drawable-xxhdpi round icon (144x144) with anti-aliasing
convert source.png -resize 144x144 -background none -gravity center \\
  -extent 144x144 -format png - | \\
  convert - -draw "circle 72,72 72,0" -alpha set -compose copy-opacity -composite \\
  -antialias android/app/src/main/res/drawable-xxhdpi/ic_launcher_round.png

# 2. Create mipmap-xxhdpi round icon (144x144)
convert source.png -resize 144x144 -background none -gravity center \\
  -extent 144x144 -format png - | \\
  convert - -draw "circle 72,72 72,0" -alpha set -compose copy-opacity -composite \\
  android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png

# 3. Create adaptive xxhdpi round foreground (324x324)
convert source.png -resize 195x195 -background none -gravity center \\
  -extent 324x324 -format png - | \\
  convert - -draw "circle 162,162 162,0" -alpha set -compose copy-opacity -composite \\
  android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round_foreground.png

# 4. Create adaptive xxhdpi round background (324x324) with gradient
convert -size 324x324 gradient:#42a5f5-#1976d2 -format png - | \\
  convert - -draw "circle 162,162 162,0" -alpha set -compose copy-opacity -composite \\
  android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round_background.png
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

// Generate all xxhdpi round icons
generateXxhdpiRoundIcons().catch(console.error);