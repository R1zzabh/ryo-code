# Ryo

A multi-agent AI coding platform that supports Claude Code, OpenAI's Codex CLI, GitHub Copilot CLI, Cursor CLI, Google Gemini CLI, and opencode with [Vercel Sandbox](https://vercel.com/docs/vercel-sandbox) to automatically execute coding tasks on your repositories.

## Features

- **Multi-Agent Support**: Choose from Claude Code, OpenAI Codex CLI, GitHub Copilot CLI, Cursor CLI, Google Gemini CLI, or opencode to execute coding tasks
- **User Authentication**: Secure sign-in with GitHub or Vercel OAuth
- **Multi-User Support**: Each user has their own tasks, API keys, and GitHub connection
- **Vercel Sandbox**: Runs code in isolated, secure sandboxes ([docs](https://vercel.com/docs/vercel-sandbox))
- **AI Gateway Integration**: Built for seamless integration with [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) for model routing and observability
- **AI-Generated Branch Names**: Automatically generates descriptive Git branch names using AI SDK 5 + AI Gateway
- **Task Management**: Track task progress with real-time updates
- **Persistent Storage**: Tasks stored in Neon Postgres database
- **Git Integration**: Automatically creates branches and commits changes
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS
- **MCP Server Support**: Connect MCP servers to Claude Code for extended capabilities (Claude only)

## Usage

1. **Sign In**: Authenticate with GitHub or Vercel
2. **Create a Task**: Enter a repository URL and describe what you want the AI to do
3. **Monitor Progress**: Watch real-time logs as the agent works
4. **Review Results**: See the changes made and the branch created
5. **Manage Tasks**: View all your tasks in the sidebar with status updates

## Task Configuration

### Maximum Duration

The maximum duration setting controls how long the Vercel sandbox will stay alive from the moment it's created. You can select timeouts ranging from 5 minutes to 5 hours.

- The sandbox is created at the start of the task
- The timeout begins when the sandbox is created
- All work (agent execution, dependency installation, etc.) happens within this timeframe
- When the timeout is reached, the sandbox automatically expires

### Keep Alive Setting

The Keep Alive setting determines what happens to the sandbox after your task completes.

#### Keep Alive OFF (Default)

When Keep Alive is disabled, the sandbox shuts down immediately after the task completes:

**Timeline:**
1. Task starts and sandbox is created (e.g., with 1 hour timeout)
2. Agent executes your task
3. Task completes successfully (e.g., after 10 minutes)
4. Changes are committed and pushed to the branch
5. Sandbox immediately shuts down (destroys all processes and the environment)
6. Task is marked as completed

**Use Keep Alive OFF when:**
- You're making one-time code changes that don't require iteration
- You have simple tasks that work on the first try
- You want to minimize resource usage and costs
- You don't need to test or manually interact with the code after completion

#### Keep Alive ON

When Keep Alive is enabled, the sandbox stays alive after task completion for the remaining duration:

**Timeline:**
1. Task starts and sandbox is created (e.g., with 1 hour timeout)
2. Agent executes your task
3. Task completes successfully (e.g., after 10 minutes)
4. Changes are committed and pushed to the branch
5. Sandbox stays alive with all processes running
6. You can send follow-up messages for 50 more minutes (until the 1 hour timeout expires)
7. If the project has a dev server (e.g., `npm run dev`), it automatically starts in the background
8. After the full timeout duration, the sandbox expires

**Use Keep Alive ON when:**
- You need to iterate on the code with follow-up messages
- You want to test changes in the live sandbox environment
- You anticipate needing to refine or fix issues
- You want to manually run commands or inspect the environment after completion
- You're developing a web application and want to see it running

#### Comparison

| Setting | Task completes in 10 min | Remaining sandbox time | Can send follow-ups? | Dev server starts? |
|---------|-------------------------|------------------------|---------------------|-------------------|
| Keep Alive ON | Sandbox stays alive | 50 minutes (until timeout) | Yes | Yes (if available) |
| Keep Alive OFF | Sandbox shuts down | 0 minutes | No | No |

**Note:** The maximum duration timeout always takes precedence. If you set a 1-hour timeout, the sandbox will expire after 1 hour regardless of the Keep Alive setting. Keep Alive only determines whether the sandbox shuts down early (after task completion) or stays alive until the timeout.

## How It Works

1. **Task Creation**: When you submit a task, it's stored in the database
2. **AI Branch Name Generation**: AI SDK 5 + AI Gateway automatically generates a descriptive branch name based on your task (non-blocking using Next.js 15's `after()`)
3. **Sandbox Setup**: A Vercel sandbox is created with your repository
4. **Agent Execution**: Your chosen coding agent (Claude Code, Codex CLI, GitHub Copilot CLI, Cursor CLI, Gemini CLI, or opencode) analyzes your prompt and makes changes
5. **Git Operations**: Changes are committed and pushed to the AI-generated branch
6. **Cleanup**: The sandbox is shut down to free resources

## AI Branch Name Generation

The system automatically generates descriptive Git branch names using AI SDK 5 and Vercel AI Gateway. This feature:

- **Non-blocking**: Uses Next.js 15's `after()` function to generate names without delaying task creation
- **Descriptive**: Creates meaningful branch names like `feature/user-authentication-A1b2C3` or `fix/memory-leak-parser-X9y8Z7`
- **Conflict-free**: Adds a 6-character alphanumeric hash to prevent naming conflicts
- **Fallback**: Gracefully falls back to timestamp-based names if AI generation fails
- **Context-aware**: Uses task description, repository name, and agent context for better names

### Branch Name Examples

- `feature/add-user-auth-K3mP9n` (for "Add user authentication with JWT")
- `fix/resolve-memory-leak-B7xQ2w` (for "Fix memory leak in image processing")
- `chore/update-deps-M4nR8s` (for "Update all project dependencies")
- `docs/api-endpoints-F9tL5v` (for "Document REST API endpoints")

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL with Drizzle ORM
- **AI SDK**: AI SDK 5 with Vercel AI Gateway integration
- **AI Agents**: Claude Code, OpenAI Codex CLI, GitHub Copilot CLI, Cursor CLI, Google Gemini CLI, opencode
- **Sandbox**: [Vercel Sandbox](https://vercel.com/docs/vercel-sandbox)
- **Authentication**: Next Auth (OAuth with GitHub/Vercel)
- **Git**: Automated branching and commits with AI-generated branch names

## MCP Server Support

Connect MCP Servers to extend Claude Code with additional tools and integrations. **Currently only works with Claude Code agent.**

### How to Add MCP Servers

1. Go to the "Connectors" tab and click "Add MCP Server"
2. Enter server details (name, base URL, optional OAuth credentials)
