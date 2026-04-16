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

import form from "../forms/form";
import renderForm from "../forms/renderForm";
import numberField from "../forms/numberField";

const wrapGetInitialValues =
  (getInitialValues) =>
  ({ initInfo }) => {
    return getInitialValues({
      initInfo,
    });
  };

const qoeDataDetailsForm = form({ wrapGetInitialValues }, [
  numberField({
    name: "bitrate",
    label: "Average bitrate (in kbps)",
    description:
      "This value defaults to zero if you do not set it through the QoSObject. You set this value in milliseconds. " +
      "The value will be displayed in the time format (HH:MM:SS) in CJA Workspace and Reports & Analytics. " +
      "In Data Feeds, Data Warehouse, and Reporting APIs the values will be displayed in seconds.",
  }),
  numberField({
    name: "droppedFrames",
    label: "Dropped frames (Int)",
    description:
      "The number of dropped frames (Int). This value is computed as a sum of " +
      "all frames dropped during a playback session. ",
  }),
  numberField({
    name: "framesPerSecond",
    label: "Frames per second",
    description:
      "The current value of the stream frame-rate (in frames per second). ",
  }),
  numberField({
    name: "timeToStart",
    label: "Time to start (milliseconds)",
    description:
      "This value defaults to zero if you do not set it through the QoSObject. " +
      "You set this value in milliseconds. The value will be displayed in the time format (HH:MM:SS) at reporting.",
  }),
]);
renderForm(qoeDataDetailsForm);
