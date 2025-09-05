const styles = {
  metadata: {
    brandName: "Adobe.com Hackathon",
    version: "1.0.0",
    language: "en-US",
    namespace: "brand-concierge",
  },
  behavior: {
    multimodalCarousel: {
      cardClickAction: "openLink",
    },
    input: {
      enableVoiceInput: false,
      disableMultiline: true,
      showAiChatIcon: true,
    },
    chat: {
      messageAlignment: "left",
      messageWidth: "100%",
    },
  },
  disclaimer: {
    text: "AI responses may be inaccurate. Check answers and sources. {Terms}",
    links: [
      {
        text: "Terms",
        url: "https://www.adobe.com/legal/terms.html",
      },
    ],
  },
  text: {
    "welcome.heading": "Explore what you can do with Adobe apps.",
    "welcome.subheading":
      "Choose an option or tell us what interests you and we'll point you in the right direction.",
    "input.placeholder": "Tell us what you'd like to do or create",
    "input.messageInput.aria": "Message input",
    "input.send.aria": "Send message",
    "input.aiChatIcon.tooltip": "Ask AI",
    "input.mic.aria": "Voice input",
    "card.aria.select": "Select example message",
    "carousel.prev.aria": "Previous cards",
    "carousel.next.aria": "Next cards",
    "scroll.bottom.aria": "Scroll to bottom",
    "error.network":
      "I'm sorry, I'm having trouble connecting to our services right now.",
    "loading.message": "Generating response from our knowledge base",
    "feedback.dialog.title.positive": "Your feedback is appreciated",
    "feedback.dialog.title.negative": "Your feedback is appreciated",
    "feedback.dialog.question.positive":
      "What went well? Select all that apply.",
    "feedback.dialog.question.negative":
      "What went wrong? Select all that apply.",
    "feedback.dialog.notes": "Notes",
    "feedback.dialog.submit": "Submit",
    "feedback.dialog.cancel": "Cancel",
    "feedback.dialog.notes.placeholder": "Additional notes (optional)",
    "feedback.toast.success": "Thank you for the feedback.",
    "feedback.thumbsUp.aria": "Thumbs up",
    "feedback.thumbsDown.aria": "Thumbs down",
  },
  arrays: {
    "welcome.examples": [
      {
        text: "I'd like to explore templates to see what I can create.",
        image:
          "https://main--milo--adobecom.aem.page/drafts/methomas/assets/media_142fd6e4e46332d8f41f5aef982448361c0c8c65e.png",
        backgroundColor: "#FFFFFF",
      },
      {
        text: "I want to touch up and enhance my photos.",
        image:
          "https://main--milo--adobecom.aem.page/drafts/methomas/assets/media_1e188097a1bc580b26c8be07d894205c5c6ca5560.png",
        backgroundColor: "#FFFFFF",
      },
      {
        text: "I'd like to edit PDFs and make them interactive.",
        image:
          "https://main--milo--adobecom.aem.page/drafts/methomas/assets/media_1f6fed23045bbbd57fc17dadc3aa06bcc362f84cb.png",
        backgroundColor: "#FFFFFF",
      },
      {
        text: "I want to turn my clips into polished videos.",
        image:
          "https://main--milo--adobecom.aem.page/drafts/methomas/assets/media_16c2ca834ea8f2977296082ae6f55f305a96674ac.png",
        backgroundColor: "#FFFFFF",
      },
    ],
    "feedback.positive.options": [
      "Helpful and relevant recommendations",
      "Clear and easy to understand",
      "Friendly and conversational tone",
      "Visually appealing presentation",
      "Other",
    ],
    "feedback.negative.options": [
      "Not helpful or relevant",
      "Confusing or unclear",
      "Too formal or robotic",
      "Poor visual presentation",
      "Other",
    ],
  },
  assets: {
    icons: {
      company: "",
    },
  },
  theme: {
    "--color-primary": "#007bff",
    "--color-button-primary": "#3B63FB",
    "--color-text-light": "#ffffff",
    "--main-container-background":
      "linear-gradient(122.87deg, #E1E9FF 20.72%, #EFE3FA 34.96%, #F5DFF8 42.08%, #FCDCF5 49.2%, #FFDEC3 91.6%)",
    "--welcome-heading-size-desktop": "36px",
    "--welcome-heading-weight": "800",
    "--welcome-subheading-size-desktop": "16px",
    "--welcome-subheading-weight": "400",
    "--color-text": "#131313",
    "--input-border-radius": "12px",
    "--input-border-radius-mobile": "12px",
    "--input-background": "#FFFFFF",
    "--input-outline-color":
      "linear-gradient(98.11deg, #9A3CF9 -4.21%, #E743C8 35.46%, #ED457E 68.67%, #FF7918 104.7%)",
    "--input-outline-width": "2px",
    "--input-focus-outline-color": "rgba(113, 85, 250, 0.8)",
    "--submit-button-fill-color-disabled": "#C6C6C6",
    "--color-button-submit": "#ddd",
    "--color-button-submit-hover": "#ccc",
    "--button-disabled-background": "#FFFFFF",
    "--card-border-radius": "12px",
    "--card-text-color": "#292929",
    "--welcome-input-order": "3",
    "--welcome-cards-order": "2",
    "--font-family": "'Adobe Clean', adobe-clean, 'Trebuchet MS', sans-serif",
    "--disclaimer-color": "#717171",
    "--disclaimer-font-size": "12px",
    "--disclaimer-font-weight": "400",
    "--message-user-background": "#EBEEFF",
    "--message-user-text": "#292929",
    "--message-border-radius": "10px",
    "--message-concierge-background": "#FFFFFF",
    "--message-concierge-text": "#292929",
    "--dialog-button-border-radius": "var(--border-radius-large)",
    "--dialog-button-primary-background": "#007bff",
    "--dialog-button-primary-background-hover": "#0056b3",
    "--multimodal-carousel-track-margin-bottom": "1rem",
    "--message-concierge-link-color": "#007bff",
    "--message-concierge-link-decoration": "underline",
    "--chat-history-bottom-padding": "0px",
    "--message-blocker-height": "117px",
    "--message-blocker-background": "white",
  },
};
const webAgentURL =
  "https://experience-stage.adobe.net/solutions/experience-platform-brand-concierge-web-agent/static-assets/main.js";
const DATASTREAM_ID = "3849362c-f325-4418-8cc8-993342b254f7";
const BRAND_CONCIERGE_URL =
  "https://edge-int.adobedc.net/brand-concierge/conversations?sessionId=" +
  Date.now() +
  "&configId=" +
  DATASTREAM_ID;
let lastEventId = "";

function createSSEEvent(type = "message", data = "", id = null, retry = null) {
  return {
    type,
    data,
    id,
    retry,
  };
}

/**
 * Parse a single event from buffer data
 * @param {string} eventData - Raw event data
 * @returns {Object|null} - Parsed SSE event or null
 */
function parseEventFromBuffer(eventData) {
  const lines = eventData.split("\n");
  let eventType = "message";
  const data = [];
  let id = null;
  let retry = null;

  for (const line of lines) {
    // Skip empty lines and comments
    if (!line.trim() || line.startsWith(":")) {
      continue;
    }

    const colonIndex = line.indexOf(":");
    let field, value;

    if (colonIndex === -1) {
      // Field with no value
      field = line.trim();
      value = "";
    } else {
      field = line.substring(0, colonIndex).trim();
      value = line.substring(colonIndex + 1).trim();
    }

    switch (field) {
      case "event":
        eventType = value;
        break;
      case "data":
        data.push(value);
        break;
      case "id":
        id = value;
        lastEventId = value;
        break;
      case "retry":
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
  if (data.length > 0 || eventType !== "message") {
    return createSSEEvent(eventType, data.join("\n"), id, retry);
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
async function parseStream(stream, onEvent) {
  const reader = stream.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

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
      const events = buffer.split("\n\n");

      // Keep the last incomplete event in buffer
      buffer = events.pop() || "";

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
   onEvent({error});
  } finally {
    reader.releaseLock();
  }
}

console.log("Shim script loaded");
const extractResponse = (data) => {
  const parsedData = JSON.parse(data);
  const { handle = [] } = parsedData;

  if (handle.length === 0) {
    return null;
  }

  const { payload = [] } = handle[0];

  return payload;
};

const executeRequest = async (
  url,
  stringifiedPayload,
  onStreamResponseCallback,
  onFailureCallback,
) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        Accept: "text/event-stream",
      },
      body: stringifiedPayload,
    }).then((response) => {
      console.log("Fetch response received, response:", response.body);
      parseStream(response.body, onStreamResponseCallback);
    });
  } catch (error) {
    console.log("error occurred", error);
    onFailureCallback(error);
    throw new Error("Network request failed.");
  }
};

const sendBrandConciergeEvent = ({ message, onStreamResponse }) => {
  const payload = {
    events: [
      {
        query: {
          conversation: {
            surfaces: ["web://127.0.0.1:8081/docs/acom"], //here is a mocked surface the one they choose when configuring the Concierge
            message: message,
          },
        },
        xdm: {
          identityMap: {
            ECID: [
              {
                id: "64395793505733346863180552286287786759", //here you should use a mocked ECID
              },
            ],
          },
          web: {
            webPageDetails: {
              URL: "https://bc-conversation-service-dev.corp.ethos11-stage-va7.ethos.adobe.net/brand-concierge/pages/745F37C35E4B776E0A49421B@AdobeOrg/index.html", // here is amocked URL
            },
            webReferrer: {
              URL: "",
            },
          },
        },
      },
    ],
  };

  const onFailureCallback = (error) => {
    console.log("error", error);
    onStreamResponse({ error });
  };
  const onStreamResponseCallback = (event) => {
    if(event.error) {
      onStreamResponse({ error });
    }
    console.log("event", event);
    const substr = event.data.replace("data: ", "");
    const response = extractResponse(substr);
    console.log("response", response)
    onStreamResponse(response);
  };

  return executeRequest(
    BRAND_CONCIERGE_URL + "&requestId=" + Date.now(),
    JSON.stringify(payload),
    onStreamResponseCallback,
    onFailureCallback,
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
  // in the next event payload we can add urls to the styles and scripts that the prompt needs
  window.dispatchEvent(
    new CustomEvent("alloy-brand-concierge-instance", {
      detail: {
        instanceName: "alloyInstanceShim",
        selector: "#brand-concierge-mount", // the selector where it should be added the web client
        stylingConfigurations: styles, // add the object from your local env
      },
    }),
  );
});
loadScript(webAgentURL);
