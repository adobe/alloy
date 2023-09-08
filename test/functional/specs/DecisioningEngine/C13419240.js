/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { ClientFunction, t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import getBaseConfig from "../../helpers/getBaseConfig";
import { compose, debugEnabled } from "../../helpers/constants/configParts";

const networkLogger = createNetworkLogger();
const organizationId = "4DA0571C5FDC4BF70A495FC2@AdobeOrg";
const dataStreamId = "7a19c434-6648-48d3-948f-ba0258505d98";

const orgMainConfigMain = getBaseConfig(organizationId, dataStreamId);
const config = compose(orgMainConfigMain, debugEnabled);

const mockResponse = {
  requestId: "5a38a9ef-67d7-4f66-8977-c4dc0e0967b6",
  handle: [
    {
      payload: [
        {
          id: "a4486740-0a6d-433a-8b65-bfb3ac20485d",
          scope: "mobileapp://com.adobe.aguaAppIos",
          scopeDetails: {
            decisionProvider: "AJO",
            correlationID: "a6b7639b-6606-42af-9679-48eb138632d2",
            characteristics: {
              eventToken:
                "eyJtZXNzYWdlRXhlY3V0aW9uIjp7Im1lc3NhZ2VFeGVjdXRpb25JRCI6Ik5BIiwibWVzc2FnZUlEIjoiYTZiNzYzOWItNjYwNi00MmFmLTk2NzktNDhlYjEzODYzMmQyIiwibWVzc2FnZVB1YmxpY2F0aW9uSUQiOiIzZjQxZGNjNy1mNDE0LTRlMmYtYTdjOS1hMTk4ODdlYzNlNWEiLCJtZXNzYWdlVHlwZSI6Im1hcmtldGluZyIsImNhbXBhaWduSUQiOiIwY2RmMDFkZi02ZmE5LTQ0MjktOGE3My05M2ZiY2U1NTIyYWEiLCJjYW1wYWlnblZlcnNpb25JRCI6ImFiYWVhMThhLTJmNzEtNDZlMy1iZWRmLTUxNzg0YTE4MWJiZiIsImNhbXBhaWduQWN0aW9uSUQiOiIzZmIxMTY1OC1iOTMyLTRlMDktYWIyNy03ZWEyOTc2NzY2YTUifSwibWVzc2FnZVByb2ZpbGUiOnsibWVzc2FnZVByb2ZpbGVJRCI6ImVlY2U5NDNlLWVlNWYtNGMwNC1iZGI1LTQ5YjFhMjViMTNmZSIsImNoYW5uZWwiOnsiX2lkIjoiaHR0cHM6Ly9ucy5hZG9iZS5jb20veGRtL2NoYW5uZWxzL2luQXBwIiwiX3R5cGUiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbC10eXBlcy9pbkFwcCJ9fX0="
            },
            activity: {
              id:
                "0cdf01df-6fa9-4429-8a73-93fbce5522aa#3fb11658-b932-4e09-ab27-7ea2976766a5"
            }
          },
          items: [
            {
              id: "f5134bfa-381e-4b94-8546-d7023e1f3601",
              schema: "https://ns.adobe.com/personalization/ruleset-item",
              data: {
                version: 1,
                rules: [
                  {
                    condition: {
                      definition: {
                        conditions: [
                          {
                            definition: {
                              conditions: [
                                {
                                  definition: {
                                    key: "~type",
                                    matcher: "eq",
                                    values: [
                                      "com.adobe.eventType.generic.track"
                                    ]
                                  },
                                  type: "matcher"
                                },
                                {
                                  definition: {
                                    key: "~source",
                                    matcher: "eq",
                                    values: [
                                      "com.adobe.eventSource.requestContent"
                                    ]
                                  },
                                  type: "matcher"
                                },
                                {
                                  definition: {
                                    key:
                                      "~state.com.adobe.module.lifecycle/lifecyclecontextdata.dayofweek",
                                    matcher: "eq",
                                    values: [2]
                                  },
                                  type: "matcher"
                                }
                              ],
                              logic: "and"
                            },
                            type: "group"
                          }
                        ],
                        logic: "and"
                      },
                      type: "group"
                    },
                    consequences: [
                      {
                        id: "c46c7d03-eb06-4596-9087-272486cb6c41",
                        type: "cjmiam",
                        detail: {
                          mobileParameters: {
                            verticalAlign: "center",
                            dismissAnimation: "top",
                            verticalInset: 0,
                            backdropOpacity: 0.75,
                            gestures: {
                              swipeUp: "adbinapp://dismiss?interaction=swipeUp",
                              swipeDown:
                                "adbinapp://dismiss?interaction=swipeDown",
                              swipeLeft:
                                "adbinapp://dismiss?interaction=swipeLeft",
                              swipeRight:
                                "adbinapp://dismiss?interaction=swipeRight",
                              tapBackground:
                                "adbinapp://dismiss?interaction=tapBackground"
                            },
                            cornerRadius: 15,
                            horizontalInset: 0,
                            uiTakeover: true,
                            horizontalAlign: "center",
                            displayAnimation: "top",
                            width: 80,
                            backdropColor: "#ffa500",
                            height: 60
                          },
                          html:
                            '<!doctype html>\n<html><head>\n    <meta type="templateProperties" name="modal" label="adobe-label:modal" icon="adobe-icon:modal">\n    <meta type="templateZone" name="default" label="Default" classname="body" definition="[&quot;CloseBtn&quot;, &quot;Image&quot;, &quot;Text&quot;, &quot;Buttons&quot;]">\n\n    <meta type="templateDefaultAnimations" displayanimation="top" dismissanimation="top">\n    <meta type="templateDefaultSize" width="80" height="60">\n    <meta type="templateDefaultPosition" verticalalign="center" verticalinset="0" horizontalalign="center" horizontalinset="0">\n    <meta type="templateDefaultGesture" swipeup="adbinapp://dismiss?interaction=swipeUp" swipedown="adbinapp://dismiss?interaction=swipeDown" swipeleft="adbinapp://dismiss?interaction=swipeLeft" swiperight="adbinapp://dismiss?interaction=swipeRight" tapbackground="adbinapp://dismiss?interaction=tapBackground">\n    <meta type="templateDefaultUiTakeover" enable="true">\n\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <meta charset="UTF-8">\n    <style>\n      html,\n      body {\n        margin: 0;\n        padding: 0;\n        text-align: center;\n        width: 100%;\n        height: 100%;\n        font-family: adobe-clean, \'Source Sans Pro\', -apple-system, BlinkMacSystemFont, \'Segoe UI\',\n          Roboto, sans-serif;\n      }\n      h3 {\n        margin: 0.4rem auto;\n      }\n      p {\n        margin: 0.4rem auto;\n      }\n\n      .body {\n        display: flex;\n        flex-direction: column;\n        background-color: #fff;\n        border-radius: 0.3rem;\n        color: #333333;\n        width: 100vw;\n        height: 100vh;\n        text-align: center;\n        align-items: center;\n        background-size: \'cover\';\n      }\n\n      .content {\n        width: 100%;\n        height: 100%;\n        display: flex;\n        justify-content: center;\n        flex-direction: column;\n        position: relative;\n      }\n\n      a {\n        text-decoration: none;\n      }\n\n      .image {\n        height: 1rem;\n        flex-grow: 4;\n        flex-shrink: 1;\n        display: flex;\n        justify-content: center;\n        width: 90%;\n        flex-direction: column;\n        align-items: center;\n      }\n      .image img {\n        max-height: 100%;\n        max-width: 100%;\n      }\n\n      .image.empty-image {\n        display: none;\n      }\n\n      .empty-image ~ .text {\n        flex-grow: 1;\n      }\n\n      .text {\n        text-align: center;\n        color: #333333;\n        line-height: 1.25rem;\n        font-size: 0.875rem;\n        padding: 0 0.8rem;\n        width: 100%;\n        box-sizing: border-box;\n      }\n      .title {\n        line-height: 1.3125rem;\n        font-size: 1.025rem;\n      }\n\n      .buttons {\n        width: 100%;\n        display: flex;\n        flex-direction: column;\n        font-size: 1rem;\n        line-height: 1.3rem;\n        text-decoration: none;\n        text-align: center;\n        box-sizing: border-box;\n        padding: 0.8rem;\n        padding-top: 0.4rem;\n        gap: 0.3125rem;\n      }\n\n      .button {\n        flex-grow: 1;\n        background-color: #1473e6;\n        color: #ffffff;\n        border-radius: 0.25rem;\n        cursor: pointer;\n        padding: 0.3rem;\n        gap: 0.5rem;\n      }\n\n      .btnClose {\n        color: #000000;\n      }\n\n      .closeBtn {\n        align-self: flex-end;\n        color: #000000;\n        width: 1.8rem;\n        height: 1.8rem;\n        margin-top: 1rem;\n        margin-right: 0.3rem;\n      }\n      .closeBtn img {\n        width: 100%;\n        height: 100%;\n      }\n    </style>\n    <style type="text/css" id="editor-styles">\n[data-uuid="70ca8918-2bac-4c1c-869a-443dbc0d3842"]  {\n  flex-direction: row !important;\n}\n</style>\n  </head>\n\n  <body>\n    <div class="body"><div class="closeBtn" data-uuid="23f37c9a-1c44-42d6-9a04-b04fa95b67b6" data-btn-style="plain"><a aria-label="Close" class="btnClose" href="adbinapp://dismiss?interaction=cancel"><svg xmlns="http://www.w3.org/2000/svg" height="18" viewbox="0 0 18 18" width="18" class="close">\n  <rect id="Canvas" fill="#ffffff" opacity="0" width="18" height="18"></rect>\n  <path fill="currentColor" xmlns="http://www.w3.org/2000/svg" d="M13.2425,3.343,9,7.586,4.7575,3.343a.5.5,0,0,0-.707,0L3.343,4.05a.5.5,0,0,0,0,.707L7.586,9,3.343,13.2425a.5.5,0,0,0,0,.707l.707.7075a.5.5,0,0,0,.707,0L9,10.414l4.2425,4.243a.5.5,0,0,0,.707,0l.7075-.707a.5.5,0,0,0,0-.707L10.414,9l4.243-4.2425a.5.5,0,0,0,0-.707L13.95,3.343a.5.5,0,0,0-.70711-.00039Z"></path>\n</svg></a></div><div class="image" data-uuid="e8007597-19b4-4867-a7d6-030c7af36601"><img src="https://media3.giphy.com/media/R7ifMrDG24Uc89TpZH/giphy.gif?cid=ecf05e47ohtez4exx2e0u3x1zko365r8pw6lqw0qtjq32z2h&amp;ep=v1_gifs_search&amp;rid=giphy.gif&amp;ct=g" alt=""></div><div class="text" data-uuid="9b3c6283-e93c-4e6c-9b34-c27ef3638aee"><h3>Fifty percent off!</h3><p>One hour only!</p></div><div class="buttons" data-uuid="70ca8918-2bac-4c1c-869a-443dbc0d3842"><a class="button" data-uuid="3e1ac3da-5226-4322-b3da-1543f1f148ea" href="adbinapp://dismiss?interaction=clicked">Claim</a><a class="button" data-uuid="bdc2ed55-5107-40b9-84d1-32273e358aa1" href="adbinapp://dismiss?interaction=clicked">No thanks</a></div></div>\n  \n\n</body></html>',
                          remoteAssets: [
                            "https://media3.giphy.com/media/R7ifMrDG24Uc89TpZH/giphy.gif?cid=ecf05e47ohtez4exx2e0u3x1zko365r8pw6lqw0qtjq32z2h&ep=v1_gifs_search&rid=giphy.gif&ct=g"
                          ]
                        }
                      }
                    ]
                  }
                ]
              }
            }
          ]
        }
      ],
      type: "personalization:decisions",
      eventIndex: 0
    },
    {
      payload: [
        {
          scope: "Target",
          hint: "35",
          ttlSeconds: 1800
        },
        {
          scope: "AAM",
          hint: "9",
          ttlSeconds: 1800
        },
        {
          scope: "EdgeNetwork",
          hint: "or2",
          ttlSeconds: 1800
        }
      ],
      type: "locationHint:result"
    },
    {
      payload: [
        {
          key: "kndctr_4DA0571C5FDC4BF70A495FC2_AdobeOrg_cluster",
          value: "or2",
          maxAge: 1800,
          attrs: {
            SameSite: "None"
          }
        }
      ],
      type: "state:store"
    }
  ]
};

createFixture({
  title:
    "Test C13419240: Verify DOM action using the sendEvent command for a viewName",
  requestHooks: [networkLogger.edgeEndpointLogs],
  url: `${TEST_PAGE_URL}?test=C13348429`
});

test.meta({
  ID: "C13419240",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const getIframeContainer = ClientFunction(() => {
  const element = document.querySelector("#alloy-messaging-container");
  return element ? element.innerHTML : "";
});

test("Test C13419240: Verify DOM action using the sendEvent command for a viewName", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({}); // establish an identity

  await alloy.applyResponse({
    renderDecisions: false,
    responseBody: mockResponse
  });

  await alloy.sendEvent({
    renderDecisions: true,
    decisionContext: {
      "~type": "com.adobe.eventType.generic.track",
      "~source": "com.adobe.eventSource.requestContent",
      "~state.com.adobe.module.lifecycle/lifecyclecontextdata.dayofweek": 2
    }
  });

  const containerElement = await getIframeContainer();
  await t.expect(containerElement).contains("alloy-iframe-id");
});
