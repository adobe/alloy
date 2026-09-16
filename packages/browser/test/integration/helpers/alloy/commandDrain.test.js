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

import { test, expect, vi } from "vitest";
import { createCommandDrain } from "./commandDrain.js";

// Flush pending micro- and macro-tasks so a drain's `.then` runs before we
// assert on it. A bare `await Promise.resolve()` only drains one microtask.
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

// Deterministic PRNG (Park-Miller MINSTD) so the randomized cases are
// reproducible, not flaky. Stays in floating-point math to avoid bitwise ops.
const makeRand = (seed) => {
  let state = seed % 2147483647;
  if (state <= 0) {
    state += 2147483646;
  }
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
};

const shuffle = (values, rand) => {
  const out = values.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

test("register initializes the monitors global when it is absent", () => {
  const target = {};
  const drain = createCommandDrain();
  drain.register(target);
  expect(target.__alloyMonitors).toEqual([drain.monitor]);
});

test("register appends to an existing monitors array", () => {
  const existing = { onBeforeCommand() {} };
  const target = { __alloyMonitors: [existing] };
  const drain = createCommandDrain();
  drain.register(target);
  expect(target.__alloyMonitors).toEqual([existing, drain.monitor]);
});

test("drain resolves immediately when no command is in flight", async () => {
  const { drain, getPending } = createCommandDrain();
  expect(getPending()).toBe(0);
  await expect(drain()).resolves.toBeUndefined();
});

test("drain waits until an in-flight command resolves", async () => {
  const { monitor, drain, getPending } = createCommandDrain();
  monitor.onBeforeCommand({ commandName: "sendEvent" });
  expect(getPending()).toBe(1);

  let settled = false;
  const drained = drain().then(() => {
    settled = true;
  });

  await Promise.resolve();
  expect(settled).toBe(false);

  monitor.onCommandResolved({ commandName: "sendEvent" });
  await drained;
  expect(settled).toBe(true);
  expect(getPending()).toBe(0);
});

test("a rejected command also settles the drain", async () => {
  const { monitor, drain } = createCommandDrain();
  monitor.onBeforeCommand({ commandName: "sendEvent" });
  const drained = drain();
  monitor.onCommandRejected({ commandName: "sendEvent" });
  await expect(drained).resolves.toBeUndefined();
});

test("drain waits for every in-flight command", async () => {
  const { monitor, drain, getPending } = createCommandDrain();
  monitor.onBeforeCommand({ commandName: "a" });
  monitor.onBeforeCommand({ commandName: "b" });
  expect(getPending()).toBe(2);

  let settled = false;
  const drained = drain().then(() => {
    settled = true;
  });

  monitor.onCommandResolved({ commandName: "a" });
  await Promise.resolve();
  expect(settled).toBe(false);

  monitor.onCommandResolved({ commandName: "b" });
  await drained;
  expect(settled).toBe(true);
});

test("drain resolves after the timeout when a command never settles", async () => {
  vi.useFakeTimers();
  try {
    const { monitor, drain } = createCommandDrain();
    monitor.onBeforeCommand({ commandName: "stuck" });

    let settled = false;
    const drained = drain({ timeoutMs: 5000 }).then(() => {
      settled = true;
    });

    await vi.advanceTimersByTimeAsync(4999);
    expect(settled).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await drained;
    expect(settled).toBe(true);
  } finally {
    vi.useRealTimers();
  }
});

test("drain waits for a command that starts after drain is called", async () => {
  const { monitor, drain, getPending } = createCommandDrain();
  monitor.onBeforeCommand({ commandName: "first" });

  let settled = false;
  const drained = drain().then(() => {
    settled = true;
  });

  // A new command begins while the drain is already waiting; drain must wait
  // for zero in flight, not for the count captured when it was called.
  monitor.onBeforeCommand({ commandName: "second" });
  expect(getPending()).toBe(2);

  monitor.onCommandResolved({ commandName: "first" });
  await flush();
  expect(settled).toBe(false);

  monitor.onCommandResolved({ commandName: "second" });
  await drained;
  expect(settled).toBe(true);
  expect(getPending()).toBe(0);
});

test("every concurrent drain resolves on a single idle", async () => {
  // Fake timers so idle is the only thing that can resolve a drain here.
  // Without advancing the clock, a bug that resolved only one waiter would
  // leave the others pending forever instead of falling back to the timeout.
  vi.useFakeTimers();
  try {
    const { monitor, drain } = createCommandDrain();
    monitor.onBeforeCommand({ commandName: "sendEvent" });

    const done = [];
    ["d1", "d2", "d3"].forEach((label) =>
      drain({ timeoutMs: 5000 }).then(() => done.push(label)),
    );

    monitor.onCommandResolved({ commandName: "sendEvent" });
    await vi.advanceTimersByTimeAsync(0); // flush microtasks, no timer fires
    expect(done.sort()).toEqual(["d1", "d2", "d3"]);
  } finally {
    vi.useRealTimers();
  }
});

test("drain re-arms after a previous drain reached idle", async () => {
  const { monitor, drain, getPending } = createCommandDrain();
  monitor.onBeforeCommand({ commandName: "a" });
  const first = drain();
  monitor.onCommandResolved({ commandName: "a" });
  await first;
  expect(getPending()).toBe(0);

  monitor.onBeforeCommand({ commandName: "b" });
  let settled = false;
  const second = drain().then(() => {
    settled = true;
  });
  await flush();
  expect(settled).toBe(false);

  monitor.onCommandResolved({ commandName: "b" });
  await second;
  expect(settled).toBe(true);
});

test("a timed-out drain does not keep a concurrent drain from idle-resolving", async () => {
  vi.useFakeTimers();
  try {
    const { monitor, drain } = createCommandDrain();
    monitor.onBeforeCommand({ commandName: "slow" });

    let shortSettled = false;
    let longSettled = false;
    const shortDrain = drain({ timeoutMs: 1000 }).then(() => {
      shortSettled = true;
    });
    const longDrain = drain({ timeoutMs: 5000 }).then(() => {
      longSettled = true;
    });

    await vi.advanceTimersByTimeAsync(1000);
    expect(shortSettled).toBe(true);
    expect(longSettled).toBe(false);
    await shortDrain;

    // The command finally settles well before the long drain's own timeout.
    // The long drain must resolve now, via idle — proving the short timeout
    // removed only its own resolver.
    monitor.onCommandResolved({ commandName: "slow" });
    await longDrain;
    expect(longSettled).toBe(true);
  } finally {
    vi.useRealTimers();
  }
});

test("a late settle after a drain timed out is safe and updates pending", async () => {
  vi.useFakeTimers();
  try {
    const { monitor, drain, getPending } = createCommandDrain();
    monitor.onBeforeCommand({ commandName: "stuck" });

    const drained = drain({ timeoutMs: 1000 });
    await vi.advanceTimersByTimeAsync(1000);
    await drained;

    // The timeout leaves the still-in-flight command counted.
    expect(getPending()).toBe(1);
    expect(() =>
      monitor.onCommandResolved({ commandName: "stuck" }),
    ).not.toThrow();
    expect(getPending()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});

test("getPending equals begins minus settles across random interleavings", () => {
  for (const seed of [1, 42, 1337, 0x5eed, 0xc0ffee]) {
    const rand = makeRand(seed);
    const { monitor, getPending } = createCommandDrain();
    let expected = 0; // independent model, no production helpers reused

    for (let i = 0; i < 400; i += 1) {
      const roll = rand();
      if (expected === 0 || roll < 0.5) {
        monitor.onBeforeCommand({ commandName: `c${i}` });
        expected += 1;
      } else if (roll < 0.75) {
        monitor.onCommandResolved({ commandName: `c${i}` });
        expected -= 1;
      } else {
        monitor.onCommandRejected({ commandName: `c${i}` });
        expected -= 1;
      }
      expect(getPending()).toBe(expected);
    }
  }
});

test.each([7, 99, 0xbeef])(
  "drain resolves only after the last of N randomly settled commands (seed %i)",
  async (seed) => {
    const rand = makeRand(seed);
    const n = 2 + Math.floor(rand() * 6); // 2..7 commands
    const { monitor, drain, getPending } = createCommandDrain();
    for (let i = 0; i < n; i += 1) {
      monitor.onBeforeCommand({ commandName: `c${i}` });
    }
    expect(getPending()).toBe(n);

    let settled = false;
    const drained = drain().then(() => {
      settled = true;
    });

    const order = shuffle([...Array(n).keys()], rand);
    const settleOne = (k) => {
      const settle =
        rand() < 0.5 ? monitor.onCommandResolved : monitor.onCommandRejected;
      settle({ commandName: `c${order[k]}` });
    };

    // Settle all but the last: still in flight, so the drain must not resolve.
    for (let k = 0; k < n - 1; k += 1) {
      settleOne(k);
    }
    await flush();
    expect(settled).toBe(false);

    settleOne(n - 1);
    await drained;
    expect(settled).toBe(true);
    expect(getPending()).toBe(0);
  },
);
