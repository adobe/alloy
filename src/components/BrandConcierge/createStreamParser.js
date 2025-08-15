export default () =>{
  let lastEventId = '';

  function createSSEEvent(type = 'message', data = '', id = null, retry = null) {
    return {
      type,
      data,
      id,
      retry
    };
  }

  /**
   * Parse a single event from buffer data
   * @param {string} eventData - Raw event data
   * @returns {Object|null} - Parsed SSE event or null
   */
  function parseEventFromBuffer(eventData) {
    const lines = eventData.split('\n');
    let eventType = 'message';
    let data = [];
    let id = null;
    let retry = null;

    for (const line of lines) {
      // Skip empty lines and comments
      if (!line.trim() || line.startsWith(':')) {
        continue;
      }

      const colonIndex = line.indexOf(':');
      let field, value;

      if (colonIndex === -1) {
        // Field with no value
        field = line.trim();
        value = '';
      } else {
        field = line.substring(0, colonIndex).trim();
        value = line.substring(colonIndex + 1).trim();
      }

      switch (field) {
        case 'event':
          eventType = value;
          break;
        case 'data':
          data.push(value);
          break;
        case 'id':
          id = value;
          lastEventId = value;
          break;
        case 'retry':
          const retryValue = parseInt(value, 10);
          if (!isNaN(retryValue)) {
            retry = retryValue;
          }
          break;
        default:
          // Unknown field, ignore according to spec
          break;
      }
    }

    // Only create event if we have data or it's a special event
    if (data.length > 0 || eventType !== 'message') {
      return createSSEEvent(
        eventType,
        data.join('\n'),
        id,
        retry
      );
    }

    return null;
  }

  /**
   * Parse SSE stream using callbacks
   * @param {ReadableStream} stream - The readable stream from fetch response
   * @param {Function} onEvent - Callback function called for each event (event) => void
   * @param {Function} onError - Error callback (error) => void
   * @param {Function} onComplete - Completion callback () => void
   */
  async function parseStream(stream, onEvent, onError, onComplete) {
    const reader = stream.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Process any remaining data in buffer
          if (buffer.trim()) {
            const event = parseEventFromBuffer(buffer);
            if (event) {
              onEvent(event);
            }
          }
          break;
        }

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete events (separated by double newlines)
        const events = buffer.split('\n\n');

        // Keep the last incomplete event in buffer
        buffer = events.pop() || '';

        // Parse and emit complete events
        for (const eventData of events) {
          if (eventData.trim()) {
            const event = parseEventFromBuffer(eventData);
            if (event) {
              onEvent(event);
            }
          }
        }
      }
    } catch (error) {
      if (onError) onError(error);
    } finally {
      reader.releaseLock();
    }
  }

  return {
    parseStream
  };
}