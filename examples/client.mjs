export async function searchPage(query) {
  const token = process.env.RTJ_API_TOKEN;
  if (!token) {
    throw new Error("Set RTJ_API_TOKEN");
  }

  const response = await fetch("https://rtj.app/api/jobs/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) {
    throw new Error(
      `RealtimeJobs search failed: HTTP ${response.status}. See the errors guide.`,
    );
  }
  const page = await response.json();
  if (
    !page ||
    !Array.isArray(page.positions) ||
    !(
      page.nextCursor === null ||
      (typeof page.nextCursor === "string" && page.nextCursor.length > 0)
    )
  ) {
    throw new Error("Unexpected RealtimeJobs response");
  }
  return page;
}
