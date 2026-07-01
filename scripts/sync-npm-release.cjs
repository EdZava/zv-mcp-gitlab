#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const LRoot = path.join(__dirname, '..');
const LSourcePkgPath = path.join(LRoot, 'packages', 'gitlab-mcp', 'package.json');
const LSourceDist = path.join(LRoot, 'packages', 'gitlab-mcp', 'dist');
const LReleaseDir = path.join(LRoot, 'release');
const LReleaseDist = path.join(LReleaseDir, 'dist');

/** Sufijo EdZava del paquete release (incrementar al republicar). */
const EDZAVA_RELEASE_SUFFIX = 'edzava.2';

const LSourcePkg = JSON.parse(fs.readFileSync(LSourcePkgPath, 'utf8'));

if (!fs.existsSync(LSourceDist)) {
  console.error('sync-npm-release: falta dist. Ejecuta: yarn workspace @structured-world/gitlab-mcp run build');
  process.exit(1);
}

/** Fija versiones exactas (sin ^) a partir del package fuente. */
function pinDependencies(ADeps) {
  const LResult = {};
  for (const [LName, LRange] of Object.entries(ADeps)) {
    LResult[LName] = String(LRange).replace(/^[\^~]/, '');
  }
  return LResult;
}

const LReleasePkg = {
  name: '@edzava/gitlab-mcp',
  version: `${LSourcePkg.version}-${EDZAVA_RELEASE_SUFFIX}`,
  description: 'GitLab MCP server (fork EdZava, instalable desde GitHub)',
  license: LSourcePkg.license,
  bin: {
    'gitlab-mcp': './dist/src/main.js'
  },
  files: ['dist', 'package-lock.json', '.npmrc'],
  engines: LSourcePkg.engines,
  dependencies: pinDependencies(LSourcePkg.dependencies),
  repository: {
    type: 'git',
    url: 'https://github.com/EdZava/zv-mcp-gitlab.git',
    directory: 'release'
  }
};

fs.rmSync(LReleaseDir, { recursive: true, force: true });
fs.mkdirSync(LReleaseDir, { recursive: true });
fs.cpSync(LSourceDist, LReleaseDist, { recursive: true });
fs.writeFileSync(
  path.join(LReleaseDir, 'package.json'),
  `${JSON.stringify(LReleasePkg, null, 2)}\n`
);

// Mitiga scripts postinstall maliciosos al resolver el lockfile y en instalaciones con .npmrc
fs.writeFileSync(
  path.join(LReleaseDir, '.npmrc'),
  'ignore-scripts=true\nfund=false\naudit=false\n'
);

execSync('npm install --package-lock-only --ignore-scripts', {
  cwd: LReleaseDir,
  stdio: 'inherit'
});

console.log(`release sincronizado: @edzava/gitlab-mcp@${LReleasePkg.version}`);
