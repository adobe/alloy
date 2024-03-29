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
