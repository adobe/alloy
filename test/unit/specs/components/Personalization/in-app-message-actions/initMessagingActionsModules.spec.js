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

import initMessagingActionsModules from "../../../../../../src/components/Personalization/in-app-message-actions/initMessagingActionsModules";
import createModules from "../../../../../../src/components/Personalization/createModules";
import { IN_APP_MESSAGE } from "../../../../../../src/components/Personalization/constants/schema";

describe("Personalization::turbine::initMessagingActionsModules", () => {
  const modules = createModules(() => undefined);
  const expectedModules = modules[IN_APP_MESSAGE];

  it("should have all the required modules", () => {
    const messagingActionsModules = initMessagingActionsModules(() => {});

    expect(Object.keys(messagingActionsModules).length).toEqual(
      Object.keys(expectedModules).length
    );

    Object.keys(expectedModules).forEach(key => {
      expect(messagingActionsModules[key]).toEqual(jasmine.any(Function));
    });
  });
});
