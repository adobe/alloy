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

  it("calls callback immediately when data arrives before timeout", () => {
    const mockCallback = vi.fn();
    const wrappedCallback = createTimeoutWrapper({ onStreamResponseCallback: mockCallback, streamTimeout: 10000 });

    const testData = { data: "test data" };
    wrappedCallback(testData);

    expect(mockCallback).toHaveBeenCalledWith(testData);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("clears timeout when first data arrives", () => {
    const mockCallback = vi.fn();
    const wrappedCallback = createTimeoutWrapper({ onStreamResponseCallback: mockCallback, streamTimeout: 10000 });

    wrappedCallback({ data: "first chunk" });
    
    // Advance time past the timeout
    vi.advanceTimersByTime(15000);

    // Should not trigger timeout error since data already arrived
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith({ data: "first chunk" });
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

  it("ignores subsequent calls after timeout fires", () => {
    const mockCallback = vi.fn();
    const wrappedCallback = createTimeoutWrapper({ onStreamResponseCallback: mockCallback, streamTimeout: 10000 });

    // Trigger timeout
    vi.advanceTimersByTime(10000);

    expect(mockCallback).toHaveBeenCalledTimes(1);

    // Try to call after timeout
    wrappedCallback({ data: "late data" });

    // Should still only have been called once (with the error)
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("allows multiple calls before timeout", () => {
    const mockCallback = vi.fn();
    const wrappedCallback = createTimeoutWrapper({ onStreamResponseCallback: mockCallback, streamTimeout: 10000 });

    wrappedCallback({ data: "chunk 1" });
    wrappedCallback({ data: "chunk 2" });
    wrappedCallback({ data: "chunk 3" });

    expect(mockCallback).toHaveBeenCalledTimes(3);
    expect(mockCallback).toHaveBeenNthCalledWith(1, { data: "chunk 1" });
    expect(mockCallback).toHaveBeenNthCalledWith(2, { data: "chunk 2" });
    expect(mockCallback).toHaveBeenNthCalledWith(3, { data: "chunk 3" });
  });

  it("handles error events from stream", () => {
    const mockCallback = vi.fn();
    const wrappedCallback = createTimeoutWrapper({ onStreamResponseCallback: mockCallback, streamTimeout: 10000 });

    const streamError = { error: new Error("Stream error") };
    wrappedCallback(streamError);

    expect(mockCallback).toHaveBeenCalledWith(streamError);
  });

  it("does not timeout if first call happens just before timeout", () => {
    const mockCallback = vi.fn();
    const wrappedCallback = createTimeoutWrapper({ onStreamResponseCallback: mockCallback, streamTimeout: 10000 });

    // Advance to just before timeout
    vi.advanceTimersByTime(9999);

    wrappedCallback({ data: "just in time" });

    // Advance past timeout
    vi.advanceTimersByTime(1);

    // Should only have been called with the data, not with timeout error
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith({ data: "just in time" });
  });
});
