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

import createClickedElementProperties from "./createClickedElementProperties";

export default ({ clickActivityStorage }) => {
  return event => {
    const properties = clickActivityStorage.load();
    const elementProperties = createClickedElementProperties({ properties });
    if (
      elementProperties.isValidLink() ||
      elementProperties.isValidActivityMapData()
    ) {
      if (elementProperties.isValidLink()) {
        const xdm = elementProperties.xdm;
        // Have to delete the eventType not to override the page view
        delete xdm.eventType;
        event.mergeXdm(xdm);
      }
      if (elementProperties.isValidActivityMapData()) {
        event.setUserData(elementProperties.data);
      }
      // NOTE: We can't clear out all the storage here because we might still need to
      // keep a page-name for multiple link-clicks (e.g. downloads) on the same page.
      clickActivityStorage.save({
        pageName: elementProperties.pageName,
        pageIDType: elementProperties.pageIDType
      });
    }
  };
};
