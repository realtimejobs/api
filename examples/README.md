# Runnable API examples

[Back to the API guide](../README.md)

Requires Node.js 22 or later. No package installation is needed. The cURL quickstart also requires cURL 7.76 or later.

Download this documentation directory with its `examples/` folder. Run commands from the directory containing the main API README. The examples use `https://rtj.app`. Configure `RTJ_API_TOKEN` as described in the [quickstart](../README.md#get-your-first-results).

## Fetch one page

```bash
node examples/search.mjs
```

Prints the JSON response, including `nextCursor`. Searches the last 24 hours and requests up to 10 matching jobs.

For cURL without Node.js, use the inline JSON command in the [quickstart](../README.md#2-fetch-matching-jobs). The Node scripts use [request.mjs](request.mjs) to calculate the last 24 hours.

## Fetch all matching jobs

```bash
node examples/fetch-all.mjs > jobs.jsonl
```

Prints one result per line, with `position` and `employer`. Normalized job fields are included directly in `position`. The script processes each page before fetching the next one. It reuses the same date range for all requests and stops when `nextCursor` is `null`.

It stops with a nonzero exit status if a request fails, a cursor repeats, or it reaches its default limit of 100 pages while more pages remain. The output file can contain partial results after failure. The script does not automatically retry or resume.

To set a different page limit:

```bash
RTJ_MAX_PAGES=20 node examples/fetch-all.mjs > jobs.jsonl
```

`RTJ_MAX_PAGES` must be a positive integer. This is a client-side safeguard, not an API quota. Changing the page limit does not change the dates or filters.

## Customize the search

Edit [request.mjs](request.mjs) to use another date range or a page size from 1 through 250. Read the [search reference](../search.md) before changing pagination. Keep your saved RealtimeJobs filters unchanged while fetching pages.

The shared [client](client.mjs) sets a 60-second timeout per request. This is an example client setting, not a server response-time guarantee. It checks the response envelope; validate individual fields needed by your application against the [response reference](../response.md).

The [sample response](response.json) contains fictional data. Actual results depend on your filters and available jobs.

For scheduled runs, read [Recurring imports](../recurring-imports.md). These examples do not implement checkpoints or deduplication.
