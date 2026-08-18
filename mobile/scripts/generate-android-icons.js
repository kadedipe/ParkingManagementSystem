#!/usr/bin/env node

// ============================================================================
// Android Icon Generator
// ============================================================================

/**
 * Script to generate Android app icons in all required sizes
 * 
 * Run: node scripts/generate-android-icons.js
 * 
 * Prerequisites:
 * - Install sharp: npm install --save-dev sharp
 * - Place your source logo at: mobile/assets/logo-square.png
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// ============================================================================
// Configuration
// ============================================================================

const SOURCE_IMAGE = path.join(__dirname, '../assets/logo-square.png');
const OUTPUT_DIR = path.join(__dirname, '../android/app/src/main/res');

const ICON_SIZES = {
  // Launcher icons
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
  
  // Round icons
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
  
  // Legacy drawable icons
  'drawable-mdpi': 48,
  'drawable-hdpi': 72,
  'drawable-xhdpi': 96,
  'drawable-xxhdpi': 144,
  'drawable-xxxhdpi': 192,
};

const ICON_TYPES = ['ic_launcher', 'ic_launcher_round'];

// ============================================================================
// Main Function
// ============================================================================

async function generateIcons() {
  console.log('🎨 Generating Android app icons...');
  
  // Check if source image exists
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error('❌ Source image not found:', SOURCE_IMAGE);
    console.log('Please place a 512x512 PNG logo at:', SOURCE_IMAGE);
    process.exit(1);
  }

  // Load source image
  const sourceBuffer = fs.readFileSync(SOURCE_IMAGE);
  
  // Generate icons for each density
  for (const [density, size] of Object.entries(ICON_SIZES)) {
    for (const iconType of ICON_TYPES) {
      const dirPath = path.join(OUTPUT_DIR, density);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      const outputPath = path.join(dirPath, `${iconType}.png`);
      
      try {
        await sharp(sourceBuffer)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 },
          })
          .png()
          .toFile(outputPath);
        
        console.log(`✅ Generated ${iconType}.png (${size}x${size}) in ${density}`);
      } catch (error) {
        console.error(`❌ Failed to generate ${iconType} in ${density}:`, error);
      }
    }
  }
  
  console.log('🎉 Android icons generated successfully!');
  
  // Generate adaptive icons (Android 8.0+)
  await generateAdaptiveIcons();
}

// ============================================================================
// Adaptive Icons
// ============================================================================

async function generateAdaptiveIcons() {
  console.log('🎨 Generating adaptive icons...');
  
  const adaptiveIconSizes = {
    'mipmap-mdpi': 108,
    'mipmap-hdpi': 162,
    'mipmap-xhdpi': 216,
    'mipmap-xxhdpi': 324,
    'mipmap-xxxhdpi': 432,
  };
  
  const sourceBuffer = fs.readFileSync(SOURCE_IMAGE);
  
  for (const [density, size] of Object.entries(adaptiveIconSizes)) {
    const dirPath = path.join(OUTPUT_DIR, density);
    
    // Create adaptive icon (foreground)
    const foregroundPath = path.join(dirPath, 'ic_launcher_foreground.png');
    const backgroundPath = path.join(dirPath, 'ic_launcher_background.png');
    
    try {
      // Generate foreground (logo with padding)
      await sharp(sourceBuffer)
        .resize(Math.floor(size * 0.6), Math.floor(size * 0.6), {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .extend({
          top: Math.floor(size * 0.2),
          bottom: Math.floor(size * 0.2),
          left: Math.floor(size * 0.2),
          right: Math.floor(size * 0.2),
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
          background: { r: 25, g: 118, b: 210, alpha: 1 }, // Primary color #1976d2
        },
      })
        .png()
        .toFile(backgroundPath);
      
      console.log(`✅ Generated adaptive icons for ${density}`);
    } catch (error) {
      console.error(`❌ Failed to generate adaptive icons for ${density}:`, error);
    }
  }
  
  // Create ic_launcher.xml for adaptive icons
  const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`;

  for (const density of Object.keys(adaptiveIconSizes)) {
    const xmlPath = path.join(OUTPUT_DIR, density, 'ic_launcher.xml');
    fs.writeFileSync(xmlPath, xmlContent);
    console.log(`✅ Created ic_launcher.xml for ${density}`);
  }
  
  console.log('🎉 Adaptive icons generated successfully!');
}

// ============================================================================
// SVG Template for App Icon
// ============================================================================

const SVG_TEMPLATE = `<!-- ============================================================================
     App Icon SVG Template
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
  
  <!-- Background circle (for adaptive icon) -->
  <rect x="0" y="0" width="512" height="512" rx="128" fill="url(#iconGradient)" />
  
  <!-- Parking "P" symbol -->
  <rect x="170" y="110" width="172" height="292" rx="36" fill="#ffffff" />
  <rect x="210" y="150" width="92" height="100" rx="16" fill="#1976d2" />
  <rect x="210" y="270" width="92" height="100" rx="16" fill="#1976d2" />
  
  <!-- Car symbol -->
  <rect x="100" y="350" width="312" height="60" rx="30" fill="#ffffff" />
  <circle cx="170" cy="390" r="32" fill="#1976d2" stroke="#ffffff" stroke-width="8" />
  <circle cx="342" cy="390" r="32" fill="#1976d2" stroke="#ffffff" stroke-width="8" />
  
  <!-- Text "P" in circle -->
  <text x="256" y="460" text-anchor="middle" font-family="'Inter', 'Roboto', sans-serif" font-size="64" font-weight="700" fill="#ffffff">P</text>
</svg>`;

// ============================================================================
// Run
// ============================================================================

// Create the SVG template file
function createSvgTemplate() {
  const svgPath = path.join(__dirname, '../assets/logo.svg');
  if (!fs.existsSync(svgPath)) {
    fs.writeFileSync(svgPath, SVG_TEMPLATE);
    console.log('✅ Created SVG template at:', svgPath);
    console.log('📝 Convert SVG to PNG using an online converter or ImageMagick');
    console.log('   Then place the PNG at:', SOURCE_IMAGE);
  }
}

// Check if we should create the template
if (!fs.existsSync(SOURCE_IMAGE)) {
  createSvgTemplate();
  console.log('\n📌 Please convert the SVG to PNG and place it at:');
  console.log('   ', SOURCE_IMAGE);
  console.log('   Then run this script again.');
  process.exit(0);
}

// Generate icons
generateIcons().catch(console.error);