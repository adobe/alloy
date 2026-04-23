import { createInstance } from "@adobe/alloy-node";

const alloy = createInstance();

await alloy("configure", {
  orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
  datastreamId: "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83",
  edgeDomain: "edge.adobedc.net",
  edgeBasePath: "ee",
  thirdPartyCookiesEnabled: false,
  debugEnabled: true,
});

const result = await alloy("sendEvent", {
  xdm: {
    eventType: "demo.nodeSandbox",
  },
});

console.log(JSON.stringify(result, null, 2));
