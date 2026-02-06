/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
export default () => {
  // SSE streams are always UTF-8 encoded per specification
  const ENCODING = "utf-8";
  // SSE spec allows three line ending styles: CRLF (\r\n), LF (\n), or CR (\r)
  const LINE_ENDING_REGEX = /\r\n|\r|\n/;
  // Events are separated by blank lines (double line endings)
  const EVENT_SEPARATOR_REGEX = /\r\n\r\n|\n\n|\r\r/;

  /**
   * Parse a single SSE event from raw event data.
   * Follows the Server-Sent Events specification (https://html.spec.whatwg.org/multipage/server-sent-events.html)
   *
   * @param {string} eventData - Raw event data (multi-line string containing SSE fields)
   * @returns {Object|null} - Parsed SSE event with structure { type, data, id } or null if invalid
   */
  const parseEventFromBuffer = (eventData) => {
    const lines = eventData.split(LINE_ENDING_REGEX);
    const parsedEvent = {};

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (!trimmedLine) {
        continue;
      }

      const colonIndex = trimmedLine.indexOf(":");

      if (colonIndex === -1) {
        continue;
      }

      const field = trimmedLine.substring(0, colonIndex).trim();
      const value = trimmedLine.substring(colonIndex + 1).trim();

      if (field === "data") {
        parsedEvent.data = (parsedEvent.data || "") + value;
      } else if (field === "event") {
        parsedEvent.type = value;
      } else if (field === "id") {
        parsedEvent.id = value;
      }
    }

    return parsedEvent.data ? parsedEvent : null;
  };

  /**
   * Parse SSE stream using callbacks.
   * Uses modern async iteration (for await...of) for clean, performant stream processing.
   *
   * @param {ReadableStream} stream - The readable stream from fetch response
   * @param {Function} onEvent - Callback function called for each parsed event
   */
  return async (stream, onEvent) => {
    const decoder = new TextDecoder(ENCODING);
    let buffer = "";

    try {
      for await (const chunk of stream) {
        buffer += decoder.decode(chunk, { stream: true });
        const events = buffer.split(EVENT_SEPARATOR_REGEX);
        buffer = events.pop() || "";

        for (const eventData of events) {
          const trimmedEvent = eventData.trim();

          if (trimmedEvent) {
            const event = parseEventFromBuffer(trimmedEvent);

            if (event !== null) {
              onEvent(event);
            }
          }
        }
      }

      const trimmedBuffer = buffer.trim();

      if (trimmedBuffer) {
        const event = parseEventFromBuffer(trimmedBuffer);

        if (event !== null) {
          onEvent(event);
        }
      }
    } catch (error) {
      onEvent({ error });
    }
  };
};
