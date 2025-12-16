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
import { describe, it, expect } from "vitest";
import validateMessage from "../../../../../src/components/BrandConcierge/validateMessage.js";

describe("BrandConcierge::validateMessage", () => {
  describe("Valid Cases", () => {
    it("should accept valid message string", () => {
      const options = { message: "Hello, I need help" };
      expect(() => {
        validateMessage({ options });
      }).not.toThrowError();
    });

    it("should accept XDM with interactionId and conversationId", () => {
      const options = {
        xdm: {
          interactionId: "test-interaction-id",
          conversationId: "test-conversation-id",
        },
      };
      expect(() => {
        validateMessage({ options });
      }).not.toThrowError();
    });

    it("should accept XDM with full feedback object", () => {
      const options = {
        xdm: {
          conversation: {
            feedback: {
              classification: "positive",
              comment: "Great service!",
              reasons: ["helpful", "fast"],
            },
          },
        },
      };
      expect(() => {
        validateMessage({ options });
      }).not.toThrowError();
    });

    it("should accept empty XDM object", () => {
      const options = { xdm: {} };
      expect(() => {
        validateMessage({ options });
      }).not.toThrowError();
    });

    it("should accept data with type and payload", () => {
      const options = {
        data: {
          type: "feedback",
          payload: {
            rating: 5,
            comment: "Excellent!",
          },
        },
      };
      expect(() => {
        validateMessage({ options });
      }).not.toThrowError();
    });
  });

  describe("Error Cases - Invalid Types", () => {
    it("should throw error when xdm.interactionId is not a string", () => {
      const options = {
        xdm: {
          interactionId: 123,
        },
      };
      expect(() => {
        validateMessage({ options });
      }).toThrowError();
    });

    it("should throw error when feedback.reasons contains non-strings", () => {
      const options = {
        xdm: {
          conversation: {
            feedback: {
              reasons: ["valid", 123],
            },
          },
        },
      };
      expect(() => {
        validateMessage({ options });
      }).toThrowError();
    });
  });

  describe("Permissive Behavior - Accepts Extra Fields", () => {
    it("should accept message with extra fields (anyOf matches first schema)", () => {
      const options = {
        message: "Hello",
        xdm: {
          interactionId: "test",
        },
      };
      expect(() => {
        validateMessage({ options });
      }).not.toThrowError();
    });

    it("should accept message with unknown fields", () => {
      const options = {
        message: "Hello",
        unknownField: "value",
      };
      expect(() => {
        validateMessage({ options });
      }).not.toThrowError();
    });
  });
});
