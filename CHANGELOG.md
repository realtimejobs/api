# API documentation changelog

[Back to the API guide](README.md)

## 2026-09-16

- Added version 1 `position.matched` webhooks for realtime job matches. Configure receiver URLs in the webapp. Delivery follows the subscription’s notification allowance, is unsigned, and has no retries.
- Added a [webhook guide](webhooks.md), an OpenAPI event schema, a sample event, and a local receiver example to help build integrations.
