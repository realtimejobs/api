# Usage and compatibility

[Back to the API guide](README.md)

## Published limits

Each request must specify `pageSize` from 1 through 250. This is a result limit, not a request allowance.

This guide does not publish a fixed requests-per-second limit, concurrency allowance, monthly quota, or API price. It does not promise unlimited or free use. Confirm usage terms with [RTJ support](https://t.me/RealtimeJobsSupport) before a large export or scheduled integration. Token validity does not establish a usage allowance.

Each page and each retry is a separate API call. Empty results and failed authenticated requests can count as usage. If a request times out, the server may already have processed it. The response does not include a usage balance or per-call price.

## Recommended client limits

These are client recommendations, not service limits or timing guarantees:

- Start with one request at a time and a small page. Fetch cursor pages sequentially.
- Set a request timeout, maximum attempts, and maximum pages for each run. The example scripts use a 60-second request timeout and a default 100-page export cap.
- Use the [retry policy](errors.md#retry-safely) for transient failures. Stop after the retry budget is used.
- Do not start overlapping scheduled runs. Stop and report incomplete output when a run exceeds its budget.

The documented error contract does not specify a `429` response or rate-limit headers. Do not depend on their presence. If you receive an undocumented status, preserve its HTTP status for diagnosis, stop automatic retries for that response, and contact support.

## Contract changes

The customer endpoint has no API version selector. The `v1` in an API token identifies only its credential format. The OpenAPI `info.version` identifies a documentation revision; it does not select or pin server behavior.

This guide does not publish a guaranteed breaking-change notice period, deprecation window, or support period for response formats. Review the [changelog](CHANGELOG.md) when updating an integration. A pinned GitHub revision makes your documentation reproducible but does not pin the running API.

Clients should accept additional response fields and distinguish absent fields from `null`. Preserve or handle unfamiliar values without assigning them a meaning. Required request fields and known response shapes are specified in [OpenAPI](openapi.yaml); date comparisons and other behavioral rules are explained in [Search](search.md).

If your integration requires a fixed contract or guaranteed change notice, confirm those requirements with RTJ support before relying on them.
