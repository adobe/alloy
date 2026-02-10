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
import { vi, beforeEach, describe, it, expect, afterEach } from "vitest";
import createTimeoutWrapper from "../../../../../src/components/BrandConcierge/createTimeoutWrapper.js";

describe("createTimeoutWrapper", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns object with onEvent, onPing, and onComplete handlers", () => {
    const mockCallback = vi.fn();
    const wrapper = createTimeoutWrapper({ onStreamResponseCallback: mockCallback, streamTimeout: 10000 });

    expect(typeof wrapper.onEvent).toBe("function");
    expect(typeof wrapper.onPing).toBe("function");
    expect(typeof wrapper.onComplete).toBe("function");
  });

  it("calls callback immediately when data arrives before timeout", () => {
    const mockCallback = vi.fn();
    const wrapper = createTimeoutWrapper({ onStreamResponseCallback: mockCallback, streamTimeout: 10000 });

    const testData = { data: "test data" };
    wrapper.onEvent(testData);

    expect(mockCallback).toHaveBeenCalledWith(testData);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("resets timeout when data arrives", () => {
    const mockCallback = vi.fn();
    const wrapper = createTimeoutWrapper({ onStreamResponseCallback: mockCallback, streamTimeout: 10000 });

    // Advance to just before timeout
    vi.advanceTimersByTime(9000);

    wrapper.onEvent({ data: "first chunk" });

    // Advance another 9 seconds (would have timed out without reset)
    vi.advanceTimersByTime(9000);

    // Should not have triggered timeout error
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith({ data: "first chunk" });
  });

  it("resets timeout when ping arrives", () => {
    const mockCallback = vi.fn();
    const wrapper = createTimeoutWrapper({ onStreamResponseCallback: mockCallback, streamTimeout: 10000 });

    // Advance to just before timeout
    vi.advanceTimersByTime(9000);

    // Ping resets timeout
    wrapper.onPing();

    // Advance another 9 seconds
    vi.advanceTimersByTime(9000);

    // Should not have triggered timeout (ping reset it)
    expect(mockCallback).not.toHaveBeenCalled();

    // Now advance to trigger timeout
    vi.advanceTimersByTime(2000);

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: "Stream timeout: No data received within 10 seconds"
      })
    });
  });

  it("ping does not forward to callback", () => {
    const mockCallback = vi.fn();
    const wrapper = createTimeoutWrapper({ onStreamResponseCallback: mockCallback, streamTimeout: 10000 });

    wrapper.onPing();
    wrapper.onPing();
    wrapper.onPing();

    // Pings should not trigger callback
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it("calls callback with error when timeout occurs", () => {
    const mockCallback = vi.fn();
    createTimeoutWrapper({ onStreamResponseCallback: mockCallback, streamTimeout: 10000 });

    // Advance time to trigger timeout
    vi.advanceTimersByTime(10000);

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: "Stream timeout: No data received within 10 seconds"
      })
    });
  });

  it("ignores subsequent onEvent calls after timeout fires", () => {
    const mockCallback = vi.fn();
    const wrapper = createTimeoutWrapper({ onStreamResponseCallback: mockCallback, streamTimeout: 10000 });

    // Trigger timeout
    vi.advanceTimersByTime(10000);

    expect(mockCallback).toHaveBeenCalledTimes(1);

    // Try to call after timeout
    wrapper.onEvent({ data: "late data" });

    // Should still only have been called once (with the error)
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("ignores subsequent onPing calls after timeout fires", () => {
    const mockCallback = vi.fn();
    const wrapper = createTimeoutWrapper({ onStreamResponseCallback: mockCallback, streamTimeout: 10000 });

    // Trigger timeout
    vi.advanceTimersByTime(10000);

    expect(mockCallback).toHaveBeenCalledTimes(1);

    // Try to ping after timeout - should not throw
    wrapper.onPing();

    // Should still only have been called once (with the error)
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("allows multiple data calls with timeout reset between each", () => {
    const mockCallback = vi.fn();
    const wrapper = createTimeoutWrapper({ onStreamResponseCallback: mockCallback, streamTimeout: 10000 });

    wrapper.onEvent({ data: "chunk 1" });
    vi.advanceTimersByTime(5000);
    wrapper.onEvent({ data: "chunk 2" });
    vi.advanceTimersByTime(5000);
    wrapper.onEvent({ data: "chunk 3" });

    expect(mockCallback).toHaveBeenCalledTimes(3);
    expect(mockCallback).toHaveBeenNthCalledWith(1, { data: "chunk 1" });
    expect(mockCallback).toHaveBeenNthCalledWith(2, { data: "chunk 2" });
    expect(mockCallback).toHaveBeenNthCalledWith(3, { data: "chunk 3" });

    // Should not timeout since we kept resetting
    vi.advanceTimersByTime(5000);
    expect(mockCallback).toHaveBeenCalledTimes(3);
  });

  it("handles error events from stream", () => {
    const mockCallback = vi.fn();
    const wrapper = createTimeoutWrapper({ onStreamResponseCallback: mockCallback, streamTimeout: 10000 });

    const streamError = { error: new Error("Stream error") };
    wrapper.onEvent(streamError);

    expect(mockCallback).toHaveBeenCalledWith(streamError);
  });

  it("does not timeout if data arrives just before timeout", () => {
    const mockCallback = vi.fn();
    const wrapper = createTimeoutWrapper({ onStreamResponseCallback: mockCallback, streamTimeout: 10000 });

    // Advance to just before timeout
    vi.advanceTimersByTime(9999);

    wrapper.onEvent({ data: "just in time" });

    // Advance past original timeout
    vi.advanceTimersByTime(1);

    // Should only have been called with the data, not with timeout error
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith({ data: "just in time" });
  });

  it("does not timeout if ping arrives just before timeout", () => {
    const mockCallback = vi.fn();
    const wrapper = createTimeoutWrapper({ onStreamResponseCallback: mockCallback, streamTimeout: 10000 });

    // Advance to just before timeout
    vi.advanceTimersByTime(9999);

    wrapper.onPing();

    // Advance past original timeout
    vi.advanceTimersByTime(1);

    // Should not have triggered timeout
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it("maintains rolling timeout with mixed ping and data events", () => {
    const mockCallback = vi.fn();
    const wrapper = createTimeoutWrapper({ onStreamResponseCallback: mockCallback, streamTimeout: 10000 });

    // T=0: Start
    vi.advanceTimersByTime(3000);  // T=3s

    // Ping at T=3s
    wrapper.onPing();
    vi.advanceTimersByTime(4000);  // T=7s

    // Data at T=7s
    wrapper.onEvent({ data: "chunk 1" });
    vi.advanceTimersByTime(5000);  // T=12s

    // Ping at T=12s
    wrapper.onPing();
    vi.advanceTimersByTime(8000);  // T=20s

    // Data at T=20s
    wrapper.onEvent({ data: "chunk 2" });

    // Should have received both data events, no timeout
    expect(mockCallback).toHaveBeenCalledTimes(2);
    expect(mockCallback).toHaveBeenNthCalledWith(1, { data: "chunk 1" });
    expect(mockCallback).toHaveBeenNthCalledWith(2, { data: "chunk 2" });
  });

  it("clears timeout when onComplete is called", () => {
    const mockCallback = vi.fn();
    const wrapper = createTimeoutWrapper({ onStreamResponseCallback: mockCallback, streamTimeout: 10000 });

    // Receive some data
    wrapper.onEvent({ data: "chunk 1" });

    // Stream completes
    wrapper.onComplete();

    // Advance past timeout - should NOT trigger error because stream completed
    vi.advanceTimersByTime(15000);

    // Should only have the data event, no timeout error
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith({ data: "chunk 1" });
  });

  it("clears timeout when onComplete is called even with no data", () => {
    const mockCallback = vi.fn();
    const wrapper = createTimeoutWrapper({ onStreamResponseCallback: mockCallback, streamTimeout: 10000 });

    // Stream completes immediately with no data
    wrapper.onComplete();

    // Advance past timeout - should NOT trigger error
    vi.advanceTimersByTime(15000);

    // Should not have been called at all
    expect(mockCallback).not.toHaveBeenCalled();
  });
});
