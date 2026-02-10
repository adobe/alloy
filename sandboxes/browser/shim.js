const sessionId = Date.now();
const BRAND_CONCIERGE_URL =
  "https://edge-int.adobedc.net/brand-concierge/conversations?sessionId=" +
  sessionId;

window.bootstrapConversationalExperience = ({
  previewConfigs,
  styles,
  ecid,
  webAgentURL,
  selector,
}) => {
  const preview = { ...previewConfigs };

  // SSE spec allows three line ending styles: CRLF (\r\n), LF (\n), or CR (\r)
  const LINE_ENDING_REGEX = /\r\n|\r|\n/;
  // Events are separated by blank lines (double line endings)
  const EVENT_SEPARATOR_REGEX = /\r\n\r\n|\n\n|\r\r/;
  // Ping comment format: `: ping` (colon followed immediately by "ping")
  const PING_COMMENT = ": ping";

  const isPingComment = (eventData) => {
    const trimmed = eventData.trim();
    return trimmed.startsWith(PING_COMMENT);
  };

  function parseEventFromBuffer(eventData) {
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
  }

  const parseStream = async (stream, { onEvent, onPing, onComplete }) => {
    const reader = stream.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    try {
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split(EVENT_SEPARATOR_REGEX);
        buffer = events.pop() || "";

        for (const event of events) {
          const trimmedEvent = event.trim();

          if (!trimmedEvent) {
            continue;
          }

          if (isPingComment(trimmedEvent)) {
            onPing();
            continue;
          }

          const parsedEvent = parseEventFromBuffer(trimmedEvent);

          if (parsedEvent !== null) {
            onEvent(parsedEvent);
          }
        }
      }

      const trimmedBuffer = buffer.trim();

      if (!trimmedBuffer) {
        onComplete();
        return;
      }

      if (isPingComment(trimmedBuffer)) {
        onPing();
        onComplete();
        return;
      }

      const event = parseEventFromBuffer(trimmedBuffer);

      if (event !== null) {
        onEvent(event);
      }

      onComplete();
    } catch (error) {
      onEvent({ error });
      onComplete();
    } finally {
      reader.releaseLock();
    }
  };

  console.log("Shim script loaded");
  const extractPayload = (data) => {
    const parsedData = JSON.parse(data);
    const { handle = [] } = parsedData;

    if (handle.length === 0) {
      return null;
    }
    for (let i = 0; i < handle.length; i++) {
      if (handle[i].type === "brand-concierge:conversation") {
        return handle[i].payload;
      }
    }
    return null;
  };

  const executeRequest = async (
    url,
    stringifiedPayload,
    onStreamResponseCallback,
    streamingEnabled = true,
  ) => {
    try {
      return await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          Accept: streamingEnabled ? "text/event-stream" : "text/plain",
        },
        body: stringifiedPayload,
      }).then((response) => {
        parseStream(response.body, {
          onEvent: onStreamResponseCallback,
          onPing: () => {},
          onComplete: () => {},
        });
      });
    } catch (error) {
      onStreamResponseCallback({ error });
      throw new Error("Network request failed.");
    }
  };

  const sendBrandConciergeEvent = ({ message, onStreamResponse, xdm = {} }) => {
    const streamingEnabled = xdm != {};
    xdm.identityMap = {
      ECID: [
        {
          id: ecid, //here you should use a mocked ECID
        },
      ],
    };

    const payload = {
      events: [
        {
          query: {
            conversation: {
              surfaces: [""], //here is a mocked surface the one they choose when configuring the Concierge
              message: message,
              preview,
            },
          },
          xdm,
        },
      ],
    };

    const onStreamResponseCallback = (event) => {
      if (event.error) {
        onStreamResponse({ error: event.error });
      }
      const substr = event.data.replace("data: ", "");
      const responsePayload = extractPayload(substr);
      console.log("onStreamResponse callback called with", responsePayload);
      onStreamResponse(responsePayload);
    };

    return executeRequest(
      BRAND_CONCIERGE_URL + "&requestId=" + Date.now(),
      JSON.stringify(payload),
      onStreamResponseCallback,
      streamingEnabled,
    );
  };

  window.alloyInstanceShim = (command, payload) => {
    console.log("Command received in shim:", command);
    if (command === "sendConversationEvent") {
      return sendBrandConciergeEvent(payload);
    } else {
      console.warn("Unknown command received in shim:", command);
      return Promise.resolve();
    }
  };
  const loadScript = (url) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    document.head.appendChild(script);
  };

  window.addEventListener("adobe-brand-concierge-prompt-loaded", () => {
    window.dispatchEvent(
      new CustomEvent("alloy-brand-concierge-instance", {
        detail: {
          instanceName: "alloyInstanceShim",
          selector: selector,
          stylingConfigurations: styles,
        },
      }),
    );
  });
  loadScript(webAgentURL);
};
