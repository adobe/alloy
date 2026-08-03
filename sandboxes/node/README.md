# @adobe/alloy-sandbox-node

Node.js examples for manually exercising `@adobe/alloy-node`'s `configure`,
`sendEvent`, `getLibraryInfo`, and `forRequest` methods against the shared
Alloy test org/datastream. Mirrors the integration suite in
`packages/node/test/integration/nodeConsumer.spec.js`.

## Run

```sh
pnpm install

pnpm --filter @adobe/alloy-sandbox-node run configure
pnpm --filter @adobe/alloy-sandbox-node run send-event
pnpm --filter @adobe/alloy-sandbox-node run get-library-info
pnpm --filter @adobe/alloy-sandbox-node run for-request
```

`pnpm --filter @adobe/alloy-sandbox-node start` runs `send-event`.

`for-request` demonstrates the per-request identity pattern: `configure()`
runs once, then two simulated requests sharing an in-memory cookie store
(standing in for a real HTTP request/response) resolve to the same ECID,
while a third, unrelated "visitor" resolves to a different one — see
`src/forRequest.js`.

## Configuration

`src/config.js` defaults to the shared test org/datastream used across the
repo's integration tests. Override any of these env vars to point at a
different datastream:

- `ALLOY_ORG_ID`
- `ALLOY_DATASTREAM_ID`
- `ALLOY_EDGE_DOMAIN`
- `ALLOY_EDGE_BASE_PATH`
- `ALLOY_DEBUG_ENABLED` (`"true"`/`"false"`, defaults to `"true"`)
