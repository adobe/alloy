/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import getLinkRegion from "../../../../../src/components/ActivityCollector/getLinkRegion.js";

const createChildElement = element => {
  return {
    parentNode: element
  };
};

describe("ActivityCollector::getLinkRegion", () => {
  it("Returns BODY if no region is found", () => {
    expect(getLinkRegion({})).toBe("BODY");
  });

  it("Picks region properties based on priority", () => {
    const tests = [
      {
        element: {
          id: "id",
          role: "region",
          "aria-label": "aria",
          nodeName: "HEADER"
        },
        result: "id"
      },
      {
        element: {
          role: "region",
          "aria-label": "aria",
          nodeName: "HEADER"
        },
        result: "aria"
      },
      {
        element: {
          nodeName: "HEADER"
        },
        result: "HEADER"
      }
    ];
    tests.forEach(test => {
      const anchor = createChildElement(test.element);
      expect(getLinkRegion(anchor)).toBe(test.result);
    });
    expect(getLinkRegion({})).toBe("BODY");
  });

  it("Traverses up the DOM to find a region", () => {
    const element = {
      id: "3-levels"
    };
    const anchor = createChildElement(createChildElement(element));
    expect(getLinkRegion(anchor)).toBe("3-levels");
  });

  it("Supports setting region as semantic element name for supported elements", () => {
    const tests = [
      {
        element: {
          nodeName: "HEADER"
        },
        result: "HEADER"
      },
      {
        element: {
          nodeName: "MAIN"
        },
        result: "MAIN"
      },
      {
        element: {
          nodeName: "FOOTER"
        },
        result: "FOOTER"
      },
      {
        element: {
          nodeName: "NAV"
        },
        result: "NAV"
      },
      {
        element: {
          nodeName: "SECTION"
        },
        result: "BODY"
      }
    ];
    tests.forEach(test => {
      const anchor = createChildElement(test.element);
      expect(getLinkRegion(anchor)).toBe(test.result);
    });
    expect(getLinkRegion({})).toBe("BODY");
  });

  it("Truncates excess whitespace in region", () => {
    const element = {
      id: " ab   c"
    };
    const anchor = createChildElement(element);
    expect(getLinkRegion(anchor)).toBe("ab c");
  });
});
