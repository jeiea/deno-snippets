# AGENTS.md

## Overview

A collection of small Deno utility snippets, published as `@jeiea/deno-snippets` on JSR. Each
snippet is a self-contained module under `src/` with its own tests and a re-export from `mod.ts`.

## Commands

```bash
# NO_COLOR=1 disables colored output
deno task ci          # fmt, lint, check, test, publish:check in sequence
```

## Publish

Pushing to the release branch triggers publishing via GitHub workflow.
