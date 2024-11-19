/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import {createNode} from "../../utils/dom/index.js";

const createBrandConcierge = ({
                                eventManager,
                              }) => {
  console.log("blah");
  window.addEventListener("message", (message) => {

    const event = eventManager.createEvent();
    eventManager.sendEvent(event);
  });
    return {
      lifecycle: {
        onResponse: ({response}) => {
          const iframe = document.getElementById("alloy-bc");
          if(!iframe) {
            const handles = response.getPayloadsByType("brandConcierge:configuration");
            const element = createNode("iframe", {
              src: "http://localhost:8081",
              id: "alloy-bc",
            });
            const parent = document.querySelector("BODY");
            parent.appendChild(element);
          }
        },
      }
    };
};
  createBrandConcierge.namespace = "BrandConcierge";

  export default createBrandConcierge;
