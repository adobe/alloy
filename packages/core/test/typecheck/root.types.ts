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

// Compile-time tests for the public entry of @adobe/alloy-core. Checked by
// `pnpm --filter @adobe/alloy-core run typecheck`; never executed.

/* eslint-disable import/extensions -- `.js` specifiers resolve to `.ts` sources, as in src */
import { expectTypeOf } from "vitest";
import {
  consent,
  createCoreConfigs,
  createCustomInstance,
  createGetImsAccessToken,
  createInstance,
} from "../../src/index.js";
import type {
  CreateCustomInstanceOptions,
  CreateInstanceOptions,
  CreatePlatformServices,
} from "../../src/index.js";
import type { AlloyMonitor } from "../../src/types.js";
import type {
  AlloyMonitor as CoreAlloyMonitor,
  ComponentCreator,
} from "../../src/core/types.js";
import type { PlatformServices } from "../../src/services/index.js";
import { getComponentMetadata } from "../../src/componentMetadata.js";

// `AlloyMonitor` is re-exported from `types.ts` under the same name.
expectTypeOf<AlloyMonitor>().toEqualTypeOf<CoreAlloyMonitor>();

// Option interfaces.
expectTypeOf<CreateInstanceOptions>().toEqualTypeOf<{
  name?: string;
  monitors?: AlloyMonitor[];
}>();
expectTypeOf<CreateCustomInstanceOptions>().toEqualTypeOf<{
  name?: string;
  monitors?: AlloyMonitor[];
  components?: ComponentCreator[];
}>();
expectTypeOf<CreatePlatformServices>().toEqualTypeOf<() => PlatformServices>();

// Parameters.
expectTypeOf(createInstance)
  .parameter(0)
  .toEqualTypeOf<CreateInstanceOptions | undefined>();
expectTypeOf(createCustomInstance)
  .parameter(2)
  .toEqualTypeOf<ReturnType<typeof createCoreConfigs> | undefined>();
expectTypeOf(createCustomInstance)
  .parameter(3)
  .toEqualTypeOf<ReturnType<typeof createGetImsAccessToken> | undefined>();
expectTypeOf(consent).toExtend<ComponentCreator>();

declare const createPlatformServices: CreatePlatformServices;
createCustomInstance({ components: [consent] }, createPlatformServices);
// @ts-expect-error components must be component creators.
createCustomInstance({ components: [() => 1] }, createPlatformServices);
// @ts-expect-error unknown option.
createInstance({ nmae: "alloy" }, createPlatformServices);

// The instance is a callable command executor.
const alloy = createInstance({ name: "alloy" }, createPlatformServices);
expectTypeOf(alloy).parameters.toEqualTypeOf<
  [commandName: string, options?: unknown]
>();
expectTypeOf(alloy("configure")).resolves.not.toBeAny();

// Component metadata.
const metadata = getComponentMetadata();
expectTypeOf(metadata.optional).toEqualTypeOf<readonly string[]>();
expectTypeOf(metadata.required).toEqualTypeOf<readonly string[]>();
