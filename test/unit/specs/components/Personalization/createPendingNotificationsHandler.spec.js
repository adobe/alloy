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
import createPendingNotificationsHandler from "../../../../../src/components/Personalization/createPendingNotificationsHandler";

describe("Personalization::createPendingNotificationsHandler", () => {
  let pendingDisplayNotifications;
  let mergeDecisionsMeta;
  let event;
  let pendingNotificationsHandler;

  beforeEach(() => {
    pendingDisplayNotifications = jasmine.createSpyObj(
      "pendingDisplayNotifications",
      ["clear"]
    );
    mergeDecisionsMeta = jasmine.createSpy("mergeDecisionsMeta");
    event = "myevent";
    pendingNotificationsHandler = createPendingNotificationsHandler({
      pendingDisplayNotifications,
      mergeDecisionsMeta
    });
  });

  it("should clear pending notifications and merge decisions meta", () => {
    pendingDisplayNotifications.clear.and.returnValue(
      Promise.resolve(["mymeta1", "mymeta2"])
    );
    return pendingNotificationsHandler({ event }).then(() => {
      expect(mergeDecisionsMeta).toHaveBeenCalledOnceWith(
        event,
        ["mymeta1", "mymeta2"],
        "display"
      );
    });
  });
});
