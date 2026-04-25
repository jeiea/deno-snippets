# AGENTS.md

Repository guide for agents.

All repository files are written in English.

## Overview

A collection of small Deno utility snippets, published as `@jeiea/deno-snippets` on JSR. Each
snippet is a self-contained module under `src/` with its own tests and a re-export from `mod.ts`.

## Commands

```bash
# NO_COLOR=1 disables colored output
deno task test        # Run tests (--doc --allow-all)
deno task fmt         # Check formatting
deno task lint        # Check lint
deno task check       # Type-check
deno task ci          # fmt, lint, check, test, publish:check in sequence
```

Single test:

```bash
deno test src/git_subprocess.test.ts --filter "isolates"
```

## Architecture

- `mod.ts`: entry point, re-exports each snippet
- `src/<snippet>.ts`: one snippet per file, with a sibling `<snippet>.test.ts`
- Each snippet should be small, dependency-light, and copy-friendly
