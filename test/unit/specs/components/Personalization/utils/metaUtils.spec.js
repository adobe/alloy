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
import {
  cleanMetas,
  dedupeMetas
} from "../../../../../../src/components/Personalization/utils/metaUtils";

describe("Personalization::metaUtils", () => {
  it("cleanMetas", () => {
    expect(
      cleanMetas([
        {
          id: "8f5",
          scope: "web://aepdemo.com/",
          scopeDetails: {
            decisionProvider: "AJO",
            correlationID: "39",
            characteristics: {
              eventToken: "eyJ"
            },
            activity: {
              id: "12"
            }
          },
          trackingLabel: "lbl-buy-now",
          scopeType: "page"
        },
        {
          id: "e9b",
          scope: "web://aepdemo.com/",
          scopeDetails: {
            decisionProvider: "AJO",
            correlationID: "03",
            characteristics: {
              eventToken: "eyJ"
            },
            activity: {
              id: "4f2",
              matchedSurfaces: ["web://aepdemo.com/"]
            }
          },
          trackingLabel: "lbl-buy-now",
          scopeType: "page"
        }
      ])
    ).toEqual([
      {
        id: "8f5",
        scope: "web://aepdemo.com/",
        scopeDetails: {
          decisionProvider: "AJO",
          correlationID: "39",
          characteristics: {
            eventToken: "eyJ"
          },
          activity: {
            id: "12"
          }
        }
      },
      {
        id: "e9b",
        scope: "web://aepdemo.com/",
        scopeDetails: {
          decisionProvider: "AJO",
          correlationID: "03",
          characteristics: {
            eventToken: "eyJ"
          },
          activity: {
            id: "4f2",
            matchedSurfaces: ["web://aepdemo.com/"]
          }
        }
      }
    ]);
  });

  it("dedupeMetas", () => {
    expect(
      dedupeMetas([
        {
          id: "8f5",
          scope: "web://aepdemo.com/",
          scopeDetails: {
            decisionProvider: "AJO",
            correlationID: "39",
            characteristics: {
              eventToken: "eyJ"
            },
            activity: {
              id: "12"
            }
          },
          trackingLabel: "lbl-buy-now",
          scopeType: "page"
        },
        {
          id: "e9b",
          scope: "web://aepdemo.com/",
          scopeDetails: {
            decisionProvider: "AJO",
            correlationID: "03",
            characteristics: {
              eventToken: "eyJ"
            },
            activity: {
              id: "4f2",
              matchedSurfaces: ["web://aepdemo.com/"]
            }
          },
          trackingLabel: "lbl-buy-now",
          scopeType: "page"
        },
        {
          id: "8f5",
          scope: "web://aepdemo.com/",
          scopeDetails: {
            decisionProvider: "AJO",
            correlationID: "39",
            characteristics: {
              eventToken: "eyJ"
            },
            activity: {
              id: "12"
            }
          },
          trackingLabel: "lbl-buy-now",
          scopeType: "page"
        },
        {
          id: "e9b",
          scope: "web://aepdemo.com/",
          scopeDetails: {
            decisionProvider: "AJO",
            correlationID: "03",
            characteristics: {
              eventToken: "eyJ"
            },
            activity: {
              id: "4f2",
              matchedSurfaces: ["web://aepdemo.com/"]
            }
          },
          trackingLabel: "lbl-buy-now",
          scopeType: "page"
        }
      ])
    ).toEqual([
      {
        id: "8f5",
        scope: "web://aepdemo.com/",
        scopeDetails: {
          decisionProvider: "AJO",
          correlationID: "39",
          characteristics: {
            eventToken: "eyJ"
          },
          activity: {
            id: "12"
          }
        },
        trackingLabel: "lbl-buy-now",
        scopeType: "page"
      },
      {
        id: "e9b",
        scope: "web://aepdemo.com/",
        scopeDetails: {
          decisionProvider: "AJO",
          correlationID: "03",
          characteristics: {
            eventToken: "eyJ"
          },
          activity: {
            id: "4f2",
            matchedSurfaces: ["web://aepdemo.com/"]
          }
        },
        trackingLabel: "lbl-buy-now",
        scopeType: "page"
      }
    ]);
  });
});
