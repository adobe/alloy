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

const createClickHandler = (eventManager, lifecycle) => {
  return clickEvent => {
    // TODO: Consider safeguarding from the same object being clicked multiple times in rapid succession?
    const clickedElement = clickEvent.target;
    const event = eventManager.createEvent();
    lifecycle.onClick({ event, clickedElement }).then(() => {
      if (event.isEmpty()) {
        return;
      }

      eventManager.sendEvent(event);
    });
  };
};

export default (config, eventManager, lifecycle) => {
  const enabled = config.get("clickCollectionEnabled");

  if (!enabled) {
    return;
  }

  const clickHandler = createClickHandler(eventManager, lifecycle);

  document.addEventListener("click", clickHandler, true);
};
