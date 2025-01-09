const markdownToHtml = (markdown) => {
  // Convert headers
  markdown = markdown.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
  markdown = markdown.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
  markdown = markdown.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  markdown = markdown.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  markdown = markdown.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  markdown = markdown.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Convert bold and italic text
  markdown = markdown.replace(/\*\*\*(.*)\*\*\*/gim, '<b><i>$1</i></b>');
  markdown = markdown.replace(/\*\*(.*)\*\*/gim, '<b>$1</b>');
  markdown = markdown.replace(/\*(.*)\*/gim, '<i>$1</i>');

  // Convert blockquotes
  markdown = markdown.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Convert ordered lists
  markdown = markdown.replace(/^\d+\.\s+(.*$)/gim, '<ol><li>$1</li></ol>');
  markdown = markdown.replace(/<\/ol>\s*<ol>/gim, '');

  // Convert unordered lists
  markdown = markdown.replace(/^\-\s+(.*$)/gim, '<ul><li>$1</li></ul>');
  markdown = markdown.replace(/<\/ul>\s*<ul>/gim, '');

  // Convert inline code
  markdown = markdown.replace(/`([^`]+)`/gim, '<code>$1</code>');

  // Convert code blocks
  markdown = markdown.replace(/```([^`]+)```/gim, '<pre><code>$1</code></pre>');

  // Convert horizontal rules
  markdown = markdown.replace(/^\s*[-*]{3,}\s*$/gim, '<hr>');

  // Convert links
  markdown = markdown.replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2">$1</a>');

  // Convert images
  markdown = markdown.replace(/\!\[([^\]]*)\]\(([^\)]+)\)/gim, '<img src="$2" alt="$1">');

  // Convert line breaks
  markdown = markdown.replace(/\n/gim, '<br>');

  return markdown.trim();
}
class Loading {
  constructor() {
    this.element = document.createElement('div');
    this.element.style.height = '100%';
    this.element.style.display = 'flex';
    this.element.style.justifyContent = 'center';
    this.element.style.alignItems = 'center';
    this.element.style.gap = '6px';

    const loadingCircle1 = new LoadingCircle().element;
    const loadingCircle2 = new LoadingCircle().element;
    const loadingCircle3 = new LoadingCircle().element;
    loadingCircle1.style.animationDelay = '0s';
    loadingCircle2.style.animationDelay = '0.25s';
    loadingCircle3.style.animationDelay = '0.5s';

    this.element.appendChild(loadingCircle1);
    this.element.appendChild(loadingCircle2);
    this.element.appendChild(loadingCircle3);
  }
}

class LoadingCircle {
  constructor() {
    this.element = document.createElement('div');
    this.element.style.width = '8px';
    this.element.style.height = '8px';
    this.element.style.borderRadius = '50%';
    this.element.style.opacity = '1';
    this.element.style.transition = 'opacity 1s ease-in-out';
    this.element.style.animation = 'fade 1s infinite';
    this.element.style.backgroundColor = '#F96302';

    this.element.innerHTML = `
      <style>
        @keyframes fade {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
      </style>
    `;
  }
}

class ChatInterface {
  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'chat-interface';
    this.element.innerHTML = `
      <style>
        .chat-interface {
          width: 380px;
          height: 550px;
          z-index: 3000000000;
          border-radius: 2px;
          background-color: white;
          position: fixed;
          bottom: 20px;
          right: 20px;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
          a {
            color: #F96302;
          }
          .chat-header {
            height: 48px;
            border-radius: 2px;
            background-color: #F96302;
            color: white;
            font-size: 14px;
            font-weight: bold;
            padding: 10px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .chat-body {
            display: flex;
            flex-direction: column;
            height: 476px;
            .chat-messages {
              flex: 1;
              padding: 0 12px 10px 12px;
              overflow-y: auto;
              .response-container {
                display: flex;
                padding-top: 12px;
                &.user-response-container {
                  justify-content: right;
                }
                .response {
                  width: fit-content;
                  min-height: 33px;
                  padding: 6px 16px;
                  border-radius: 16px;
                  &.concierge-response {
                    background-color: #EEEEEE;
                    color: black;
                  }
                  &.user-response {
                    background-color: #000000; //#F96302;
                    color: white;
                  }
                }
              }
            }
            .chat-input-container {
              display: flex;
              .chat-input {
                flex: 1;
                padding: 10px;
                margin: 6px 0 6px 12px;
                border-width: 1px 0 1px 1px;
                border-style: solid;
                border-color: #212120;
                border-top-left-radius: 2px;
                border-bottom-left-radius: 2px;
              }
              .send-button {
                background-color: #F96302;
                padding: 10px;
                margin: 6px 12px 6px 0;
                border: none;
                border-top-right-radius: 2px;
                border-bottom-right-radius: 2px;
                color: white;
                font-weight: bold;
                cursor: pointer;
                &:disabled {
                  background-color: #FF9752;
                }
              }
            }
          }
        }
      </style>
      <div class="chat-header">
        Ask Build Buddy
        <button class="close-button">
          <img style="transform: rotate(90deg);" src="https://assets.thdstatic.com/images/v1/caret-white.svg" alt="Minimize Chat" />
        </button>
      </div>
      <div class="chat-body">
        <div class="chat-messages"></div>
        <div class="chat-input-container">
          <input class="chat-input" type="text" placeholder="What brings you in today?" />
          <button class="send-button">Send</button>
        </div>
      </div>
    `;

    setTimeout(() => {
      this.chatMessages = this.element.querySelector('.chat-messages');

      this.closeButton = this.element.querySelector('.close-button');
      this.closeButton.addEventListener('click', this.close);

      this.chatInput = this.element.querySelector('.chat-input');
      this.chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          this.sendMessage();
        }
      });

      this.sendButton = this.element.querySelector('.send-button');
      this.sendButton.addEventListener('click', this.sendMessage);

      this.resetChatControls();
      this.startConversation();
    }, 0);

    window.addEventListener('alloy-brand-concierge-instance', payload => {
      const { instanceName } = payload.detail;
      this.alloyInstanceName = instanceName;
    });
    window.dispatchEvent(new CustomEvent("adobe-brand-concierge-prompt-loaded"));
  }

  close = () => {
    document.body.appendChild(new ChatButton().element);
    document.body.removeChild(this.element);
  }

  resetChatControls = () => {
    this.chatInput.disabled = false;
    this.chatInput.value = '';
    this.chatInput.focus();
    this.sendButton.disabled = false;
  }

  disableChatControls = () => {
    this.chatInput.disabled = true;
    this.sendButton.disabled = true;
  }

  startConversation = () => {
    // Prompt the concierge to start the conversation
    this.fetchAndAppendConciergeResponse("Hello!");
  }

  sendMessage = () => {
    const message = this.chatInput.value?.trim();
    if (!message) {
      return;
    }

    this.resetChatControls();
    this.appendUserResponse(message);

    // Simulate a delay before the concierge responds for a more human-like experience
    const maxWaitMilliseconds = 1250;
    const minWaitMilliseconds = 750;
    const waitMilliseconds = Math.floor(Math.random() * (maxWaitMilliseconds - minWaitMilliseconds + 1)) + minWaitMilliseconds;
    setTimeout(() => this.fetchAndAppendConciergeResponse(message), waitMilliseconds);
  }

  appendResponse = (responseElement, isConciergeResponse) => {
    const responseContainerElement = this.createResponseContainerElement(isConciergeResponse);
    responseContainerElement.appendChild(responseElement);

    this.chatMessages.appendChild(responseContainerElement);
    responseContainerElement.scrollIntoView({ behavior: "smooth", block: "start" });

    return responseContainerElement;
  }

  getStylePrefix = (isConciergeResponse) => {
    return isConciergeResponse ? 'concierge' : 'user';
  }

  createMessageElement = (message, isConciergeResponse) => {
    const prefix = this.getStylePrefix(isConciergeResponse);
    const messageElement = document.createElement('div');
    messageElement.className = `response ${prefix}-response`;
    messageElement.innerHTML = message;
    return messageElement;
  }

  createLoadingElement = () => {
    const loading = new Loading();
    const loadingElement = document.createElement('div');
    loadingElement.className = 'response concierge-response';
    loadingElement.appendChild(loading.element);
    return loadingElement;
  }

  createResponseContainerElement = (isConciergeResponse) => {
    const prefix = this.getStylePrefix(isConciergeResponse);
    const responseContainerElement = document.createElement('div');
    responseContainerElement.className = `response-container ${prefix}-response-container`;
    return responseContainerElement;
  }

  replaceResponseContainerElementContents = (responseContainerElement, newElement) => {
    responseContainerElement.replaceChildren();
    responseContainerElement.appendChild(newElement);
  }

  appendUserResponse = (message) => {
    const messageElement = this.createMessageElement(message, false);
    return this.appendResponse(messageElement, false);
  }

  fetchAndAppendConciergeResponse = (message) => {
    // Get the last user response container element to scroll to it after the concierge responds
    const lastUserResponseContainerElement = this.chatMessages.lastElementChild;

    const responseContainerElement = this.appendResponse(this.createLoadingElement(), true);
    this.disableChatControls();

    /*fetch('https://experience-platform-aep-gen-ai-assistant-exp86.corp.ethos12-stage-va7.ethos.adobe.net/brand-concierge/chats?datastream_id=211312ed-d9ca-4f51-b09c-2de37a2a24d0&response_format=markdown', {
      method: 'POST',
      headers: {
        // This header isn't needed when calling from PostBuster, but if it's not present here the request fails (422)
        "Content-Type": "",
      },
      body: JSON.stringify({
        message,
        featureOverride: {
          "aep-copilot-agent-selector": "copilot_brand_concierge_v1"
        }
      }),*/
    if (this.alloyInstanceName) {

      window[this.alloyInstanceName]("sendBrandConciergeEvent", {
        message: message
      }).then(response => {
        return response.json();
      })
        .then(data => {
          const conciergeMessage = data?.interaction?.response[0]?.message;
          if (conciergeMessage) {
            const htmlConciergeMessage = markdownToHtml(conciergeMessage);
            this.replaceResponseContainerElementContents(
              responseContainerElement,
              this.createMessageElement(htmlConciergeMessage, true)
            );
            // Now that the response has grown in height, scroll to show the last user response at the top
            // in case the response is taller than the chat messages viewport.  We want to ensure that the
            // user still has the context of their last message when viewing the concierge response.
            lastUserResponseContainerElement?.scrollIntoView({ behavior: "smooth", block: "start" });
          }

          this.resetChatControls();
        })
        .catch(error => {
          console.error(error);

          this.replaceResponseContainerElementContents(
            responseContainerElement,
            this.createMessageElement('Sorry, I am unable to assist you at the moment. Please try again later.', true)
          );
          responseContainerElement.scrollIntoView({ behavior: "smooth", block: "start" });

          this.resetChatControls();
        });
    }
  }
}
class ChatButton {
  constructor() {
    this.element = document.createElement('div');
    this.element.innerHTML = `
      <style>
        .bc-chat-button {
          width: 200px;
          color: white;
          background-color: #F96302;
          border-radius: 2px;
          font-family: helvetica-neue-75-bold,ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;
          font-size: 16px;
          font-weight: 400;
          padding: 10px;
          margin: 10px;
          position: fixed;
          bottom: 20px;
          right: 20px;
        }
        .bc-chat-button:hover {
            background-color: black;
            text-decoration: underline;
          }
        }
      </style>
      <button id="adobe-bc-btn" class="bc-chat-button">Ask Build Buddy</button>
    `;

    this.element.querySelector('button').addEventListener('click', this.handleClick);
  }

  handleClick = () => {
    document.body.appendChild(new ChatInterface().element);
    document.body.removeChild(this.element);

  }
}

const rootElement = document.body;
if (rootElement) {
  const chatButton = new ChatButton();
  rootElement.appendChild(chatButton.element);
}