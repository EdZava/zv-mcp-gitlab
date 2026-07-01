# Seguridad — forks MCP EdZava

## Principios

1. **Version fijada**: los consumidores (GestionG5) referencian commit SHA o tag exacto en GitHub.
2. **Lockfiles**: dependencias transitivas bloqueadas (`package-lock.json`, `uv.lock`).
3. **Sin scripts en install** (GitLab `release/.npmrc`): `ignore-scripts=true` reduce riesgo de supply chain via postinstall.
4. **Actualizaciones controladas**: bump de tag/SHA solo tras revision y `npm audit` / `uv lock` en CI o local.

## GitLab (`release/`)

- Ejecutar `npm audit --omit=dev` en `release/` antes de cada tag.
- No commitear `node_modules` en `release/`.

## Python (Jira, MSSQL)

- Mantener `uv.lock` en la raiz del fork.
- `uvx --from git+...@<sha>` instala con el lock del commit fijado.

## Reporte

Incidencias de seguridad del equipo: contactar al mantenedor del fork EdZava antes de publicar un tag nuevo.
