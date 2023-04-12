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

import attachClickActivityCollector from "./attachClickActivityCollector";
import configValidators from "./configValidators";
import createLinkClick from "./createLinkClick";
import window from "../../utils/window";
import createGetLinkDetails from "./createGetLinkDetails";
import getLinkName from "./getLinkName";
import getLinkRegion from "./getLinkRegion";
import {
  determineLinkType,
  findSupportedAnchorElement,
  getAbsoluteUrlFromAnchorElement
} from "./utils";

const getLinkDetails = createGetLinkDetails({
  window,
  getLinkName,
  getLinkRegion,
  getAbsoluteUrlFromAnchorElement,
  findSupportedAnchorElement,
  determineLinkType
});

const createActivityCollector = ({
  config,
  eventManager,
  handleError,
  logger
}) => {
  const linkClick = createLinkClick({ getLinkDetails, config, logger });

  return {
    lifecycle: {
      onComponentsRegistered(tools) {
        const { lifecycle } = tools;
        attachClickActivityCollector({
          eventManager,
          lifecycle,
          handleError
        });
        // TODO: createScrollActivityCollector ...
      },
      onClick({ event, clickedElement }) {
        linkClick({ targetElement: clickedElement, event });
      }
    }
  };
};

createActivityCollector.namespace = "ActivityCollector";
createActivityCollector.configValidators = configValidators;
createActivityCollector.buildOnInstanceConfiguredExtraParams = ({
  config,
  logger
}) => {
  return {
    getLinkDetails: targetElement => {
      return getLinkDetails({ targetElement, config, logger });
    }
  };
};

export default createActivityCollector;
