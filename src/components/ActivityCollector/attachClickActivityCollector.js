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

import { noop } from "../../utils";

const createClickHandler = ({ eventManager, lifecycle, handleError }) => {
  return clickEvent => {
    // TODO: Consider safeguarding from the same object being clicked multiple times in rapid succession?
    const clickedElement = clickEvent.target;
    const event = eventManager.createEvent();
    return (
      lifecycle
        .onClick({ event, clickedElement })
        .then(() => {
          if (event.isEmpty()) {
            return Promise.resolve();
          }
          return eventManager.sendEvent(event);
        })
        // eventManager.sendEvent() will return a promise resolved to an
        // object and we want to avoid returning any value to the customer
        .then(noop)
        .catch(error => {
          handleError(error, "click collection");
        })
    );
  };
};

export default ({ config, eventManager, lifecycle, handleError }) => {
  const enabled = config.clickCollectionEnabled;

  if (!enabled) {
    return;
  }

  const clickHandler = createClickHandler({
    eventManager,
    lifecycle,
    handleError
  });

  document.addEventListener("click", clickHandler, true);
};
