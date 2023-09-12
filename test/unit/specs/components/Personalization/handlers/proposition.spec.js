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
import {
  createProposition,
  buildReturnedDecisions,
  buildReturnedPropositions
} from "../../../../../../src/components/Personalization/handlers/proposition";

describe("Personalization::handlers", () => {
  describe("createProposition", () => {
    it("returns the handle", () => {
      const handle = { id: "id", scope: "scope", scopeDetails: "scopeDetails" };
      const proposition = createProposition(handle);
      expect(proposition.getHandle()).toEqual(handle);
    });
    it("is okay with an empty handle", () => {
      const proposition = createProposition({});
      expect(proposition.getHandle()).toEqual({});
    });
    it("returns the item meta", () => {
      const handle = {
        id: "id",
        scope: "scope",
        scopeDetails: "scopeDetails",
        other: "other",
        items: [{}]
      };
      const proposition = createProposition(handle);
      expect(proposition.getItemMeta(0)).toEqual({
        id: "id",
        scope: "scope",
        scopeDetails: "scopeDetails"
      });
    });
    it("extracts the trackingLabel in the item meta", () => {
      const handle = {
        id: "id",
        scope: "scope",
        scopeDetails: "scopeDetails",
        items: [
          { characteristics: { trackingLabel: "trackingLabel1" } },
          { characteristics: { trackingLabel: "trackingLabel2" } }
        ]
      };
      const proposition = createProposition(handle);
      expect(proposition.getItemMeta(1)).toEqual({
        id: "id",
        scope: "scope",
        scopeDetails: "scopeDetails",
        trackingLabel: "trackingLabel2"
      });
    });
    it("saves the redirect", () => {
      const proposition = createProposition({
        id: "id1",
        items: [{ a: 1 }, { b: 2 }]
      });
      proposition.redirect("redirectUrl");
      expect(proposition.getRedirectUrl()).toEqual("redirectUrl");
    });
    it("includes the redirect in the notifications", () => {
      const proposition = createProposition({
        id: "id1",
        items: [{ a: 1 }, { b: 2 }]
      });
      proposition.redirect("redirectUrl");
      const notifications = [];
      proposition.addToNotifications(notifications);
      expect(notifications).toEqual([
        { id: "id1", scope: undefined, scopeDetails: undefined }
      ]);
    });
    it("includes the redirect in the returned propositions", () => {
      const proposition = createProposition({
        id: "id1",
        items: [{ a: 1 }, { b: 2 }]
      });
      proposition.redirect("redirectUrl");
      const propositions = [];
      proposition.addToReturnedPropositions(propositions);
      expect(propositions).toEqual([
        { id: "id1", items: [{ a: 1 }, { b: 2 }], renderAttempted: true }
      ]);
    });
    it("doesn't include the redirect in the returned decisions", () => {
      const proposition = createProposition({
        id: "id1",
        items: [{ a: 1 }, { b: 2 }]
      });
      proposition.redirect("redirectUrl");
      const decisions = [];
      proposition.addToReturnedDecisions(decisions);
      expect(decisions).toEqual([]);
    });
    it("returns undefined for the redirect URL when it is not set", () => {
      const proposition = createProposition({
        id: "id1",
        items: [{ a: 1 }, { b: 2 }]
      });
      expect(proposition.getRedirectUrl()).toBeUndefined();
    });
    it("includes the proposition in the returned propositions when not rendered", () => {
      const proposition = createProposition({
        id: "id1",
        items: [{ a: 1 }, { b: 2 }]
      });
      const propositions = [];
      proposition.addToReturnedPropositions(propositions);
      expect(propositions).toEqual([
        { id: "id1", items: [{ a: 1 }, { b: 2 }], renderAttempted: false }
      ]);
    });
    it("includes the proposition in the returned decisions when not rendered", () => {
      const proposition = createProposition({
        id: "id1",
        items: [{ a: 1 }, { b: 2 }]
      });
      const decisions = [];
      proposition.addToReturnedDecisions(decisions);
      expect(decisions).toEqual([{ id: "id1", items: [{ a: 1 }, { b: 2 }] }]);
    });
    it("does not include the notification if it isn't rendered", () => {
      const proposition = createProposition({
        id: "id1",
        items: [{ a: 1 }, { b: 2 }]
      });
      const notifications = [];
      proposition.addToNotifications(notifications);
      expect(notifications).toEqual([]);
    });
    it("handles a completely rendered item", async () => {
      const proposition = createProposition({
        id: "id1",
        items: [{ a: 1 }, { b: 2 }]
      });
      proposition.includeInDisplayNotification();
      proposition.addRenderer(0, () => {});
      proposition.addRenderer(1, () => {});

      const notification = await proposition.render({ enabled: false });
      expect(notification).toEqual({
        id: "id1",
        scope: undefined,
        scopeDetails: undefined
      });
      const propositions = [];
      proposition.addToReturnedPropositions(propositions);
      expect(propositions).toEqual([
        { id: "id1", items: [{ a: 1 }, { b: 2 }], renderAttempted: true }
      ]);
      const decisions = [];
      proposition.addToReturnedDecisions(decisions);
      expect(decisions).toEqual([]);
    });
    it("handles a partially rendered item", async () => {
      const proposition = createProposition({
        id: "id1",
        items: [{ a: 1 }, { b: 2 }]
      });
      proposition.includeInDisplayNotification();
      proposition.addRenderer(0, () => {});

      const notification = await proposition.render({ enabled: false });
      expect(notification).toEqual({
        id: "id1",
        scope: undefined,
        scopeDetails: undefined
      });
      const propositions = [];
      proposition.addToReturnedPropositions(propositions);
      expect(propositions).toEqual([
        { id: "id1", items: [{ a: 1 }], renderAttempted: true },
        { id: "id1", items: [{ b: 2 }], renderAttempted: false }
      ]);
      const decisions = [];
      proposition.addToReturnedDecisions(decisions);
      expect(decisions).toEqual([{ id: "id1", items: [{ b: 2 }] }]);
    });
    it("renders items", async () => {
      const logger = jasmine.createSpyObj("logger", ["info", "warn"]);
      logger.enabled = true;
      const renderer1 = jasmine.createSpy("renderer1");
      const renderer2 = jasmine.createSpy("renderer2");
      const proposition = createProposition({
        id: "id1",
        items: [{ a: 1 }, { b: 2 }]
      });
      proposition.includeInDisplayNotification();
      proposition.addRenderer(0, renderer1);
      proposition.addRenderer(1, renderer2);
      await proposition.render(logger);
      expect(renderer1).toHaveBeenCalledTimes(1);
      expect(renderer2).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith(`Action {"a":1} executed.`);
      expect(logger.info).toHaveBeenCalledWith(`Action {"b":2} executed.`);
    });
  });

  describe("buildReturnedDecisions", () => {
    let p1;
    let p2;
    let p3;

    beforeEach(() => {
      p1 = jasmine.createSpyObj("p1", ["addToReturnedDecisions"]);
      p2 = jasmine.createSpyObj("p2", ["addToReturnedDecisions"]);
      p3 = jasmine.createSpyObj("p3", ["addToReturnedDecisions"]);
    });

    it("returns empty array when no propositions", () => {
      const returnedDecisions = buildReturnedDecisions([]);
      expect(returnedDecisions).toEqual([]);
    });
    it("returns added decisions", () => {
      p1.addToReturnedDecisions.and.callFake(array => {
        array.push("decision1");
      });
      p3.addToReturnedDecisions.and.callFake(array => {
        array.push("decision3");
      });
      const returnedDecisions = buildReturnedDecisions([p1, p2, p3]);
      expect(returnedDecisions).toEqual(["decision1", "decision3"]);
    });
  });

  describe("buildReturnedPropositions", () => {
    let p1;
    let p2;
    let p3;

    beforeEach(() => {
      p1 = jasmine.createSpyObj("p1", ["addToReturnedPropositions"]);
      p2 = jasmine.createSpyObj("p2", ["addToReturnedPropositions"]);
      p3 = jasmine.createSpyObj("p3", ["addToReturnedPropositions"]);
    });

    it("returns empty array when no propositions", () => {
      const returnedPropositions = buildReturnedPropositions([]);
      expect(returnedPropositions).toEqual([]);
    });
    it("returns added propositions", () => {
      p1.addToReturnedPropositions.and.callFake(array => {
        array.push("proposition1");
      });
      p3.addToReturnedPropositions.and.callFake(array => {
        array.push("proposition3");
      });
      const returnedPropositions = buildReturnedPropositions([p1, p2, p3]);
      expect(returnedPropositions).toEqual(["proposition1", "proposition3"]);
    });
  });
});
