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

    it("should accept message with onStreamResponse callback", () => {
      const options = {
        message: "Hello",
        onStreamResponse: () => {},
      };
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

    it("should accept XDM with only interactionId", () => {
      const options = {
        xdm: {
          interactionId: "test-interaction-id",
        },
      };
      expect(() => {
        validateMessage({ options });
      }).not.toThrowError();
    });

    it("should accept XDM with only conversationId", () => {
      const options = {
        xdm: {
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

    it("should accept XDM with partial feedback object", () => {
      const options = {
        xdm: {
          conversation: {
            feedback: {
              classification: "negative",
            },
          },
        },
      };
      expect(() => {
        validateMessage({ options });
      }).not.toThrowError();
    });

    it("should accept XDM with feedback containing only reasons array", () => {
      const options = {
        xdm: {
          conversation: {
            feedback: {
              reasons: ["unclear", "slow"],
            },
          },
        },
      };
      expect(() => {
        validateMessage({ options });
      }).not.toThrowError();
    });

    it("should accept XDM with empty reasons array", () => {
      const options = {
        xdm: {
          conversation: {
            feedback: {
              reasons: [],
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

    it("should accept data with type and empty payload", () => {
      const options = {
        data: {
          type: "event",
          payload: {},
        },
      };
      expect(() => {
        validateMessage({ options });
      }).not.toThrowError();
    });

    it("should accept data with onStreamResponse callback", () => {
      const options = {
        data: {
          type: "action",
          payload: {},
        },
        onStreamResponse: () => {},
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

    it("should throw error when xdm.conversationId is not a string", () => {
      const options = {
        xdm: {
          conversationId: 456,
        },
      };
      expect(() => {
        validateMessage({ options });
      }).toThrowError();
    });

    it("should throw error when feedback.classification is not a string", () => {
      const options = {
        xdm: {
          conversation: {
            feedback: {
              classification: true,
            },
          },
        },
      };
      expect(() => {
        validateMessage({ options });
      }).toThrowError();
    });

    it("should throw error when feedback.comment is not a string", () => {
      const options = {
        xdm: {
          conversation: {
            feedback: {
              comment: { text: "invalid" },
            },
          },
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

    it("should throw error when feedback.reasons is not an array", () => {
      const options = {
        xdm: {
          conversation: {
            feedback: {
              reasons: "not-an-array",
            },
          },
        },
      };
      expect(() => {
        validateMessage({ options });
      }).toThrowError();
    });

  });

  describe("AnyOf Permissive Behavior", () => {
    // Note: Due to anyOf behavior, invalid data/message values can pass through
    // the xdm schema which is permissive (xdm field is optional).
    // These tests verify the actual validator behavior.

    it("should accept data with invalid type because xdm schema is permissive", () => {
      const options = {
        data: {
          type: 123,
          payload: {},
        },
      };
      // Does not throw - passes through xdm schema which doesn't require xdm field
      expect(() => {
        validateMessage({ options });
      }).not.toThrowError();
    });

    it("should accept data with missing type because xdm schema is permissive", () => {
      const options = {
        data: {
          payload: {},
        },
      };
      // Does not throw - passes through xdm schema
      expect(() => {
        validateMessage({ options });
      }).not.toThrowError();
    });

    it("should accept message with invalid type because xdm schema is permissive", () => {
      const options = {
        message: 123,
      };
      // Does not throw - passes through xdm schema
      expect(() => {
        validateMessage({ options });
      }).not.toThrowError();
    });

    it("should accept invalid onStreamResponse because xdm schema is permissive", () => {
      const options = {
        message: "Hello",
        onStreamResponse: "not-a-function",
      };
      // Does not throw - passes through xdm schema
      expect(() => {
        validateMessage({ options });
      }).not.toThrowError();
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
