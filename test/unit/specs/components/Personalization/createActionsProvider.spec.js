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
import createActionsProvider from "../../../../../src/components/Personalization/createActionsProvider.js";

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
          exercise: () => Promise.resolve(),
        },
      },
      preprocessors: {
        something: [(action) => action],
        superfluous: [
          (action) => action,
          (action) => action,
          (action) => action,
        ],
      },
      logger,
    });
  });

  it("executes appropriate action", (done) => {
    const actionDetails = {
      schema: "something",
      type: "eat",
      itWorked: true,
    };

    actionsProvider.executeAction(actionDetails).then((result) => {
      expect(result).toEqual("yum");
      expect(logger.info).toHaveBeenCalledOnceWith(
        jasmine.stringContaining(
          `Action ${JSON.stringify(actionDetails)} executed.`,
        ),
      );
      done();
    });
  });

  it("throws error if missing schema", (done) => {
    const actionDetails = {
      schema: "hidden-valley",
      type: "truckee",
      itWorked: true,
    };

    actionsProvider.executeAction(actionDetails).catch((error) => {
      expect(error.message).toEqual(
        `Action "truckee" not found for schema "hidden-valley"`,
      );
      expect(logger.warn).toHaveBeenCalledOnceWith(
        jasmine.stringContaining(
          `Failed to execute action ${JSON.stringify(actionDetails)}.`,
        ),
      );
      done();
    });
  });

  it("throws error if missing action", (done) => {
    const actionDetails = {
      schema: "something",
      type: "truckee",
      itWorked: true,
    };

    actionsProvider.executeAction(actionDetails).catch((error) => {
      expect(error.message).toEqual(
        `Action "truckee" not found for schema "something"`,
      );
      expect(logger.warn).toHaveBeenCalledOnceWith(
        jasmine.stringContaining(
          `Failed to execute action ${JSON.stringify(actionDetails)}.`,
        ),
      );
      done();
    });
  });
});
