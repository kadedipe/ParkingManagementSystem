#!/usr/bin/env node

// ============================================================================
// Icon Generation Script
// ============================================================================

/**
 * Script to generate all favicon and PWA icons
 * 
 * Run: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// ============================================================================
// Configuration
// ============================================================================

const ICON_SIZES = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 57, name: 'apple-touch-icon-57x57.png' },
  { size: 72, name: 'apple-touch-icon-72x72.png' },
  { size: 76, name: 'apple-touch-icon-76x76.png' },
  { size: 114, name: 'apple-touch-icon-114x114.png' },
  { size: 120, name: 'apple-touch-icon-120x120.png' },
  { size: 144, name: 'apple-touch-icon-144x144.png' },
  { size: 152, name: 'apple-touch-icon-152x152.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
];

const OUTPUT_DIR = path.join(__dirname, '../public');

// ============================================================================
// SVG to PNG Conversion
// ============================================================================

const createFaviconImage = (size) => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#1976d2');
  gradient.addColorStop(1, '#42a5f5');
  ctx.fillStyle = gradient;
  
  const radius = size * 0.2;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();
  
  // Parking "P" symbol
  const padding = size * 0.15;
  const rectWidth = size - padding * 2;
  const rectHeight = size * 0.6;
  const rectX = padding;
  const rectY = size * 0.2;
  
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(rectX, rectY, rectWidth, rectHeight, size * 0.08);
  ctx.fill();
  
  // P shape
  const pWidth = rectWidth * 0.4;
  const pHeight = rectHeight * 0.45;
  const pX = rectX + rectWidth * 0.3;
  const pY = rectY + rectHeight * 0.1;
  
  ctx.fillStyle = '#1976d2';
  ctx.beginPath();
  ctx.roundRect(pX, pY, pWidth, pHeight, size * 0.04);
  ctx.fill();
  
  // Bottom bar of P
  const barY = rectY + rectHeight * 0.65;
  ctx.beginPath();
  ctx.roundRect(pX, barY, pWidth, rectHeight * 0.25, size * 0.04);
  ctx.fill();
  
  // Car symbol
  const carY = rectY + rectHeight * 0.85;
  const carWidth = rectWidth * 0.8;
  const carHeight = rectHeight * 0.15;
  const carX = rectX + rectWidth * 0.1;
  
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(carX, carY, carWidth, carHeight, size * 0.04);
  ctx.fill();
  
  // Wheels
  const wheelSize = size * 0.06;
  ctx.fillStyle = '#1976d2';
  ctx.beginPath();
  ctx.arc(carX + carWidth * 0.2, carY + carHeight, wheelSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(carX + carWidth * 0.8, carY + carHeight, wheelSize, 0, Math.PI * 2);
  ctx.fill();
  
  return canvas;
};

// ============================================================================
// Create ICO File
// ============================================================================

const createICO = async () => {
  // Use a library like 'png-to-ico' or use the generated PNGs
  // For simplicity, we'll create the 16x16 and 32x32 PNGs
  console.log('Creating favicon.ico...');
  console.log('Please use an online tool to convert favicon-16x16.png and favicon-32x32.png to favicon.ico');
  console.log('Or use a library like "png-to-ico" in your build process');
};

// ============================================================================
// Main Execution
// ============================================================================

const generateIcons = async () => {
  console.log('🎨 Generating icons...');
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Create icons directory
  const iconsDir = path.join(OUTPUT_DIR, 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  // Generate each icon
  for (const icon of ICON_SIZES) {
    const canvas = createFaviconImage(icon.size);
    const buffer = canvas.toBuffer('image/png');
    const outputPath = path.join(
      icon.size > 180 ? iconsDir : OUTPUT_DIR,
      icon.name
    );
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Generated ${icon.name} (${icon.size}x${icon.size})`);
  }
  
  // Generate favicon.ico (16x16 and 32x32)
  console.log('📝 Note: favicon.ico not generated automatically.');
  console.log('Please combine favicon-16x16.png and favicon-32x32.png into favicon.ico');
  console.log('using an online tool or the "png-to-ico" library.');
  
  console.log('🎉 Icon generation complete!');
};

// ============================================================================
// RoundRect Polyfill for Canvas
// ============================================================================

if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
    const r = typeof radii === 'number' ? radii : (radii || 0);
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    return this;
  };
}

// ============================================================================
// Run if executed directly
// ============================================================================

if (require.main === module) {
  generateIcons().catch(console.error);
}

module.exports = generateIcons;