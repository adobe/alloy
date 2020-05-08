/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import createOnClickHandler from "../../../../../src/components/Personalization/createOnClickHandler";

describe("Personalization::createOnClickHandler", () => {
  let mergeMeta;
  let collectClicks;
  const event = {
    mergeXdm: jasmine.createSpy("mergeXdm"),
    mergeMeta: jasmine.createSpy("mergeMeta")
  };
  const clickStorage = [];
  const metas = [
    {
      id: 1,
      scope: "foo"
    }
  ];
  beforeEach(() => {
    mergeMeta = jasmine.createSpy("mergeMeta");
    collectClicks = jasmine.createSpy("collectClicks").and.returnValue(metas);
  });

  it("collects clicks", () => {
    const handleOnClick = createOnClickHandler({
      mergeMeta,
      collectClicks,
      clickStorage
    });
    const clickedElement = "foo";

    handleOnClick({ event, clickedElement });

    expect(event.mergeXdm).toHaveBeenCalledWith({ eventType: "click" });
    expect(mergeMeta).toHaveBeenCalledWith(event, { decisions: metas });
    expect(collectClicks).toHaveBeenCalledWith(clickedElement, clickStorage);
  });
});
