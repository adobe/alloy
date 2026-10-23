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

// Compile-time tests for the component contracts. Checked by
// `pnpm --filter @adobe/alloy-core run typecheck`; never executed.

/* eslint-disable import/extensions -- `.js` specifiers resolve to `.ts` sources, as in src */
import { expectTypeOf } from "vitest";
import * as optionalComponentCreators from "../../src/core/componentCreators.js";
import * as requiredComponentCreators from "../../src/core/requiredComponentCreators.js";
import createComponentRegistry from "../../src/core/createComponentRegistry.js";
import initializeComponents from "../../src/core/initializeComponents.js";
import type { Lifecycle } from "../../src/core/createLifecycle.js";
import type {
  Component,
  ComponentCommand,
  ComponentCreator,
  ComponentTools,
  EventManager,
  Logger,
  Response,
} from "../../src/core/types.js";
import type { ConsentManager } from "../../src/core/consent/types.js";
import type {
  ApplyResponseCommandOptions,
  SendEventCommandOptions,
} from "../../src/components/DataCollector/index.js";
import type { RequestPayload } from "../../src/utils/request/types.js";
import type {
  ConsentObject,
  ConsentRequestPayload,
  SetConsentOptions,
} from "../../src/components/Consent/types.js";
import type * as RulesEngineTypes from "../../src/components/RulesEngine/types.js";

// Every built-in creator is a ComponentCreator.
const {
  audiences,
  brandConcierge,
  consent,
  eventMerge,
  mediaAnalyticsBridge,
  rulesEngine,
  streamingMedia,
} = optionalComponentCreators;
const { dataCollector, identity, libraryInfo } = requiredComponentCreators;
expectTypeOf(audiences).toExtend<ComponentCreator>();
expectTypeOf(brandConcierge).toExtend<ComponentCreator>();
expectTypeOf(consent).toExtend<ComponentCreator>();
expectTypeOf(eventMerge).toExtend<ComponentCreator>();
expectTypeOf(mediaAnalyticsBridge).toExtend<ComponentCreator>();
expectTypeOf(rulesEngine).toExtend<ComponentCreator>();
expectTypeOf(streamingMedia).toExtend<ComponentCreator>();
expectTypeOf(dataCollector).toExtend<ComponentCreator>();
expectTypeOf(identity).toExtend<ComponentCreator>();
expectTypeOf(libraryInfo).toExtend<ComponentCreator>();

// A creator receives the typed tools core injects.
expectTypeOf<Parameters<ComponentCreator>[0]>().toEqualTypeOf<ComponentTools>();
declare const tools: ComponentTools;
expectTypeOf(tools.logger).toEqualTypeOf<Logger>();
expectTypeOf(tools.eventManager).toEqualTypeOf<EventManager>();
expectTypeOf(tools.consent).toEqualTypeOf<ConsentManager>();
expectTypeOf(tools.instanceName).toEqualTypeOf<string>();
// @ts-expect-error core injects no such tool.
expectTypeOf(tools.notATool).toBeUnknown();

// A creator may take a subset of the tools.
const createGreeter = Object.assign(
  ({ logger }: Pick<ComponentTools, "logger">) => ({
    commands: {
      greet: {
        optionsValidator: (options: unknown) => ({ name: String(options) }),
        run: ({ name }: { name: string }) => logger.info(name),
      } satisfies ComponentCommand<unknown, { name: string }>,
    },
    lifecycle: {
      onBeforeEvent: ({ event }: { event: { mergeXdm: () => void } }) => {
        event.mergeXdm();
      },
    },
  }),
  { namespace: "Greeter" },
);
const greeter: ComponentCreator = createGreeter;
// @ts-expect-error a creator cannot ask for a tool core does not inject.
const needsMissingTool: ComponentCreator = Object.assign(
  ({ notATool }: { notATool: string }) => ({ commands: {}, notATool }),
  { namespace: "Missing" },
);

// Commands and hooks keep their own option and payload types.
type GreetCommand = ComponentCommand<unknown, { name: string }>;
expectTypeOf<Parameters<GreetCommand["run"]>[0]>().toEqualTypeOf<{
  name: string;
}>();
const greetComponent: Component<{ greet: GreetCommand }> = createGreeter(tools);
expectTypeOf(greetComponent.commands).toEqualTypeOf<
  { greet: GreetCommand } | undefined
>();

// The registry takes the full built-in creator list without casts.
const componentCreators: ComponentCreator[] = [
  ...Object.values(optionalComponentCreators),
  ...Object.values(requiredComponentCreators),
  greeter,
];
declare const lifecycle: Lifecycle;
const componentRegistry = createComponentRegistry();
componentRegistry.register("Greeter", createGreeter(tools));
initializeComponents({
  componentCreators,
  lifecycle,
  componentRegistry,
  getImmediatelyAvailableTools: () => tools,
});

// DataCollector commands take typed options.
type DataCollectorCommands = ReturnType<typeof dataCollector>["commands"];
expectTypeOf<
  Parameters<DataCollectorCommands["sendEvent"]["run"]>[0]
>().toEqualTypeOf<SendEventCommandOptions>();
expectTypeOf<
  Parameters<DataCollectorCommands["applyResponse"]["run"]>[0]
>().toEqualTypeOf<ApplyResponseCommandOptions>();
expectTypeOf<SendEventCommandOptions["mergeId"]>().toEqualTypeOf<
  string | undefined
>();
// @ts-expect-error sendEvent has no such option.
expectTypeOf<SendEventCommandOptions["notAnOption"]>().toBeUnknown();
// DataCollector declares no lifecycle hooks.
expectTypeOf(dataCollector(tools)).not.toHaveProperty("lifecycle");
// Consent: the setConsent command and lifecycle hooks are typed.
type ConsentComponent = ReturnType<typeof consent>;
type SetConsentRun = NonNullable<
  ConsentComponent["commands"]
>["setConsent"]["run"];
expectTypeOf<Parameters<SetConsentRun>[0]>().toEqualTypeOf<SetConsentOptions>();
expectTypeOf<SetConsentOptions["consent"]>().toEqualTypeOf<ConsentObject[]>();
type ConsentOnResponse = NonNullable<
  ConsentComponent["lifecycle"]
>["onResponse"];
expectTypeOf<Parameters<ConsentOnResponse>[0]>().toEqualTypeOf<{
  response: Response;
}>();
expectTypeOf<ConsentRequestPayload>().toExtend<RequestPayload>();

export { greeter, needsMissingTool };

// RulesEngine typedef names are exported.
expectTypeOf<
  RulesEngineTypes.Consequence["detail"]
>().toEqualTypeOf<RulesEngineTypes.ConsequenceDetail>();
expectTypeOf<RulesEngineTypes.EventRegistry>().toEqualTypeOf<
  Record<string, RulesEngineTypes.EventRecord>
>();
expectTypeOf<RulesEngineTypes.Proposition["items"]>().toEqualTypeOf<
  RulesEngineTypes.PropositionItem[]
>();
expectTypeOf<
  RulesEngineTypes.RulesEventPayload["iam.eventType"]
>().toEqualTypeOf<string>();
expectTypeOf<
  RulesEngineTypes.EventHistoryOperationData["content"]
>().toEqualTypeOf<RulesEngineTypes.RulesEventPayload>();
