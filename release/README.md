# release-gitlab-mcp (release)

Paquete npm **standalone** para instalar el MCP de GitLab desde este repositorio sin compilar el monorepo.

## Cliente MCP (`mcp.json`)

```json
"git+https://github.com/EdZava/zv-mcp-gitlab.git#9.1.1-release.2?subdir=release"
```

Ejemplo con `npx`:

```json
{
  "command": "npx",
  "args": [
    "-y",
    "--package",
    "git+https://github.com/EdZava/zv-mcp-gitlab.git#9.1.1-release.2?subdir=release",
    "gitlab-mcp",
    "stdio"
  ]
}
```

Sustituye el tag por la version publicada en este repositorio.

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
