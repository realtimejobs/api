# Realtime position webhooks

[Back to the API guide](README.md)

Receive matching jobs at your HTTPS endpoint. RTJ attempts delivery to Telegram and every webhook configured for your subscription. Use [search](search.md) to fetch historical jobs. Webhooks carry realtime match notifications, not a complete feed of job updates or deletions.

## Set up a receiver

1. Prepare an HTTPS endpoint that accepts JSON POSTs. Use the [local example](examples/README.md#receive-a-sample-webhook) to inspect an event before deploying your receiver.
2. Open `/settings` from the subscription’s Telegram chat, then select **Settings → Notifications → Webhooks → Add webhook**. Enter the receiver URL and save. The **API** tab also has a Webhooks link when available. Use **Edit** or **Remove** on the list to change endpoints.
   Webhook settings are available with a paid plan. On a free or trial plan, open **API** and select **Unlock webhooks** to upgrade.
3. Keep the subscription active and process incoming events using the contract below.

Your receiver does not need `RTJ_API_TOKEN`. That token is for [search requests](authentication.md). Adding an endpoint does not send historical jobs or a test event, and successful configuration does not prove that RTJ can reach the endpoint.

## Delivery behavior

- RTJ sends a JSON `POST` with `Content-Type: application/json`.
- Notifications follow the subscription's saved filters, active state, freshness checks, and remaining daily notification allowance. Older postings are normally skipped unless recently reopened. A search result does not establish webhook eligibility.
- One accepted position uses one unit of the daily notification allowance, regardless of endpoint count or delivery success. This is separate from [search API usage](usage-and-compatibility.md).
- An applied or not-for-me reaction on any attached Telegram contact suppresses repeat delivery of that position for the whole subscription.
- Pausing the subscription stops future notifications on all transports. Blocking the Telegram bot also pauses the subscription. Already accepted notifications may still arrive.
- Each HTTP attempt has a five-second deadline from request start. This is not a maximum delay from matching to receipt. Attempts may wait before starting; there is no delivery-order guarantee.
- Any 2xx response counts as receiver acceptance. Failed requests are not retried, including HTTP `429` and `5xx`. Redirects are not followed.
- Failure at one endpoint does not cancel other attempts or block Telegram. Slow endpoints can delay waiting webhook attempts when delivery capacity is occupied.
- Delivery is best-effort. Service restarts can lose attempts, and duplicate events are possible. There is no customer replay or delivery-history API.
- Removing or changing a URL does not guarantee cancellation of attempts that already selected the old address.

Search tokens can remain valid for paused subscriptions. Webhooks still follow the notification rules above.

## Event payload

Download the [complete fictional JSON event](examples/webhook-event.json). The machine-readable contract is the `position.matched` webhook in [OpenAPI](openapi.yaml).

| Field            | Type                                 | Meaning                                                                                        |
| ---------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `version`        | integer, currently `1`               | Event format version, independent of token format and documentation revision.                  |
| `type`           | string, currently `position.matched` | Realtime job match notification.                                                               |
| `subscriptionId` | integer                              | Subscription that accepted the notification.                                                   |
| `occurredAt`     | ISO 8601 timestamp string            | When RTJ prepared this payload, not the source posting time or a delivery ID.                  |
| `positionId`     | string                               | Opaque position identifier. Do not parse its format. Reopened positions retain their identity. |
| `position`       | object                               | The job object from one [search result](response.md#position).                                 |
| `employer`       | object                               | The [employer object](response.md#employer) from one search result.                            |

A webhook has no `positions` array or `nextCursor`. Nullable fields can be `null`; optional fields can be absent. Allow additional response fields. See the [response reference](response.md) for job fields, timestamps, inferred information, and handling untrusted source text. Matching rules, billing details, and Telegram message data are excluded.

## Receive and process events

RTJ requests have no signature or receiver authentication header. Payload fields alone cannot prove that a request came from RTJ. HTTPS protects the connection but does not authenticate RTJ to your receiver. If verified sender identity is required, the current contract does not meet that requirement.

1. Accept JSON POSTs and set a payload-size limit suitable for job descriptions. Validate the fields your application uses. Check `version` and `type` before processing; handle unsupported versions explicitly.
2. Save accepted events to reliable storage or a queue, then return 2xx promptly within the five-second HTTP deadline. Process expensive work afterward. A 2xx response confirms acceptance, not completion of your work.
3. Make processing safe when the same position arrives more than once. Track failures in your receiver. A non-2xx response does not cause RTJ to retry.

The [local receiver example](examples/README.md#receive-a-sample-webhook) checks basic envelope fields and saves each request separately. It is a learning example, not a complete production receiver.

### Duplicate events and reopened jobs

There is no unique event or delivery ID. Within a subscription, `positionId` can group notifications for the same position, but cannot distinguish duplicate delivery from a later legitimate notification. `occurredAt` can change between duplicate notifications; it is not a deduplication key.

A reopened position can arrive with the same `positionId`. Inspect `position.metadata.last_reopened_at` before suppressing it. Choose a merge policy that fits your application rather than discarding all later events for a position. No permanent position-identity guarantee is published.

### Missed events and search

Search responses do not expose `positionId`, so there is no shared public ID for an exact join. Matching by `position.apply_url` is only a hint. Searches can help fill gaps, but cannot guarantee complete recovery or exact reconciliation. Read [Recurring imports](recurring-imports.md) before combining polling and webhooks.

This event is not a job update or deletion stream. A missing notification is not proof that a job closed or stopped matching. Contact [RTJ support](https://t.me/RealtimeJobsSupport) for delivery problems; include the UTC time and relevant subscription/position identifiers, and remove secrets and personal data.
