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

import { CLICK_ACTIVITY_DATA } from "../../constants/sessionDataKeys.js";

export default ({ storage }) => {
  return {
    save: (data) => {
      const jsonData = JSON.stringify(data);
      storage.setItem(CLICK_ACTIVITY_DATA, jsonData);
    },
    load: () => {
      let jsonData = null;
      const data = storage.getItem(CLICK_ACTIVITY_DATA);
      if (data) {
        jsonData = JSON.parse(data);
      }
      return jsonData;
    },
    remove: () => {
      storage.removeItem(CLICK_ACTIVITY_DATA);
    },
  };
};
