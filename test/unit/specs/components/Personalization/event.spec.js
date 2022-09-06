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

import {
  mergeDecisionsMeta,
  mergeQuery,
  mergeMeta
} from "../../../../../src/components/Personalization/event";

describe("Personalization::event", () => {
  let event;

  beforeEach(() => {
    event = jasmine.createSpyObj("event", [
      "mergeXdm",
      "mergeQuery",
      "mergeMeta"
    ]);
  });

  describe("mergeDecisionsMeta", () => {
    it("merges decisions meta", () => {
      const decisionsMeta = [
        {
          id: "abc",
          scope: "home"
        },
        {
          id: "def",
          scope: "cart"
        }
      ];
      mergeDecisionsMeta(event, decisionsMeta);
      expect(event.mergeXdm).toHaveBeenCalledWith({
        _experience: {
          decisioning: {
            propositions: [
              {
                id: "abc",
                scope: "home"
              },
              {
                id: "def",
                scope: "cart"
              }
            ]
          }
        }
      });
    });
  });

  describe("mergeQuery", () => {
    it("merges query details", () => {
      const details = {
        foo: "bar"
      };
      mergeQuery(event, details);
      expect(event.mergeQuery).toHaveBeenCalledWith({
        personalization: {
          foo: "bar"
        }
      });
    });
  });

  describe("mergeMeta", () => {
    it("merges meta details", () => {
      const meta = {
        foo: "bar"
      };
      mergeMeta(event, meta);
      expect(event.mergeMeta).toHaveBeenCalledWith({
        target: {
          foo: "bar"
        }
      });
    });
  });
});
