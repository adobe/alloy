/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { t, ClientFunction } from "testcafe";
import {
  createTestIdSelector,
  createTestIdSelectorString,
} from "../dataTestIdSelectors.mjs";

const xdmTree = createTestIdSelector("xdmTree");
const displayNamesSwitch = createTestIdSelector("displayNamesSwitch");

const escapeRegex = (value) => value.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
const buildTitlePattern = (title) => {
  const normalized = escapeRegex(title.trim()).replace(
    /\s+/g,
    "[\\s\\u200B-\\u200D\\uFEFF]*",
  );
  return new RegExp(`^${normalized}$`, "i");
};

const getIsElementInViewport = (selector) => {
  return ClientFunction(
    () => {
      return new Promise((resolve) => {
        const observer = new IntersectionObserver(
          (entries) => {
            resolve(entries[0].isIntersecting);
          },
          {
            threshold: 1.0,
          },
        );
        // eslint-disable-next-line no-undef
        observer.observe(selector());
      });
    },
    {
      dependencies: {
        selector,
      },
    },
  )();
};

const create = (node) => {
  const populationIndicator = node.find(
    createTestIdSelectorString("populationAmountIndicator"),
  );
  const expansionToggle = node
    .parent(".ant-tree-treenode")
    .nth(0)
    .find(".ant-tree-switcher");
  return {
    click: async () => {
      await t.expect(node.exists).ok();
      await t.click(node);
    },
    toggleExpansion: async () => {
      await t.expect(expansionToggle.exists).ok();
      await t.click(expansionToggle);
      // wait for animation to finish
      await t.wait(300);
    },
    expectInViewport: async () => {
      const isElementInViewport = await getIsElementInViewport(node);
      return t.expect(isElementInViewport).ok();
    },
    populationIndicator: {
      expectFull: async () => {
        await t.expect(populationIndicator.hasClass("is-full")).ok();
      },
      expectPartial: async () => {
        return t.expect(populationIndicator.hasClass("is-partial")).ok();
      },
      expectEmpty: async () => {
        await t.expect(populationIndicator.hasClass("is-empty")).ok();
      },
      expectBlank: async () => {
        await t.expect(populationIndicator.exists).notOk();
      },
    },
    expectIsValid: async () => {
      await t.expect(node.hasClass("is-invalid")).notOk();
    },
    expectIsNotValid: async () => {
      await t.expect(node.hasClass("is-invalid")).ok();
    },
    expectExists: async () => {
      await t.expect(node.exists).ok();
    },
    expectNotExists: async () => {
      await t.expect(node.exists).notOk();
    },
    expectTitleEquals: async (title) => {
      await t
        .expect(
          node.find(createTestIdSelectorString("xdmTreeNodeTitleDisplayName"))
            .innerText,
        )
        .eql(title);
    },
    next: () => {
      return create(
        node()
          .parent(".ant-tree-treenode")
          .nth(0)
          .nextSibling()
          .find(createTestIdSelectorString("xdmTreeNodeTitle")),
      );
    },
  };
};

export default {
  node: (title) => {
    const titleSelector = xdmTree
      .find(createTestIdSelectorString("xdmTreeNodeTitleDisplayName"))
      .withText(buildTitlePattern(title))
      .parent(createTestIdSelectorString("xdmTreeNodeTitle"))
      .nth(0);

    return create(titleSelector);
  },
  toggleDisplayNames: async () => {
    await t.click(displayNamesSwitch);
  },
};
