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
let globalSuppressReactErrorBoundaryMessage = false;
let globalUnexpectedErrorMessagesLogged = 0;

const reactErrorBoundaryMessage =
  "React will try to recreate this component tree";
const originalConsoleError = console.error;

export const wrappedConsoleError = (...args) => {
  if (globalSuppressReactErrorBoundaryMessage) {
    for (const arg of args) {
      if (String(arg).includes(reactErrorBoundaryMessage)) {
        return;
      }
    }
  }
  originalConsoleError.apply(console, args);
  globalUnexpectedErrorMessagesLogged += 1;
};

export const suppressReactErrorBoundaryMessage = () => {
  globalSuppressReactErrorBoundaryMessage = true;
};

export const resetErrorSuppression = () => {
  const savedErrorNumber = globalUnexpectedErrorMessagesLogged;
  globalSuppressReactErrorBoundaryMessage = false;
  globalUnexpectedErrorMessagesLogged = 0;
  if (savedErrorNumber > 0) {
    throw new Error(
      `${savedErrorNumber} unexpected error(s) were logged to the console.`,
    );
  }
};
