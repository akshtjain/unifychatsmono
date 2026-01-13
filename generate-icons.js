/**
 * Generate placeholder icons for the extension
 * Run with: node generate-icons.js
 *
 * For production, replace these with properly designed icons
 */

const fs = require('fs');
const path = require('path');

// Simple 1x1 purple PNG as base64 (will be stretched)
// For proper icons, use a design tool or image editor
const sizes = [16, 48, 128];

// This creates a simple purple square PNG
// In production, replace with actual designed icons
function createSimplePNG(size) {
  // PNG header + IHDR + IDAT with purple color + IEND
  // This is a minimal valid PNG with a solid color

  const { createCanvas } = require('canvas');
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#6366f1');
  gradient.addColorStop(1, '#8b5cf6');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Draw a simple list icon
  ctx.strokeStyle = 'white';
  ctx.lineWidth = Math.max(1, size / 16);
  ctx.lineCap = 'round';

  const padding = size * 0.25;
  const lineSpacing = (size - padding * 2) / 4;

  for (let i = 0; i < 3; i++) {
    const y = padding + lineSpacing * (i + 1);
    // Dot
    ctx.beginPath();
    ctx.arc(padding, y, size / 20, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    // Line
    ctx.beginPath();
    ctx.moveTo(padding + size * 0.15, y);
    ctx.lineTo(size - padding, y);
    ctx.stroke();
  }

  return canvas.toBuffer('image/png');
}

// Check if canvas module is available
try {
  require('canvas');

  sizes.forEach(size => {
    const buffer = createSimplePNG(size);
    const filePath = path.join(__dirname, 'icons', `icon-${size}.png`);
    fs.writeFileSync(filePath, buffer);
    console.log(`Created: ${filePath}`);
  });

  console.log('\nIcons generated successfully!');
} catch (err) {
  console.log('Note: The "canvas" npm package is required to generate icons.');
  console.log('Run: npm install canvas');
  console.log('\nAlternatively, create icon-16.png, icon-48.png, and icon-128.png manually.');
  console.log('Place them in the icons/ folder with a purple gradient background and list icon.');

  // Create placeholder text files explaining what icons are needed
  sizes.forEach(size => {
    const filePath = path.join(__dirname, 'icons', `icon-${size}.txt`);
    fs.writeFileSync(filePath, `Create a ${size}x${size} PNG icon here.\nUse a purple gradient (#6366f1 to #8b5cf6) with a white list icon.`);
    console.log(`Created placeholder: ${filePath}`);
  });
}
