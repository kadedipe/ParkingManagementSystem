// ============================================================================
// PWA Icon Generator
// ============================================================================

/**
 * Script to generate PWA icons from a source image
 * 
 * Run: node scripts/generate-pwa-icons.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// ============================================================================
// Configuration
// ============================================================================

const ICON_SIZES = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
];

const SOURCE_IMAGE = path.join(__dirname, '../src/assets/images/logo/logo.png');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

// ============================================================================
// Main Function
// ============================================================================

async function generateIcons() {
  console.log('🎨 Generating PWA icons...');
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Check if source image exists
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error('❌ Source image not found:', SOURCE_IMAGE);
    console.log('Please create a logo.png file in src/assets/images/logo/');
    process.exit(1);
  }
  
  // Generate each icon
  for (const icon of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, icon.name);
    
    try {
      await sharp(SOURCE_IMAGE)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${icon.name} (${icon.size}x${icon.size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${icon.name}:`, error);
    }
  }
  
  console.log('🎉 PWA icons generated successfully!');
}

// ============================================================================
// Run
// ============================================================================

generateIcons().catch(console.error);