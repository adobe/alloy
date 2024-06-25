/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import createEvent from "../../../../src/core/createEvent.js";

describe("createEvent", () => {
  let event;

  beforeEach(() => {
    event = createEvent();
  });

  it("deeply merges XDM with user-provided XDM merged last", () => {
    event.setUserXdm({
      fruit: {
        type: "apple",
      },
      veggie: {
        type: "carrot",
      },
    });
    event.mergeXdm({
      fruit: {
        type: "strawberry",
      },
      sport: {
        type: "basketball",
      },
    });
    event.mergeXdm();
    event.mergeXdm(null);
    event.mergeXdm({
      sport: {
        type: "football",
      },
      game: {
        type: "clue",
      },
    });
    event.finalize();
    expect(event.toJSON()).toEqual({
      xdm: {
        fruit: {
          type: "apple",
        },
        veggie: {
          type: "carrot",
        },
        sport: {
          type: "football",
        },
        game: {
          type: "clue",
        },
      },
    });
  });

  it("does not modify the original user XDM object", () => {
    const dataLayer = {
      fruit: {
        type: "apple",
      },
      veggie: {
        type: "carrot",
      },
    };
    event.setUserXdm(dataLayer);
    event.mergeXdm({
      fruit: {
        type: "strawberry",
      },
      sport: {
        type: "basketball",
      },
    });
    expect(dataLayer).toEqual({
      fruit: {
        type: "apple",
      },
      veggie: {
        type: "carrot",
      },
    });
  });

  it("handles undefined user XDM", () => {
    event.setUserXdm(undefined);
    event.mergeXdm({
      fruit: "apple",
    });
    event.finalize();
    expect(event.toJSON()).toEqual({
      xdm: {
        fruit: "apple",
      },
    });
  });

  it("sets user data", () => {
    event.setUserData({ fruit: "apple" });
    event.setUserData({ veggie: "carrot" });
    event.finalize();
    expect(event.toJSON()).toEqual({
      data: {
        veggie: "carrot",
      },
    });
  });

  it("handles undefined user data", () => {
    event.setUserData(undefined);
    event.finalize();
    expect(event.toJSON()).toEqual({});
  });

  it("deeply merges meta", () => {
    event.mergeMeta({
      fruit: {
        type: "strawberry",
      },
      sport: {
        type: "basketball",
      },
    });
    event.mergeMeta({
      sport: {
        type: "football",
      },
      game: {
        type: "clue",
      },
    });
    event.mergeMeta();
    event.mergeMeta(null);
    event.finalize();
    expect(event.toJSON()).toEqual({
      meta: {
        fruit: {
          type: "strawberry",
        },
        sport: {
          type: "football",
        },
        game: {
          type: "clue",
        },
      },
    });
  });

  it("deeply merges query", () => {
    event.mergeQuery({
      fruit: {
        type: "strawberry",
      },
      sport: {
        type: "basketball",
      },
    });
    event.mergeQuery({
      sport: {
        type: "football",
      },
      game: {
        type: "clue",
      },
    });
    event.mergeQuery();
    event.mergeQuery(null);
    event.finalize();
    expect(event.toJSON()).toEqual({
      query: {
        fruit: {
          type: "strawberry",
        },
        sport: {
          type: "football",
        },
        game: {
          type: "clue",
        },
      },
    });
  });

  it("sets documentUnloading", () => {
    expect(event.getDocumentMayUnload()).toBeFalse();
    event.documentMayUnload();
    expect(event.getDocumentMayUnload()).toBeTrue();
  });

  it("throws error when mergeXdm called after finalize", () => {
    event.setUserXdm({ web: {} });
    event.finalize();
    expect(() => event.mergeXdm({ a: "b" })).toThrowError(
      "mergeXdm cannot be called after event is finalized.",
    );
  });

  it("throws error when toJSON called before finalize", () => {
    event.setUserXdm({ web: {} });
    expect(() => event.toJSON()).toThrowError("toJSON called before finalize");
  });

  it("reports whether the event is empty", () => {
    expect(event.isEmpty()).toBeTrue();
    event.setUserData({ foo: "bar" });
    expect(event.isEmpty()).toBeFalse();
  });
  it("returns undefined when no viewName exists", () => {
    expect(event.getViewName()).toBe(undefined);
    event.setUserXdm({ web: {} });
    expect(event.getViewName()).toBe(undefined);
    event.setUserXdm({ web: { webPageDetails: {} } });
    expect(event.getViewName()).toBe(undefined);
  });
  it("returns viewName when viewName exists", () => {
    event.setUserXdm({ web: { webPageDetails: { viewName: "cart" } } });
    expect(event.getViewName()).toBe("cart");
  });
  describe("applyCallback", () => {
    it("can add fields to empty xdm", () => {
      const callback = ({ xdm, data }) => {
        xdm.a = "1";
        data.b = "2";
      };
      const subject = createEvent();
      subject.finalize(callback);
      expect(subject.toJSON()).toEqual({ xdm: { a: "1" }, data: { b: "2" } });
    });

    it("can add fields to an existing xdm", () => {
      const callback = ({ xdm, data }) => {
        xdm.b = "2";
        data.b = "2";
      };
      const subject = createEvent();
      subject.setUserData({ a: "1" });
      subject.setUserXdm({ a: "1" });
      subject.finalize(callback);
      expect(subject.toJSON()).toEqual({
        xdm: { a: "1", b: "2" },
        data: { a: "1", b: "2" },
      });
    });

    it("can remove fields", () => {
      const callback = ({ xdm, data }) => {
        delete xdm.a;
        delete data.a;
      };
      const subject = createEvent();
      subject.setUserXdm({ a: "1", b: "2" });
      subject.setUserData({ a: "1", b: "2" });
      subject.finalize(callback);
      expect(subject.toJSON()).toEqual({ xdm: { b: "2" }, data: { b: "2" } });
    });

    it("can set xdm or data to empty objects", () => {
      const callback = (content) => {
        content.xdm = {};
        content.data = {};
      };
      const subject = createEvent();
      subject.setUserXdm({ a: "1", b: "2" });
      subject.setUserData({ a: "1", b: "2" });
      subject.finalize(callback);
      expect(subject.toJSON()).toEqual({});
    });

    it("can delete xdm or data objects", () => {
      const callback = (content) => {
        delete content.xdm;
        delete content.data;
      };
      const subject = createEvent();
      subject.setUserXdm({ a: "1", b: "2" });
      subject.setUserData({ a: "1", b: "2" });
      subject.finalize(callback);
      expect(subject.toJSON()).toEqual({});
    });

    it("event merges when there is an error", () => {
      const callback = ({ xdm, data }) => {
        delete xdm.a;
        xdm.c = "3";
        delete data.a;
        data.c = "3";
        throw new Error("Expected Error");
      };
      const subject = createEvent();
      subject.setUserXdm({ a: "1", b: "2" });
      subject.setUserData({ a: "1", b: "2" });
      expect(() => subject.finalize(callback)).toThrowError("Expected Error");
      expect(subject.toJSON()).toEqual({
        xdm: { b: "2", c: "3" },
        data: { b: "2", c: "3" },
      });
    });

    it("event shouldSend should be true when callback returns undefined", () => {
      const callback = () => {
        return undefined;
      };
      const subject = createEvent();
      subject.finalize(callback);
      expect(subject.shouldSend()).toBeTrue();
    });

    it("event shouldSend should be true when callback returns true", () => {
      const callback = () => {
        return true;
      };
      const subject = createEvent();
      subject.finalize(callback);
      expect(subject.shouldSend()).toBeTrue();
    });

    it("event shouldSend should be false when callback throws error", () => {
      const callback = () => {
        throw new Error("Expected Error");
      };
      const subject = createEvent();
      expect(() => subject.finalize(callback)).toThrowError("Expected Error");
      expect(subject.shouldSend()).toBeFalse();
    });

    it("event shouldSend should be false when callback returns false", () => {
      const callback = () => {
        return false;
      };
      const subject = createEvent();
      subject.finalize(callback);
      expect(subject.shouldSend()).toBeFalse();
    });

    it("can replace xdm or data", () => {
      const callback = (content) => {
        content.xdm = { a: "1" };
        content.data = { b: "2" };
      };

      const subject = createEvent();
      subject.setUserXdm({ c: "3" });
      subject.setUserData({ d: "4" });
      subject.finalize(callback);
      expect(subject.toJSON()).toEqual({
        xdm: { a: "1" },
        data: { b: "2" },
      });
    });
  });

  it("deduplicates propositions by id", () => {
    const subject = createEvent();
    subject.mergeXdm({
      _experience: {
        decisioning: {
          propositions: [
            { id: "1", scope: "a" },
            { id: "2", scope: "a" },
          ],
        },
      },
    });
    subject.setUserXdm({
      _experience: {
        decisioning: {
          propositions: [
            { id: "2", scope: "a" },
            { id: "3", scope: "a" },
            { id: "3", scope: "a" },
          ],
        },
      },
    });
    subject.finalize();
    expect(subject.toJSON()).toEqual({
      xdm: {
        _experience: {
          decisioning: {
            propositions: [
              { id: "2", scope: "a" },
              { id: "3", scope: "a" },
              { id: "1", scope: "a" },
            ],
          },
        },
      },
    });
  });
});
