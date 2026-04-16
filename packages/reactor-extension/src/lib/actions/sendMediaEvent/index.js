/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const createMediaEvent = require("./createSendMediaEvent");
const createMediaSession = require("./createMediaSession");
const instanceManager = require("../../instanceManager/index");
const { mediaCollectionSessionStorage } = require("../../index");
const createGetConfigOverrides = require("../../utils/createGetConfigOverrides");

// eslint-disable-next-line no-underscore-dangle
const satelliteApi = window._satellite;

const trackMediaSession = createMediaSession({
  instanceManager,
  mediaCollectionSessionStorage,
  satelliteApi,
  getConfigOverrides: createGetConfigOverrides(turbine.environment?.stage),
});
module.exports = createMediaEvent({
  instanceManager,
  trackMediaSession,
  logger: turbine.logger,
  mediaCollectionSessionStorage,
  satelliteApi,
});
