// ============================================================================
// K6 Run Script - Execute Load Tests with Configuration
// ============================================================================

// parking-management-system/tests/load/run.js

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

// Configuration
const CONFIG = {
  profiles: ['smoke', 'load', 'stress', 'spike', 'soak', 'breakpoint'],
  resultsDir: path.join(__dirname, 'results'),
  scriptPath: path.join(__dirname, 'k6-script.js'),
  configPath: path.join(__dirname, 'k6-config.js'),
};

// Ensure results directory exists
if (!fs.existsSync(CONFIG.resultsDir)) {
  fs.mkdirSync(CONFIG.resultsDir, { recursive: true });
}

async function runLoadTest(profile = 'load') {
  console.log(`\n🚀 Running ${profile} load test...`);
  console.log('========================================\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsFile = path.join(CONFIG.resultsDir, `results-${profile}-${timestamp}.json`);
  const htmlReport = path.join(CONFIG.resultsDir, `report-${profile}-${timestamp}.html`);

  // Build the command
  const command = `
    k6 run ${CONFIG.scriptPath} \
      --config ${CONFIG.configPath} \
      --env TEST_PROFILE=${profile} \
      --out json=${resultsFile} \
      --summary-time=json \
      --summary-trend-stats=avg,min,max,p(95),p(99)
  `;

  try {
    console.log(`📝 Running command: ${command}`);
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    
    console.log(`\n✅ ${profile} load test completed successfully`);
    console.log(`📊 Results saved to: ${resultsFile}`);
    
    // Generate HTML report
    await generateHtmlReport(resultsFile, htmlReport);
    console.log(`📄 HTML report saved to: ${htmlReport}`);
    
    return { resultsFile, htmlReport };
  } catch (error) {
    console.error(`\n❌ ${profile} load test failed:`, error.message);
    throw error;
  }
}

async function generateHtmlReport(jsonFile, htmlFile) {
  // Import and run the report generator
  const { generateHtmlReport } = await import('./generate-report.js');
  return generateHtmlReport(jsonFile, htmlFile);
}

async function runAllProfiles() {
  console.log('🚀 Running all load test profiles...');
  console.log('========================================\n');
  
  const results = [];
  
  for (const profile of CONFIG.profiles) {
    try {
      const result = await runLoadTest(profile);
      results.push({ profile, ...result });
    } catch (error) {
      console.error(`Failed to run ${profile} test:`, error.message);
    }
  }
  
  console.log('\n📊 All load tests completed');
  console.log('========================================');
  results.forEach(({ profile, resultsFile, htmlReport }) => {
    console.log(`  ${profile}: ${resultsFile}`);
  });
}

// Parse command line arguments
const args = process.argv.slice(2);
const profile = args[0] || 'load';

if (profile === 'all') {
  runAllProfiles();
} else if (CONFIG.profiles.includes(profile)) {
  runLoadTest(profile);
} else {
  console.error(`Invalid profile: ${profile}`);
  console.log(`Available profiles: ${CONFIG.profiles.join(', ')}`);
  process.exit(1);
}