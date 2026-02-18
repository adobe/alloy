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

import { useState } from "react";

// We have a top-level error boundary for displaying errors that would be
// considered fatal. Error boundaries only catch errors in certain
// circumstances (https://reactjs.org/docs/error-boundaries.html) and does not
// catch errors that are the result of an asynchronous operation.
// This modules is a hook that allows us to report any async errors that we
// catch that we want to bubble up to the top-level error boundary for display.
// https://github.com/facebook/react/issues/14981#issuecomment-468460187
// If you pass a function then this hook will return the function wrapped with
// a try catch that reports the async error. Otherwise this will return a function
// that you can call with the error to display.
const useReportAsyncError = (func) => {
  const [, setState] = useState();

  if (func) {
    return (...args) => {
      async function fn() {
        try {
          return await func(...args);
        } catch (e) {
          if (e.name !== "AbortError") {
            setState(() => {
              throw e;
            });
          }
          throw e;
        }
      }

      return fn();
    };
  }

  return (error) => {
    setState(() => {
      throw error;
    });
  };
};

export default useReportAsyncError;
