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
  const outer = await makeTempRepo();
  const inner = await makeTempRepo();
  try {
    // Simulate running inside a pre-commit hook of `outer`: parent env points
    // git at outer/.git. Without isolation, `git -C inner add` would write to
    // outer's index.
    Deno.env.set("GIT_DIR", `${outer.path}/.git`);
    Deno.env.set("GIT_INDEX_FILE", `${outer.path}/.git/index`);
    try {
      await Deno.writeTextFile(`${inner.path}/marker.txt`, "hello\n");
      await runGitOrThrow(["-C", inner.path, "add", "marker.txt"]);
      await runGitOrThrow([
        "-C",
        inner.path,
        "commit",
        "-q",
        "--no-verify",
        "-m",
        "init",
      ]);

      const outerIndex = await runGit(["-C", outer.path, "ls-files"]);
      assertEquals(outerIndex.ok, true);
      assertEquals(outerIndex.stdout, "", "outer index must remain empty");

      const innerLog = await runGitOrThrow([
        "-C",
        inner.path,
        "log",
        "--oneline",
      ]);
      assertStringIncludes(innerLog.stdout, "init");
    } finally {
      Deno.env.delete("GIT_DIR");
      Deno.env.delete("GIT_INDEX_FILE");
    }
  } finally {
    await outer.dispose();
    await inner.dispose();
  }
});

async function makeTempRepo(): Promise<{ path: string; dispose: () => Promise<void> }> {
  const path = await Deno.makeTempDir({ prefix: "deno-snippets-git-" });
  await runGitOrThrow(["init", "-q", "-b", "main", path]);
  await runGitOrThrow(["-C", path, "config", "user.email", "t@t.com"]);
  await runGitOrThrow(["-C", path, "config", "user.name", "T"]);
  await runGitOrThrow(["-C", path, "config", "commit.gpgsign", "false"]);
  return {
    path,
    dispose: () => Deno.remove(path, { recursive: true }),
  };
}
