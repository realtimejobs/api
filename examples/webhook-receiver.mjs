import { createServer } from "node:http";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { join } from "node:path";

const port = Number(process.env.RTJ_WEBHOOK_PORT ?? 3000);
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new Error("RTJ_WEBHOOK_PORT must be an integer from 0 through 65535");
}
const directory = join(process.cwd(), "rtj-webhook-events");
await mkdir(directory, { recursive: true });
const maxBytes = 1024 * 1024;

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasSupportedEnvelope(value) {
  return (
    isObject(value) &&
    value.version === 1 &&
    value.type === "position.matched" &&
    Number.isInteger(value.subscriptionId) &&
    typeof value.positionId === "string" &&
    typeof value.occurredAt === "string" &&
    Number.isFinite(Date.parse(value.occurredAt)) &&
    isObject(value.position) &&
    isObject(value.employer)
  );
}

const server = createServer({ requestTimeout: 5000 }, (request, response) => {
  if (request.url !== "/webhooks/rtj") {
    request.resume();
    response.writeHead(404).end();
    return;
  }
  if (request.method !== "POST") {
    request.resume();
    response.writeHead(405, { Allow: "POST" }).end();
    return;
  }
  if (
    request.headers["content-type"]?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  ) {
    request.resume();
    response.writeHead(415).end();
    return;
  }
  let size = 0;
  let rejected = false;
  const chunks = [];
  request.on("data", (chunk) => {
    if (rejected) return;
    size += chunk.length;
    if (size > maxBytes) {
      rejected = true;
      chunks.length = 0;
      response.writeHead(413).end();
      return;
    }
    chunks.push(chunk);
  });
  request.on("error", () => {
    rejected = true;
    chunks.length = 0;
    response.destroy();
  });
  request.on("end", async () => {
    if (rejected) return;
    let event;
    try {
      event = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      response.writeHead(400).end();
      return;
    }
    if (!hasSupportedEnvelope(event)) {
      response.writeHead(400).end();
      return;
    }
    try {
      // Each receipt is saved separately; this local ID is not a deduplication key.
      await writeFile(
        join(directory, `${randomUUID()}.json`),
        JSON.stringify(event) + "\n",
        {
          flag: "wx",
          flush: true,
        },
      );
      response.writeHead(204).end();
    } catch {
      response.writeHead(500).end();
    }
  });
});
server.listen(port, "127.0.0.1", () => {
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Expected TCP address");
  console.log(`Listening at http://127.0.0.1:${address.port}/webhooks/rtj`);
});
