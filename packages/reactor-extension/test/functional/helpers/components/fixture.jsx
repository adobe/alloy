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

import { createRoot } from "react-dom/client";
import { lightTheme, Provider } from "@adobe/react-spectrum";
import deserializeReactElement from "./deserializeReactElement.mjs";
import Heading from "../../../../src/view/components/typography/heading";
import Body from "../../../../src/view/components/typography/body";

const container = document.getElementById("root");
const root = createRoot(container);

// If you're adding tests for a component, be sure to add the component here.
const components = {
  Heading,
  Body,
};

window.renderSerializedReactElement = (element) => {
  const deserializedReactElement = deserializeReactElement({
    element,
    components,
  });

  root.render(
    <Provider
      theme={lightTheme}
      colorScheme="light"
      UNSAFE_className="react-spectrum-provider"
    >
      {deserializedReactElement}
    </Provider>,
  );
};
