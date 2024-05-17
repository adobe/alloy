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
import handleRequestFailure from "../../../../../src/core/edgeNetwork/handleRequestFailure.js";

describe("handleRequestFailure", () => {
  it("works", () => {
    const onRequestFailureCallbackAggregator = jasmine.createSpyObj(
      "onRequestFailureCallbackAggregator",
      ["add", "call"],
    );

    onRequestFailureCallbackAggregator.call.and.returnValue(Promise.resolve());

    const error = new Error("woopsie");

    handleRequestFailure(onRequestFailureCallbackAggregator)(error).catch(
      (err) => {
        expect(onRequestFailureCallbackAggregator.call).toHaveBeenCalledWith({
          error,
        });
        expect(err).toEqual(error);
      },
    );
  });
});
