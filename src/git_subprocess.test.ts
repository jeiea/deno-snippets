import { assertEquals, assertStringIncludes } from "@std/assert";
import { runGit, runGitOrThrow } from "./git_subprocess.ts";

Deno.test("runGit returns ok=false instead of throwing on git failure", async () => {
  const result = await runGit(["no-such-subcommand-zzz"]);
  assertEquals(result.ok, false);
  assertEquals(result.stderr.length > 0, true);
});

Deno.test("runGitOrThrow throws on non-zero exit", async () => {
  let threw = false;
  try {
    await runGitOrThrow(["no-such-subcommand-zzz"]);
  } catch (e) {
    threw = true;
    assertStringIncludes((e as Error).message, "git no-such-subcommand-zzz");
  }
  assertEquals(threw, true);
});

Deno.test("isolates child git from parent GIT_DIR / GIT_INDEX_FILE", async () => {
  await using outer = await makeTempRepo();
  await using inner = await makeTempRepo();
  // Simulate running inside a pre-commit hook of `outer`: parent env points
  // git at outer/.git. Without isolation, `git -C inner add` would write to
  // outer's index.
  using _envGuard = setEnv({
    GIT_DIR: `${outer.path}/.git`,
    GIT_INDEX_FILE: `${outer.path}/.git/index`,
  });

  await Deno.writeTextFile(`${inner.path}/marker.txt`, "hello\n");
  await runGitOrThrow(["-C", inner.path, "add", "marker.txt"]);
  await runGitOrThrow(["-C", inner.path, "commit", "-q", "--no-verify", "-m", "init"]);

  const outerIndex = await runGit(["-C", outer.path, "ls-files"]);
  assertEquals(outerIndex.ok, true);
  assertEquals(outerIndex.stdout, "", "outer index must remain empty");

  const innerLog = await runGitOrThrow(["-C", inner.path, "log", "--oneline"]);
  assertStringIncludes(innerLog.stdout, "init");
});

interface TempRepo {
  path: string;
  [Symbol.asyncDispose](): Promise<void>;
}

async function makeTempRepo(): Promise<TempRepo> {
  const path = await Deno.makeTempDir({ prefix: "deno-snippets-git-" });
  await runGitOrThrow(["init", "-q", "-b", "main", path]);
  await runGitOrThrow(["-C", path, "config", "user.email", "t@t.com"]);
  await runGitOrThrow(["-C", path, "config", "user.name", "T"]);
  await runGitOrThrow(["-C", path, "config", "commit.gpgsign", "false"]);
  return {
    path,
    [Symbol.asyncDispose]: () => Deno.remove(path, { recursive: true }),
  };
}

function setEnv(vars: Record<string, string>): Disposable {
  const previous = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(vars)) {
    previous.set(key, Deno.env.get(key));
    Deno.env.set(key, value);
  }
  return {
    [Symbol.dispose]() {
      for (const [key, prev] of previous) {
        if (prev === undefined) Deno.env.delete(key);
        else Deno.env.set(key, prev);
      }
    },
  };
}
