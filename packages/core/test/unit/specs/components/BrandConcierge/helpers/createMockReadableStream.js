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

/**
 * Creates a mock ReadableStream with getReader() support for testing.
 * Simulates the behavior of fetch response.body streams.
 *
 * @param {Array<Uint8Array|Error>} chunks - Array of chunks to yield. Use Error instances to simulate stream errors.
 * @returns {Object} - Mock stream object with getReader() method
 *
 * @example
 * // Normal stream
 * const stream = createMockReadableStream([
 *   new TextEncoder().encode('data: {"text": "Hello"}\n\n'),
 *   new TextEncoder().encode('data: {"text": "World"}\n\n'),
 * ]);
 *
 * @example
 * // Stream that errors
 * const stream = createMockReadableStream([
 *   new TextEncoder().encode('data: {"text": "Hello"}\n\n'),
 *   new Error("Stream reading failed"),
 * ]);
 */
export default (chunks) => {
  let index = 0;
  let locked = false;

  return {
    getReader() {
      if (locked) {
        throw new Error("ReadableStream is locked");
      }
      locked = true;

      return {
        async read() {
          if (index >= chunks.length) {
            return { done: true, value: undefined };
          }

          const chunk = chunks[index];
          index += 1;

          if (chunk instanceof Error) {
            throw chunk;
          }

          return { done: false, value: chunk };
        },

        releaseLock() {
          locked = false;
        },
      };
    },
  };
};
