# Search matching jobs

[Back to the API guide](README.md)

Machine-readable contract: [OpenAPI](openapi.yaml). Send JSON with the [bearer token](authentication.md#authentication) to the production API base URL, `https://rtj.app`.

## Search request

```http
POST /api/jobs/search
```

| Field      | Required | Description                                                                                                       |
| ---------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `after`    | Yes      | ISO 8601 date-time with `Z` or an explicit UTC offset. Inclusive lower bound for the job's computed posting time. |
| `before`   | Yes      | ISO 8601 date-time with `Z` or an explicit UTC offset. Exclusive upper bound. Must be later than `after`.         |
| `pageSize` | Yes      | Integer from `1` through `250`. There is no default.                                                              |
| `cursor`   | No       | Nonempty string returned as `nextCursor` by a previous page. Omit it on the first request. Do not send `null`.    |

Unknown top-level fields are rejected. Do not send `page`, `offset`, `subscriptionId`, or a version field.

The date range uses the computed posting time, not the time when your integration first saw the job. A job exactly at `after` is included; a job exactly at `before` is excluded.

Use uppercase `T` between the date and time, and uppercase `Z` or an offset with a colon, such as `+02:00`. Seconds are optional; prefer `2026-09-12T00:00:00Z` for compatibility with date-time libraries. The OpenAPI `SearchTimestamp` pattern follows the accepted request syntax.

The API uses the current saved search settings for the token's subscription. Change those settings through RealtimeJobs before starting a new search.

## Pagination

Results are ordered by computed posting time, newest first, with an internal tie-breaker for equal timestamps.

1. Send the first request without `cursor`.
2. Process the returned `positions`.
3. If `nextCursor` is a string, send it as `cursor` in the next request.
4. Stop when `nextCursor` is `null`.

Keep the same `after` and `before` values and subscription settings while paging. The cursor is bound to the date range and effective matching rules. A settings change can make it invalid. `pageSize` can change between pages. Do not decode, edit, or construct cursors from response timestamps.

Each page is a fresh query. The API does not provide a fixed snapshot, total result count, or snapshot ID. Jobs and their details can change between requests. If you run repeated imports, handle repeated results in your application. The response does not expose a dedicated public job ID; `position.apply_url` is useful as a source link, but is not a guaranteed permanent identifier.

For a complete script, see [Fetch all matching jobs](examples/README.md#fetch-all-matching-jobs).

## Choose a search window and page size

Start with a recent 24-hour window and `pageSize: 10` to check your integration. Increase the page size, up to 250, when you need fewer calls for an export. Larger pages can contain more source text and require more memory and processing. A smaller page size does not reduce the number of jobs that match the same date range.

An empty page is a successful response. Follow `nextCursor` until it is `null`, even if a page is empty. If the completed search has no results, check the saved filters and dates before widening the window.

Read [Usage and compatibility](usage-and-compatibility.md) before a large export and [Recurring imports](recurring-imports.md) before scheduling repeated searches.
