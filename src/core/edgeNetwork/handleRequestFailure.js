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
export default (onRequestFailureCallbackAggregator) => {
  return (error) => {
    // Regardless of whether the network call failed, an unexpected status
    // code was returned, or the response body was malformed, we want to call
    // the onRequestFailure callbacks, but still throw the exception.
    const throwError = () => {
      throw error;
    };
    return onRequestFailureCallbackAggregator
      .call({ error })
      .then(throwError, throwError);
  };
};
