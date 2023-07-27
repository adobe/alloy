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
import { IN_APP_MESSAGE } from "../../Personalization/constants/schema";
import {
  IAM_ACTION_TYPE_BANNER,
  IAM_ACTION_TYPE_CUSTOM,
  IAM_ACTION_TYPE_FULLSCREEN,
  IAM_ACTION_TYPE_MODAL
} from "../../Personalization/in-app-message-actions/initMessagingActionsModules";

const deduceType = html => {
  if (html.includes("banner")) {
    return IAM_ACTION_TYPE_BANNER;
  }

  if (html.includes("modal")) {
    return IAM_ACTION_TYPE_MODAL;
  }

  if (html.includes("fullscreen")) {
    return IAM_ACTION_TYPE_FULLSCREEN;
  }

  return IAM_ACTION_TYPE_CUSTOM;
};

export default (id, type, detail) => {
  const { html, mobileParameters } = detail;

  const webParameters = { info: "this is a placeholder" };

  return {
    schema: IN_APP_MESSAGE,
    data: {
      type: deduceType(html, mobileParameters),
      mobileParameters,
      webParameters,
      content: html,
      contentType: "text/html"
    },
    id
  };
};
