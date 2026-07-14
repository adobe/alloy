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

const VISITOR_LIBRARY_URL = "/sandboxes/browser/public/e2e/js/visitor.5.js";

export default () => {
  if (window.Visitor) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = VISITOR_LIBRARY_URL;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Failed to load Visitor.js"));
    document.head.appendChild(script);
  });
};
