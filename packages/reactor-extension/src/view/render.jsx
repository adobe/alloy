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

import { Provider, lightTheme } from "@adobe/react-spectrum";
import { Provider as SpectrumProvider } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import ErrorBoundary from "./components/errorBoundary";
import "./global.css";
import monitorForOriginatingErrors from "./utils/monitorForOriginatingErrors";

monitorForOriginatingErrors();

const container = document.getElementById("root");
const root = createRoot(container);

// The style macro is evaluated at build time, so a runtime `noPadding` cannot
// live inside a single style() call. Precompute both variants and pick one.
const paddedStyles = style({
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  padding: 8,
});
const flushStyles = style({
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  padding: 0,
});

// The S2 provider is nested inside the v3 provider so views can hold both
// Spectrum versions while they migrate one page at a time. S2 requires the
// innermost provider. Both are removed down to one once migration completes.
export default (View, { noPadding = false } = {}) => {
  root.render(
    <Provider
      theme={lightTheme}
      colorScheme="light"
      UNSAFE_className="react-spectrum-provider spectrum spectrum--medium spectrum--light spectrum-accessibility-overrides"
    >
      <SpectrumProvider
        background="base"
        colorScheme="light"
        styles={noPadding ? flushStyles : paddedStyles}
      >
        <ErrorBoundary>
          <View />
        </ErrorBoundary>
      </SpectrumProvider>
    </Provider>,
  );
};
