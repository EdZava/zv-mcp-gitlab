# Seguridad — zv-mcp-gitlab

## Principios

1. **Version fijada**: los consumidores referencian commit SHA o tag exacto en GitHub.
2. **Lockfiles**: dependencias transitivas bloqueadas (`package-lock.json`, `uv.lock` donde aplique).
3. **Sin scripts en install** (GitLab `release/.npmrc`): `ignore-scripts=true` reduce riesgo de supply chain via postinstall.
4. **Actualizaciones controladas**: bump de tag/SHA solo tras revision y `npm audit` / `uv lock` en CI o local.

## GitLab (`release/`)

- Ejecutar `npm audit --omit=dev` en `release/` antes de cada tag.
- No commitear `node_modules` en `release/`.

## Python (otros forks MCP)

- Mantener `uv.lock` en la raiz del fork cuando corresponda.
- `uvx --from git+...@<sha>` instala con el lock del commit fijado.

## Reporte

Incidencias de seguridad: abrir un issue privado o contactar al mantenedor del repositorio antes de publicar un tag nuevo.
