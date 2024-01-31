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

import { number, objectOf, string } from "../../utils/validation";

export default objectOf({
  mediaCollection: objectOf({
    channel: string()
      .nonEmpty()
      .required(),
    playerName: string()
      .nonEmpty()
      .required(),
    appVersion: string(),
    mainPingInterval: number()
      .minimum(10)
      .maximum(50)
      .default(10),
    adPingInterval: number()
      .minimum(1)
      .maximum(10)
      .default(10)
  }).noUnknownFields()
});