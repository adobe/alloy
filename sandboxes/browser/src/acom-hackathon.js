export const styles = {
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
