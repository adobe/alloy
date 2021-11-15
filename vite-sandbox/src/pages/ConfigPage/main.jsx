import * as React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import ConfigurationPage from "./App";

ReactDOM.render(
  <React.StrictMode>
    {/* "Mount" this app under the /ConfigPage URL pathname. All routes and links
        are relative to this name. */}
    <BrowserRouter basename="/config">
      <ConfigurationPage />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
