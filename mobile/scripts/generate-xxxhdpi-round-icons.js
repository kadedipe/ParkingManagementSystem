#!/usr/bin/env node

// ============================================================================
// Android xxxhdpi Round Icon Generator
// ============================================================================

/**
 * Script to generate all Android xxxhdpi round app icons
 * 
 * Run: node scripts/generate-xxxhdpi-round-icons.js
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

// xxxhdpi round icon configurations (192x192)
const XXXHDPI_ROUND_CONFIG = {
  // Drawable xxxhdpi round icon
  'drawable-xxxhdpi': {
    size: 192,
    name: 'ic_launcher_round.png',
  },
  // Mipmap xxxhdpi round icon
  'mipmap-xxxhdpi': {
    size: 192,
    name: 'ic_launcher_round.png',
  },
};

// Adaptive xxxhdpi round icons (Android 8.0+)
const ADAPTIVE_XXXHDPI_ROUND = {
  'mipmap-xxxhdpi': {
    size: 432,
    foreground: 'ic_launcher_round_foreground.png',
    background: 'ic_launcher_round_background.png',
  },
};

// ============================================================================
// SVG Template for Round Icon
// ============================================================================

const ROUND_SVG_TEMPLATE = `<!-- ============================================================================
     xxxhdpi Round App Icon SVG Template (512x512)
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
    
    <filter id="innerGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  
  <!-- Round background with gradient -->
  <circle cx="256" cy="256" r="240" fill="url(#roundGradient)" filter="url(#glow)" />
  
  <!-- Decorative rings with glow -->
  <circle cx="256" cy="256" r="232" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.3" />
  <circle cx="256" cy="256" r="180" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.15" />
  <circle cx="256" cy="256" r="140" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.08" />
  
  <!-- Inner glow ring -->
  <circle cx="256" cy="256" r="200" fill="none" stroke="#42a5f5" stroke-width="2" opacity="0.2" filter="url(#innerGlow)" />
  
  <!-- Parking "P" symbol -->
  <g clip-path="url(#roundClip)" filter="url(#shadow)">
    <!-- Main P shape background with rounded corners -->
    <rect x="170" y="110" width="172" height="292" rx="36" fill="#ffffff" opacity="0.95" />
    
    <!-- P vertical bar with gradient -->
    <rect x="210" y="150" width="92" height="100" rx="16" fill="url(#iconGradient)" />
    
    <!-- P horizontal bar -->
    <rect x="210" y="270" width="92" height="100" rx="16" fill="url(#iconGradient)" />
    
    <!-- P inner highlight -->
    <rect x="218" y="158" width="76" height="84" rx="12" fill="#ffffff" opacity="0.25" />
    <rect x="218" y="278" width="76" height="84" rx="12" fill="#ffffff" opacity="0.25" />
    
    <!-- P inner shadow -->
    <rect x="218" y="158" width="76" height="84" rx="12" fill="none" stroke="#1565c0" stroke-width="1" opacity="0.3" />
    <rect x="218" y="278" width="76" height="84" rx="12" fill="none" stroke="#1565c0" stroke-width="1" opacity="0.3" />
  </g>
  
  <!-- Car symbol -->
  <g clip-path="url(#roundClip)">
    <!-- Car body with shadow -->
    <rect x="100" y="350" width="312" height="60" rx="30" fill="#ffffff" opacity="0.95" filter="url(#shadow)" />
    
    <!-- Car top -->
    <rect x="150" y="310" width="212" height="50" rx="25" fill="#ffffff" opacity="0.85" />
    
    <!-- Window frames -->
    <rect x="170" y="320" width="60" height="30" rx="8" fill="url(#iconGradient)" opacity="0.35" />
    <rect x="242" y="320" width="60" height="30" rx="8" fill="url(#iconGradient)" opacity="0.35" />
    <rect x="314" y="320" width="30" height="30" rx="8" fill="url(#iconGradient)" opacity="0.35" />
    
    <!-- Window reflections -->
    <rect x="175" y="325" width="50" height="4" rx="2" fill="#ffffff" opacity="0.6" />
    <rect x="247" y="325" width="50" height="4" rx="2" fill="#ffffff" opacity="0.6" />
    <rect x="319" y="325" width="20" height="4" rx="2" fill="#ffffff" opacity="0.6" />
    
    <!-- Wheels with detail -->
    <circle cx="170" cy="390" r="32" fill="url(#iconGradient)" stroke="#ffffff" stroke-width="6" />
    <circle cx="170" cy="390" r="22" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.3" />
    <circle cx="170" cy="390" r="12" fill="#ffffff" opacity="0.3" />
    <circle cx="170" cy="390" r="4" fill="url(#iconGradient)" opacity="0.5" />
    
    <circle cx="342" cy="390" r="32" fill="url(#iconGradient)" stroke="#ffffff" stroke-width="6" />
    <circle cx="342" cy="390" r="22" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.3" />
    <circle cx="342" cy="390" r="12" fill="#ffffff" opacity="0.3" />
    <circle cx="342" cy="390" r="4" fill="url(#iconGradient)" opacity="0.5" />
    
    <!-- Headlights with glow -->
    <rect x="95" y="365" width="20" height="10" rx="5" fill="#ffeb3b" opacity="0.9" filter="url(#glow)" />
    <rect x="397" y="365" width="20" height="10" rx="5" fill="#f44336" opacity="0.9" filter="url(#glow)" />
    
    <!-- Tail lights -->
    <rect x="95" y="380" width="8" height="8" rx="4" fill="#f44336" opacity="0.5" />
    <rect x="409" y="380" width="8" height="8" rx="4" fill="#ffeb3b" opacity="0.5" />
    
    <!-- Fog lights -->
    <circle cx="105" cy="390" r="4" fill="#ffeb3b" opacity="0.3" />
    <circle cx="407" cy="390" r="4" fill="#ffeb3b" opacity="0.3" />
  </g>
</svg>`;

// ============================================================================
// Main Function
// ============================================================================

async function generateXxxhdpiRoundIcons() {
  console.log('🎨 Generating Android xxxhdpi round app icons...');
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

  // Generate standard xxxhdpi round icons
  await generateStandardXxxhdpiRoundIcons(sourceBuffer);

  // Generate adaptive xxxhdpi round icons
  await generateAdaptiveXxxhdpiRoundIcons(sourceBuffer);

  // Generate XML files
  await generateXxxhdpiRoundXMLFiles();

  console.log('\n🎉 All Android xxxhdpi round icons generated successfully!');
  console.log('================================================');
}

// ============================================================================
// Generate Standard xxxhdpi Round Icons
// ============================================================================

async function generateStandardXxxhdpiRoundIcons(sourceBuffer) {
  console.log('📱 Generating standard xxxhdpi round icons (192x192)...');

  for (const [density, config] of Object.entries(XXXHDPI_ROUND_CONFIG)) {
    const dirPath = path.join(OUTPUT_DIR, density);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const outputPath = path.join(dirPath, config.name);
    
    // Generate high quality circular icon
    await generateUltraHighQualityCircularIcon(sourceBuffer, config.size, outputPath);
    console.log(`   ✅ ${config.name} (192x192) → ${density}`);
  }
}

// ============================================================================
// Generate Ultra High Quality Circular Icon
// ============================================================================

async function generateUltraHighQualityCircularIcon(sourceBuffer, size, outputPath) {
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

  // Apply circular mask with high quality settings
  await sharp(sourceBuffer)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: true,
    })
    .composite([{
      input: maskBuffer,
      blend: 'dest-in',
    }])
    .png({
      compressionLevel: 9,
      quality: 100,
      force: true,
      adaptiveFiltering: true,
      palette: false,
    })
    .toFile(outputPath);
}

// ============================================================================
// Generate Adaptive xxxhdpi Round Icons
// ============================================================================

async function generateAdaptiveXxxhdpiRoundIcons(sourceBuffer) {
  console.log('\n🎨 Generating adaptive xxxhdpi round icons (432x432)...');

  for (const [density, config] of Object.entries(ADAPTIVE_XXXHDPI_ROUND)) {
    const dirPath = path.join(OUTPUT_DIR, density);
    
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const size = config.size;
    const paddedSize = Math.floor(size * 0.6);
    const padding = Math.floor(size * 0.2);

    // Generate foreground (round) with ultra high quality
    const foregroundPath = path.join(dirPath, config.foreground);
    await generateUltraHighQualityCircularAdaptiveForeground(sourceBuffer, size, foregroundPath);
    console.log(`   ✅ ${config.foreground} (${size}x${size}) → ${density}`);

    // Generate background (round) with gradient
    const backgroundPath = path.join(dirPath, config.background);
    await generateUltraHighQualityCircularBackground(size, backgroundPath);
    console.log(`   ✅ ${config.background} (${size}x${size}) → ${density}`);
  }
}

// ============================================================================
// Generate Ultra High Quality Circular Adaptive Foreground
// ============================================================================

async function generateUltraHighQualityCircularAdaptiveForeground(sourceBuffer, size, outputPath) {
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
      withoutEnlargement: true,
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
      adaptiveFiltering: true,
      palette: false,
    })
    .toFile(outputPath);
}

// ============================================================================
// Generate Ultra High Quality Circular Background
// ============================================================================

async function generateUltraHighQualityCircularBackground(size, outputPath) {
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
      adaptiveFiltering: true,
      palette: false,
    })
    .toFile(outputPath);
}

// ============================================================================
// Generate XML Files
// ============================================================================

async function generateXxxhdpiRoundXMLFiles() {
  console.log('\n📄 Generating xxxhdpi round XML configuration files...');

  const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_round_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_round_foreground"/>
</adaptive-icon>`;

  const dirPath = path.join(OUTPUT_DIR, 'mipmap-xxxhdpi');
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const xmlPath = path.join(dirPath, 'ic_launcher_round.xml');
  fs.writeFileSync(xmlPath, xmlContent);
  console.log(`   ✅ ic_launcher_round.xml → mipmap-xxxhdpi`);
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
// Manual ImageMagick Commands with Ultra Quality
// ============================================================================

const IMAGEMAGICK_COMMANDS = `
# ============================================================================
# ImageMagick Commands for xxxhdpi Round Icons (Ultra Quality)
# ============================================================================

# 1. Create drawable-xxxhdpi round icon (192x192) with anti-aliasing
convert source.png -resize 192x192 -filter LanczosSharp \\
  -background none -gravity center -extent 192x192 \\
  -unsharp 0.5x0.5+0.5+0.008 -format png - | \\
  convert - -draw "circle 96,96 96,0" -alpha set -compose copy-opacity -composite \\
  -antialias -quality 100 -strip \\
  android/app/src/main/res/drawable-xxxhdpi/ic_launcher_round.png

# 2. Create mipmap-xxxhdpi round icon (192x192)
convert source.png -resize 192x192 -filter LanczosSharp \\
  -background none -gravity center -extent 192x192 \\
  -unsharp 0.5x0.5+0.5+0.008 -format png - | \\
  convert - -draw "circle 96,96 96,0" -alpha set -compose copy-opacity -composite \\
  -antialias -quality 100 -strip \\
  android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png

# 3. Create adaptive xxxhdpi round foreground (432x432)
convert source.png -resize 260x260 -filter LanczosSharp \\
  -background none -gravity center -extent 432x432 \\
  -unsharp 0.5x0.5+0.5+0.008 -format png - | \\
  convert - -draw "circle 216,216 216,0" -alpha set -compose copy-opacity -composite \\
  -antialias -quality 100 -strip \\
  android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round_foreground.png

# 4. Create adaptive xxxhdpi round background (432x432)
convert -size 432x432 gradient:#42a5f5-#1976d2 -format png - | \\
  convert - -draw "circle 216,216 216,0" -alpha set -compose copy-opacity -composite \\
  -antialias -quality 100 -strip \\
  android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round_background.png
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

// Generate all xxxhdpi round icons
generateXxxhdpiRoundIcons().catch(console.error);