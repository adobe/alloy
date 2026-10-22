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

// Compile-time tests for the core contracts. Checked by
// `pnpm --filter @adobe/alloy-core run typecheck`; never executed.

/* eslint-disable import/extensions -- `.js` specifiers resolve to `.ts` sources, as in src */
import { expectTypeOf } from "vitest";
import { Types } from "../../src/core/types.js";
import type {
  AlloyMonitor,
  ApplyResponseOptions,
  Component,
  ComponentCreator,
  Event,
  EventManager,
  Logger,
  Response,
  ResponseContent,
  ResponseCreator,
  ResponseFragment,
  SendEventOptions,
} from "../../src/core/types.js";
import type {
  ConsentManager,
  ConsentStateMachine,
} from "../../src/core/consent/types.js";
import type { EdgeRequestExecutor } from "../../src/core/edgeNetwork/types.js";
import type { IdentityManager } from "../../src/core/identity/types.js";
import type {
  CookieAttributes as ServicesCookieAttributes,
  CookieConverter as ServicesCookieConverter,
} from "../../src/services/types.js";
import type {
  CookieAttributes,
  CookieConverter,
  Event as BaseEvent,
  Logger as BaseLogger,
} from "../../src/utils/types.js";

expectTypeOf(Types).toEqualTypeOf<Record<never, never>>();

// Core contracts are supersets of the subsets utils depends on.
expectTypeOf<Logger>().toExtend<BaseLogger>();
expectTypeOf<Event>().toExtend<BaseEvent>();

// The services cookie types are the utils ones.
expectTypeOf<ServicesCookieAttributes>().toEqualTypeOf<CookieAttributes>();
expectTypeOf<ServicesCookieConverter>().toEqualTypeOf<CookieConverter>();

// Logger and monitor hooks have typed payloads.
declare const logger: Logger;
expectTypeOf(logger.enabled).toEqualTypeOf<boolean>();
logger.logOnBeforeCommand({ commandName: "sendEvent", options: {} });
logger.logOnContentHiding({
  status: "hide-containers",
  message: "Hidden.",
  logLevel: "info",
});
// @ts-expect-error commandName is required.
logger.logOnCommandResolved({ options: {}, result: {} });
// @ts-expect-error logLevel must be a console level.
logger.logOnContentHiding({ status: "x", message: "y", logLevel: "debug" });

const monitor: AlloyMonitor = {
  onBeforeLog: ({ instanceName, level, arguments: args }) => {
    expectTypeOf(instanceName).toEqualTypeOf<string>();
    expectTypeOf(level).toEqualTypeOf<"info" | "warn" | "error">();
    expectTypeOf(args).toEqualTypeOf<unknown[]>();
  },
  onNetworkResponse: ({ requestId, statusCode, retriesAttempted }) => {
    expectTypeOf(requestId).toEqualTypeOf<string>();
    expectTypeOf(statusCode).toEqualTypeOf<number>();
    expectTypeOf(retriesAttempted).toEqualTypeOf<number>();
  },
  onContentRendering: ({ status, payload }) => {
    expectTypeOf(status).toEqualTypeOf<string>();
    expectTypeOf(payload).toEqualTypeOf<unknown>();
  },
};

// Events and the event manager.
declare const event: Event;
expectTypeOf(event.getContent()).toEqualTypeOf<Record<string, unknown>>();
expectTypeOf(event.getViewName()).toEqualTypeOf<string | undefined>();
event.finalize();
event.finalize(({ xdm, data }) => {
  expectTypeOf(xdm).toEqualTypeOf<Record<string, unknown>>();
  expectTypeOf(data).toEqualTypeOf<Record<string, unknown>>();
  return false;
});
// @ts-expect-error XDM is an object, not a string.
event.setUserXdm("xdm");

const sendEventOptions: SendEventOptions = {
  renderDecisions: true,
  decisionScopes: ["__view__"],
  edgeConfigOverrides: { datastreamId: "abc" },
};
const applyResponseOptions: ApplyResponseOptions = {
  responseBody: { handle: [] },
};
declare const eventManager: EventManager;
expectTypeOf(eventManager.createEvent()).toEqualTypeOf<Event>();
expectTypeOf(eventManager.sendEvent(event, sendEventOptions)).toEqualTypeOf<
  Promise<Record<string, unknown> | undefined>
>();
expectTypeOf(
  eventManager.applyResponse(event, applyResponseOptions),
).toEqualTypeOf<Promise<Record<string, unknown>>>();

// Responses.
const fragment: ResponseFragment = { type: "identity:persist", payload: [] };
const content: ResponseContent = {
  handle: [{ type: fragment.type, payload: [] }],
  errors: [],
};
declare const createResponse: ResponseCreator;
const response: Response = createResponse({ content, getHeader: () => "" });
expectTypeOf(response.getPayloadsByType("identity:persist")).toEqualTypeOf<
  unknown[]
>();
expectTypeOf(response.toJSON()).toEqualTypeOf<ResponseContent>();

// Consent and identity.
declare const consent: ConsentManager;
expectTypeOf(consent.current()).toEqualTypeOf<{
  state: string;
  wasSet: boolean;
}>();
declare const consentState: ConsentStateMachine;
expectTypeOf(consentState.awaitConsent).returns.toEqualTypeOf<Promise<void>>();

declare const identity: IdentityManager;
expectTypeOf(identity.initialize).toEqualTypeOf<() => void>();
expectTypeOf(identity.setIdentityAcquired).toEqualTypeOf<() => void>();
expectTypeOf(identity.awaitIdentity()).toEqualTypeOf<Promise<void>>();
expectTypeOf(identity.getEcidFromCookie()).toEqualTypeOf<string | null>();

declare const sendEdgeNetworkRequest: EdgeRequestExecutor;
expectTypeOf(sendEdgeNetworkRequest).returns.toEqualTypeOf<
  Promise<Record<string, unknown>>
>();

// Components.
const component: Component = {
  lifecycle: {
    onBeforeEvent: ({ event: e }: { event: Event }) => {
      e.mergeXdm({});
    },
  },
  commands: {
    getThing: {
      documentationUri: "https://example.com",
      optionsValidator: (options: Record<string, unknown>) => options,
      run: () => ({}),
    },
  },
};
const createThing = Object.assign(() => component, { namespace: "Thing" });
const creator: ComponentCreator = createThing;

// @ts-expect-error namespace must be a string.
const badNamespace: ComponentCreator = Object.assign(() => component, {
  namespace: 1,
});
const badCommands: Component = {
  // @ts-expect-error each command needs a run function.
  commands: { getThing: { documentationUri: "" } },
};
const badLifecycle: Component = {
  // @ts-expect-error lifecycle hooks are a known set.
  lifecycle: { onSomethingElse: () => {} },
};

export { badCommands, badLifecycle, badNamespace, creator, monitor };
