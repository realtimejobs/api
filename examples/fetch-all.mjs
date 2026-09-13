import { createQuery } from "./request.mjs";
import { searchPage } from "./client.mjs";

try {
  const maxPages = Number(process.env.RTJ_MAX_PAGES ?? "100");
  if (!Number.isSafeInteger(maxPages) || maxPages < 1) {
    throw new Error("RTJ_MAX_PAGES must be a positive integer");
  }

  const query = createQuery();
  const seenCursors = new Set();
  for (let pageNumber = 1; ; pageNumber += 1) {
    const page = await searchPage(query);
    for (const result of page.positions) {
      console.log(JSON.stringify(result));
    }
    if (page.nextCursor === null) break;
    if (pageNumber >= maxPages) {
      throw new Error("RTJ_MAX_PAGES reached. The export is incomplete.");
    }
    if (seenCursors.has(page.nextCursor)) {
      throw new Error(
        "The server repeated a cursor. The export is incomplete.",
      );
    }
    seenCursors.add(page.nextCursor);
    query.cursor = page.nextCursor;
  }
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "RealtimeJobs export failed",
  );
  process.exitCode = 1;
}
