#!/usr/bin/env node

// ============================================================================
// Xcode Workspace Setup Script
// ============================================================================

/**
 * Script to set up the Xcode workspace files
 * 
 * Run: node scripts/setup-workspace.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// ============================================================================
// Configuration
// ============================================================================

const WORKSPACE_DIR = path.join(__dirname, '../ios/ParkingSystem.xcworkspace');
const SHARED_DATA_DIR = path.join(WORKSPACE_DIR, 'xcshareddata');
const USER_DATA_DIR = path.join(WORKSPACE_DIR, 'xcuserdata');
const USERNAME = os.userInfo().username;

// ============================================================================
// Main Function
// ============================================================================

function setupWorkspace() {
    console.log('🎨 Setting up Xcode workspace...');
    console.log('================================================\n');

    // Create workspace directory
    if (!fs.existsSync(WORKSPACE_DIR)) {
        fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
        console.log(`✅ Created workspace directory: ${WORKSPACE_DIR}`);
    }

    // Create xcshareddata directory
    if (!fs.existsSync(SHARED_DATA_DIR)) {
        fs.mkdirSync(SHARED_DATA_DIR, { recursive: true });
        console.log(`✅ Created shared data directory: ${SHARED_DATA_DIR}`);
    }

    // Create workspace contents
    const workspaceContent = `<?xml version="1.0" encoding="UTF-8"?>
<Workspace
   version = "1.0">
   <FileRef
      location = "group:ParkingSystem.xcodeproj">
   </FileRef>
   <FileRef
      location = "group:Pods/Pods.xcodeproj">
   </FileRef>
</Workspace>`;

    const workspacePath = path.join(WORKSPACE_DIR, 'contents.xcworkspacedata');
    fs.writeFileSync(workspacePath, workspaceContent);
    console.log(`✅ Created: ${workspacePath}`);

    // Create IDEWorkspaceChecks.plist
    const ideWorkspaceChecks = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>IDEDidComputeMac32BitWarning</key>
    <true/>
</dict>
</plist>`;

    const ideWorkspacePath = path.join(SHARED_DATA_DIR, 'IDEWorkspaceChecks.plist');
    fs.writeFileSync(ideWorkspacePath, ideWorkspaceChecks);
    console.log(`✅ Created: ${ideWorkspacePath}`);

    // Create user data directory
    const userXcuserdataDir = path.join(USER_DATA_DIR, `${USERNAME}.xcuserdatad`);
    if (!fs.existsSync(userXcuserdataDir)) {
        fs.mkdirSync(userXcuserdataDir, { recursive: true });
        console.log(`✅ Created user data directory: ${userXcuserdataDir}`);
    }

    console.log('\n🎉 Workspace setup completed successfully!');
    console.log('================================================');
    console.log('\n📌 Next steps:');
    console.log('   1. Run `pod install` in the ios directory');
    console.log('   2. Open the workspace: open ParkingSystem.xcworkspace');
    console.log('   3. Build and run the project');
}

// ============================================================================
// Run
// ============================================================================

setupWorkspace();