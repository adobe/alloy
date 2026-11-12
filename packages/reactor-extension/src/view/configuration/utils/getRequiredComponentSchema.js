/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { invalid, shape } from "../../forms/validation";

export default (requiredComponent, getValidationSchema) =>
  ({ initInfo }) => {
    const components = initInfo?.extensionSettings?.components || {};
    const isComponentDisabled = components[requiredComponent] === false;
    const settings = initInfo?.settings;

    if (isComponentDisabled && !settings) {
      return shape({
        requiredComponent: invalid(
          `The ${requiredComponent} component is disabled.`,
        ),
      });
    }

    return getValidationSchema();
  };
