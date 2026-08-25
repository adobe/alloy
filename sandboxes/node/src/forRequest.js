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

import createConfiguredInstance from "./createConfiguredInstance.js";

// A real server would back this with the incoming request's `Cookie` header
// and write to the outgoing response's `Set-Cookie` header. This in-memory
// stand-in just has to satisfy the same CookieService shape.
const createInMemoryCookieService = (jar = new Map()) => ({
  get: (name) => jar.get(name),
  getAll: () => Object.fromEntries(jar),
  set: (name, value) => {
    jar.set(name, value);
    return value;
  },
  remove: (name) => jar.delete(name),
  withConverter: () => createInMemoryCookieService(jar),
});

// configure() runs once, as it would at server startup. forRequest() below
// is the cheap, per-request operation.
const alloy = await createConfiguredInstance();

// Two "requests" from the same visitor, sharing one cookie store: identity
// should resolve to the same ECID both times, without the two requests
// sharing anything else with each other.
const visitorACookies = createInMemoryCookieService();
const { identity: visitorARequest1 } = await alloy
  .forRequest({ cookie: visitorACookies })
  .getIdentity();
const { identity: visitorARequest2 } = await alloy
  .forRequest({ cookie: visitorACookies })
  .getIdentity();

console.log("Visitor A, request 1 ECID:", visitorARequest1.ECID);
console.log("Visitor A, request 2 ECID:", visitorARequest2.ECID);
console.log(
  "Same visitor resolves to the same ECID:",
  visitorARequest1.ECID === visitorARequest2.ECID,
);

// A different visitor, with their own (empty) cookie store, gets their own
// identity — proving requests aren't accidentally sharing state.
const visitorBCookies = createInMemoryCookieService();
const { identity: visitorBRequest1 } = await alloy
  .forRequest({ cookie: visitorBCookies })
  .getIdentity();

console.log("Visitor B ECID:", visitorBRequest1.ECID);
console.log(
  "Different visitors resolve to different ECIDs:",
  visitorARequest1.ECID !== visitorBRequest1.ECID,
);
