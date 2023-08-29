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
