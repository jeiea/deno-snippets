/**
 * @module
 *
 * A collection of small Deno utility snippets.
 *
 * @example Run git without leaking GIT_* env vars
 * ```ts ignore
 * import { runGitOrThrow } from "@jeiea/deno-snippets";
 *
 * const { stdout } = await runGitOrThrow(["rev-parse", "HEAD"]);
 * console.log(stdout.trim());
 * ```
 */
export * from "./src/git_subprocess.ts";
