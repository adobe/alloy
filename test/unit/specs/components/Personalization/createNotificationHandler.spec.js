/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import createNotificationHandler from "../../../../../src/components/Personalization/createNotificationHandler";

describe("Personalization::createNotificationHandler", () => {
  let collect;
  let renderedPropositions;
  let notificationHandler;
  const NOTIFICATIONS = [
    {
      id: "abc",
      scope: "web://localhost:3000/inAppMessages",
      scopeDetails: {
        activity: {
          id: "abc#123"
        }
      }
    }
  ];

  beforeEach(() => {
    collect = jasmine.createSpy("collect").and.returnValue(Promise.resolve());

    renderedPropositions = jasmine.createSpyObj("renderedPropositions", [
      "concat"
    ]);

    notificationHandler = createNotificationHandler(
      collect,
      renderedPropositions
    );
  });

  it("emits a notification immediately", () => {
    const handleNotifications = notificationHandler(true, true, "foo");
    handleNotifications(NOTIFICATIONS);
    expect(collect).toHaveBeenCalledOnceWith({
      decisionsMeta: NOTIFICATIONS,
      viewName: "foo"
    });
  });

  it("defers the notification", () => {
    const handleNotifications = notificationHandler(true, false, undefined);
    handleNotifications(NOTIFICATIONS);

    expect(collect).not.toHaveBeenCalled();
    expect(renderedPropositions.concat).toHaveBeenCalledTimes(1);
  });

  it("doesn't do anything if renderDecisions is false", () => {
    notificationHandler(false, true, undefined);
    expect(renderedPropositions.concat).not.toHaveBeenCalled();
  });
});
