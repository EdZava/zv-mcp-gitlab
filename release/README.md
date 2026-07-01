# @edzava/gitlab-mcp (release)

Paquete npm **standalone** para instalar el MCP de GitLab desde este fork sin compilar el monorepo.

## Uso en Cursor (`mcp.json`)

```json
"gitlab": {
  "command": "npx",
  "args": [
    "-y",
    "--package",
    "git+https://github.com/EdZava/zv-mcp-gitlab.git#9.1.1-edzava.2?subdir=release",
    "gitlab-mcp",
    "stdio"
  ],
  "envFile": "${workspaceFolder}/.cursor/mcp.env",
  "env": {
    "GITLAB_API_URL": "https://git-lab.rido.es",
    "LOG_LEVEL": "error",
    "NODE_ENV": "production"
  }
}
```

Sustituye el tag por la version publicada en este fork.

## Seguridad

- `package-lock.json`: dependencias npm **fijadas** (reproducibles).
- `.npmrc` con `ignore-scripts=true`: evita scripts postinstall al instalar.
- Publicar solo tags revisados; no reescribir tags ya usados en produccion.

## Regenerar `release/`

```bash
yarn workspace @structured-world/gitlab-mcp run build
yarn sync-release
git add release/ scripts/sync-npm-release.cjs
git commit -m "release: sync @edzava/gitlab-mcp"
git tag 9.1.1-edzava.3   # incrementar sufijo en scripts/sync-npm-release.cjs si aplica
git push origin main --tags
```
