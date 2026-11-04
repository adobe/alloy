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

import type { Event } from "@adobe/alloy-core/core/types.js";
import type { ClickActivityStorage } from "./types.js";

/** The page name path of the event content; callers check it with `hasPageName`. */
interface PageViewContent {
  xdm: { web: { webPageDetails: { name: string } } };
}

export default ({
  clickActivityStorage,
}: {
  clickActivityStorage: ClickActivityStorage;
}) => {
  return (event: Event) => {
    // Called only for events that `hasPageName` accepted.
    const content = event.getContent() as unknown as PageViewContent;
    clickActivityStorage.save({
      pageName: content.xdm.web.webPageDetails.name,
      pageIDType: 1, // 1 = name, 0 = URL
    });
  };
};
