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

export default event => {
  const content = event.getContent();
  return (
    content.xdm !== undefined &&
    // NOTE: A page view event should "ideally" include the pageViews type
    // && event.xdm.eventType === "web.webpagedetails.pageViews"
    content.xdm.web !== undefined &&
    content.xdm.web.webPageDetails !== undefined &&
    content.xdm.web.webPageDetails.name !== undefined
  );
};
