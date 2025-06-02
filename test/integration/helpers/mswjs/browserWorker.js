/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { setupWorker } from "msw/browser";
import { networkRecorder } from "./networkRecorder.js";

const createWorker = () => {
  const worker = setupWorker();

  const originalUse = worker.use;

  worker.use = (...handlers) => {
    if (import.meta.env.VITE_BYPASS_HANDLERS === "true") {
      handlers = [];
    }

    return originalUse.apply(worker, handlers);
  };

  // Add a response transformer to record all requests/responses
  worker.events.on("request:start", ({ request, requestId }) => {
    networkRecorder.captureRequest({ request, requestId });
  });

  worker.events.on("response:mocked", ({ request, requestId, response }) => {
    networkRecorder.captureResponse({ request, requestId, response });
  });

  worker.events.on("response:bypass", ({ request, requestId, response }) => {
    networkRecorder.captureResponse({ request, requestId, response });
  });

  return worker;
};

export { createWorker };
