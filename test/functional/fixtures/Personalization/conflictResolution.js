/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
export const inAppMessagesPropositions = {
  requestId: "09ead9d7-b91f-41d6-9bb5-e7a5396315d6",
  handle: [
    {
      payload: [
        {
          id: "03560676528201411421379778603411811904",
          namespace: {
            code: "ECID",
          },
        },
      ],
      type: "identity:result",
    },
    {
      payload: [
        {
          id: "id2",
          scope: "web://www.test.com/",
          scopeDetails: {
            rank: 2,
            decisionProvider: "AJO",
            correlationID: "3a034993-3bdb-4d8d-870f-0817e8949ebd-0",
            characteristics: {
              eventToken:
                "eyJtZXNzYWdlRXhlY3V0aW9uIjp7Im1lc3NhZ2VFeGVjdXRpb25JRCI6IlVFOkluYm91bmQiLCJtZXNzYWdlSUQiOiIxYmQ4NWMwMC1iNGM5LTQ0NjQtYjIyMC1hYzY5ZTY5NGI1M2QiLCJtZXNzYWdlUHVibGljYXRpb25JRCI6IjNhMDM0OTkzLTNiZGItNGQ4ZC04NzBmLTA4MTdlODk0OWViZCIsIm1lc3NhZ2VUeXBlIjoibWFya2V0aW5nIiwiY2FtcGFpZ25JRCI6IjY4ODg5NDdjLTAyZDQtNDFhNi05YzZjLTE1YTU4ZTVlNzcyYyIsImNhbXBhaWduVmVyc2lvbklEIjoiNDU1NzE2MmQtNzgyMi00Zjg4LTkyZWItMmMxZmViZTFhMmViIiwiY2FtcGFpZ25BY3Rpb25JRCI6ImNhMzJlZjZmLWY3NTItNDA2Ny04YmFlLTE1NGY2MDAyN2E3ZSJ9LCJtZXNzYWdlUHJvZmlsZSI6eyJtZXNzYWdlUHJvZmlsZUlEIjoiYjBlM2M0YjctMWE3YS00NTljLWE2YzUtNTFlNDU0ZDVjYmRiIiwiY2hhbm5lbCI6eyJfaWQiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbHMvaW5BcHAiLCJfdHlwZSI6Imh0dHBzOi8vbnMuYWRvYmUuY29tL3hkbS9jaGFubmVsLXR5cGVzL2luQXBwIn19fQ==",
            },
            activity: {
              id: "6888947c-02d4-41a6-9c6c-15a58e5e772c#ca32ef6f-f752-4067-8bae-154f60027a7e",
              matchedSurfaces: ["web://surface1/"],
            },
          },
          items: [
            {
              id: "e1090531-caee-4749-a738-680f393cf4a9",
              schema: "https://ns.adobe.com/personalization/ruleset-item",
              data: {
                version: 1,
                rules: [
                  {
                    condition: {
                      definition: {
                        key: "~type",
                        matcher: "eq",
                        values: ["com.adobe.eventType.rulesEngine"],
                      },
                      type: "matcher",
                    },
                    consequences: [
                      {
                        id: "f03980c9-5344-4e32-84c7-d74ffebf06d6",
                        type: "schema",
                        detail: {
                          id: "f03980c9-5344-4e32-84c7-d74ffebf06d6",
                          schema:
                            "https://ns.adobe.com/personalization/message/in-app",
                          data: {
                            content:
                              "<!doctype html><html><body>Proposition 2</body></html>",
                            contentType: "text/html",
                            remoteAssets: [
                              "https://cdn.experience.adobe.net/solutions/cjm-inapp-editor/assets/InAppBlockImageDefault.aa849e19.svg",
                            ],
                            webParameters: {
                              "alloy-content-iframe": {
                                style: {
                                  border: "none",
                                  height: "100%",
                                  width: "100%",
                                },
                                params: {
                                  enabled: true,
                                  insertionMethod: "appendChild",
                                  parentElement: "#alloy-messaging-container",
                                },
                              },
                              "alloy-messaging-container": {
                                style: {
                                  backgroundColor: "#000000",
                                  border: "none",
                                  borderRadius: "15px",
                                  height: "100vh",
                                  overflow: "hidden",
                                  position: "fixed",
                                  width: "100%",
                                  left: "50%",
                                  transform:
                                    "translateX(-50%) translateY(-50%)",
                                  top: "50%",
                                },
                                params: {
                                  enabled: true,
                                  insertionMethod: "appendChild",
                                  parentElement: "body",
                                },
                              },
                              "alloy-overlay-container": {
                                style: {
                                  position: "fixed",
                                  top: "0",
                                  left: "0",
                                  width: "100%",
                                  height: "100%",
                                  background: "transparent",
                                  opacity: 0.2,
                                  backgroundColor: "#000000",
                                },
                                params: {
                                  enabled: true,
                                  insertionMethod: "appendChild",
                                  parentElement: "body",
                                },
                              },
                            },
                            publishedDate: 1727568749,
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
        {
          id: "id1",
          scope: "web://www.test.com/",
          scopeDetails: {
            rank: 1,
            decisionProvider: "AJO",
            correlationID: "d4f5d677-1123-4605-ad9e-86fead923220-0",
            characteristics: {
              eventToken:
                "eyJtZXNzYWdlRXhlY3V0aW9uIjp7Im1lc3NhZ2VFeGVjdXRpb25JRCI6IlVFOkluYm91bmQiLCJtZXNzYWdlSUQiOiJiNmY1ODVmZS1mNWE1LTQ0NWUtYjU0OC0yOThlMmQ1MDFkZTYiLCJtZXNzYWdlUHVibGljYXRpb25JRCI6ImQ0ZjVkNjc3LTExMjMtNDYwNS1hZDllLTg2ZmVhZDkyMzIyMCIsIm1lc3NhZ2VUeXBlIjoibWFya2V0aW5nIiwiY2FtcGFpZ25JRCI6ImI3NWNkNDAyLTIwNzMtNDc5OC1hMDJjLTc0YmQyMDg0MmQyNyIsImNhbXBhaWduVmVyc2lvbklEIjoiMmExMDJjZDMtZmM0NC00ZDI0LWEzMWMtNzZhZTBmY2FjMWJhIiwiY2FtcGFpZ25BY3Rpb25JRCI6ImNhMzJlZjZmLWY3NTItNDA2Ny04YmFlLTE1NGY2MDAyN2E3ZSJ9LCJtZXNzYWdlUHJvZmlsZSI6eyJtZXNzYWdlUHJvZmlsZUlEIjoiNzEyZjYwN2UtNjNmNS00NGExLTg3ZDYtM2Y1NWQzYjVmNGM2IiwiY2hhbm5lbCI6eyJfaWQiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbHMvaW5BcHAiLCJfdHlwZSI6Imh0dHBzOi8vbnMuYWRvYmUuY29tL3hkbS9jaGFubmVsLXR5cGVzL2luQXBwIn19fQ==",
            },
            activity: {
              id: "b75cd402-2073-4798-a02c-74bd20842d27#ca32ef6f-f752-4067-8bae-154f60027a7e",
              matchedSurfaces: ["web://surface1/"],
            },
          },
          items: [
            {
              id: "471af8f8-7806-47ce-885e-45fffe14108a",
              schema: "https://ns.adobe.com/personalization/ruleset-item",
              data: {
                version: 1,
                rules: [
                  {
                    condition: {
                      definition: {
                        key: "~type",
                        matcher: "eq",
                        values: ["com.adobe.eventType.rulesEngine"],
                      },
                      type: "matcher",
                    },
                    consequences: [
                      {
                        id: "613e9843-7291-4505-9cca-3f76caff6bec",
                        type: "schema",
                        detail: {
                          id: "613e9843-7291-4505-9cca-3f76caff6bec",
                          schema:
                            "https://ns.adobe.com/personalization/message/in-app",
                          data: {
                            content:
                              "<!doctype html><html><body>Proposition 1</body></html>",
                            contentType: "text/html",
                            remoteAssets: [
                              "https://cdn.experience.adobe.net/solutions/cjm-inapp-editor/assets/InAppBlockImageDefault.aa849e19.svg",
                            ],
                            webParameters: {
                              "alloy-content-iframe": {
                                style: {
                                  border: "none",
                                  height: "100%",
                                  width: "100%",
                                },
                                params: {
                                  enabled: true,
                                  insertionMethod: "appendChild",
                                  parentElement: "#alloy-messaging-container",
                                },
                              },
                              "alloy-messaging-container": {
                                style: {
                                  backgroundColor: "#000000",
                                  border: "none",
                                  borderRadius: "15px",
                                  height: "100vh",
                                  overflow: "hidden",
                                  position: "fixed",
                                  width: "100%",
                                  left: "50%",
                                  transform:
                                    "translateX(-50%) translateY(-50%)",
                                  top: "50%",
                                },
                                params: {
                                  enabled: true,
                                  insertionMethod: "appendChild",
                                  parentElement: "body",
                                },
                              },
                              "alloy-overlay-container": {
                                style: {
                                  position: "fixed",
                                  top: "0",
                                  left: "0",
                                  width: "100%",
                                  height: "100%",
                                  background: "transparent",
                                  opacity: 0.2,
                                  backgroundColor: "#000000",
                                },
                                params: {
                                  enabled: true,
                                  insertionMethod: "appendChild",
                                  parentElement: "body",
                                },
                              },
                            },
                            publishedDate: 1727568995,
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      ],
      type: "personalization:decisions",
      eventIndex: 0,
    },
  ],
};
