export interface GitResult {
  ok: boolean;
  stdout: string;
  stderr: string;
}

export interface GitOptions {
  /** Extra env vars merged on top of the isolated env (overrides per key). */
  env?: Record<string, string>;
}

/**
 * Run a git subprocess. Returns the captured output; never throws on a
 * non-zero exit code — inspect `ok` to branch.
 *
 * @example
 * ```ts ignore
 * import { runGit } from "@jeiea/snippets";
 *
 * const result = await runGit(["status", "--porcelain"]);
 * if (result.ok && result.stdout === "") {
 *   console.log("clean working tree");
 * }
 * ```
 *
 * @example Force C locale for parseable output
 * ```ts ignore
 * import { runGit } from "@jeiea/snippets";
 *
 * const result = await runGit(
 *   ["remote", "show", "origin"],
 *   { env: { LC_ALL: "C" } },
 * );
 * ```
 */
export async function runGit(args: string[], options?: GitOptions): Promise<GitResult> {
  const env = options?.env ? { ...isolatedGitEnv(), ...options.env } : isolatedGitEnv();
  const cmd = new Deno.Command("git", {
    args,
    stdout: "piped",
    stderr: "piped",
    env,
    clearEnv: true,
  });
  const output = await cmd.output();
  return {
    ok: output.success,
    stdout: new TextDecoder().decode(output.stdout),
    stderr: new TextDecoder().decode(output.stderr),
  };
}

/**
 * Like {@link runGit} but throws when git exits non-zero. Use this when a
 * failure is a programming error rather than an expected branch.
 *
 * @example
 * ```ts ignore
 * import { runGitOrThrow } from "@jeiea/snippets";
 *
 * const { stdout } = await runGitOrThrow(["rev-parse", "HEAD"]);
 * console.log(stdout.trim());
 * ```
 */
export async function runGitOrThrow(
  args: string[],
  options?: GitOptions,
): Promise<{ stdout: string; stderr: string }> {
  const result = await runGit(args, options);
  if (!result.ok) {
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr}`);
  }
  return { stdout: result.stdout, stderr: result.stderr };
}

/**
 * Run `git` as a subprocess without inheriting `GIT_*` environment variables.
 *
 * When this code runs inside a `pre-commit` hook (or any other context where
 * git has exported `GIT_DIR`, `GIT_INDEX_FILE`, etc.), naive child invocations
 * of `git` will reuse the parent's `.git` directory and index even when given
 * `-C <other-path>`. That can corrupt the host repository's index — for
 * example, the test fixtures of an unrelated temp repo end up staged in the
 * outer commit.
 *
 * `runGit` / `runGitOrThrow` strip every `GIT_*` key from the inherited env
 * and spawn with `clearEnv: true`, so the child `git` rediscovers `.git` from
 * its working directory.
 *
 * `isolatedGitEnv` is intentionally not exported — call sites must go through
 * the helpers, otherwise it is too easy to forget the matching `clearEnv`.
 *
 * @module
 */

function isolatedGitEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(Deno.env.toObject())) {
    if (key.startsWith("GIT_")) continue;
    env[key] = value;
  }
  return env;
}
