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

import instancePicker from "../forms/instancePicker";
import textField from "../forms/textField";
import renderForm from "../forms/renderForm";
import notice from "../forms/notice";
import requiredComponent from "../forms/requiredComponent";

const createMediaTrackerForm = requiredComponent(
  {
    requiredComponent: "mediaAnalyticsBridge",
    title: "the Create media tracker action",
    whole: true,
  },
  [
    notice({
      title: "Legacy Media Analytics",
      description:
        "This action exports the Media API to a window object, which is particularly useful for those transitioning " +
        "from the legacy Media JS SDK to the Web SDK. Please ensure that the Streaming Media section is properly " +
        "configured for the instance in the configuration view before proceeding.",
    }),
    instancePicker({ name: "instanceName" }),
    textField({
      name: "objectName",
      label: "Export the Media Legacy API to this window object",
      description:
        "Enter the object name where you want the Media API to be exported." +
        " If none is provided by default it is going to be exported to 'window.Media'.",
    }),
  ],
);

renderForm(createMediaTrackerForm);
