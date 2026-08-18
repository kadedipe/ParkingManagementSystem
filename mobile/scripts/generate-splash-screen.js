#!/usr/bin/env node

// ============================================================================
// iOS Splash Screen Image Generator
// ============================================================================

/**
 * Script to generate iOS splash screen images
 * 
 * Run: node scripts/generate-splash-screen.js
 * 
 * Prerequisites:
 * - Install sharp: npm install --save-dev sharp
 * - Place your splash screen template at: mobile/assets/splash-template.png
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// ============================================================================
// Configuration
// ============================================================================

const SOURCE_IMAGE = path.join(__dirname, '../assets/splash-template.png');
const OUTPUT_DIR = path.join(__dirname, '../ios/ParkingSystem/Images.xcassets/SplashScreen.imageset');

// Splash screen sizes
const SPLASH_SIZES = [
  { size: '375x812', filename: 'SplashScreen.png', scale: '1x' },
  { size: '750x1624', filename: 'SplashScreen@2x.png', scale: '2x' },
  { size: '1125x2436', filename: 'SplashScreen@3x.png', scale: '3x' },
];

// ============================================================================
// SVG Template for Splash Screen
// ============================================================================

const SVG_TEMPLATE = `<!-- ============================================================================
     Splash Screen SVG Template
     ============================================================================ -->

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 375 812" width="375" height="812">
  <defs>
    <linearGradient id="splashGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1976d2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#42a5f5;stop-opacity:1" />
    </linearGradient>
    
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.15"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="375" height="812" fill="url(#splashGradient)" />
  
  <!-- App Icon -->
  <g filter="url(#shadow)">
    <rect x="112" y="256" width="151" height="151" rx="36" fill="#ffffff" />
    <text x="187" y="350" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="80" font-weight="bold" fill="#1976d2">P</text>
  </g>
  
  <!-- App Name -->
  <text x="187" y="440" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="28" font-weight="600" fill="#ffffff">Parking System</text>
  
  <!-- Tagline -->
  <text x="187" y="470" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="14" fill="#ffffff" opacity="0.8">Smart Parking Management</text>
  
  <!-- Loading indicator -->
  <rect x="160" y="540" width="55" height="4" rx="2" fill="#ffffff" opacity="0.3" />
  <rect x="160" y="540" width="20" height="4" rx="2" fill="#ffffff">
    <animate attributeName="width" from="0" to="55" dur="1.5s" repeatCount="indefinite" />
  </rect>
</svg>`;

// ============================================================================
// Main Function
// ============================================================================

async function generateSplashScreen() {
  console.log('🎨 Generating iOS splash screen images...');
  console.log('================================================\n');

  // Check if source image exists
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error('❌ Source image not found:', SOURCE_IMAGE);
    console.log('\n📌 Please create a splash screen template and place it at:');
    console.log('   ', SOURCE_IMAGE);
    console.log('\n   Alternatively, use the SVG template provided below.\n');
    
    // Create SVG template
    const assetsDir = path.join(__dirname, '../assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    const svgPath = path.join(assetsDir, 'splash-template.svg');
    fs.writeFileSync(svgPath, SVG_TEMPLATE);
    console.log('✅ Created SVG template at:', svgPath);
    console.log('📌 Convert SVG to PNG using an online converter or ImageMagick');
    console.log('   Then save as splash-template.png and run this script again.\n');
    process.exit(0);
  }

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const sourceBuffer = fs.readFileSync(SOURCE_IMAGE);

  // Generate each splash screen
  console.log('📱 Generating splash screen images...');
  for (const config of SPLASH_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, config.filename);
    const [width, height] = config.size.split('x').map(Number);

    try {
      await sharp(sourceBuffer)
        .resize(width, height, {
          fit: 'cover',
          position: 'center',
          kernel: sharp.kernel.lanczos3,
        })
        .png({
          compressionLevel: 9,
          quality: 100,
          force: true,
        })
        .toFile(outputPath);

      console.log(`   ✅ ${config.filename} (${width}x${height})`);
    } catch (error) {
      console.error(`   ❌ Failed to generate ${config.filename}:`, error);
    }
  }

  // Generate Contents.json
  await generateContentsJSON();

  console.log('\n🎉 All iOS splash screen images generated successfully!');
  console.log('================================================');
}

// ============================================================================
// Generate Contents.json
// ============================================================================

async function generateContentsJSON() {
  const contents = {
    images: SPLASH_SIZES.map(config => ({
      idiom: 'universal',
      filename: config.filename,
      scale: config.scale,
    })),
    info: {
      version: 1,
      author: 'xcode',
    },
  };

  const outputPath = path.join(OUTPUT_DIR, 'Contents.json');
  fs.writeFileSync(outputPath, JSON.stringify(contents, null, 2));
  console.log('   ✅ Contents.json generated');
}

// ============================================================================
// Run
// ============================================================================

// Check if source image exists
if (!fs.existsSync(SOURCE_IMAGE)) {
  console.log('\n📌 Please create a splash screen template and place it at:');
  console.log('   ', SOURCE_IMAGE);
  console.log('\n   The template should include:');
  console.log('   - App logo centered');
  console.log('   - App name below the logo');
  console.log('   - Background color matching your app theme');
  console.log('   - Recommended size: 1125x2436 (iPhone X size)\n');
  process.exit(0);
}

generateSplashScreen().catch(console.error);