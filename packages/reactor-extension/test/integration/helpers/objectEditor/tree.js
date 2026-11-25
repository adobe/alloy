/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { expect } from "vitest";
import field from "../field";
import { TIMEOUT } from "./timeout";

const ERROR_TITLE = "This field contains an error";
const LABEL_TEST_ID = "xdmTreeNodeTitleDisplayName";

// Mirrors the strokeDasharray values in populationAmountIndicator.jsx.
const DASH_ARRAY = { full: "100 0", partial: "50 50", empty: "0 200" };

// rc-tree renders rows as a flat list; a row's depth is its number of indent
// units.
const depthOf = (label) =>
  label.closest('[role="treeitem"]').querySelectorAll(".ant-tree-indent-unit")
    .length;

const createNode = (view, spec, { index } = {}) => {
  const names = [].concat(spec);
  const describeNode = `Tree node ${JSON.stringify(spec)}`;

  // Indexes (in DOM order) of the rendered rows whose title and ancestor
  // titles match `names`.
  const findMatches = () => {
    const chain = [];
    const matches = [];
    view
      .getByTestId(LABEL_TEST_ID)
      .elements()
      .forEach((label, rowIndex) => {
        const depth = depthOf(label);
        chain.length = depth;
        chain[depth] = label.textContent;
        const start = depth + 1 - names.length;
        if (start >= 0 && names.every((name, i) => chain[start + i] === name)) {
          matches.push(rowIndex);
        }
      });
    return matches;
  };

  // Waits for the node to be rendered. Rows and their title labels are
  // one-to-one and in the same order, so the matched index addresses both.
  const locate = async () => {
    let rowIndex;
    await expect
      .poll(() => {
        const matches = findMatches();
        if (index === undefined && matches.length > 1) {
          throw new Error(
            `${describeNode} is ambiguous (${matches.length} matches). Pass the ancestor path or { index }.`,
          );
        }
        rowIndex = matches[index ?? 0];
        return rowIndex !== undefined;
      }, TIMEOUT)
      .toBe(true);
    const row = view.getByRole("treeitem").nth(rowIndex);
    return {
      row,
      label: view.getByTestId(LABEL_TEST_ID).nth(rowIndex),
      indicator: row.getByTestId("populationAmountIndicator"),
    };
  };

  const isExpanded = (row) =>
    row.element().getAttribute("aria-expanded") === "true";

  // A click that lands while the tree is re-rendering from a previous
  // expansion can be dropped, so re-check the state and click again.
  const setExpanded = async (expanded) => {
    const { row } = await locate();
    await expect.element(row, TIMEOUT).toBeVisible();
    if (!row.element().hasAttribute("aria-expanded")) {
      throw new Error(`${describeNode} has no children to expand.`);
    }
    for (let attempt = 0; attempt < 3; attempt += 1) {
      if (isExpanded(row) === expanded) {
        return;
      }
      // eslint-disable-next-line no-await-in-loop
      await row.locator(".ant-tree-switcher").click(TIMEOUT);
      try {
        // eslint-disable-next-line no-await-in-loop
        await expect
          .poll(() => isExpanded(row), { timeout: 1500 })
          .toBe(expanded);
        return;
      } catch {
        // try again
      }
    }
    await expect.poll(() => isExpanded(row), TIMEOUT).toBe(expanded);
  };

  const onLabel = (assertion) => async () => {
    const { label } = await locate();
    await assertion(label);
  };

  // Absence assertions would pass for a node that isn't rendered, so locate()
  // (which waits for the node to exist) runs first.
  const expectPopulation = async (kind) => {
    const { indicator } = await locate();
    await expect
      .element(indicator, TIMEOUT)
      .toHaveAttribute("stroke-dasharray", DASH_ARRAY[kind]);
  };

  return {
    click: async () => field((await locate()).label).click(),
    expand: () => setExpanded(true),
    collapse: () => setExpanded(false),
    expectExists: () =>
      expect
        .poll(() => findMatches().length > (index ?? 0), TIMEOUT)
        .toBe(true),
    expectNotExists: () =>
      expect
        .poll(() => findMatches().length <= (index ?? 0), TIMEOUT)
        .toBe(true),
    expectSelected: async () =>
      expect
        .element((await locate()).row, TIMEOUT)
        .toHaveClass("ant-tree-treenode-selected"),
    expectExpanded: async () =>
      expect
        .element((await locate()).row, TIMEOUT)
        .toHaveAttribute("aria-expanded", "true"),
    expectInViewport: onLabel((label) =>
      expect
        .poll(() => {
          const rect = label.element().getBoundingClientRect();
          return rect.top >= 0 && rect.bottom <= window.innerHeight;
        }, TIMEOUT)
        .toBe(true),
    ),
    expectOutOfViewport: onLabel((label) =>
      expect
        .poll(() => {
          const rect = label.element().getBoundingClientRect();
          return rect.bottom < 0 || rect.top > window.innerHeight;
        }, TIMEOUT)
        .toBe(true),
    ),
    // Keeps scrolling to the bottom until the node has left the viewport:
    // expanded children render a moment after the expansion state flips, so
    // the page may not be tall enough on the first attempt.
    scrollAway: onLabel((label) =>
      expect
        .poll(() => {
          window.scrollTo(0, document.documentElement.scrollHeight);
          const rect = label.element().getBoundingClientRect();
          return rect.bottom < 0 || rect.top > window.innerHeight;
        }, TIMEOUT)
        .toBe(true),
    ),
    expectValid: async () => {
      const { row, label } = await locate();
      await expect.element(label, TIMEOUT).toBeInTheDocument();
      await expect
        .element(row.getByTitle(ERROR_TITLE, { exact: true }), TIMEOUT)
        .not.toBeInTheDocument();
    },
    expectInvalid: async () => {
      const { row } = await locate();
      await expect
        .element(row.getByTitle(ERROR_TITLE, { exact: true }), TIMEOUT)
        .toBeInTheDocument();
    },
    population: {
      expectFull: () => expectPopulation("full"),
      expectPartial: () => expectPopulation("partial"),
      expectEmpty: () => expectPopulation("empty"),
      expectBlank: async () => {
        const { label, indicator } = await locate();
        await expect.element(label, TIMEOUT).toBeInTheDocument();
        await expect.element(indicator, TIMEOUT).not.toBeInTheDocument();
      },
    },
  };
};

export default (view) => ({
  node: (spec, options) => createNode(view, spec, options),
  // Display names of every rendered tree node, top to bottom.
  nodeNames: () =>
    view
      .getByTestId(LABEL_TEST_ID)
      .elements()
      .map((element) => element.textContent),
});
