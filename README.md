# Ryo

Ryo is a web workspace for running AI coding agents against GitHub repositories. Give an agent a task, follow its logs while it works in a Vercel Sandbox, then review the diff and open a pull request from the resulting branch.

## What you can do

- Sign in with GitHub or Vercel and connect GitHub to browse repositories, issues, commits, and pull requests.
- Run tasks with Claude Code, OpenAI Codex CLI, GitHub Copilot CLI, Cursor CLI, Gemini CLI, or OpenCode.
- Inspect task logs and diffs. With an active sandbox, browse and edit files, run terminal commands, and preview a supported development server.
- Review and continue work on a task branch, sync edits, and manage the associated pull request from the task page.
- Configure provider keys and MCP connectors in your account. Connector support depends on the selected agent and connector type.

## Local setup

You need Git, Node.js 22, Bun, a PostgreSQL database such as Neon, and a GitHub OAuth app. Running coding tasks also requires a Vercel project with Sandbox access and credentials for your chosen agent.

```sh
git clone https://github.com/R1zzabh/ryo-code.git
cd ryo-code
bun install --frozen-lockfile
```

### Configure the environment

Create a `.env` file in the project root. Next.js reads this file for local development, and the Drizzle CLI loads it through `dotenv/config`.

```dotenv
POSTGRES_URL=
JWE_SECRET=
ENCRYPTION_KEY=
NEXT_PUBLIC_AUTH_PROVIDERS=github
NEXT_PUBLIC_GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
SANDBOX_VERCEL_TEAM_ID=
SANDBOX_VERCEL_PROJECT_ID=
SANDBOX_VERCEL_TOKEN=
```

| Variable | Purpose |
| --- | --- |
| `POSTGRES_URL` | PostgreSQL connection string used by the app and migrations. |
| `JWE_SECRET` | Base64url-encoded 32-byte key used to encrypt session tokens. |
| `ENCRYPTION_KEY` | Separate 32-byte key encoded as 64 hexadecimal characters, used for stored secrets. |
| `NEXT_PUBLIC_AUTH_PROVIDERS` | Comma-separated sign-in providers. Defaults to `github`. Use `github,vercel` to offer both. |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | GitHub OAuth app credentials for sign-in and repository access. |
| `NEXT_PUBLIC_VERCEL_CLIENT_ID`, `VERCEL_CLIENT_SECRET` | Vercel OAuth credentials when Vercel sign-in is enabled. |
| `SANDBOX_VERCEL_TEAM_ID`, `SANDBOX_VERCEL_PROJECT_ID`, `SANDBOX_VERCEL_TOKEN` | Vercel team, project, and API token used to create and manage sandboxes. |
| `MAX_SANDBOX_DURATION` | Optional sandbox duration limit in minutes. Defaults to `300`. |

Generate the two encryption keys independently and copy each output to its corresponding variable.

```sh
node -p "require('node:crypto').randomBytes(32).toString('base64url')"
node -p "require('node:crypto').randomBytes(32).toString('hex')"
```

Register the callback URL for each OAuth provider you configure. For a deployment, use the deployed origin in place of `http://localhost:3000`.

| Provider | Local callback URL |
| --- | --- |
| GitHub | `http://localhost:3000/api/auth/github/callback` |
| Vercel | `http://localhost:3000/api/auth/callback/vercel` |

Keep secrets in the local environment or deployment settings. After signing in with Vercel, connect GitHub before starting a repository task.

### Configure your coding agent

Add supported keys in the app's API Keys dialog or set the corresponding server environment variables.

| Agent | Credentials used by Ryo |
| --- | --- |
| Claude Code | `ANTHROPIC_API_KEY` |
| OpenAI Codex CLI | `AI_GATEWAY_API_KEY` |
| GitHub Copilot CLI | A connected GitHub account with Copilot access. The runner passes the account token as `GH_TOKEN`. |
| Cursor CLI | `CURSOR_API_KEY` |
| Gemini CLI | `GEMINI_API_KEY` |
| OpenCode | `AI_GATEWAY_API_KEY` or `ANTHROPIC_API_KEY`, depending on the model |

Ryo can also use AI Gateway to generate task titles, branch names, and commit messages.

### Apply migrations and start the app

```sh
bun run db:migrate
bun run dev
```

Open `http://localhost:3000` and sign in.

## Run a task

1. Choose a GitHub repository you can write to or enter its URL.
2. Describe the change you want. Select an agent and model, then adjust dependency installation, maximum duration, or Keep Alive as needed.
3. Start the task and watch its logs. Ryo creates a sandbox, prepares the repository, and runs the agent. When the agent produces changes, Ryo attempts to commit and push them to the task branch.
4. Review the diff. Use the active sandbox for further edits or a follow-up prompt, or review the branch on GitHub.
5. Open a pull request when the changes are ready. The task page can show its status and checks.

The duration limit starts when the sandbox is created, so setup and dependency installation count toward it. With Keep Alive enabled, the sandbox can stay available after the agent finishes until it expires or you stop it. The task's logs and any pushed commits remain available after the sandbox stops.

## Architecture

| Path | Responsibility |
| --- | --- |
| [`app/`](app/) | Next.js App Router pages and API routes for auth, repositories, and tasks. |
| [`components/`](components/) | React interface for task creation, logs, file editing, terminal access, diffs, and pull requests. |
| [`lib/sandbox/`](lib/sandbox/) | Sandbox creation, agent adapters, command execution, development server detection, and Git operations. |
| [`lib/github/`](lib/github/) | GitHub API clients and user token lookup. |
| [`lib/session/`](lib/session/) | OAuth session creation and retrieval. |
| [`lib/db/`](lib/db/) | Drizzle schema, database access, and versioned PostgreSQL migrations. |

The web app uses Next.js 16, React 19, TypeScript, Tailwind CSS, and Jotai. PostgreSQL stores application data through Drizzle ORM. Agent commands run inside Vercel Sandbox, while GitHub hosts the repositories, branches, and pull requests.

## Development commands

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the development server. |
| `bun run build` | Build the production app. |
| `bun run start` | Serve the production build. |
| `bun run lint` | Run ESLint. |
| `bun run type-check` | Run TypeScript checks. |
| `bun run format:check` | Check TypeScript and TSX formatting. |
| `bun run db:generate` | Generate a migration after changing the Drizzle schema. |
| `bun run db:migrate` | Apply committed migrations to the configured database. |
| `bun run db:studio` | Open Drizzle Studio for the configured database. |

## Deploy on Vercel

Import the repository as a Next.js project, set the environment variables for the deployment, and register OAuth callback URLs for the deployed origin. Apply the checked-in migrations to the deployment database before serving traffic. The [production migration script](scripts/migrate-production.ts) can be wired into a deployment workflow and runs when `VERCEL_ENV=production`.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| OAuth rejects the callback | Match the provider's registered callback to the origin and path used by the app. |
| Sign-in fails when creating a session | Check that `JWE_SECRET` decodes to 32 bytes and is set in the running app. |
| Database tables are missing | Confirm `POSTGRES_URL` points to the intended database and run `bun run db:migrate`. |
| A task fails before the agent starts | Check the three Sandbox variables, GitHub connection, and credentials for the selected agent. |
| A task finishes but its terminal or preview is unavailable | Check the sandbox status and whether Keep Alive was enabled. |
| Branch push or PR creation fails | Check the connected GitHub account's write access and repository branch rules, then review the task logs. |
