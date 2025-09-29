const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

async function run() {
  const extDir = path.resolve(__dirname, '..');
  const tempDir = path.join(extDir, 'pack-temp');
  const outVsix = path.join(extDir, `sdd-implementation-verification-${require(path.join(extDir, 'package.json')).version}.vsix`);

  try {
    // Clean tempDir
    await fsp.rm(tempDir, { recursive: true, force: true });
    await fsp.mkdir(tempDir, { recursive: true });

    const pkg = require(path.join(extDir, 'package.json'));

    // Create minimal package.json for packaging
    const minimal = {
      name: pkg.name,
      displayName: pkg.displayName,
      description: pkg.description,
      version: pkg.version,
      publisher: pkg.publisher,
      engines: pkg.engines,
      categories: pkg.categories,
      keywords: pkg.keywords,
      activationEvents: pkg.activationEvents,
      main: pkg.main,
      contributes: pkg.contributes,
      repository: pkg.repository || { type: 'git', url: 'https://github.com/Phazzie/SeamDrivenDevelopment' }
    };

    await fsp.writeFile(path.join(tempDir, 'package.json'), JSON.stringify(minimal, null, 2), 'utf8');

    // Copy dist, README, LICENSE, resources if present
    const toCopy = ['dist', 'README.md', 'README.MD', 'README', 'LICENSE', 'LICENSE.md', 'resources'];
    for (const name of toCopy) {
      const src = path.join(extDir, name);
      const dest = path.join(tempDir, name);
      if (fs.existsSync(src)) {
        // Use fs.cp if available
        if (fsp.cp) {
          await fsp.cp(src, dest, { recursive: true });
        } else {
          // fallback: copy files/directories
          await copyRecursive(src, dest);
        }
      }
    }

    // Run vsce package in tempDir
    console.log('Packaging from', tempDir);
    execSync('npx vsce package', { cwd: tempDir, stdio: 'inherit' });

    // Move .vsix (there will be one .vsix file in tempDir)
    const files = await fsp.readdir(tempDir);
    const vsix = files.find(f => f.endsWith('.vsix'));
    if (!vsix) throw new Error('No .vsix produced in temp dir');

    const produced = path.join(tempDir, vsix);
    await fsp.copyFile(produced, outVsix);
    console.log('Packaged VSIX copied to', outVsix);

    // Cleanup
    await fsp.rm(tempDir, { recursive: true, force: true });
    console.log('Temporary packaging folder removed');

    process.exit(0);
  } catch (err) {
    console.error('Packaging failed:', err);
    try { await fsp.rm(tempDir, { recursive: true, force: true }); } catch (e) {}
    process.exit(1);
  }
}

async function copyRecursive(src, dest) {
  const stat = await fsp.stat(src);
  if (stat.isDirectory()) {
    await fsp.mkdir(dest, { recursive: true });
    const entries = await fsp.readdir(src);
    for (const e of entries) {
      await copyRecursive(path.join(src, e), path.join(dest, e));
    }
  } else {
    await fsp.copyFile(src, dest);
  }
}

run();