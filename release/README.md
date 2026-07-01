# @edzava/gitlab-mcp (release)

Paquete npm **standalone** para instalar el MCP de GitLab desde este fork sin compilar el monorepo.

## Uso en Cursor (`mcp.json`)

```json
"gitlab": {
  "command": "npx",
  "args": [
    "-y",
    "--package",
    "git+https://github.com/EdZava/zv-mcp-gitlab.git#9.1.1-edzava.1?subdir=release",
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

Sustituye el tag `#9.1.1-edzava.1` por la versión que quieras fijar.

## Regenerar `release/`

Tras cambios en `packages/gitlab-mcp`:

```bash
yarn workspace @structured-world/gitlab-mcp run build
yarn sync-release
git add release/ && git commit -m "release: sync @edzava/gitlab-mcp"
git tag 9.1.1-edzava.2   # incrementar según corresponda
git push origin main --tags
```
