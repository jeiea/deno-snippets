import { assert } from "@std/assert";
import { createTempDir } from "./temp_dir.ts";

Deno.test("created directory exists on the filesystem", async () => {
  await using tmp = await createTempDir({ prefix: "snippets-test-" });
  const stat = await Deno.stat(tmp.path);
  assert(stat.isDirectory);
});

Deno.test("disposal removes the directory", async () => {
  let savedPath: string;
  {
    await using tmp = await createTempDir({ prefix: "snippets-test-" });
    savedPath = tmp.path;
    await Deno.writeTextFile(`${tmp.path}/file.txt`, "data");
  }
  const exists = await Deno.stat(savedPath!).then(() => true, () => false);
  assert(!exists);
});

Deno.test("respects prefix option", async () => {
  await using tmp = await createTempDir({ prefix: "custom-pfx-" });
  const dirName = tmp.path.replaceAll("\\", "/").split("/").pop()!;
  assert(dirName.startsWith("custom-pfx-"));
});
