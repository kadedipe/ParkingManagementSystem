#!/usr/bin/env node

// ============================================================================
// Android Round Icon Generator - Complete Set
// ============================================================================

/**
 * Script to generate all Android round app icons in all required densities
 * 
 * Run: node scripts/generate-round-icons.js
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

// Round icon sizes for all densities
const ROUND_CONFIG = {
  // Legacy drawable round icons
  'drawable-mdpi': { size: 48, name: 'ic_launcher_round.png' },
  'drawable-hdpi': { size: 72, name: 'ic_launcher_round.png' },
  'drawable-xhdpi': { size: 96, name: 'ic_launcher_round.png' },
  'drawable-xxhdpi': { size: 144, name: 'ic_launcher_round.png' },
  'drawable-xxxhdpi': { size: 192, name: 'ic_launcher_round.png' },
  
  // Mipmap round icons
  'mipmap-mdpi': { size: 48, name: 'ic_launcher_round.png' },
  'mipmap-hdpi': { size: 72, name: 'ic_launcher_round.png' },
  'mipmap-xhdpi': { size: 96, name: 'ic_launcher_round.png' },
  'mipmap-xxhdpi': { size: 144, name: 'ic_launcher_round.png' },
  'mipmap-xxxhdpi': { size: 192, name: 'ic_launcher_round.png' },
};

// Adaptive round icon sizes (Android 8.0+)
const ADAPTIVE_ROUND_SIZES = {
  'mipmap-mdpi': 108,
  'mipmap-hdpi': 162,
  'mipmap-xhdpi': 216,
  'mipmap-xxhdpi': 324,
  'mipmap-xxxhdpi': 432,
};

// ============================================================================
// SVG Template for Round Icon
// ============================================================================

const ROUND_SVG_TEMPLATE = `<!-- ============================================================================
     Round App Icon SVG Template (512x512)
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
// Main Functions
// ============================================================================

async function generateRoundIcons() {
  console.log('🎨 Generating Android round app icons...');
  console.log('================================================\n');

  // Check if source image exists
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error('❌ Source image not found:', SOURCE_IMAGE);
    console.log('\n📌 Please create a 512x512 PNG logo and place it at:');
    console.log('   ', SOURCE_IMAGE);
    console.log('\n   Alternatively, use the SVG template provided:');
    console.log('   - Convert the SVG above to PNG');
    console.log('   - Use an online SVG to PNG converter\n');
    process.exit(1);
  }

  const sourceBuffer = fs.readFileSync(SOURCE_IMAGE);

  // Generate legacy round icons
  await generateLegacyRoundIcons(sourceBuffer);

  // Generate adaptive round icons
  await generateAdaptiveRoundIcons(sourceBuffer);

  // Generate XML files
  await generateRoundXMLFiles();

  console.log('\n🎉 All Android round icons generated successfully!');
  console.log('================================================');
  console.log('✅ Generated round icons for all densities');
  console.log('✅ Created adaptive round icons for Android 8.0+');
  console.log('✅ Created XML configuration files');
}

// ============================================================================
// Generate Legacy Round Icons
// ============================================================================

async function generateLegacyRoundIcons(sourceBuffer) {
  console.log('📱 Generating legacy round launcher icons...');

  for (const [density, config] of Object.entries(ROUND_CONFIG)) {
    const dirPath = path.join(OUTPUT_DIR, density);
    const outputPath = path.join(dirPath, config.name);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    try {
      // Create circular icon
      const size = config.size;
      
      // First resize and create circular mask
      const circularBuffer = await createRoundIcon(sourceBuffer, size);
      
      await sharp(circularBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png()
        .toFile(outputPath);

      console.log(`   ✅ ${config.name} (${size}x${size}) → ${density}`);
    } catch (error) {
      console.error(`   ❌ Failed to generate ${config.name} in ${density}:`, error);
    }
  }
}

// ============================================================================
// Create Round Icon
// ============================================================================

async function createRoundIcon(sourceBuffer, size) {
  // Create a circular mask
  const svgMask = `
    <svg width="${size}" height="${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white" />
    </svg>
  `;

  const maskBuffer = await sharp(Buffer.from(svgMask))
    .png()
    .toBuffer();

  // Apply circular mask to source image
  const circularBuffer = await sharp(sourceBuffer)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .composite([{
      input: maskBuffer,
      blend: 'dest-in',
    }])
    .toBuffer();

  return circularBuffer;
}

// ============================================================================
// Generate Adaptive Round Icons
// ============================================================================

async function generateAdaptiveRoundIcons(sourceBuffer) {
  console.log('\n🎨 Generating adaptive round icons (Android 8.0+)...');

  for (const [density, size] of Object.entries(ADAPTIVE_ROUND_SIZES)) {
    const dirPath = path.join(OUTPUT_DIR, density);
    const foregroundPath = path.join(dirPath, 'ic_launcher_round_foreground.png');
    const backgroundPath = path.join(dirPath, 'ic_launcher_round_background.png');

    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    try {
      // Generate foreground (logo with padding, circular)
      const paddedSize = Math.floor(size * 0.6);
      const padding = Math.floor(size * 0.2);

      // Create circular foreground
      const foregroundBuffer = await createRoundIcon(sourceBuffer, paddedSize);
      
      await sharp(foregroundBuffer)
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png()
        .toFile(foregroundPath);

      // Generate background (solid color with round shape)
      const maskBuffer = await createCircularMask(size);
      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 25, g: 118, b: 210, alpha: 1 }, // Primary color
        },
      })
        .composite([{
          input: maskBuffer,
          blend: 'dest-in',
        }])
        .png()
        .toFile(backgroundPath);

      console.log(`   ✅ Adaptive round icons (${size}x${size}) → ${density}`);
    } catch (error) {
      console.error(`   ❌ Failed to generate adaptive round icons for ${density}:`, error);
    }
  }
}

// ============================================================================
// Create Circular Mask
// ============================================================================

async function createCircularMask(size) {
  const svgMask = `
    <svg width="${size}" height="${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white" />
    </svg>
  `;

  return await sharp(Buffer.from(svgMask))
    .png()
    .toBuffer();
}

// ============================================================================
// Generate XML Files
// ============================================================================

async function generateRoundXMLFiles() {
  console.log('\n📄 Generating round adaptive XML files...');

  const densities = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];
  
  const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_round_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_round_foreground"/>
</adaptive-icon>`;

  for (const density of densities) {
    const dirPath = path.join(OUTPUT_DIR, `mipmap-${density}`);
    
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const xmlPath = path.join(dirPath, 'ic_launcher_round.xml');
    fs.writeFileSync(xmlPath, xmlContent);
    console.log(`   ✅ ic_launcher_round.xml → mipmap-${density}`);
  }
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
// Manual Alternative: ImageMagick Commands
// ============================================================================

const IMAGEMAGICK_COMMANDS = `
# ============================================================================
# ImageMagick Commands for Round Icons
# ============================================================================

# Create base round icon for hdpi (72x72)
convert source.png -resize 72x72 -background none -gravity center \\
  -extent 72x72 -format png - | \\
  convert - -draw "circle 36,36 36,0" -alpha set -compose copy-opacity -composite \\
  android/app/src/main/res/drawable-hdpi/ic_launcher_round.png

# For all densities:
# mdpi: 48x48
# hdpi: 72x72
# xhdpi: 96x96
# xxhdpi: 144x144
# xxxhdpi: 192x192

# Round icon template:
# circle center_x,center_y radius_radius
# For 72x72: circle 36,36 36,0
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
  console.log('   3. Save as logo-512x512.png');
  console.log('\n   OR use ImageMagick:');
  console.log('   convert logo-round.svg logo-512x512.png\n');
  process.exit(0);
}

// Generate all round icons
generateRoundIcons().catch(console.error);