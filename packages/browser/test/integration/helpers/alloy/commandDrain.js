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

// Tracks in-flight Alloy commands through the monitor lifecycle hooks so a test
// can wait for them to finish before it cleans up.
//
// Call `register()` before Alloy loads (Alloy reads the monitors lazily per
// command), then `await drain()` at teardown.

export const createCommandDrain = () => {
  let pending = 0;
  let idleResolvers = [];

  const flushIfIdle = () => {
    if (pending > 0) {
      return;
    }
    const resolvers = idleResolvers;
    idleResolvers = [];
    resolvers.forEach((resolve) => resolve());
  };

  const settle = () => {
    pending -= 1;
    flushIfIdle();
  };

  const monitor = {
    onBeforeCommand() {
      pending += 1;
    },
    onCommandResolved() {
      settle();
    },
    onCommandRejected() {
      settle();
    },
  };

  return {
    monitor,

    // Own the global so a caller can't push onto an undefined array.
    register(target = window) {
      target.__alloyMonitors = target.__alloyMonitors || [];
      target.__alloyMonitors.push(monitor);
    },

    // The timeout stops a stuck command from hanging teardown and wedging the suite.
    drain({ timeoutMs = 5000 } = {}) {
      if (pending === 0) {
        return Promise.resolve();
      }
      return new Promise((resolve) => {
        const onIdle = () => {
          clearTimeout(timer);
          resolve();
        };
        const timer = setTimeout(() => {
          idleResolvers = idleResolvers.filter((r) => r !== onIdle);
          resolve();
        }, timeoutMs);
        idleResolvers.push(onIdle);
      });
    },

    getPending() {
      return pending;
    },
  };
};
