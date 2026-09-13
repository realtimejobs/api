# Authentication and tokens

[Back to the API guide](README.md)

## Get an API access token

You need a RealtimeJobs subscription. Open your subscription settings with `/settings`, select **API**, and choose **Generate Token**.

Copy the generated token and store it securely, for example as `RTJ_API_TOKEN` in your server environment. The secret is shown only after generation. Copy it before leaving the API tab; you cannot retrieve it later.

The token is bound to the subscription whose settings you opened.

## Replace a token

Open `/settings` → **API**, choose **Regenerate Token**, and confirm. This revokes all existing API tokens for that subscription before it creates a replacement. Integrations using an old token will stop working. Update each integration with the new token.

If generation fails after revocation, the old tokens remain revoked. Reload the token status and generate a new token before retrying your integration.

## Authentication

Send the token in the `Authorization` header on every search request:

```http
Authorization: Bearer rtj_api_v1.<secret>
Content-Type: application/json
```

Treat the complete token as an opaque secret. The `v1` part identifies the token format; it is not an API endpoint version. A token is bound to one subscription. You do not send a customer ID or subscription ID with a search request.

Use HTTPS. Keep tokens in server-side environment variables or a secret store. Do not put tokens in GitHub, URLs, browser bundles, or logs.

The service checks the token and current subscription on each request. Paused and unpaid subscriptions can use valid tokens. Expired or revoked tokens cannot be used. Access also fails if the subscription is banned, unavailable, or transferred to another customer. This describes authentication behavior, not API pricing or a usage allowance.
