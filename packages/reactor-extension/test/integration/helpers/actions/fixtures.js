/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

export const instances = [
  { name: "alloy1", edgeConfigId: "PR123" },
  { name: "alloy2", edgeConfigId: "PR456" },
];

// Typing a full set of overrides into three environments takes 25-30s when
// the machine is loaded, so those tests get more than the default 30s.
export const LONG_TEST_TIMEOUT = 90_000;
