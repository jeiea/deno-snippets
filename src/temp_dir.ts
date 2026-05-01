/**
 * A temporary directory handle that cleans up on disposal.
 *
 * @example
 * ```ts ignore
 * import { createTempDir } from "@jeiea/snippets";
 *
 * await using tmp = await createTempDir({ prefix: "my-tool-" });
 * console.log(tmp.path); // e.g. /tmp/my-tool-abcdef
 * // directory is removed when `tmp` goes out of scope
 * ```
 */
export interface TempDir extends AsyncDisposable {
  readonly path: string;
}

/**
 * Create a temporary directory that is removed when disposed.
 *
 * Thin wrapper around {@linkcode Deno.makeTempDir} that returns an
 * {@linkcode AsyncDisposable}, so `await using` handles cleanup automatically.
 *
 * @example
 * ```ts ignore
 * import { createTempDir } from "@jeiea/snippets";
 *
 * await using tmp = await createTempDir({ prefix: "work-" });
 * await Deno.writeTextFile(`${tmp.path}/hello.txt`, "hi");
 * ```
 */
export async function createTempDir(options?: Deno.MakeTempOptions): Promise<TempDir> {
  const path = await Deno.makeTempDir(options);
  return {
    path,
    async [Symbol.asyncDispose]() {
      await Deno.remove(path, { recursive: true });
    },
  };
}
