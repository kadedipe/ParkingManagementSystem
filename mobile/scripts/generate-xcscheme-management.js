#!/usr/bin/env node

// ============================================================================
// Xcode Scheme Management Generator
// ============================================================================

/**
 * Script to generate xcschememanagement.plist with current username
 * 
 * Run: node scripts/generate-xcscheme-management.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// ============================================================================
// Configuration
// ============================================================================

const PROJECT_DIR = path.join(__dirname, '../ios/ParkingSystem.xcodeproj');
const USER_DATA_DIR = path.join(PROJECT_DIR, 'xcuserdata');
const USERNAME = os.userInfo().username;

// ============================================================================
// Main Function
// ============================================================================

function generateSchemeManagement() {
    console.log('🎨 Generating Xcode scheme management file...');
    console.log('================================================\n');

    // Create user data directory
    const userXcuserdataDir = path.join(USER_DATA_DIR, `${USERNAME}.xcuserdatad`);
    const schemesDir = path.join(userXcuserdataDir, 'xcschemes');

    if (!fs.existsSync(userXcuserdataDir)) {
        fs.mkdirSync(userXcuserdataDir, { recursive: true });
        console.log(`✅ Created directory: ${userXcuserdataDir}`);
    }

    if (!fs.existsSync(schemesDir)) {
        fs.mkdirSync(schemesDir, { recursive: true });
        console.log(`✅ Created directory: ${schemesDir}`);
    }

    // Scheme management content
    const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>SchemeUserState</key>
    <dict>
        <key>ParkingSystem.xcscheme</key>
        <dict>
            <key>orderHint</key>
            <integer>0</integer>
            <key>isShown</key>
            <true/>
        </dict>
        <key>ParkingSystem-Debug.xcscheme</key>
        <dict>
            <key>orderHint</key>
            <integer>1</integer>
            <key>isShown</key>
            <true/>
        </dict>
        <key>ParkingSystem-Release.xcscheme</key>
        <dict>
            <key>orderHint</key>
            <integer>2</integer>
            <key>isShown</key>
            <true/>
        </dict>
        <key>ParkingSystemTests.xcscheme</key>
        <dict>
            <key>orderHint</key>
            <integer>3</integer>
            <key>isShown</key>
            <true/>
        </dict>
    </dict>
    <key>SuppressBuildableAutocreation</key>
    <dict>
        <key>00E356ED1AD99517003FC87E</key>
        <dict>
            <key>primary</key>
            <true/>
        </dict>
        <key>13B07F861A680F5B00A75B9A</key>
        <dict>
            <key>primary</key>
            <true/>
        </dict>
    </dict>
</dict>
</plist>`;

    const outputPath = path.join(schemesDir, 'xcschememanagement.plist');
    fs.writeFileSync(outputPath, plistContent);
    console.log(`✅ Generated: ${outputPath}`);

    console.log('\n🎉 Xcode scheme management file generated successfully!');
    console.log('================================================');
}

// ============================================================================
// Run
// ============================================================================

// Check if project exists
if (!fs.existsSync(PROJECT_DIR)) {
    console.error('❌ Xcode project not found:', PROJECT_DIR);
    console.log('\nPlease make sure you are in the correct directory.');
    process.exit(1);
}

generateSchemeManagement();