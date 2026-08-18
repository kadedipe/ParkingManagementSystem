// coverage-report.js
const fs = require('fs');
const path = require('path');

// Generate coverage summary
const coverageSummary = {
  total: { lines: 0, statements: 0, functions: 0, branches: 0 },
  files: []
};

const coverageDir = path.join(__dirname, 'coverage');
const coverageFiles = fs.readdirSync(coverageDir);

for (const file of coverageFiles) {
  if (file.endsWith('.json')) {
    const data = JSON.parse(fs.readFileSync(path.join(coverageDir, file)));
    coverageSummary.files.push({
      name: file,
      coverage: data
    });
  }
}

console.log('📊 Coverage Summary:');
console.log(JSON.stringify(coverageSummary, null, 2));