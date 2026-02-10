/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { vi, beforeEach, describe, it, expect } from "vitest";
import createStreamParser from "../../../../../src/components/BrandConcierge/createStreamParser.js";
import flushPromiseChains from "../../../helpers/flushPromiseChains.js";

describe("createStreamParser", () => {
  let streamParser;
  let onEvent;
  let onPing;
  let onComplete;

  beforeEach(() => {
    streamParser = createStreamParser();
    onEvent = vi.fn();
    onPing = vi.fn();
    onComplete = vi.fn();
  });

  it("creates a stream parser function", () => {
    expect(typeof streamParser).toBe("function");
  });

  it("parses streaming data chunks", async () => {
    // Create a mock stream using async generator
    async function* mockStream() {
      yield new TextEncoder().encode('data: {"text": "Hello"}\n\n');
      yield new TextEncoder().encode('data: {"text": " World"}\n\n');
    }

    await streamParser(mockStream(), { onEvent, onPing, onComplete });

    expect(onEvent).toHaveBeenCalledTimes(2);
    expect(onEvent).toHaveBeenCalledWith({ data: '{"text": "Hello"}' });
    expect(onEvent).toHaveBeenCalledWith({ data: '{"text": " World"}' });
  });

  it("handles parsing errors gracefully", async () => {
    // Create a mock stream that yields invalid data
    async function* mockStream() {
      yield new TextEncoder().encode('data: {"text": "Hello"}\n\n');
      yield new TextEncoder().encode('data: invalid json\n\n');
    }

    await streamParser(mockStream(), { onEvent, onPing, onComplete });

    expect(onEvent).toHaveBeenCalledTimes(2);
    expect(onEvent).toHaveBeenCalledWith({ data: '{"text": "Hello"}' });
    expect(onEvent).toHaveBeenCalledWith({ data: 'invalid json' });
  });

  it("handles stream reading errors", async () => {
    // Create a mock stream that throws an error
    async function* mockStream() {
      yield new TextEncoder().encode('data: {"text": "Hello"}\n\n');
      throw new Error("Stream reading failed");
    }

    await streamParser(mockStream(), { onEvent, onPing, onComplete });

    expect(onEvent).toHaveBeenCalledWith({ data: '{"text": "Hello"}' });
    expect(onEvent).toHaveBeenCalledWith({ error: expect.any(Error) });
  });

  it("ignores empty lines and non-ping comments", async () => {
    async function* mockStream() {
      yield new TextEncoder().encode(': this is a comment\n\n');
      yield new TextEncoder().encode('\n\n');
      yield new TextEncoder().encode('data: {"text": "Hello"}\n\n');
    }

    await streamParser(mockStream(), { onEvent, onPing, onComplete });

    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledWith({ data: '{"text": "Hello"}' });
  });

  it("calls onPing callback when ping comment is received", async () => {

    async function* mockStream() {
      yield new TextEncoder().encode(': ping\n\n');
      yield new TextEncoder().encode('data: {"text": "Hello"}\n\n');
    }

    await streamParser(mockStream(), { onEvent, onPing, onComplete });

    expect(onPing).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledWith({ data: '{"text": "Hello"}' });
  });

  it("handles multiple ping comments", async () => {
    async function* mockStream() {
      yield new TextEncoder().encode(': ping\n\n');
      yield new TextEncoder().encode(': ping\n\n');
      yield new TextEncoder().encode('data: {"text": "Hello"}\n\n');
      yield new TextEncoder().encode(': ping\n\n');
    }

    await streamParser(mockStream(), { onEvent, onPing, onComplete });

    expect(onPing).toHaveBeenCalledTimes(3);
    expect(onEvent).toHaveBeenCalledTimes(1);
  });

  it("only treats ': ping' as ping comment", async () => {
    async function* mockStream() {
      yield new TextEncoder().encode(': ping\n\n');     // This IS a ping (space after colon)
      yield new TextEncoder().encode(':ping\n\n');      // This is NOT (no space after colon)
      yield new TextEncoder().encode(': pinging\n\n');  // This IS a ping (startsWith ': ping')
      yield new TextEncoder().encode(': PING\n\n');     // This is NOT (uppercase)
    }

    await streamParser(mockStream(), { onEvent, onPing, onComplete });

    expect(onPing).toHaveBeenCalledTimes(2);  // ': ping' and ': pinging' count
    expect(onEvent).toHaveBeenCalledTimes(0); // None have data fields
  });

  it("handles event types and IDs", async () => {
    async function* mockStream() {
      yield new TextEncoder().encode('event: message\ndata: {"text": "Hello"}\nid: 123\n\n');
    }

    await streamParser(mockStream(), { onEvent, onPing, onComplete });

    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledWith({
      type: 'message',
      data: '{"text": "Hello"}',
      id: '123'
    });
  });

  it("handles multi-line data", async () => {
    async function* mockStream() {
      yield new TextEncoder().encode('data: line 1\ndata: line 2\n\n');
    }

    await streamParser(mockStream(), { onEvent, onPing, onComplete });

    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledWith({ data: 'line 1line 2' });
  });

  it("processes buffer remainder at end", async () => {
    async function* mockStream() {
      yield new TextEncoder().encode('data: {"text": "Hello"}');
    }

    await streamParser(mockStream(), { onEvent, onPing, onComplete });

    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledWith({ data: '{"text": "Hello"}' });
  });

  it("calls onComplete when stream ends with data", async () => {
    async function* mockStream() {
      yield new TextEncoder().encode('data: {"text": "Hello"}\n\n');
    }

    await streamParser(mockStream(), { onEvent, onPing, onComplete });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("calls onComplete when stream ends with empty buffer", async () => {
    async function* mockStream() {
      yield new TextEncoder().encode('data: {"text": "Hello"}\n\n');
    }

    await streamParser(mockStream(), { onEvent, onPing, onComplete });

    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("calls onComplete when stream ends with ping", async () => {
    async function* mockStream() {
      yield new TextEncoder().encode(': ping');
    }

    await streamParser(mockStream(), { onEvent, onPing, onComplete });

    expect(onPing).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("calls onComplete after onEvent when stream errors", async () => {
    async function* mockStream() {
      throw new Error("Stream error");
    }

    await streamParser(mockStream(), { onEvent, onPing, onComplete });

    expect(onEvent).toHaveBeenCalledWith({ error: expect.any(Error) });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});