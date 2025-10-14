const sessionId = Date.now();
const BRAND_CONCIERGE_URL =
  "https://edge-int.adobedc.net/brand-concierge/conversations?sessionId=" + sessionId;

window.bootstrapConversationalExperience = ({previewConfigs, styles, ecid, webAgentURL, selector}) => {
  const preview = {...previewConfigs };


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

  const parseStream = async (stream, onEvent) => {
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
  };

  console.log("Shim script loaded");
  const extractPayload = (data) => {
    const parsedData = JSON.parse(data);
    const { handle = [] } = parsedData;

    if (handle.length === 0) {
      return null;
    }
    for(let i=0; i < handle.length; i++) {
      if(handle[i].type === "brand-concierge:conversation") {
        return handle[i].payload;
      }
    }
    return null;
  };

  const executeRequest = async (
    url,
    stringifiedPayload,
    onStreamResponseCallback,
    streamingEnabled = true
  ) => {
    try {
      return await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          Accept: streamingEnabled ? "text/event-stream": "text/plain",
        },
        body: stringifiedPayload,
      }).then((response) => {
        parseStream(response.body, onStreamResponseCallback);
      });
    } catch (error) {
      onStreamResponseCallback({error});
      throw new Error("Network request failed.");
    }
  };

  const sendBrandConciergeEvent = ({ message, onStreamResponse, xdm = {} }) => {
    const streamingEnabled = xdm != {};
    xdm.identityMap =  {
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
              preview
            },
          },
          xdm
        },
      ],
    };


    const onStreamResponseCallback = (event) => {
      if(event.error) {
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
      streamingEnabled
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

}
