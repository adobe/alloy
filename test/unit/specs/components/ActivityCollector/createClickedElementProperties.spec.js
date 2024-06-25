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

import createClickedElementProperties from "../../../../../src/components/ActivityCollector/createClickedElementProperties";

describe("ActivityCollector::createClickedElementProperties", () => {
  let properties;
  beforeEach(() => {
    properties = {
      pageName: "testPageName",
      linkName: "testLinkName",
      linkRegion: "testLinkRegion",
      linkType: "testLinkType",
      linkUrl: "testLinkUrl",
      pageIDType: 0
    };
  });
  it("Should return object with the init properties", () => {
    const props = createClickedElementProperties({ properties });
    expect(props.properties).toEqual(properties);
  });
  it("Can determine it holds valid link properties", () => {
    const props = createClickedElementProperties({ properties });
    expect(props.isValidLink()).toBe(true);
  });
  it("Can determine it holds invalid link properties", () => {
    let props = createClickedElementProperties({});
    expect(props.isValidLink()).toBe(false);
    props = createClickedElementProperties({ properties });
    props.linkName = "";
    expect(props.isValidLink()).toBe(false);
  });
  it("Can determine it holds internal link properties", () => {
    const props = createClickedElementProperties({ properties });
    expect(props.isInternalLink()).toBe(false);
    props.linkType = "other";
    expect(props.isInternalLink()).toBe(true);
  });
  it("Can determine it holds valid ActivityMap properties", () => {
    const props = createClickedElementProperties({ properties });
    expect(props.isValidActivityMapData()).toBe(true);
    props.pageName = "";
    expect(props.isValidActivityMapData()).toBe(false);
  });
  it("Can convert properties to a populated DATA Analytics schema with ActivityMap data", () => {
    const props = createClickedElementProperties({ properties });
    const data = props.data;
    expect(data).toEqual({
      __adobe: {
        analytics: {
          c: {
            a: {
              activitymap: {
                page: "testPageName",
                link: "testLinkName",
                region: "testLinkRegion",
                pageIDType: 0
              }
            }
          }
        }
      }
    });
  });
  it("Can convert properties to a populated XDM Analytics schema with ActivityMap data", () => {
    const props = createClickedElementProperties({ properties });
    const data = props.xdm;
    expect(data).toEqual({
      eventType: "web.webinteraction.linkClicks",
      web: {
        webInteraction: {
          name: "testLinkName",
          region: "testLinkRegion",
          type: "testLinkType",
          URL: "testLinkUrl",
          linkClicks: {
            value: 1
          }
        }
      }
    });
  });
  it("Can populate properties from options", () => {
    const props = createClickedElementProperties();
    const options = {
      xdm: {
        web: {
          webInteraction: {
            name: "xdmName",
            region: "xdmRegion",
            type: "xdmType",
            URL: "xdmUrl",
            linkClicks: {
              value: 2
            }
          }
        }
      },
      data: {
        __adobe: {
          analytics: {
            c: {
              a: {
                activitymap: {
                  page: "dataPage",
                  link: "dataLink",
                  region: "dataRegion",
                  pageIDType: 1
                }
              }
            }
          }
        }
      },
      clickedElement: {}
    };
    props.options = options;
    // The DATA portion takes priority
    expect(props.properties).toEqual({
      pageName: "dataPage",
      linkName: "dataLink",
      linkRegion: "dataRegion",
      linkType: "xdmType",
      linkUrl: "xdmUrl",
      pageIDType: 1
    });
  });
  it("Can apply a property filter", () => {
    const props = createClickedElementProperties({ properties });
    // Need a clickedElement for the filter to be executed
    props.clickedElement = {};
    const filter = p => {
      p.linkType = "filtered";
    };
    props.applyPropertyFilter(filter);
    expect(props.linkType).toBe("filtered");
  });
  it("Prints message when filter rejects properties", () => {
    const logger = jasmine.createSpyObj("logger", ["info"]);
    const props = createClickedElementProperties({ properties, logger });
    // Need a clickedElement for the filter to be executed
    props.clickedElement = {};
    const filter = p => {
      p.linkType = "filtered";
      return false;
    };
    props.applyPropertyFilter(filter);
    expect(logger.info).toHaveBeenCalledWith(
      jasmine.stringMatching(
        /^Clicked element properties were rejected by filter function/
      )
    );
  });
  it("Can apply a property filter for all properties", () => {
    const props = createClickedElementProperties({ properties });
    props.clickedElement = {};
    const filter = p => {
      p.pageName = "filtered";
      p.linkName = "filtered";
      p.linkRegion = "filtered";
      p.linkType = "filtered";
      p.linkUrl = "filtered";
      p.pageIDType = 1;
    };
    props.applyPropertyFilter(filter);
    expect(props.linkType).toBe("filtered");
    expect(props.pageName).toBe("filtered");
  });
  it("Can apply an options property filter", () => {
    const props = createClickedElementProperties({ properties });
    // Need a clickedElement for the filter to be executed
    props.clickedElement = {};
    const filter = options => {
      options.xdm.web.webInteraction.type = "filtered";
    };
    props.applyOptionsFilter(filter);
    expect(props.linkType).toBe("filtered");
  });
  it("Can apply an options property filter for all properties", () => {
    const props = createClickedElementProperties({ properties });
    props.clickedElement = {};
    const filter = options => {
      if (
        options &&
        options.xdm &&
        options.xdm.web &&
        options.xdm.web.webInteraction
      ) {
        const webInteraction = options.xdm.web.webInteraction;
        webInteraction.name = "filtered"; // Link name
        webInteraction.region = "filtered"; // Link region
        webInteraction.type = "filtered"; // Link type
        webInteraction.URL = "filtered"; // Link URL
      }
      /* eslint no-underscore-dangle: 0 */
      if (
        options &&
        options.data &&
        options.data.__adobe &&
        options.data.__adobe.analytics
      ) {
        const { c } = options.data.__adobe.analytics;
        if (c && c.a && c.a.activitymap) {
          const activitymap = c.a.activitymap;
          activitymap.page = "filtered"; // Page name
          activitymap.link = "filtered"; // Link name
          activitymap.region = "filtered"; // Link region
        }
      }
    };
    props.applyOptionsFilter(filter);
    expect(props.linkType).toBe("filtered");
    expect(props.pageName).toBe("filtered");
  });
});
