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

import { boolean, number } from "../../utils/configValidators";
import { fireReferrerHideableImage } from "../../utils";
import processIdSyncsFactory from "./processIdSyncsFactory";

import createComponent from "./createComponent";

const createIdentity = ({ config, logger, optIn, eventManager }) => {
  const processIdSyncs = processIdSyncsFactory({
    fireReferrerHideableImage,
    logger
  });
  return createComponent(processIdSyncs, config, logger, optIn, eventManager);
};

createIdentity.namespace = "Identity";

createIdentity.configValidators = {
  idSyncEnabled: {
    defaultValue: undefined,
    validate: boolean()
  },
  idSyncContainerId: {
    defaultValue: undefined,
    validate: number()
      .integer()
      .minimum(0)
      .expected("an integer greater than or equal to 0")
  },
  thirdPartyCookiesEnabled: {
    defaultValue: true,
    validate: boolean()
  }
};

// #if _REACTOR
// Not much need to validate since we are our own consumer.
createIdentity.configValidators.reactorRegisterGetEcid = {
  defaultValue: () => {}
};
// #endif

export default createIdentity;
