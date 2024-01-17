/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import "core-js/stable";
import "regenerator-runtime/runtime";
import React from "react";
import ReactDOM from "react-dom";
import { Provider, defaultTheme } from "@adobe/react-spectrum";
import "@adobe/spectrum-css/dist/spectrum-core.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(
  <Provider theme={defaultTheme}>
    <App />
  </Provider>,
  document.getElementById("root")
);

serviceWorker.unregister();
