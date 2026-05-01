# deno-snippets

A collection of small, copy-friendly Deno utility snippets.

## Installation

```sh
deno add jsr:@jeiea/snippets
```

or

```ts
import { createTempDir, runGit, runGitOrThrow } from "jsr:@jeiea/snippets";
```

## Snippets

### git_subprocess

Run `git` as a subprocess with `GIT_*` environment variables stripped, so that parent process state
(for example a `pre-commit` hook's `GIT_DIR` / `GIT_INDEX_FILE`) does not leak into child
invocations and corrupt unrelated repositories.

```ts ignore
import { runGit, runGitOrThrow } from "@jeiea/snippets";

// Branching on success
const status = await runGit(["status", "--porcelain"]);
if (status.ok && status.stdout === "") {
  console.log("clean");
}

// Assertive variant — throws on failure
const { stdout } = await runGitOrThrow(["rev-parse", "HEAD"]);
console.log(stdout.trim());
```

### temp_dir

Create a temporary directory that is automatically removed when disposed. Wraps `Deno.makeTempDir`
with `AsyncDisposable`, so `await using` handles cleanup.

```ts ignore
import { createTempDir } from "@jeiea/snippets";

await using tmp = await createTempDir({ prefix: "work-" });
await Deno.writeTextFile(`${tmp.path}/hello.txt`, "hi");
// directory is removed when `tmp` goes out of scope
```

## License

MIT
