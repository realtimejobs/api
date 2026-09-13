import { pathToFileURL } from "node:url";

export function createQuery() {
  const before = new Date();
  const after = new Date(before.getTime() - 24 * 60 * 60 * 1000);
  return {
    after: after.toISOString(),
    before: before.toISOString(),
    pageSize: 10,
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  console.log(JSON.stringify(createQuery()));
}
