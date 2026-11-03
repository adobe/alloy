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

// A consumer composing a custom build from the published component creators.
import { createCustomInstance, components } from "@adobe/alloy";
import { brandConcierge } from "@adobe/alloy-core/core/componentCreators.js";

export const withPersonalization = createCustomInstance({
  components: [components.personalization],
});

export const withBrandConcierge = createCustomInstance({
  components: [components.brandConcierge, brandConcierge],
});

export const withEverything = createCustomInstance({
  components: Object.values(components),
});

// @ts-expect-error A component creator must be a function.
createCustomInstance({ components: [{ namespace: "NotAComponent" }] });
