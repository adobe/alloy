/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { t, Selector } from "testcafe";
import createComponentFixture from "../../helpers/components/createComponentFixture.mjs";
import renderReactElement from "../../helpers/components/renderReactElement.mjs";

createComponentFixture({
  title: "Heading component",
});

const scenarios = [
  {
    props: {
      size: "XXXL",
    },
    assertions: {
      tagName: "h1",
      classNames: ["spectrum-Heading--sizeXXXL"],
    },
  },
  {
    props: {
      size: "XXL",
    },
    assertions: {
      tagName: "h1",
      classNames: ["spectrum-Heading--sizeXXL"],
    },
  },
  {
    props: {
      size: "XL",
    },
    assertions: {
      tagName: "h1",
      classNames: ["spectrum-Heading--sizeXL"],
    },
  },
  {
    props: {
      size: "L",
    },
    assertions: {
      tagName: "h2",
      classNames: ["spectrum-Heading--sizeL"],
    },
  },
  {
    props: {
      size: "M",
    },
    assertions: {
      tagName: "h3",
      classNames: ["spectrum-Heading--sizeM"],
    },
  },
  {
    props: {
      size: "S",
    },
    assertions: {
      tagName: "h4",
      classNames: ["spectrum-Heading--sizeS"],
    },
  },
  {
    props: {
      size: "XS",
    },
    assertions: {
      tagName: "h5",
      classNames: ["spectrum-Heading--sizeXS"],
    },
  },
  {
    props: {
      size: "XXS",
    },
    assertions: {
      tagName: "h6",
      classNames: ["spectrum-Heading--sizeXXS"],
    },
  },
  {
    props: {
      variant: "heavy",
    },
    assertions: {
      tagName: "h4",
      classNames: ["spectrum-Heading--sizeS", "spectrum-Heading--heavy"],
    },
  },
  {
    props: {
      variant: "light",
    },
    assertions: {
      tagName: "h4",
      classNames: ["spectrum-Heading--sizeS", "spectrum-Heading--light"],
    },
  },
  {
    props: {
      isSerif: true,
    },
    assertions: {
      tagName: "h4",
      classNames: ["spectrum-Heading--sizeS", "spectrum-Heading--serif"],
    },
  },
  {
    props: {
      marginTop: "size-300",
    },
    assertions: {
      tagName: "h4",
      classNames: ["spectrum-Heading--sizeS"],
      style:
        "margin-top: var(--spectrum-global-dimension-size-300, var(--spectrum-alias-size-300);",
    },
  },
  {
    props: {
      marginBottom: "size-300",
    },
    assertions: {
      tagName: "h4",
      classNames: ["spectrum-Heading--sizeS"],
      style:
        "margin-bottom: var(--spectrum-global-dimension-size-300, var(--spectrum-alias-size-300);",
    },
  },
  {
    props: {},
    assertions: {
      tagName: "h4",
      classNames: ["spectrum-Heading--sizeS"],
    },
  },
];

scenarios.forEach(({ props, assertions }) => {
  test(`renders with props: ${JSON.stringify(props)}`, async () => {
    const element = {
      type: "Heading",
      props: {
        ...props,
        children: "Test Heading",
      },
      key: null,
    };
    await renderReactElement(element);
    const selector = Selector(assertions.tagName);
    await t.expect(selector.textContent).eql("Test Heading");
    await t
      .expect(selector.classNames)
      .eql(["spectrum-Heading"].concat(assertions.classNames));
    if (assertions.style) {
      await t.expect(selector.getAttribute("style")).eql(assertions.style);
    } else {
      await t
        .expect(selector.getAttribute("style"))
        .notOk("Style found when no style was expected.");
    }
  });
});
