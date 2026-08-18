#!/usr/bin/env node

// ============================================================================
// iOS Launch Image Generator
// ============================================================================

/**
 * Script to generate iOS launch images
 * 
 * Run: node scripts/generate-launch-images.js
 * 
 * Prerequisites:
 * - Install sharp: npm install --save-dev sharp
 * - Place your launch image template at: mobile/assets/launch-template.png
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// ============================================================================
// Configuration
// ============================================================================

const SOURCE_IMAGE = path.join(__dirname, '../assets/launch-template.png');
const OUTPUT_DIR = path.join(__dirname, '../ios/ParkingSystem/Images.xcassets/LaunchImage.launchimage');

// Launch image sizes
const LAUNCH_SIZES = [
  // iPhone
  { size: '640x1136', filename: 'LaunchImage-700-568h@2x.png', idiom: 'iphone', scale: '2x', subtype: 'retina4' },
  
  // iPad
  { size: '768x1024', filename: 'LaunchImage-700-Portrait~ipad.png', idiom: 'ipad', scale: '1x' },
  { size: '1536x2048', filename: 'LaunchImage-700-Portrait@2x~ipad.png', idiom: 'ipad', scale: '2x' },
];

// ============================================================================
// Main Function
// ============================================================================

async function generateLaunchImages() {
  console.log('🎨 Generating iOS launch images...');
  console.log('================================================\n');

  // Check if source image exists
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error('❌ Source image not found:', SOURCE_IMAGE);
    console.log('\n📌 Please create a launch image template and place it at:');
    console.log('   ', SOURCE_IMAGE);
    console.log('\n   The template should be a PNG file with the app logo and branding.');
    console.log('   Recommended size: 1024x1024 or larger.\n');
    process.exit(1);
  }

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const sourceBuffer = fs.readFileSync(SOURCE_IMAGE);

  // Generate each launch image
  console.log('📱 Generating launch images...');
  for (const config of LAUNCH_SIZES) {
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

  console.log('\n🎉 All iOS launch images generated successfully!');
  console.log('================================================');
}

// ============================================================================
// Generate Contents.json
// ============================================================================

async function generateContentsJSON() {
  const contents = {
    images: LAUNCH_SIZES.map(config => {
      const image = {
        extent: 'full-screen',
        idiom: config.idiom,
        filename: config.filename,
        orientation: 'portrait',
        scale: config.scale,
      };
      
      // Add subtype for iPhone retina4
      if (config.subtype) {
        image.subtype = config.subtype;
      }
      
      // Add minimum-system-version for iOS versions
      if (config.idiom === 'iphone') {
        image['minimum-system-version'] = '7.0';
      } else {
        image['minimum-system-version'] = '7.0';
      }
      
      return image;
    }),
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
  console.log('\n📌 Please create a launch image template and place it at:');
  console.log('   ', SOURCE_IMAGE);
  console.log('\n   The template should be a PNG file with:');
  console.log('   - App logo centered');
  console.log('   - App name below the logo');
  console.log('   - Background color matching your app theme');
  console.log('   - Recommended size: 1024x1024 or larger\n');
  process.exit(0);
}

generateLaunchImages().catch(console.error);