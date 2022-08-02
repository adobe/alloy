/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const fireViewEndCustomEvent = () => {
  console.log("Firing Custom Event 'event-view-end'");
  var event = new CustomEvent('event-view-end');
  var obj = document.querySelector("#app");
  obj.dispatchEvent(event);
};

const fireViewStartCustomEvent = (data) => {
  console.log("Firing Custom Event 'event-view-start'");
  let event = new CustomEvent('event-view-start', data);
  document.body.dispatchEvent(event);
};

const fireActionTriggerCustomEvent = (target, data) => {
  console.log("Firing Custom Triggered Event");
  var event = new CustomEvent('event-action-trigger', data);
  var obj = target.dispatchEvent(event);
};

export {
  fireViewEndCustomEvent,
  fireViewStartCustomEvent,
  fireActionTriggerCustomEvent
}
