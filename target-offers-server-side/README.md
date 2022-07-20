# Target Offers Server-side

## Overview

This sample demonstrates using Adobe Experience Platform to get personalization content from Adobe Target.  The web page changes based on the personalization content returned.

This sample does NOT rely on client-side libraries like the [Adobe Experience Platform Web SDK](https://experienceleague.adobe.com/docs/experience-platform/edge/home.html) to get personalization content.  Instead, it uses the [Adobe Experience Platform APIs](https://developer.adobe.com/experience-platform-apis/) to fetch personalization content.  Then the implementation generates HTML server-side based on the target offers returned. 

Here is what the page looks like before and after personalization content is rendered.

| without target personalization                                          | with target personalization                                                   |
|-------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| <img src="../.assets/plain-server-side.png" alt="drawing" width="800"/> | <img src="../.assets/with-offers-server-side.png" alt="drawing" width="800"/> |

Please review the [summary of target activities used](../TargetActivities.md) for this sample.


## Running the sample

<small>Prerequisite: [install node and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).</small>

To run this sample:

1. Clone the repository to your local machine.
2. Open a terminal and change directory to this sample's folder.
3. Run `npm install`
4. Run `npm start`
5. Open a web browser to [http://localhost](http://localhost)

## How it works

1. [Express](https://expressjs.com/) is used for a lean server-side implementation. To handle basic server requests and routing.
2. The web page is requested and any cookies previously stored by the browser prefixed with `kndctr_` are included.
3. When the page is requested from the app server, an event is sent to the [interactive data collection endpoint](https://experienceleague.adobe.com/docs/experience-platform/edge-network-server-api/data-collection/interactive-data-collection.html?lang=en) to fetch personalization content.  This sample app makes use of some helper methods to simplify building and sending requests to the API (see [aepEdgeClient.js](../common/aepEdgeClient.js)).  But the request is simply a `POST` with a payload that contains an event and query.  The cookies (if available) from the prior step are included with the request in the `meta>state>entries` array.
```javascript
fetch(
  "https://edge.adobedc.net/ee/v2/interact?dataStreamId=abc&requestId=123",
  {
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      "content-type": "text/plain; charset=UTF-8",
      pragma: "no-cache",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      "sec-gpc": "1",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      Referer: "http://localhost/",
    },
    body: JSON.stringify({
      event: {
        xdm: {
          web: {
            webPageDetails: {
              URL: "http://localhost/",
            },
            webReferrer: {
              URL: "",
            },
          },
          identityMap: {
            FPID: [
              {
                id: "xyz",
                authenticatedState: "ambiguous",
                primary: true,
              },
            ],
          },
          timestamp: "2022-06-23T22:21:00.878Z",
        },
        data: {},
      },
      query: {
        identity: {
          fetch: ["ECID"],
        },
        personalization: {
          schemas: [
            "https://ns.adobe.com/personalization/default-content-item",
            "https://ns.adobe.com/personalization/html-content-item",
            "https://ns.adobe.com/personalization/json-content-item",
            "https://ns.adobe.com/personalization/redirect-item",
            "https://ns.adobe.com/personalization/dom-action",
          ],
          decisionScopes: ["__view__", "sample-json-offer"],
        },
      },
      meta: {
        state: {
          domain: "localhost",
          cookiesEnabled: true,
          entries: [
            {
              "key": "kndctr_XXX_AdobeOrg_identity",
              "value": "abc123"
            },
            {
              "key": "kndctr_XXX_AdobeOrg_cluster",
              "value": "or2"
            }
          ],
        },
      },
    }),
    method: "POST",
  }
).then((res) => res.json());
```

4. The target offer from the form-based activity is read from the response and used when producing the HTML response.
5. For form-based activities, display events must manually be sent in the implementation to indicate when the offer has been displayed. In this example the notification is sent server-side during the request lifecycle.

```javascript
function sendDisplayEvent(aepEdgeClient, req, propositions, cookieEntries) {
  const address = getAddress(req);

  aepEdgeClient.interact(
    {
      event: {
        xdm: {
          web: {
            webPageDetails: { URL: address },
            webReferrer: { URL: "" },
          },
          timestamp: new Date().toISOString(),
          eventType: "decisioning.propositionDisplay",
          _experience: {
            decisioning: {
              propositions: propositions.map((proposition) => {
                const { id, scope, scopeDetails } = proposition;

                return {
                  id,
                  scope,
                  scopeDetails,
                };
              }),
            },
          },
        },
      },
      query: { identity: { fetch: ["ECID"] } },
      meta: {
        state: {
          domain: "",
          cookiesEnabled: true,
          entries: [...cookieEntries],
        },
      },
    },
    {
      Referer: address,
    }
  );
}
```
6. Visual Experience Composer (VEC) offers are ignored since the Web SDK is required to render them.
7. When the HTML response is returned, the identity and cluster cookies are set on the response by the application server.
 
## Key Observations

### Cookies
Cookies are used to persist user identity and cluster information.  When using a server-side implementation, the application server must handle the storing and sending of these cookies during the request lifecycle.

| Cookie                   | Purpose                                                                   | Stored by          | Sent by            |
|--------------------------|---------------------------------------------------------------------------|--------------------|--------------------|
| kndctr_AdobeOrg_identity | Contains user identity details                                            | application server | application server |
| kndctr_AdobeOrg_cluster  | Indicates which experience edge cluser should be used to fulfill requests | application server | application server |


### Request placement

Requests to Adobe Experience Platform API are required to get propositions and send a display notification.  When using a client-side implementation, the Web SDK makes these reqeusts when the `sendEvent` command is used.

| Request                                        | Made by                                                      |
|------------------------------------------------|--------------------------------------------------------------|
| interact request to get propositions           | application server calling the Adobe Experience Platform API |
| interact request to send display notifications | application server calling the Adobe Experience Platform API |

### Flow Diagram

<img src="../.assets/diagram-server-side.png" alt="drawing" />

## Beyond the sample

This sample app can serve as a starting point for you to experiment and learn more about Adobe Experience Platform. For example, you can change a few environment variables so the sample app pulls in offers from your own AEP configuration.  To do so, just open the `.env` file at the root of this repository and modify the variables.  Restart the sample app, and you're ready to experiemnt using your own personalization content.
