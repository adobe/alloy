import createActionsProvider from "../../../../../src/components/Personalization/createActionsProvider";

describe("createActionsProvider", () => {
  let actionsProvider;
  let logger;

  beforeEach(() => {
    logger = jasmine.createSpyObj("logger", ["warn", "error", "info"]);
    logger.enabled = true;

    actionsProvider = createActionsProvider({
      modules: {
        something: {
          eat: () => Promise.resolve("yum"),
          sleep: () => Promise.resolve(),
          exercise: () => Promise.resolve()
        }
      },
      preprocessors: {
        something: [action => action],
        superfluous: [action => action, action => action, action => action]
      },
      logger
    });
  });

  it("executes appropriate action", done => {
    const actionDetails = {
      schema: "something",
      type: "eat",
      itWorked: true
    };

    actionsProvider.executeAction(actionDetails).then(result => {
      expect(result).toEqual("yum");
      expect(logger.info).toHaveBeenCalledOnceWith(
        jasmine.stringContaining(
          `Action ${JSON.stringify(actionDetails)} executed.`
        )
      );
      done();
    });
  });

  it("throws error if missing schema", done => {
    const actionDetails = {
      schema: "hidden-valley",
      type: "truckee",
      itWorked: true
    };

    actionsProvider.executeAction(actionDetails).catch(error => {
      expect(error.message).toEqual(
        `Action "truckee" not found for schema "hidden-valley"`
      );
      expect(logger.error).toHaveBeenCalledOnceWith(
        jasmine.stringContaining(
          `Failed to execute action ${JSON.stringify(actionDetails)}.`
        )
      );
      done();
    });
  });

  it("throws error if missing action", done => {
    const actionDetails = {
      schema: "something",
      type: "truckee",
      itWorked: true
    };

    actionsProvider.executeAction(actionDetails).catch(error => {
      expect(error.message).toEqual(
        `Action "truckee" not found for schema "something"`
      );
      expect(logger.error).toHaveBeenCalledOnceWith(
        jasmine.stringContaining(
          `Failed to execute action ${JSON.stringify(actionDetails)}.`
        )
      );
      done();
    });
  });
});
