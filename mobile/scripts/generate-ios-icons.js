#!/usr/bin/env node

// ============================================================================
// iOS App Icon Generator - Complete Set
// ============================================================================

/**
 * Script to generate all iOS app icons
 * 
 * Run: node scripts/generate-ios-icons.js
 * 
 * Prerequisites:
 * - Install sharp: npm install --save-dev sharp
 * - Place your 1024x1024 logo at: mobile/assets/logo-1024x1024.png
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// ============================================================================
// Configuration
// ============================================================================

const SOURCE_IMAGE = path.join(__dirname, '../assets/logo-1024x1024.png');
const OUTPUT_DIR = path.join(__dirname, '../ios/ParkingSystem/Images.xcassets/AppIcon.appiconset');

// iOS icon sizes (size, scale, filename, idiom)
const ICON_CONFIGS = [
  // iPhone icons
  { size: 20, scale: '2x', filename: 'icon-20@2x.png', idiom: 'iphone', actualSize: 40 },
  { size: 20, scale: '3x', filename: 'icon-20@3x.png', idiom: 'iphone', actualSize: 60 },
  { size: 29, scale: '2x', filename: 'icon-29@2x.png', idiom: 'iphone', actualSize: 58 },
  { size: 29, scale: '3x', filename: 'icon-29@3x.png', idiom: 'iphone', actualSize: 87 },
  { size: 40, scale: '2x', filename: 'icon-40@2x.png', idiom: 'iphone', actualSize: 80 },
  { size: 40, scale: '3x', filename: 'icon-40@3x.png', idiom: 'iphone', actualSize: 120 },
  { size: 60, scale: '2x', filename: 'icon-60@2x.png', idiom: 'iphone', actualSize: 120 },
  { size: 60, scale: '3x', filename: 'icon-60@3x.png', idiom: 'iphone', actualSize: 180 },
  
  // iPad icons
  { size: 20, scale: '1x', filename: 'icon-20.png', idiom: 'ipad', actualSize: 20 },
  { size: 20, scale: '2x', filename: 'icon-20@2x.png', idiom: 'ipad', actualSize: 40 },
  { size: 29, scale: '1x', filename: 'icon-29.png', idiom: 'ipad', actualSize: 29 },
  { size: 29, scale: '2x', filename: 'icon-29@2x.png', idiom: 'ipad', actualSize: 58 },
  { size: 40, scale: '1x', filename: 'icon-40.png', idiom: 'ipad', actualSize: 40 },
  { size: 40, scale: '2x', filename: 'icon-40@2x.png', idiom: 'ipad', actualSize: 80 },
  { size: 76, scale: '1x', filename: 'icon-76.png', idiom: 'ipad', actualSize: 76 },
  { size: 76, scale: '2x', filename: 'icon-76@2x.png', idiom: 'ipad', actualSize: 152 },
  { size: 83.5, scale: '2x', filename: 'icon-83.5@2x.png', idiom: 'ipad', actualSize: 167 },
  
  // App Store
  { size: 1024, scale: '1x', filename: 'icon-1024.png', idiom: 'ios-marketing', actualSize: 1024 },
];

// ============================================================================
// SVG Template for App Icon
// ============================================================================

const SVG_TEMPLATE = `<!-- ============================================================================
     iOS App Icon SVG Template (1024x1024)
     ============================================================================ -->

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <!-- Gradients -->
    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1976d2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#42a5f5;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="iconGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d47a1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1976d2;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="pGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1976d2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1565c0;stop-opacity:1" />
    </linearGradient>
    
    <!-- Shadows -->
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.2"/>
    </filter>
    
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <filter id="innerGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    
    <filter id="innerShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feOffset dx="0" dy="2"/>
      <feGaussianBlur stdDeviation="4" result="offset-blur"/>
      <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
      <feFlood flood-color="black" flood-opacity="0.2" result="color"/>
      <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
      <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
    </filter>
    
    <!-- Rounded Rectangle Clip -->
    <clipPath id="roundedClip">
      <rect x="0" y="0" width="1024" height="1024" rx="230" />
    </clipPath>
  </defs>
  
  <!-- Background with gradient -->
  <rect x="0" y="0" width="1024" height="1024" rx="230" fill="url(#iconGradient)" />
  
  <!-- Subtle inner glow border -->
  <rect x="12" y="12" width="1000" height="1000" rx="218" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.15" filter="url(#innerGlow)" />
  
  <!-- Inner decorative rings -->
  <rect x="40" y="40" width="944" height="944" rx="190" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.08" />
  <rect x="80" y="80" width="864" height="864" rx="170" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.05" />
  
  <!-- Parking "P" symbol with shadow -->
  <g filter="url(#shadow)">
    <!-- Main P shape background -->
    <rect x="340" y="220" width="344" height="584" rx="72" fill="#ffffff" opacity="0.95" />
    
    <!-- P vertical bar with gradient -->
    <rect x="420" y="300" width="184" height="200" rx="32" fill="url(#pGradient)" />
    
    <!-- P horizontal bar -->
    <rect x="420" y="540" width="184" height="200" rx="32" fill="url(#pGradient)" />
    
    <!-- P inner highlight -->
    <rect x="436" y="316" width="152" height="168" rx="24" fill="#ffffff" opacity="0.25" />
    <rect x="436" y="556" width="152" height="168" rx="24" fill="#ffffff" opacity="0.25" />
    
    <!-- P inner shadow -->
    <rect x="436" y="316" width="152" height="168" rx="24" fill="none" stroke="#1565c0" stroke-width="2" opacity="0.3" />
    <rect x="436" y="556" width="152" height="168" rx="24" fill="none" stroke="#1565c0" stroke-width="2" opacity="0.3" />
  </g>
  
  <!-- Car symbol -->
  <g filter="url(#shadow)">
    <!-- Car body -->
    <rect x="200" y="700" width="624" height="120" rx="60" fill="#ffffff" opacity="0.95" />
    
    <!-- Car top -->
    <rect x="300" y="620" width="424" height="100" rx="50" fill="#ffffff" opacity="0.85" />
    
    <!-- Windows with gradient -->
    <rect x="340" y="640" width="120" height="60" rx="16" fill="url(#pGradient)" opacity="0.3" />
    <rect x="484" y="640" width="120" height="60" rx="16" fill="url(#pGradient)" opacity="0.3" />
    <rect x="628" y="640" width="60" height="60" rx="16" fill="url(#pGradient)" opacity="0.3" />
    
    <!-- Window reflections -->
    <rect x="350" y="650" width="100" height="8" rx="4" fill="#ffffff" opacity="0.6" />
    <rect x="494" y="650" width="100" height="8" rx="4" fill="#ffffff" opacity="0.6" />
    <rect x="638" y="650" width="40" height="8" rx="4" fill="#ffffff" opacity="0.6" />
    
    <!-- Wheels with detail -->
    <circle cx="340" cy="780" r="64" fill="url(#pGradient)" stroke="#ffffff" stroke-width="12" />
    <circle cx="340" cy="780" r="44" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.3" />
    <circle cx="340" cy="780" r="24" fill="#ffffff" opacity="0.3" />
    <circle cx="340" cy="780" r="8" fill="url(#pGradient)" opacity="0.5" />
    
    <circle cx="684" cy="780" r="64" fill="url(#pGradient)" stroke="#ffffff" stroke-width="12" />
    <circle cx="684" cy="780" r="44" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.3" />
    <circle cx="684" cy="780" r="24" fill="#ffffff" opacity="0.3" />
    <circle cx="684" cy="780" r="8" fill="url(#pGradient)" opacity="0.5" />
    
    <!-- Headlights with glow -->
    <rect x="190" y="730" width="40" height="20" rx="10" fill="#ffeb3b" opacity="0.9" filter="url(#glow)" />
    <rect x="794" y="730" width="40" height="20" rx="10" fill="#f44336" opacity="0.9" filter="url(#glow)" />
    
    <!-- Tail lights -->
    <rect x="190" y="760" width="16" height="16" rx="8" fill="#f44336" opacity="0.5" />
    <rect x="818" y="760" width="16" height="16" rx="8" fill="#ffeb3b" opacity="0.5" />
    
    <!-- Fog lights -->
    <circle cx="210" cy="780" r="8" fill="#ffeb3b" opacity="0.3" />
    <circle cx="814" cy="780" r="8" fill="#ffeb3b" opacity="0.3" />
  </g>
</svg>`;

// ============================================================================
// Main Function
// ============================================================================

async function generateIcons() {
  console.log('🎨 Generating iOS app icons...');
  console.log('================================================\n');

  // Check if source image exists
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error('❌ Source image not found:', SOURCE_IMAGE);
    console.log('\n📌 Please create a 1024x1024 PNG logo and place it at:');
    console.log('   ', SOURCE_IMAGE);
    console.log('\n   Alternatively, use the SVG template provided\n');
    process.exit(1);
  }

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const sourceBuffer = fs.readFileSync(SOURCE_IMAGE);

  // Generate each icon
  console.log('📱 Generating iOS icons...');
  for (const config of ICON_CONFIGS) {
    const outputPath = path.join(OUTPUT_DIR, config.filename);
    const size = config.actualSize;

    // For App Store icon, use highest quality settings
    const sharpOptions = {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
      kernel: sharp.kernel.lanczos3,
    };

    if (config.size === 1024) {
      // Extra quality for App Store icon
      await sharp(sourceBuffer)
        .resize(size, size, sharpOptions)
        .png({
          compressionLevel: 9,
          quality: 100,
          force: true,
          adaptiveFiltering: true,
          palette: false,
        })
        .toFile(outputPath);
    } else {
      await sharp(sourceBuffer)
        .resize(size, size, sharpOptions)
        .png({
          compressionLevel: 9,
          quality: 100,
          force: true,
        })
        .toFile(outputPath);
    }

    console.log(`   ✅ ${config.filename} (${size}x${size}) → ${config.scale}`);
  }

  // Generate Contents.json
  await generateContentsJSON();

  console.log('\n🎉 All iOS icons generated successfully!');
  console.log('================================================');
}

// ============================================================================
// Generate Contents.json
// ============================================================================

async function generateContentsJSON() {
  const contents = {
    images: ICON_CONFIGS.map(config => ({
      size: `${config.size}x${config.size}`,
      idiom: config.idiom || 'universal',
      filename: config.filename,
      scale: config.scale,
    })),
    info: {
      version: 1,
      author: 'xcode',
    },
  };

  // Remove duplicate entries
  const uniqueImages = [];
  const seen = new Set();
  for (const image of contents.images) {
    const key = `${image.size}-${image.scale}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueImages.push(image);
    }
  }
  contents.images = uniqueImages;

  const outputPath = path.join(OUTPUT_DIR, 'Contents.json');
  fs.writeFileSync(outputPath, JSON.stringify(contents, null, 2));
  console.log('   ✅ Contents.json generated');
}

// ============================================================================
// Create SVG Template
// ============================================================================

function createSVGTemplate() {
  const assetsDir = path.join(__dirname, '../assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const svgPath = path.join(assetsDir, 'logo-ios.svg');
  if (!fs.existsSync(svgPath)) {
    fs.writeFileSync(svgPath, SVG_TEMPLATE);
    console.log('✅ Created iOS SVG template at:', svgPath);
  }
}

// ============================================================================
// Run
// ============================================================================

createSVGTemplate();

if (!fs.existsSync(SOURCE_IMAGE)) {
  console.log('\n📌 Please create a 1024x1024 PNG logo and place it at:');
  console.log('   ', SOURCE_IMAGE);
  console.log('\n   Steps:');
  console.log('   1. Use the SVG template in mobile/assets/logo-ios.svg');
  console.log('   2. Convert SVG to PNG using an online converter');
  console.log('   3. Save as logo-1024x1024.png\n');
  process.exit(0);
}

generateIcons().catch(console.error);