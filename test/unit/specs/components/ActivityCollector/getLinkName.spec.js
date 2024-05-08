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

import getLinkName from "../../../../../src/components/ActivityCollector/getLinkName.js";

const createNodeWithAttribute = (nodeName, attributeName, attributeValue) => {
  const node = {
    nodeName,
    getAttribute: name => {
      if (name === attributeName) {
        return attributeValue;
      }
      return null;
    }
  };
  node[attributeName] = attributeValue;
  return node;
};

describe("ActivityCollector::getLinkName", () => {
  it("Returns empty string if no link-name can be constructed", () => {
    expect(getLinkName({})).toBe("");
  });

  it("Prioritizes node innerText over textContent", () => {
    // The innerText always takes priority when determining the link-name
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText
    expect(
      getLinkName({
        nodeName: "A",
        innerText: "inner",
        textContent: "content"
      })
    ).toBe("inner");
    // Child nodes are ignored unless they include non-supported elements
    // which can end up corrupting the innerText value
    expect(
      getLinkName({
        nodeName: "A",
        innerText: "inner",
        textContent: "content",
        childNodes: [createNodeWithAttribute("IMG", "src", "image.jpg")]
      })
    ).toBe("inner");
    expect(
      getLinkName({
        nodeName: "A",
        textContent: "content"
      })
    ).toBe("content");
  });
  // this is an use case when in the children nodes there is an unsupported node,
  // thus the innerText might contain some unrelated data
  it("Excludes unsupported nodes", () => {
    expect(
      getLinkName({
        innerText: "Not picked due to non-supported child nodes",
        nodeName: "A",
        childNodes: [
          // Title attributes would contribute to the link-name
          // However LINK is a non-supported element
          createNodeWithAttribute("LINK", "title", "Link Title"),
          createNodeWithAttribute("IMG", "src", "image.jpg")
        ]
      })
    ).toBe("image.jpg");
  });

  // This test could look like: <a href="https://example.com">Click Here<img src="image.jpg"></a>
  it("Prioritizes nodeValue over other element properties", () => {
    expect(
      getLinkName({
        nodeName: "A",
        childNodes: [
          createNodeWithAttribute("#text", "nodeValue", "Click Here"),
          createNodeWithAttribute("IMG", "src", "image.jpg")
        ]
      })
    ).toBe("Click Here");
  });

  it("Select link-name based on a property hierarchy", () => {
    expect(
      getLinkName({
        nodeName: "A",
        childNodes: [
          createNodeWithAttribute("IMG", "title", "title"),
          createNodeWithAttribute("IMG", "src", "image.jpg"),
          createNodeWithAttribute("IMG", "alt", "alt"),
          createNodeWithAttribute("INPUT", "value", "input")
        ]
      })
    ).toBe("alt");
    expect(
      getLinkName({
        nodeName: "A",
        childNodes: [
          createNodeWithAttribute("IMG", "title", "title"),
          createNodeWithAttribute("IMG", "src", "image.jpg"),
          createNodeWithAttribute("INPUT", "value", "input")
        ]
      })
    ).toBe("title");
    expect(
      getLinkName({
        nodeName: "A",
        childNodes: [
          createNodeWithAttribute("IMG", "src", "image.jpg"),
          createNodeWithAttribute("INPUT", "value", "input")
        ]
      })
    ).toBe("input");
    expect(
      getLinkName({
        nodeName: "A",
        childNodes: [createNodeWithAttribute("IMG", "src", "image.jpg")]
      })
    ).toBe("image.jpg");
  });

  it("Truncates excess whitespace in link-name", () => {
    expect(
      getLinkName({
        nodeName: "A",
        innerText: " ab   c",
        textContent: "content"
      })
    ).toBe("ab c");
  });
});

it("Ignores the spaces attributes", () => {
  expect(
    getLinkName({
      nodeName: "A",
      childNodes: [
        createNodeWithAttribute("IMG", "title", "title"),
        createNodeWithAttribute("IMG", "src", "image.jpg"),
        createNodeWithAttribute("IMG", "alt", "  "),
        createNodeWithAttribute("IMG", "alt", "alt"),
        createNodeWithAttribute("INPUT", "value", "input")
      ]
    })
  ).toBe("alt");
});
