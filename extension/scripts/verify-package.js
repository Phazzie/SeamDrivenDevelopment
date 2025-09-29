const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
const { execSync } = require('child_process');

function fail(msg) {
  console.error('❌', msg);
  process.exit(1);
}

try {
  const extDir = path.resolve(__dirname, '..');
  const pkg = require(path.join(extDir, 'package.json'));
  console.log('Running package:standalone...');
  execSync('npm run package:standalone', { cwd: extDir, stdio: 'inherit' });

  const vsixPath = path.join(extDir, `sdd-implementation-verification-${pkg.version}.vsix`);
  if (!fs.existsSync(vsixPath)) fail('VSIX not found: ' + vsixPath);

  const zip = new AdmZip(vsixPath);
  const entries = zip.getEntries().map(e => e.entryName);

  console.log('VSIX entries:', entries);

  // Expect at least dist/index.js
  if (!entries.some(e => e.endsWith('dist/index.js'))) fail('dist/index.js not found in VSIX');
  if (!entries.some(e => e.endsWith('package.json'))) fail('package.json missing in VSIX');

  // Verify package.json contributions exist in original package.json
  const requiredCommands = [
    'sdd.analyzeSelectedFunction',
    'sdd.generateContractFromSelection',
    'sdd.validateContractFromExplorer',
    'sdd.openImplementationPanel'
  ];

  const contributed = (pkg.contributes && pkg.contributes.commands) || [];
  for (const cmd of requiredCommands) {
    if (!contributed.some(c => c.command === cmd)) fail(`package.json missing contribution for command: ${cmd}`);
  }

  console.log('✅ VSIX verification passed');
  process.exit(0);
} catch (err) {
  console.error('Error during verification:', err);
  process.exit(1);
}