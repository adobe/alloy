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
const DEFAULT_CONTENT = "defaultContent";

const expectedProps = [
  "mobileParameters",
  "webParameters",
  "content",
  "contentType"
];

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

  return true;
};

export default ({ modules, logger }) => item => {
  const data = item.getData();
  const meta = item.getMeta();

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