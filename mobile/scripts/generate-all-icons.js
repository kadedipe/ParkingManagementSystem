#!/usr/bin/env node

// ============================================================================
// Complete Android Icon Generator
// ============================================================================

/**
 * Script to generate all Android app icons in all required densities
 * 
 * Run: node scripts/generate-all-icons.js
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

// Complete icon configuration for all densities
const ICON_CONFIG = {
  // Legacy launcher icons
  'drawable-mdpi': { size: 48, name: 'ic_launcher.png' },
  'drawable-hdpi': { size: 72, name: 'ic_launcher.png' },
  'drawable-xhdpi': { size: 96, name: 'ic_launcher.png' },
  'drawable-xxhdpi': { size: 144, name: 'ic_launcher.png' },
  'drawable-xxxhdpi': { size: 192, name: 'ic_launcher.png' },
  
  // Legacy round launcher icons
  'drawable-mdpi': { size: 48, name: 'ic_launcher_round.png' },
  'drawable-hdpi': { size: 72, name: 'ic_launcher_round.png' },
  'drawable-xhdpi': { size: 96, name: 'ic_launcher_round.png' },
  'drawable-xxhdpi': { size: 144, name: 'ic_launcher_round.png' },
  'drawable-xxxhdpi': { size: 192, name: 'ic_launcher_round.png' },
  
  // Mipmap launcher icons
  'mipmap-mdpi': { size: 48, name: 'ic_launcher.png' },
  'mipmap-hdpi': { size: 72, name: 'ic_launcher.png' },
  'mipmap-xhdpi': { size: 96, name: 'ic_launcher.png' },
  'mipmap-xxhdpi': { size: 144, name: 'ic_launcher.png' },
  'mipmap-xxxhdpi': { size: 192, name: 'ic_launcher.png' },
  
  // Mipmap round launcher icons
  'mipmap-mdpi': { size: 48, name: 'ic_launcher_round.png' },
  'mipmap-hdpi': { size: 72, name: 'ic_launcher_round.png' },
  'mipmap-xhdpi': { size: 96, name: 'ic_launcher_round.png' },
  'mipmap-xxhdpi': { size: 144, name: 'ic_launcher_round.png' },
  'mipmap-xxxhdpi': { size: 192, name: 'ic_launcher_round.png' },
};

// Adaptive icon sizes (Android 8.0+)
const ADAPTIVE_CONFIG = {
  'mipmap-mdpi': { size: 108, foreground: 'ic_launcher_foreground.png', background: 'ic_launcher_background.png' },
  'mipmap-hdpi': { size: 162, foreground: 'ic_launcher_foreground.png', background: 'ic_launcher_background.png' },
  'mipmap-xhdpi': { size: 216, foreground: 'ic_launcher_foreground.png', background: 'ic_launcher_background.png' },
  'mipmap-xxhdpi': { size: 324, foreground: 'ic_launcher_foreground.png', background: 'ic_launcher_background.png' },
  'mipmap-xxxhdpi': { size: 432, foreground: 'ic_launcher_foreground.png', background: 'ic_launcher_background.png' },
};

// Adaptive round icons
const ADAPTIVE_ROUND_CONFIG = {
  'mipmap-mdpi': { size: 108, foreground: 'ic_launcher_round_foreground.png', background: 'ic_launcher_round_background.png' },
  'mipmap-hdpi': { size: 162, foreground: 'ic_launcher_round_foreground.png', background: 'ic_launcher_round_background.png' },
  'mipmap-xhdpi': { size: 216, foreground: 'ic_launcher_round_foreground.png', background: 'ic_launcher_round_background.png' },
  'mipmap-xxhdpi': { size: 324, foreground: 'ic_launcher_round_foreground.png', background: 'ic_launcher_round_background.png' },
  'mipmap-xxxhdpi': { size: 432, foreground: 'ic_launcher_round_foreground.png', background: 'ic_launcher_round_background.png' },
};

// ============================================================================
// SVG Templates
// ============================================================================

const SVG_TEMPLATES = {
  // Regular icon SVG
  regular: `<!-- ============================================================================
     App Icon SVG Template (512x512)
     ============================================================================ -->

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1976d2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#42a5f5;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="iconGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d47a1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1976d2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
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
  round: `<!-- ============================================================================
     Round App Icon SVG Template (512x512)
     ============================================================================ -->

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
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
  
  <!-- White circle border -->
  <circle cx="256" cy="256" r="232" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.3" />
  
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
// Main Functions
// ============================================================================

async function generateAllIcons() {
  console.log('🎨 Generating complete Android app icons...');
  console.log('================================================\n');
  
  // Check if source image exists
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error('❌ Source image not found:', SOURCE_IMAGE);
    console.log('\n📌 Please create a 512x512 PNG logo and place it at:');
    console.log('   ', SOURCE_IMAGE);
    console.log('\n   Alternatively, use the SVG templates provided:');
    console.log('   - Create logo-512x512.png from the SVG above');
    console.log('   - Use an online SVG to PNG converter\n');
    process.exit(1);
  }

  const sourceBuffer = fs.readFileSync(SOURCE_IMAGE);
  
  // Generate all icons
  await generateLegacyIcons(sourceBuffer);
  await generateAdaptiveIcons(sourceBuffer);
  await generateAdaptiveRoundIcons(sourceBuffer);
  await generateAdaptiveXMLFiles();
  
  console.log('\n🎉 All Android icons generated successfully!');
  console.log('================================================');
  console.log('✅ Generated icons for all densities');
  console.log('✅ Created adaptive icons for Android 8.0+');
  console.log('✅ Created XML configuration files');
}

// ============================================================================
// Generate Legacy Icons
// ============================================================================

async function generateLegacyIcons(sourceBuffer) {
  console.log('📱 Generating legacy launcher icons...');
  
  // Group configurations by density
  const densityConfigs = {};
  for (const [density, config] of Object.entries(ICON_CONFIG)) {
    if (!densityConfigs[density]) {
      densityConfigs[density] = [];
    }
    densityConfigs[density].push(config);
  }

  for (const [density, configs] of Object.entries(densityConfigs)) {
    const dirPath = path.join(OUTPUT_DIR, density);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    for (const config of configs) {
      const outputPath = path.join(dirPath, config.name);
      
      try {
        // Check if it's a round icon
        const isRound = config.name.includes('round');
        
        let imageBuffer = sourceBuffer;
        
        // Add circular mask for round icons
        if (isRound) {
          imageBuffer = await createCircularIcon(sourceBuffer, config.size);
        }
        
        await sharp(imageBuffer)
          .resize(config.size, config.size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 },
          })
          .png()
          .toFile(outputPath);
        
        console.log(`   ✅ ${config.name} (${config.size}x${config.size}) → ${density}`);
      } catch (error) {
        console.error(`   ❌ Failed to generate ${config.name} in ${density}:`, error);
      }
    }
  }
}

// ============================================================================
// Create Circular Icon
// ============================================================================

async function createCircularIcon(sourceBuffer, size) {
  // Create a circular mask
  const svgMask = `
    <svg width="${size}" height="${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white" />
    </svg>
  `;
  
  const maskBuffer = await sharp(Buffer.from(svgMask))
    .png()
    .toBuffer();
  
  return await sharp(sourceBuffer)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .composite([{
      input: maskBuffer,
      blend: 'dest-in',
    }])
    .toBuffer();
}

// ============================================================================
// Generate Adaptive Icons
// ============================================================================

async function generateAdaptiveIcons(sourceBuffer) {
  console.log('\n🎨 Generating adaptive icons (Android 8.0+)...');
  
  for (const [density, config] of Object.entries(ADAPTIVE_CONFIG)) {
    const dirPath = path.join(OUTPUT_DIR, density);
    
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    const size = config.size;
    const foregroundPath = path.join(dirPath, config.foreground);
    const backgroundPath = path.join(dirPath, config.background);
    
    try {
      // Generate foreground (logo with padding)
      const paddedSize = Math.floor(size * 0.6);
      const padding = Math.floor(size * 0.2);
      
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
        .png()
        .toFile(foregroundPath);
      
      // Generate background (solid color)
      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 25, g: 118, b: 210, alpha: 1 }, // Primary color
        },
      })
        .png()
        .toFile(backgroundPath);
      
      console.log(`   ✅ Adaptive icons (${size}x${size}) → ${density}`);
    } catch (error) {
      console.error(`   ❌ Failed to generate adaptive icons for ${density}:`, error);
    }
  }
}

// ============================================================================
// Generate Adaptive Round Icons
// ============================================================================

async function generateAdaptiveRoundIcons(sourceBuffer) {
  console.log('\n🎨 Generating adaptive round icons...');
  
  for (const [density, config] of Object.entries(ADAPTIVE_ROUND_CONFIG)) {
    const dirPath = path.join(OUTPUT_DIR, density);
    
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    const size = config.size;
    const foregroundPath = path.join(dirPath, config.foreground);
    const backgroundPath = path.join(dirPath, config.background);
    
    try {
      // Generate foreground (logo with padding, circular)
      const paddedSize = Math.floor(size * 0.6);
      const padding = Math.floor(size * 0.2);
      
      const circularBuffer = await createCircularIcon(sourceBuffer, size);
      
      await sharp(circularBuffer)
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
        .png()
        .toFile(foregroundPath);
      
      // Generate background (solid color with round shape)
      const maskBuffer = await createCircularMask(size);
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
// Generate Adaptive XML Files
// ============================================================================

async function generateAdaptiveXMLFiles() {
  console.log('\n📄 Generating adaptive XML configuration files...');
  
  const densities = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];
  
  // Regular adaptive icon XML
  const regularXML = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`;

  // Round adaptive icon XML
  const roundXML = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_round_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_round_foreground"/>
</adaptive-icon>`;

  for (const density of densities) {
    const dirPath = path.join(OUTPUT_DIR, `mipmap-${density}`);
    
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Write regular adaptive XML
    const regularPath = path.join(dirPath, 'ic_launcher.xml');
    fs.writeFileSync(regularPath, regularXML);
    
    // Write round adaptive XML
    const roundPath = path.join(dirPath, 'ic_launcher_round.xml');
    fs.writeFileSync(roundPath, roundXML);
    
    console.log(`   ✅ XML files → mipmap-${density}`);
  }
}

// ============================================================================
// Create SVG Templates
// ============================================================================

function createSVGTemplates() {
  console.log('📝 Creating SVG templates...');
  
  const assetsDir = path.join(__dirname, '../assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  
  // Regular icon SVG
  const regularPath = path.join(assetsDir, 'logo.svg');
  if (!fs.existsSync(regularPath)) {
    fs.writeFileSync(regularPath, SVG_TEMPLATES.regular);
    console.log('   ✅ Created logo.svg template');
  }
  
  // Round icon SVG
  const roundPath = path.join(assetsDir, 'logo-round.svg');
  if (!fs.existsSync(roundPath)) {
    fs.writeFileSync(roundPath, SVG_TEMPLATES.round);
    console.log('   ✅ Created logo-round.svg template');
  }
}

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

// Generate all icons
generateAllIcons().catch(console.error);