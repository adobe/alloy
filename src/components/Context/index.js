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

import webFactory from "./webFactory";
import deviceFactory from "./deviceFactory";
import environmentFactory from "./environmentFactory";
import placeContextFactory from "./placeContextFactory";
import topFrameSetFactory from "./topFrameSetFactory";
import timestampFactory from "./timestampFactory";
import implementationDetailsFactory from "./implementationDetailsFactory";
import libraryVersion from "../../constants/libraryVersion";
import createComponent from "./createComponent";

const topFrameSetProvider = topFrameSetFactory(window);
const web = webFactory(window, topFrameSetProvider);
const device = deviceFactory(window);
const environment = environmentFactory(window);
const placeContext = placeContextFactory(() => new Date());
const timestamp = timestampFactory(() => new Date());
const implementationDetails = implementationDetailsFactory(libraryVersion);

const createContext = ({ config, logger }) => {
  return createComponent(
    config,
    logger,
    {
      web,
      device,
      environment,
      placeContext
    },
    [timestamp, implementationDetails]
  );
};

createContext.namespace = "Context";
createContext.abbreviation = "CO";
createContext.configValidators = {
  context: {
    defaultValue: ["web", "device", "environment", "placeContext"]
  }
};

export default createContext;
