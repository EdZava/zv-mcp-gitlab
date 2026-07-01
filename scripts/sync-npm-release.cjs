#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const LRoot = path.join(__dirname, '..');
const LSourcePkgPath = path.join(LRoot, 'packages', 'gitlab-mcp', 'package.json');
const LSourceDist = path.join(LRoot, 'packages', 'gitlab-mcp', 'dist');
const LReleaseDir = path.join(LRoot, 'release');
const LReleaseDist = path.join(LReleaseDir, 'dist');

const LSourcePkg = JSON.parse(fs.readFileSync(LSourcePkgPath, 'utf8'));

if (!fs.existsSync(LSourceDist)) {
  console.error('sync-npm-release: falta dist. Ejecuta: yarn workspace @structured-world/gitlab-mcp run build');
  process.exit(1);
}

const LReleasePkg = {
  name: '@edzava/gitlab-mcp',
  version: `${LSourcePkg.version}-edzava.1`,
  description: 'GitLab MCP server (fork EdZava, instalable desde GitHub)',
  license: LSourcePkg.license,
  bin: {
    'gitlab-mcp': './dist/src/main.js'
  },
  files: ['dist'],
  engines: LSourcePkg.engines,
  dependencies: LSourcePkg.dependencies,
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

console.log(`release sincronizado: @edzava/gitlab-mcp@${LReleasePkg.version}`);
