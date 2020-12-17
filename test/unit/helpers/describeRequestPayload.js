/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/**
 * Tests the base methods that all types of request payloads share.
 */
export default createPayload => {
  describe("base request payload functionality", () => {
    let payload;

    beforeEach(() => {
      payload = createPayload();
    });

    it("merges state", () => {
      payload.mergeState({
        fruit: {
          name: "banana"
        },
        vegetable: {
          name: "carrot"
        }
      });
      payload.mergeState({
        fruit: {
          name: "apple",
          calories: 105
        },
        vegetable: {
          calories: 25
        }
      });

      // We don't evaluate the entire `state` object because the request
      // modules that leverage this base request may have added other things
      // to `state` as well. For that reason, we just evaluate the fruit
      // and vegetable.
      const postSerializationPayload = JSON.parse(JSON.stringify(payload));
      expect(postSerializationPayload.meta.state.fruit).toEqual({
        name: "apple",
        calories: 105
      });
      expect(postSerializationPayload.meta.state.vegetable).toEqual({
        name: "carrot",
        calories: 25
      });
    });

    it("merges query", () => {
      payload.mergeQuery({
        fruit: {
          name: "banana"
        },
        vegetable: {
          name: "carrot"
        }
      });
      payload.mergeQuery({
        fruit: {
          name: "apple",
          calories: 105
        },
        vegetable: {
          calories: 25
        }
      });
      // We don't evaluate the entire `query` object because the request
      // modules that leverage this base request may have added other things
      // to `query` as well. For that reason, we just evaluate the fruit
      // and vegetable.
      const postSerializationPayload = JSON.parse(JSON.stringify(payload));
      expect(postSerializationPayload.query.fruit).toEqual({
        name: "apple",
        calories: 105
      });
      expect(postSerializationPayload.query.vegetable).toEqual({
        name: "carrot",
        calories: 25
      });
    });
  });
};
