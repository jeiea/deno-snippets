# deno-snippets

A collection of small, copy-friendly Deno utility snippets.

## Installation

```sh
deno add jsr:@jeiea/deno-snippets
```

or

```ts
import { runGit, runGitOrThrow } from "jsr:@jeiea/deno-snippets";
```

## Snippets

### git_subprocess

Run `git` as a subprocess with `GIT_*` environment variables stripped, so that parent process state
(for example a `pre-commit` hook's `GIT_DIR` / `GIT_INDEX_FILE`) does not leak into child
invocations and corrupt unrelated repositories.

```ts ignore
import { runGit, runGitOrThrow } from "@jeiea/deno-snippets";

// Branching on success
const status = await runGit(["status", "--porcelain"]);
if (status.ok && status.stdout === "") {
  console.log("clean");
}

// Assertive variant — throws on failure
const { stdout } = await runGitOrThrow(["rev-parse", "HEAD"]);
console.log(stdout.trim());
```

## License

MIT
