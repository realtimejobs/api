import { createQuery } from "./request.mjs";
import { searchPage } from "./client.mjs";

try {
  const page = await searchPage(createQuery());
  console.log(JSON.stringify(page, null, 2));
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "RealtimeJobs request failed",
  );
  process.exitCode = 1;
}
