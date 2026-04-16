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
  title: "Body component",
});

const scenarios = [
  {
    props: {
      size: "XXXL",
    },
    assertions: {
      classNames: ["spectrum-Body--sizeXXXL"],
    },
  },
  {
    props: {
      size: "XXL",
    },
    assertions: {
      classNames: ["spectrum-Body--sizeXXL"],
    },
  },
  {
    props: {
      size: "XL",
    },
    assertions: {
      classNames: ["spectrum-Body--sizeXL"],
    },
  },
  {
    props: {
      size: "L",
    },
    assertions: {
      classNames: ["spectrum-Body--sizeL"],
    },
  },
  {
    props: {
      size: "M",
    },
    assertions: {
      classNames: ["spectrum-Body--sizeM"],
    },
  },
  {
    props: {
      size: "S",
    },
    assertions: {
      classNames: ["spectrum-Body--sizeS"],
    },
  },
  {
    props: {
      size: "XS",
    },
    assertions: {
      classNames: ["spectrum-Body--sizeXS"],
    },
  },
  {
    props: {
      size: "XXS",
    },
    assertions: {
      classNames: ["spectrum-Body--sizeXXS"],
    },
  },
  {
    props: {
      marginTop: "size-300",
    },
    assertions: {
      classNames: ["spectrum-Body--sizeS"],
      style:
        "margin-top: var(--spectrum-global-dimension-size-300, var(--spectrum-alias-size-300);",
    },
  },
  {
    props: {
      marginBottom: "size-300",
    },
    assertions: {
      classNames: ["spectrum-Body--sizeS"],
      style:
        "margin-bottom: var(--spectrum-global-dimension-size-300, var(--spectrum-alias-size-300);",
    },
  },
  {
    props: {},
    assertions: {
      classNames: ["spectrum-Body--sizeS"],
    },
  },
];

scenarios.forEach(({ props, assertions }) => {
  test(`renders with props: ${JSON.stringify(props)}`, async () => {
    const element = {
      type: "Body",
      props: {
        ...props,
        children: "Test Body",
      },
      key: null,
    };
    await renderReactElement(element);
    const selector = Selector("p");
    await t.expect(selector.textContent).eql("Test Body");
    await t
      .expect(selector.classNames)
      .eql(["spectrum-Body"].concat(assertions.classNames));
    if (assertions.style) {
      await t.expect(selector.getAttribute("style")).eql(assertions.style);
    } else {
      await t
        .expect(selector.getAttribute("style"))
        .notOk("Style found when no style was expected.");
    }
  });
});
