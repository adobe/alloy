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
import { APPLICATION_JSON } from "../../../constants/contentType.js";

const DEFAULT_CONTENT = "defaultContent";

const expectedProps = ["content", "contentType"];
const expectedContentProps = ["mobileParameters", "webParameters", "html"];

const isValidInAppMessage = (data, logger) => {
  for (let i = 0; i < expectedProps.length; i += 1) {
    const prop = expectedProps[i];
    if (!Object.prototype.hasOwnProperty.call(data, prop)) {
      logger.warn(
        `Invalid in-app message data: missing property '${prop}'.`,
        data
      );
      return false;
    }
  }

  const { content, contentType } = data;

  if (contentType === APPLICATION_JSON) {
    for (let i = 0; i < expectedContentProps.length; i += 1) {
      const prop = expectedContentProps[i];
      if (!Object.prototype.hasOwnProperty.call(content, prop)) {
        logger.warn(
          `Invalid in-app message data.content: missing property '${prop}'.`,
          data
        );
        return false;
      }
    }
  }

  return true;
};

export default ({ modules, logger }) => {
  return item => {
    const data = item.getData();
    const meta = { ...item.getProposition().getNotification() };

    if (!data) {
      logger.warn("Invalid in-app message data: undefined.", data);
      return {};
    }

    const { type = DEFAULT_CONTENT } = data;

    if (!modules[type]) {
      logger.warn("Invalid in-app message data: unknown type.", data);
      return {};
    }

    if (!isValidInAppMessage(data, logger)) {
      return {};
    }

    if (!meta) {
      logger.warn("Invalid in-app message meta: undefined.", meta);
      return {};
    }

    return {
      render: () => {
        return modules[type]({
          ...data,
          meta
        });
      },
      setRenderAttempted: true,
      includeInNotification: true
    };
  };
};
