/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { Selector, t, ClientFunction } from "testcafe";
import {
  createTestIdSelector,
  createTestIdSelectorString,
} from "./dataTestIdSelectors.mjs";

const popoverMenuSelector = Selector('[role="listbox"]');
const tabSelector = Selector('[role="tab"]');
const menuItemCssSelector = '[role="option"], [role="option"] span';
const menuItemSimpleCssSelector = '[role="option"]';
const invalidAttribute = "aria-invalid";
const invalidCssSelector = '[class*="--invalid"]';
// Sometimes TestCafe's click simulation doesn't match what
// React-Spectrum is expecting. A single click might open then
// close a Picker, for example. Calling click directly on
// the element seems to work better. Other Adobe teams have taken
// a similar approach when using Cypress or React Testing Library
const compatibleClick = async (selector) => {
  await t.expect(selector.exists).ok();
  // Normally TestCafe will automatically scroll the target into view,
  // but since we are using a client function to perform the click
  // TestCafe doesn't automatically scroll.
  await t.scrollIntoView(selector);
  await ClientFunction(() => {
    const element = selector();
    element.click();
  }).with({
    dependencies: { selector },
  })();
};

const createExpectError = (selector) => async () => {
  await t
    .expect(selector.getAttribute(invalidAttribute))
    .eql("true", "Expected field to have error when it did not");
};
const createExpectInvalidCssClass = (selector) => async () => {
  await t.expect(selector.parent().find(invalidCssSelector).exists).ok();
};

const createExpectHidden = (selector) => async () => {
  await t.expect(selector.hasAttribute("hidden")).ok();
};

const createExpectNoError = (selector) => async () => {
  await t
    .expect(selector.getAttribute(invalidAttribute))
    .notEql("true", "Expected field to not have error when it did");
};

const createExpectValue = (selector) => async (value) => {
  // We need to use the value attribute instead of property
  // because some react-spectrum components, like Select,
  // don't set the value property on the primary DOM element
  // but instead use an attribute.
  await t.expect(selector.getAttribute("value")).eql(value);
};

const createExpectText = (selector) => async (text) => {
  await t
    .expect(selector.withExactText(text).exists)
    .ok(`Text ${text} not found.`);
};

const createExpectMatch = (selector) => async (value) => {
  // We need to use the value attribute instead of property
  // because some react-spectrum components, like Select,
  // don't set the value property on the primary DOM element
  // but instead use an attribute.
  await t.expect(selector.getAttribute("value")).match(value);
};

const createClick = (selector) => async () => {
  await t.expect(selector.exists).ok();
  await t.click(selector);
};

const createExpectChecked = (selector) => async () => {
  await t.expect(selector.checked).ok();
};

const createExpectUnchecked = (selector) => async () => {
  await t.expect(selector.checked).notOk();
};

const createExpectExists = (selector) => async () => {
  await t.expect(selector.exists).ok();
};

const createExpectNotExists = (selector) => async () => {
  await t.expect(selector.exists).notOk();
};

const createExpectEnabled = (selector) => async () => {
  await t.expect(selector.hasAttribute("disabled")).notOk();
};

const createExpectDisabled = (selector) => async () => {
  await t.expect(selector.hasAttribute("disabled")).ok();
};

const createExpectHasRole = (selector, expectedRole) => () =>
  t.expect(selector.getAttribute("role")).eql(expectedRole);

const createExpectNotHasRole = (selector, expectedRole) => () =>
  t.expect(selector.getAttribute("role")).notEql(expectedRole);

// The menu items are virtualized, meaning that any items that
// are not visible to the user will not be found in the DOM by TestCafe.
// You may need to scroll the menu to be able to assert that certain items exist.
const createExpectMenuOptionLabels = (menuSelector) => async (labels) => {
  // wait for the menu to appear
  await menuSelector();
  const menuItems = menuSelector.find(menuItemSimpleCssSelector);
  for (let i = 0; i < labels.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await t
      .expect(menuItems.nth(i).withExactText(labels[i]).exists)
      .ok(
        `Option with label ${labels[i]} does not exist when it is expected to exist. Be sure you've opened the menu first.`,
      );
  }
  await t.expect(menuItems.count).eql(labels.length);
};

// The menu items are virtualized, meaning that any items that
// are not visible to the user will not be found in the DOM by TestCafe.
// You may need to scroll the menu to be able to assert that certain items exist.
const createExpectMenuOptionsLabelsInclude =
  (menuSelector) => async (labels) => {
    // wait for the menu to appear
    await menuSelector();
    const menuItems = menuSelector.find(menuItemCssSelector);
    for (let i = 0; i < labels.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await t
        .expect(menuItems.withExactText(labels[i]).exists)
        .ok(
          `Option with label ${labels[i]} does not exist when it is expected to exist. Be sure you've opened the menu first.`,
        );
    }
  };

// The menu items are virtualized, meaning that any items that
// are not visible to the user will not be found in the DOM by TestCafe.
// You may need to scroll the menu to be able to assert that certain items don't exist.
const createExpectMenuOptionLabelsExclude =
  (menuSelector) => async (labels) => {
    // wait for the menu to appear
    await menuSelector();
    const menuItems = menuSelector.find(menuItemCssSelector);
    for (let i = 0; i < labels.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await t
        .expect(menuItems.withExactText(labels[i]).exists)
        .notOk(
          `Option with label ${labels[i]} exists when it is expected to not exist.`,
        );
    }
  };

const createExpectTabSelected = (selector) => async () => {
  await t.expect(selector.getAttribute("aria-selected")).eql("true");
};

// The menu items are virtualized, meaning that any items that
// are not visible to the user will not be found in the DOM by TestCafe.
// You may need to scroll the menu to be able to assert that certain items exist.
const createSelectMenuOption = (menuSelector) => async (label) => {
  // wait for the menu to appear
  await t.expect(menuSelector.exists).ok();
  const option = menuSelector.find(menuItemCssSelector).withExactText(label);
  await t.click(option);
};

// This provides an abstraction layer on top of react-spectrum
// in order to keep react-spectrum specifics outside of tests.
// This abstraction is more valuable for some components (Select, Accordion)
// than for others (Button), but should probably be used for all
// components for consistency. Feel free to add additional
// components and methods. We always include the original
// selector on the returned object, so if we need to do something
// a bit more custom inside the test, the test can use the selector
// and TestCafe APIs directly. A test ID string or a Selector can
// be passed into each component wrapper.
const componentWrappers = {
  comboBox(selector) {
    return {
      expectIsComboBox: createExpectHasRole(selector, "combobox"),
      expectError: createExpectError(selector),
      expectNoError: createExpectNoError(selector),
      // We use createExpectValue because the text is stored on a value attribute of
      // the element with our data-test-id, even though our true intention is to assert
      // the text in the textfield.
      expectText: createExpectValue(selector),
      // expectValue matches other components, but is the same as expectText
      expectValue: createExpectValue(selector),
      async openMenu() {
        await t.click(
          selector.parent().find("button[aria-haspopup='listbox']"),
        );
      },
      // If the user needs to manually open the menu before selecting an
      // item, you'll need to call openMenu first.
      selectMenuOption: createSelectMenuOption(popoverMenuSelector),
      // If the user needs to manually open the menu before viewing option
      // labels, you'll need to call openMenu first.
      expectMenuOptionLabels: createExpectMenuOptionLabels(popoverMenuSelector),
      expectMenuOptionLabelsInclude:
        createExpectMenuOptionsLabelsInclude(popoverMenuSelector),
      expectMenuOptionLabelsExclude:
        createExpectMenuOptionLabelsExclude(popoverMenuSelector),
      async enterSearch(text) {
        await t.typeText(selector, text);
      },
      async pressEnterKey() {
        await t.pressKey("enter");
      },
      async clear() {
        await t.selectText(selector).pressKey("delete");
      },
      async scrollToTop() {
        // sometimes when over-scrolling the popup will close, so we scroll to 1 pixel
        await t.scroll(popoverMenuSelector, 0, 1);
      },
      // When the combobox loads pages of data when scrolling, this
      // will keep scrolling until the the item is reached.
      async scrollDownToItem(label) {
        for (let i = 0; i < 10; i += 1) {
          if (
            // eslint-disable-next-line no-await-in-loop
            await popoverMenuSelector
              .find(menuItemCssSelector)
              .withExactText(label).exists
          ) {
            return;
          }

          // eslint-disable-next-line no-await-in-loop
          await t.scrollBy(popoverMenuSelector, 0, 200);
        }

        throw new Error(
          `Option with label ${label} does not exist while scrolling down when it is expected to exist.`,
        );
      },
      expectDisabled: createExpectDisabled(selector),
    };
  },
  picker(selector) {
    return {
      async expectIsPicker() {
        await t.expect(selector.getAttribute("aria-haspopup")).eql("listbox");
        // must be a button element
        await t.expect(selector.tagName).eql("button");
      },
      expectError: createExpectInvalidCssClass(selector),
      expectNoError: createExpectNoError(selector),
      expectText: createExpectText(selector),
      async selectOption(label) {
        await compatibleClick(selector);
        await this.scrollDownToItem(label);
        await createSelectMenuOption(popoverMenuSelector)(label);
      },
      async expectSelectedOptionLabel(label) {
        // Safari includes a newline at the end of the selected option label innerText
        await t.expect(selector.innerText).contains(label);
      },
      async expectMenuOptionLabels(labels) {
        await compatibleClick(selector);
        await createExpectMenuOptionLabels(popoverMenuSelector)(labels);
      },
      async expectMenuOptionLabelsInclude(labels) {
        await compatibleClick(selector);
        await createExpectMenuOptionsLabelsInclude(popoverMenuSelector)(labels);
      },
      async expectMenuOptionLabelsExclude(labels) {
        await compatibleClick(selector);
        await createExpectMenuOptionLabelsExclude(popoverMenuSelector)(labels);
      },
      expectDisabled: createExpectDisabled(selector),
      expectEnabled: createExpectEnabled(selector.find("button")),
      expectHidden: createExpectHidden(selector.parent().parent()),
      openMenu: createClick(selector),
      // When the combobox loads pages of data when scrolling, this
      // will keep scrolling until the the item is reached.
      async scrollDownToItem(label) {
        for (let i = 0; i < 10; i += 1) {
          if (
            // eslint-disable-next-line no-await-in-loop
            await popoverMenuSelector
              .find(menuItemCssSelector)
              .withExactText(label).exists
          ) {
            return;
          }

          // eslint-disable-next-line no-await-in-loop
          await t.scrollBy(popoverMenuSelector, 0, 200);
        }

        throw new Error(
          `Option with label ${label} does not exist while scrolling down when it is expected to exist.`,
        );
      },
    };
  },
  textField(selector) {
    return {
      expectIsTextField: createExpectNotHasRole(selector, "combobox"),
      expectError: createExpectError(selector),
      expectNoError: createExpectNoError(selector),
      expectValue: createExpectValue(selector),
      expectMatch: createExpectMatch(selector),
      async typeText(text, options) {
        await t.typeText(selector, text, options);
      },
      async clear() {
        await t.selectText(selector).pressKey("delete");
      },
      // Fields with long values may need to be clicked before they
      // are cleared to get rid of the "..." at the end.
      async click() {
        await t.click(selector);
      },
    };
  },
  textArea(selector) {
    return {
      expectError: createExpectError(selector),
      expectNoError: createExpectNoError(selector),
      async expectValue(text) {
        await t.expect(selector.value).eql(text);
      },
      async typeText(text) {
        await t.typeText(selector, text);
      },
      async clear() {
        await t.selectText(selector).pressKey("delete");
      },
    };
  },
  checkbox(selector) {
    return {
      expectError: createExpectError(selector),
      expectChecked: createExpectChecked(selector),
      expectUnchecked: createExpectUnchecked(selector),
      click: createClick(selector),
    };
  },
  radio(selector) {
    return {
      expectChecked: createExpectChecked(selector),
      expectUnchecked: createExpectUnchecked(selector),
      click: createClick(selector),
    };
  },
  button(selector) {
    return {
      click: createClick(selector),
    };
  },
  illustratedMessage(selector) {
    return {
      async expectMessage(message) {
        await t
          .expect(selector.find("section").withText(message).exists)
          .ok(`Message ${message} not found.`);
      },
    };
  },
  tab(selector) {
    return {
      click: createClick(selector),
      expectSelected: createExpectTabSelected(selector),
    };
  },
  tabs() {
    // Normally we would incorporate the selector for the
    // parent Tabs component by doing something like
    // selector.find(tabCssSelector).withExactText(label)
    // This would allow us to ensure we're searching for a tab
    // within a specific Tabs instance when multiple Tabs instances
    // are on the page. Unfortunately, React-Spectrum has a bug where
    // data attributes added to the Tabs component are never
    // added to any underlying DOM elements. So, we'll just search
    // for any tab on the page that contains the label.
    // https://github.com/adobe/react-spectrum/issues/2002
    return {
      async expectTabLabels(labels) {
        for (let i = 0; i < labels.length; i += 1) {
          // eslint-disable-next-line no-await-in-loop
          await t
            .expect(tabSelector.nth(i).withExactText(labels[i]).exists)
            .ok(
              `Tab with label ${labels[i]} does not exist when it is expected to exist.`,
            );
        }
        await t.expect(tabSelector.count).eql(labels.length);
      },
      async selectTab(label) {
        await t.click(tabSelector.withExactText(label));
      },
    };
  },
  dialog() {
    return {};
  },
  alert() {
    return {};
  },
  // You can chain additional component methods after calling this method
  container(selector) {
    const that = this;
    return Object.keys(this).reduce(
      (containerComponents, key) => ({
        ...containerComponents,
        // Using the function keyword here so this is defined
        // eslint-disable-next-line object-shorthand
        [key]: function containerComponent(childTestId) {
          return that[key].call(
            this,
            selector.find(createTestIdSelectorString(childTestId)),
          );
        },
      }),
      {},
    );
  },
};

/**
 * Given a test ID string or a selector, it returns a selector.
 * @param {string|Selector} testIdOrSelector
 * @returns {Selector}
 */
const selectorize = (testIdOrSelector) => {
  return typeof testIdOrSelector === "string"
    ? createTestIdSelector(testIdOrSelector)
    : testIdOrSelector;
};

// This adds certain properties to all component wrappers.
Object.keys(componentWrappers).forEach((componentName) => {
  const componentWrapper = componentWrappers[componentName];
  componentWrappers[componentName] = function selectorizedComponent(
    testIdOrSelector,
  ) {
    const selector = selectorize(testIdOrSelector);
    return {
      expectEnabled: createExpectEnabled(selector),
      expectDisabled: createExpectDisabled(selector),
      expectExists: createExpectExists(selector),
      expectNotExists: createExpectNotExists(selector),
      ...componentWrapper.call(this, selector),
      selector,
    };
  };
});

export default componentWrappers;
