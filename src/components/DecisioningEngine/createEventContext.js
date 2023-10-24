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
import createNoopEventRegistry from "./createNoopEventRegistry";

export default () => {
  let currentEventRegistry = createNoopEventRegistry();

  const addExperienceEdgeEvent = event => {
    return currentEventRegistry.addExperienceEdgeEvent(event);
  };

  const addEvent = (event, eventType, eventId, action) => {
    return currentEventRegistry.addEvent(event, eventType, eventId, action);
  };

  const getEvent = (eventType, eventId) => {
    return currentEventRegistry.getEvent(eventType, eventId);
  };

  const toJSON = () => {
    return currentEventRegistry.toJSON();
  };

  const clear = () => {
    currentEventRegistry.clear();
  };

  const setCurrentEventRegistry = eventRegistry => {
    currentEventRegistry = eventRegistry;
  };

  return {
    addExperienceEdgeEvent,
    addEvent,
    getEvent,
    toJSON,
    setCurrentEventRegistry,
    clear
  };
};
