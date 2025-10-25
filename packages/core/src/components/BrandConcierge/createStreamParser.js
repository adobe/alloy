/**
 * Parse SSE stream using callbacks
 * @param {ReadableStream} stream - The readable stream from fetch response
 * @param {Function} onEvent - Callback function called for each event
 */
export default () => {
  /**
   * Parse a single event from buffer data
   * @param {string} eventData - Raw event data
   * @returns {Object|null} - Parsed SSE event or null
   */
  function parseEventFromBuffer(eventData) {
    const lines = eventData.split("\n");
    let eventType = "message";
    let data = "";

    for (const line of lines) {
      if (line.startsWith("event:")) {
        eventType = line.substring(6).trim();
      } else if (line.startsWith("data:")) {
        data += line.substring(5).trim() + "\n";
      }
    }

    return data ? { type: eventType, data: data.trim() } : null;
  }

  return async (stream, onEvent) => {
    const reader = stream.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\r\n");
        buffer = events.pop() || ""; // Keep incomplete data in the buffer

        for (const eventData of events) {
          const event = parseEventFromBuffer(eventData);
          if (event) onEvent(event);
        }
      }

      // Process any remaining data in the buffer
      if (buffer.trim()) {
        const event = parseEventFromBuffer(buffer);
        if (event) onEvent(event);
      }
    } catch (error) {
      onEvent({ error });
    } finally {
      reader.releaseLock();
    }
  }
};