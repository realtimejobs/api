# RealtimeJobs API

Fetch jobs that match your saved RealtimeJobs filters. Each result includes a job title, source URL, employer, and available enrichment such as salary and location.

To receive realtime matching jobs, configure a receiver in the webapp and follow the [webhook guide](webhooks.md). The search quickstart below uses an API token; webhook receivers do not need one.

## Get your first results

You need a RealtimeJobs subscription and cURL 7.76 or later. This request works from any directory. Node.js is needed only for the optional [runnable scripts](examples/README.md).

### 1. Get a token

Open your RealtimeJobs subscription settings with `/settings`, select **API**, and choose **Generate Token**. Token controls are available with a paid plan. On a free or trial plan, select **Unlock API** to upgrade.

Copy the generated token. Keep it in your secret store or set it as `RTJ_API_TOKEN` in your local environment. The production API base URL is `https://rtj.app`.

Use HTTPS and keep the token private. See [Authentication and tokens](authentication.md) for token setup and replacement.

### 2. Fetch matching jobs

Set `RTJ_API_TOKEN` in your shell environment. The examples use the production API at `https://rtj.app`.

Replace the example dates with a recent UTC date range. `after` is included and `before` is excluded. Start with `pageSize: 10` to inspect a small result set.

```bash
curl --fail-with-body --silent --show-error \
  "https://rtj.app/api/jobs/search" \
  --header "Authorization: Bearer ${RTJ_API_TOKEN:?Set RTJ_API_TOKEN}" \
  --header 'Content-Type: application/json' \
  --data '{
    "after": "2026-09-12T00:00:00Z",
    "before": "2026-09-13T00:00:00Z",
    "pageSize": 10
  }'
```

The API applies your subscription's saved filters. The dates above are fixed example dates, not a rolling search. To calculate the last 24 hours automatically, use the [Node.js example](examples/README.md#fetch-one-page).

### 3. Read the result

A successful request returns HTTP `200`. Here are selected fields from a fictional result; the complete objects contain more fields:

```json
{
  "positions": [
    {
      "position": {
        "title": "Backend Engineer",
        "apply_url": "https://example.com/jobs/backend-engineer",
        "detected_role": "Backend Engineer",
        "languages": ["en"]
      },
      "employer": { "name": "Example Company" }
    }
  ],
  "nextCursor": null
}
```

Use `position.apply_url` to open the source job. Normalized job information is included directly in `position`; unavailable values are `null`. `nextCursor: null` means there is no further page.

If `positions` is empty, the request succeeded but returned no matching jobs. Check your saved filters or search a wider date range. If `nextCursor` is a string, use it to [fetch the next page](search.md#pagination).

## Continue

| Task                                            | Guide                                          |
| ----------------------------------------------- | ---------------------------------------------- |
| Set dates, page size, and pagination            | [Search reference](search.md)                  |
| Understand job, employer, and enrichment fields | [Response reference](response.md)              |
| Run a single request or save all matching jobs  | [Runnable examples](examples/README.md)        |
| Replace a token                                 | [Authentication and tokens](authentication.md) |
| Recover from an error                           | [Errors and retries](errors.md)                |
| Review documentation changes                    | [Changelog](CHANGELOG.md)                      |

The [OpenAPI specification](openapi.yaml) provides the machine-readable HTTP contract. Read [Usage and compatibility](usage-and-compatibility.md) before a large export and [Recurring imports](recurring-imports.md) before scheduling searches.

## Give these docs to your agent

Read the documentation at [realtimejobs/api](https://github.com/realtimejobs/api). Give your agent the [agent integration guide](https://github.com/realtimejobs/api/blob/HEAD/agents.md). GitHub's **Raw** view provides the Markdown without the page interface. Keep all files on the same branch, tag, or commit when downloading them. The [documentation index](llms.txt) lists the files to read; link it explicitly rather than relying on automatic discovery.

For a search integration, copy this prompt. For a webhook receiver, give your agent the [webhook guide](webhooks.md) and [event fixture](examples/webhook-event.json) instead:

```text
Build a RealtimeJobs integration using the documentation at
https://github.com/realtimejobs/api/blob/HEAD/agents.md.
Read its linked OpenAPI contract and the guides needed for my task.
Use https://rtj.app as the API base URL and read RTJ_API_TOKEN from my
environment. If the token is missing, ask me to configure it; do not ask
me to paste the token into chat.
Start with one small page. Use only documented request fields and saved
subscription filters. Explain any limits that affect the requested workflow.
```

## Support

Contact [RTJ support on Telegram](https://t.me/RealtimeJobsSupport) for API access, usage terms, or documentation errors. Include the HTTP status, request time in UTC, and the steps to reproduce the problem. Remove your token and personal data before sharing a request.
