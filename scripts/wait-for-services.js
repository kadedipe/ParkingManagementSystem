// ============================================================================
// Wait for Services - Service Readiness Check
// ============================================================================

// parking-management-system/scripts/wait-for-services.js

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const services = [
  { name: 'PostgreSQL', host: 'localhost', port: 5432, command: 'pg_isready' },
  { name: 'Redis', host: 'localhost', port: 6379, command: 'redis-cli ping' },
];

async function checkService(service) {
  try {
    const { stdout } = await execAsync(service.command);
    return stdout.includes('accepting connections') || stdout.includes('PONG');
  } catch (error) {
    return false;
  }
}

async function waitForServices() {
  console.log('⏳ Waiting for services to be ready...');
  
  let allReady = false;
  let attempts = 0;
  const maxAttempts = 30;
  
  while (!allReady && attempts < maxAttempts) {
    allReady = true;
    for (const service of services) {
      const ready = await checkService(service);
      if (!ready) {
        console.log(`⏳ ${service.name} is not ready yet...`);
        allReady = false;
        break;
      }
    }
    
    if (!allReady) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  if (allReady) {
    console.log('✅ All services are ready!');
  } else {
    console.error('❌ Services failed to start!');
    process.exit(1);
  }
}

waitForServices();