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
import { addStyle, removeElements } from "../utils";

const STYLE_TAG_ID = "alloy-messaging-banner-styles";
const ELEMENT_TAG_ID = "alloy-messaging-banner";
const BANNER_CSS_CLASSNAME = "alloy-banner";

const showBanner = ({ background, content }) => {
  removeElements(BANNER_CSS_CLASSNAME);

  addStyle(
    STYLE_TAG_ID,
    `.alloy-banner {
        display: flex;
        justify-content: center;
        padding: 10px;
        background: ${background};
      }
      .alloy-banner-content {
      }`
  );

  const banner = document.createElement("div");
  banner.id = ELEMENT_TAG_ID;
  banner.className = BANNER_CSS_CLASSNAME;

  const bannerContent = document.createElement("div");
  bannerContent.className = "alloy-banner-content";
  bannerContent.innerHTML = content;
  banner.appendChild(bannerContent);

  document.body.prepend(banner);
};

export default settings => {
  return new Promise(resolve => {
    const { meta } = settings;

    showBanner(settings);

    resolve({ meta });
  });
};
