# @edzava/gitlab-mcp (release)

Paquete npm **standalone** para `npx --package git+...@TAG?subdir=release`.

## Cliente MCP (`mcp.json`)

Repositorio **privado**: usar `git+ssh` (clave SSH en el agente). Sustituye el tag por la version publicada.

```json
"npx": {
  "args": [
    "-y",
    "--package",
    "git+ssh://git@github.com/EdZava/zv-mcp-gitlab.git#9.1.1-release.3?subdir=release",
    "gitlab-mcp",
    "stdio"
  ]
}
```

Alternativa con GitHub Packages (requiere `~/.npmrc` con token de lectura de paquetes):

```json
"--package",
"@edzava/gitlab-mcp@9.1.1-release.3"
```

## Regenerar `release/`

Compilar el paquete fuente, luego `yarn sync-release` (o `mcp-release-toolkit sync`).

Configuracion: `.mcp-release.toml` + [zv-mcp-release-toolkit](https://github.com/EdZava/zv-mcp-release-toolkit).

## Seguridad

- `package-lock.json`: dependencias npm fijadas (reproducibles).
- `.npmrc` con `ignore-scripts=true`: evita scripts postinstall al instalar.
- Publicar solo tags revisados; no reescribir tags ya usados en produccion.
