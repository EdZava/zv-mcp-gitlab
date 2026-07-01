# release-gitlab-mcp (release)

Paquete npm **standalone** para instalar el MCP de GitLab desde este fork sin compilar el monorepo.

## Uso en Cursor (`mcp.json`)

```json
"gitlab": {
  "command": "npx",
  "args": [
    "-y",
    "--package",
    "git+https://github.com/EdZava/zv-mcp-gitlab.git#9.1.1-release.2?subdir=release",
    "gitlab-mcp",
    "stdio"
  ],
  "envFile": "${workspaceFolder}/.cursor/mcp.env"
}
```

Sustituye el tag por la version publicada en este fork.

## Regenerar `release/`

```bash
yarn workspace @structured-world/gitlab-mcp run build
yarn sync-release
git add release/ .mcp-release.toml
git tag 9.1.1-release.3   # incrementar release_suffix en .mcp-release.toml
git push origin main --tags
```

Configuracion: `.mcp-release.toml` + [zv-mcp-release-toolkit](https://github.com/EdZava/zv-mcp-release-toolkit).

## Seguridad

- `package-lock.json`: dependencias npm fijadas (reproducibles).
- `.npmrc` con `ignore-scripts=true`: evita scripts postinstall al instalar.
- Publicar solo tags revisados; no reescribir tags ya usados en produccion.
