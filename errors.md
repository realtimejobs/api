# Errors and retries

[Back to the API guide](README.md)

Use the HTTP status to decide what to do. Error bodies have more than one shape.

## Invalid token

HTTP `401`:

```json
{
  "message": "Invalid API access token",
  "error": "Unauthorized",
  "statusCode": 401
}
```

Check that the request sends `Authorization: Bearer <your-token>`. Use the full token, including its prefix. If it expired or was revoked, [create a replacement](authentication.md). Stop retrying until you have a valid token.

## Invalid date range

HTTP `400`:

```json
{
  "message": "Invalid position search request: before: before must be later than after",
  "error": "Bad Request",
  "statusCode": 400
}
```

Set `after` to the earlier date and `before` to the later date. Equal dates are also invalid. Request-validation messages identify the field and explain the failure. Do not depend on the exact message text in client code.

## Invalid cursor

HTTP `400`:

```json
{
  "code": "invalid_cursor",
  "message": "Position search cursor is invalid"
}
```

Restart the search without `cursor`. Keep the date range and saved filters unchanged while reading subsequent pages. Pass `nextCursor` unchanged; do not construct a cursor from a job timestamp. If you already saved earlier pages, handle repeated results when you restart.

## Status reference

| HTTP status | Meaning                                                                                       | Action                                                                                                                     |
| ----------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `400`       | Invalid request, saved search rules, or cursor.                                               | Check required fields, dates, and page size. Restart an invalid cursor. If your saved filters still fail, contact support. |
| `401`       | Missing, malformed, unknown, expired, or revoked token.                                       | Fix the bearer header or replace the token.                                                                                |
| `403`       | The linked subscription is unavailable, banned, or no longer belongs to the token's customer. | Check your subscription with support.                                                                                      |
| `500`       | Search or result loading failed.                                                              | Retry with a delay. Contact support if it persists.                                                                        |
| `503`       | The service could not complete the request.                                                   | Retry with a delay. The search might already have run.                                                                     |
| `504`       | Search timed out.                                                                             | Retry with a delay; consider a smaller date range or page size.                                                            |

Search errors can contain `code` and `message`, with codes `invalid_rules`, `invalid_cursor`, `query_timeout`, or `internal_error`. Authentication and request-validation errors can instead contain `statusCode`, `message`, and `error`.

## Retry safely

For network failures and HTTP `500`, `503`, or `504`, use increasing delays and a maximum number of attempts. For example, wait 1, 2, then 4 seconds before three retries. This is a suggested client policy, not a server timing guarantee.

Each retry is a separate API call and can return changed data. Failed requests and empty results can count as API usage. If a client times out, it cannot assume that the server did not process the request.

The [example scripts](examples/README.md) stop on errors and do not automatically retry. A paginated export can have written some results before it fails. Check the exit status before treating an export as complete.

## Limits and support

The maximum page size is 250 jobs. Confirm your request allowance and usage terms with [RTJ support](https://t.me/RealtimeJobsSupport) before a large import. A page-size limit does not define a requests-per-second or monthly allowance. See [Usage and compatibility](usage-and-compatibility.md) for published policy limits and recommended client budgets.
