/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { test, expect, describe } from "../../helpers/testsSetup/extend.js";
import { pullDestinationsHandler } from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";

// Regression test for PLATIR-64321: sendEvent must surface activation:pull
// (profileLookup) destinations in its result so consumers (e.g. Launch rules
// reading event.destinations) can read returned segment IDs. PR #1475 removed
// this return value, breaking commerce/audience activation use cases.
describe("Audiences pull destinations", () => {
  test("returns activation:pull destinations on the sendEvent result", async ({
    alloy,
    worker,
  }) => {
    worker.use(...[pullDestinationsHandler]);

    await alloy("configure", structuredClone(alloyConfig));

    const result = await alloy("sendEvent");

    expect(result.destinations).toBeDefined();
    const segmentIds = result.destinations.flatMap((destination) =>
      destination.segments.map((segment) => segment.id),
    );
    expect(segmentIds).toEqual(["seg-AAA", "seg-BBB", "seg-CCC"]);
  });
});
