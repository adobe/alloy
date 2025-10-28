/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 717:
/***/ ((module, __unused_webpack___webpack_exports__, __webpack_require__) => {

/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(417);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
// Imports



var ___CSS_LOADER_URL_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(709), __webpack_require__.b);
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_0___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/* ========== Base variables and settings ========== */
:root {
  --primary-color: #304cb2;
  --primary-hover-color: #1a2c80;
  --background-color: #ffffff;
  --text-color: #000000;
  --border-color: #e3e3e3;
  --secondary-background: white;
  --concierge-message-bg: #FFFFFF;
  --user-message-bg: #304cb2;
  --prompt-message-bg: #FFFFFF;
  --user-message-text: white;
  --concierge-message-text: #000000;
  --prompt-message-text: #000000;
  --transition-speed: 0.3; /* Smaller UI transitions */
  --page-transition-duration: 0.5s; /* Page transition duration */
  --font-family: 'Southwest Sans', Arial, sans-serif;
  --font-prompt: Nunito Sans;
  /* Content widths */
  --content-width-mobile: 100%;
  --content-width-desktop: 800px;
  --container-padding-mobile: 16px;
  --container-padding-desktop: 24px;
  
  /* Card dimensions */
  --card-width: 248px;
  --card-gap: 10px;
  --dark-color: #222222;
  --color-white: #FFFFFF;
}

/* Ensure the body and html take up full height */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: auto; /* Allow scrolling */
  font-family: var(--font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${___CSS_LOADER_URL_REPLACEMENT_0___});
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
}

/* Main container */
.brand-concierge-container {
  font-family: var(--font-family);
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: var(--text-color);
  position: relative;
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
  overflow: auto; /* Allow scrolling */
}

/* Initial state - centered content */
.brand-concierge-container.initial-state {
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-concierge-container.initial-state .chat-interface {
  justify-content: center;
  margin: 0 auto;
  height: auto;
  min-height: 0;
}

.brand-concierge-container.initial-state .chat-history {
  opacity: 0;
  pointer-events: none;
  position: absolute; /* Position out of flow */
  transition: opacity var(--page-transition-duration) ease;
}

.brand-concierge-container:not(.initial-state) .chat-history {
  min-height: 200px;
  padding-top: 80px; /* Add space for logo at top when expanded */
  opacity: 1;
  height: auto;
  pointer-events: all;
  transition: opacity var(--page-transition-duration) ease;
}

.brand-concierge-container.initial-state .input-section {
  position: static;
  max-width: var(--content-width-desktop);
  width: 100%;
  bottom: auto;
  transition: all var(--page-transition-duration) ease;
  padding-right: var(--container-padding-mobile);
  box-sizing: border-box;
}

/* Example messages transition */
.brand-concierge-container.initial-state .example-messages {
  padding-top: 0;
  transition: opacity var(--page-transition-duration) ease;
}

.brand-concierge-container:not(.initial-state) .example-messages {
  opacity: 0;
  pointer-events: none;
  position: absolute; /* Take out of normal flow */
  transition: opacity var(--page-transition-duration) ease;
}

/* Company Logo */
.company-logo {
  position: fixed;
  top: 24px;
  left: 24px;
  z-index: 20;
  display: flex;
  align-items: center;
}

.company-logo svg {
  width: 180px;
  height: auto;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Chat interface */
.chat-interface {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  max-width: var(--content-width-desktop);
  margin: 0 auto;
  width: 100%;
  z-index: 1;
  overflow: visible; /* Allow content to be visible */
  box-sizing: border-box;
}

/* Header */
.chat-header {
  padding: 16px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Chat history */
.chat-history {
  flex: 1;
  display: flex;
  flex-direction: column; /* Show messages in regular order, newest at bottom */
  justify-content: flex-end; /* Push content to the bottom */
  padding: 16px;
  padding-top: 16px;
  padding-bottom: 144px;
  width: 100%;
  max-width: var(--content-width-desktop);
  margin: 0 auto;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden; /* Prevent horizontal scrolling */
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  transition: opacity var(--page-transition-duration) ease;
  position: relative; /* Establish stacking context */
  z-index: 2; /* Lower than message-blocker */
}

/* When not in initial state, chat history should take up space */
.chat-history.expanded {
  max-height: none;
}
.message-content a {
  color: black;
}

/* Chat messages */
.chat-message {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  width: auto;
  position: relative; /* Ensure proper stacking */
  z-index: 6; /* Higher than chat history */
  animation: messageSlideUp 0.3s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

.user-message {
  align-self: flex-end;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 0;
  margin-left: auto;
}

.concierge-message {
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  margin-left: 0;
  margin-right: auto;
}

.message-content {
  padding: 16px 24px;
  border-radius: 8px;
  line-height: 1.4;
  word-wrap: break-word;
  display: inline-block;
  font-family: var(--font-family);
  font-size: 16px;
}

.user-message .message-content {
  background-color: var(--user-message-bg);
  color: var(--user-message-text);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
.prompt-message .message-content {
  background-color: var(--prompt-message-bg);
  color: var(--prompt-message-text);
  box-shadow: 0 1px 2px rgba(5, 84, 232, 0.87);
  cursor: pointer;
  padding: 8px 8px;
  font-family: var(--font-family);
  width: 328px;
  display: flex;
  align-items: center;
}
.prompt-message svg {
  padding-right: 5px;
}
.concierge-message .message-content {
  background-color: var(--concierge-message-bg);
  color: var(--concierge-message-text);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.concierge-message .message-content.with-background-image {
  padding: 0;
  overflow: hidden;
  border-radius: 8px;
}

/* Loading indicator for concierge messages */
.message-loading {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 16px;
  min-width: 60px;
  gap: 12px;
  white-space: nowrap;
}

.loading-dots {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--user-message-bg);
  animation: loadingPulse 1.4s infinite ease-in-out;
}

.loading-text {
  color: var(--concierge-message-text);
  font-weight: 500;
}

.loading-dot:nth-child(1) {
  animation-delay: 0s;
}

.loading-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes loadingPulse {
  0%, 100% {
    transform: scale(0.6);
    opacity: 0.6;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Input section */
.input-section {
  background: transparent;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 10;
  box-sizing: border-box;
  transition: all var(--page-transition-duration) ease;
}

/* Input container */
.input-container {
  max-width: var(--content-width-desktop);
  margin: 10px auto;
  display: flex;
  align-items: center;
  background: var(--secondary-background);
  border-radius: 4px;
  padding: 0 8px 0 24px;
  outline: 1px solid var(--primary-color);
  box-sizing: border-box;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  transition: box-shadow 0.2s ease;
  border: 2px;
  border-radius: 4px;
  height: 48px;
  padding: 0 8px 0 16px;
}

/* Add outline when input is focused */
.input-container:has(.chat-input:focus) {
  box-shadow: 0 0 0 1.5px rgba(12, 12, 12, 0.8), 0 2px 4px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chat-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0;
  font-size: 18px;
  font-family: var(--font-family);
  outline: none;
  height: 100%;
  line-height: 64px;
}

/* Buttons */
.mic-button, .submit-button {
  width: 32px;
  height: 32px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.mic-button {
  background-color: #E9E9E9;
  border: 2px solid #DADADA;
  padding: 0;
  transition: background-color 0.2s ease;
}

.mic-button:hover {
  background-color: white;
  border-color: #DADADA;
  transition: none;
}

.mic-button svg {
  width: 24px;
  height: 24px;
  color: black;
}

.submit-button {
  background-color: #FFBF27;
  border: none;
  transition: background-color 0.2s ease;
}

.submit-button:hover {
  background-color: #FFBF27;
  transform: translateY(-1px);
  transition: background-color 0.2s ease;
}

.submit-button svg {
  width: 20px;
  height: 20px;
  color: black;
}

/* Microphone button listening state */
.mic-button.listening {
  background-color: white;
  border-color: #9085ED;
  animation: pulsate 1.5s infinite;
}

@keyframes pulsate {
  0% {
    box-shadow: 0 0 0 0 rgba(144, 133, 237, 0.7);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(144, 133, 237, 0.4);
    transform: scale(1.05);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(144, 133, 237, 0.7);
    transform: scale(1);
  }
}

/* Focus styles */
.chat-input:focus {
  border-color: var(--primary-color);
}

.mic-button:focus, .submit-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--primary-color);
}

/* Special focus style for mic button with increased outline distance */
.mic-button:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
  box-shadow: none;
}

/* Special focus style for submit button with increased outline distance */
.submit-button:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
  box-shadow: none;
}

/* Submit button disabled state */
.submit-button:disabled {
  background-color: #E6E6E6;
  cursor: not-allowed;
  transform: none;
  opacity: 1;
}

.submit-button:disabled:hover {
  background-color: #E6E6E6;
  transform: none;
}

.submit-button:disabled svg {
  color: #999999;
}

/* Disclaimer message */
.under-input-message {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  color: #FFFFFF;
  width: 756px;
  height: 40px;
  text-align: center;
  font-size: 14px;
  margin-top: 10px;
  max-width: var(--content-width-desktop);
  margin-right: auto;
}
.suggestions-header {
  font-family: var(--font-family);
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 18px;
  color: #FFFFFF;
}
/* Prompt suggestions container */
.prompt-suggestions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
}

/* Prompt suggestion buttons */
.suggestion-button {
  background-color: var(--primary-background, #f5f5f5);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--primary-text, #000);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.suggestion-button:hover {
  background-color: #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Styles for response item titles */
.response-item-title {
  font-size: 16px;
  font-weight: 600;
  margin: 16px 0 8px 0;
  color: var(--primary-text, #000);
}

/* Add margin to paragraphs in messages for better spacing */
.message-content p {
  margin: 8px 0;
}

/* Rich text card styles */
.rich-text-card {
  max-width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin: 0 auto; /* Center the card */
}

.card-image-header {
  width: 100%;
  height: 320px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  margin: 0;
  padding: 0;
}

/* Special styling for rich card containers */
.message-content.rich-card-container {
  padding: 0 !important;
  overflow: hidden;
  border-radius: 8px;
}

.white-content-container {
  background-color: white;
  border-radius: 8px;
  margin: -1px 16px 16px 16px; /* Top, right, bottom, left margins */
  padding: 0 20px 20px 20px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.card-content {
  padding: 20px 0 0 0; /* Top padding only, since we've added padding to container */
  color: #333;
}

.card-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.card-logo {
  margin-right: 12px;
}

.card-logo img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #333;
  margin-bottom: 8px;
}

.card-description {
  font-size: 14px;
  margin: 0 0 20px 0;
  color: #666;
}

.card-heading {
  font-size: 16px;
  font-weight: 600;
  margin: 16px 0 8px 0;
  color: #333;
}

.card-bullet-list {
  margin: 8px 0 16px 0;
  padding-left: 0;
  list-style-type: none;
  color: #666;
}

.card-bullet-list li {
  margin: 6px 0;
  font-size: 14px;
  display: flex;
  align-items: flex-start;
}

.check-list-item {
  position: relative;
  padding-left: 28px;
}

.check-icon {
  position: absolute;
  left: 0;
  top: 0;
  font-size: 14px;
  margin-right: 8px;
}

.card-markdown {
  margin: 12px 0;
  font-size: 14px;
  line-height: 1.5;
  color: #555;
}

.card-markdown a {
  color: red;
  text-decoration: none;
}

.card-markdown a:hover {
  text-decoration: underline;
}

.card-button-group {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.action-button {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button.primary {
  background-color: #000;
  color: #fff;
  border: none;
}

.action-button.primary:hover {
  background-color: #333;
}

.action-button.secondary {
  background-color: #fff;
  color: #000;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.action-button.secondary:hover {
  background-color: #f5f5f5;
}

/* Options container styles */
.options-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0 0 20px 0;
  width: 620px;
  max-width: 100%;
  margin-left: 0; /* Left align with rich card */
  margin-top: 0;
  align-items: flex-start; /* Align buttons to the left */
}

.option-button {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 10px; /* 10px padding on all sides */
  font-size: 16px;
  font-weight: 400;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  text-align: left;
  width: auto; /* Auto width instead of 100% */
  min-width: min-content; /* Allow the button to grow with content */
}

.option-button:hover {
  background-color: #f5f5f5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.option-arrow-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.option-arrow-icon svg {
  width: 18px;
  height: 19px;
}

.option-text {
  flex: 1;
}

/* Animation for new messages */
@keyframes messageSlideUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animation specifically for user messages (straight up) */
@keyframes userMessageSlideUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animation for existing messages when a new one is added */
@keyframes shiftUpExisting {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-8px);
  }
}

/* Apply animation to existing messages when a new one is added */
.chat-message.shift-up {
  animation: shiftUpExisting 0.3s ease-out forwards;
}

/* Message blocker with gradient background */
.message-blocker {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 144px;
  z-index: -1;
  width: 100%;
  max-width: none;
  margin: 0;
  pointer-events: none;
  opacity: 1;
  transition: opacity var(--page-transition-duration) ease;
}

/* Hide message blocker in initial state (landing page) */
.brand-concierge-container.initial-state .message-blocker {
  opacity: 0;
}

/* Add gradient background as pseudo-element for ID */
#brand-concierge-mount::after {
  content: "";
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 300px;
  z-index: 0;
  pointer-events: none;
  /*
  background: linear-gradient(0deg, rgb(255, 255, 255) 170px, rgba(255, 255, 255, 0)) no-repeat;
  */
  opacity: 0;
  transition: opacity var(--page-transition-duration) ease;
}

/* Show the pseudo-element gradient when parent has active-state class */
#brand-concierge-mount.active-state::after {
  opacity: 1;
}

/* Scroll to bottom button */
.scroll-to-bottom {
  position: fixed;
  bottom: 140px;
  left: 50%;
  transform: translateX(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: white;
  color: #222;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease, transform 0.2s ease;
}

.scroll-to-bottom.visible {
  opacity: 1;
  pointer-events: auto;
}

.scroll-to-bottom:hover {
  background-color: #f5f5f5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transform: translateX(-50%) translateY(-2px);
}

.scroll-to-bottom svg {
  width: 20px;
  height: 20px;
}

/* Make sure all containers have proper box-sizing */
.card, 
.message-content,
.rich-text-card,
.options-container,
.card-button-group {
  box-sizing: border-box;
}

/* ========== WelcomePanel styles ========== */
.welcome-panel {
  padding: 20px 0;
  transition: opacity var(--transition-speed) ease;
  max-width: var(--content-width-desktop);
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.welcome-panel.fade-out {
  opacity: 0;
  pointer-events: none;
  display: none; /* Hide immediately instead of fading */
}

.welcome-panel .example-heading {
  color: #FFFFFF;
  font-style: normal;
  font-weight: 700;
  font-size: 28px;
  line-height: 38px;
  margin: 0 0 12px;
  text-align: left;
  font-family: var(--font-family);
}

.welcome-panel .example-subheading {
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
  margin: 0;
  margin-bottom: 54px;
  text-align: center;
  font-family: var(--font-family);
}

.welcome-panel .card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  width: 100%;
}

.welcome-panel .card {
  background: var(--secondary-background);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  /* Button reset styles */
  border: none;
  padding: 0;
  text-align: left;
  font-family: var(--font-family);
  width: 100%;
}

.welcome-panel .card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Add focus styles for keyboard navigation */
.welcome-panel .card:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.welcome-panel .card-image {
  flex: 0 0 178px;
  background-color: #ddd;
  background-size: cover;
  background-position: center;
}

.welcome-panel .card-text {
  flex-grow: 1;
  padding: 10px 8px;
  font-size: 14px;
  margin: 8px;
  color: #FFFFFF;
  font-family: var(--font-family);
}

/* ========== CardCarousel styles ========== */
.card-carousel {
  display: none; /* Hidden by default */
  width: 100%;
  position: relative;
  overflow: hidden;
}

.card-carousel .carousel-track {
  display: flex;
  margin: 0 16px;
  gap: var(--card-gap);
  transition: transform 0.3s ease;
}

.card-carousel .card {
  flex: 0 0 var(--card-width);
}

.card-carousel .carousel-navigation-arrows {
  display: none; /* Hidden by default */
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  height: 50px; /* Extra room for the drop shadows */
}

.card-carousel .carousel-navigation-arrow {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  border: none;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-carousel .carousel-navigation-arrow:disabled {
  background-color: #f5f5f5;
  opacity: 1.0; /* Used to be 0.5 */
  cursor: not-allowed;
}

.card-carousel .carousel-navigation-arrow svg {
  width: 20px;
  height: 20px;
  fill: #333;
}

/* Make sure all containers have proper box-sizing */
.message-content,
.rich-text-card,
.options-container,
.card-button-group {
  box-sizing: border-box;
}

/* Icon Button - Base styles */
.icon-button {
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 0;
}

.icon-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.icon-button:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
  box-shadow: none;
}

.icon-button:disabled {
  background-color: #E6E6E6;
  cursor: not-allowed;
  transform: none;
  opacity: 0.7;
}

.icon-button:disabled:hover {
  background-color: #E6E6E6;
  transform: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.icon-button svg {
  width: 24px;
  height: 24px;
}

/* Primary variant */
.icon-button.primary {
  background-color: var(--primary-color);
}

.icon-button.primary:hover {
  background-color: var(--primary-color-hover);
}

.icon-button.primary svg {
  color: white;
}

.icon-button.primary:disabled {
  background-color: #E6E6E6;
}

.icon-button.primary:disabled svg {
  color: #999999;
}

/* Media queries for responsive behavior */
/* Desktop-specific styles */
@media (min-width: 769px) {
  .chat-message {
    width: 620px;
  }
  
  .brand-concierge-container:not(.initial-state) .chat-history {
    padding-top: 80px;
  }
}

/* Tablet-specific styles */
@media (max-width: 768px) {
  .welcome-panel .card-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 0;
    display: none; /* Hide regular grid */
  }

  .welcome-panel .card-text {
    padding: 8px;
    margin: 8px;
  }

  .chat-message {
    max-width: 90%;
  }

  .welcome-panel .example-heading {
    font-size: 24px;
    line-height: 30px;
  }
  
  .welcome-panel .example-subheading {
    font-size: 16px;
    line-height: 22px;
    margin-bottom: 32px;
  }
  
  .card-carousel {
    display: block; /* Show carousel instead */
  }
  
  .card-carousel .carousel-navigation-arrows {
    display: flex; /* Show navigation arrows */
  }
}

/* Phone-specific styles */
@media (max-width: 480px) {
  .company-logo {
    top: 16px;
    left: 16px;
  }

  .company-logo svg {
    width: 120px;
  }

  .example-messages {
    padding: 16px 0;
    width: 100%;
    box-sizing: border-box;
  }

  .card-grid {
    grid-template-columns: repeat(1, 1fr);
    gap: 12px;
    width: 100%;
    box-sizing: border-box;
  }

  .example-heading {
    font-size: 24px;
    line-height: 28px;
    padding: 0 8px;
  }

  .example-subheading {
    font-size: 14px;
    line-height: 20px;
    margin-bottom: 24px;
    padding: 0 8px;
  }

  .chat-input {
    font-size: 16px;
    line-height: 56px;
  }

  .mic-button, .submit-button {
    width: 32px;
    height: 32px;
  }

  .chat-history {
    padding: 16px;
    padding-bottom: 120px;
    padding-top: 60px;
  }

  .input-section {
    /*padding: 12px var(--container-padding-mobile);*/
  }

  /* Rich text card adjustments for mobile */
  .rich-text-card {
    width: 100%;
    max-width: 100%;
    margin: 0;
    box-sizing: border-box;
  }

  .card-image-header {
    height: 200px;
  }

  .card-title {
    font-size: 18px;
  }

  .card-button-group {
    flex-direction: column;
    gap: 8px;
  }

  .action-button {
    text-align: center;
  }

  .white-content-container {
    margin: -1px 8px 8px 8px;
    padding: 0 12px 16px 12px;
  }

  /* Options container adjustments */
  .options-container {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    padding: 0;
  }

  .option-button {
    width: 100%;
  }

  /* Message content adjustments */
  .message-content {
    padding: 10px 14px;
    font-size: 14px;
  }

  @keyframes messageSlideUp {
    0% {
      opacity: 0;
      transform: translateY(15px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes userMessageSlideUp {
    0% {
      opacity: 0;
      transform: translateY(15px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .scroll-to-bottom.visible {
    opacity: 1;
    transform: translateX(-50%);
  }

  .brand-concierge-container:not(.initial-state) .chat-history {
    padding-top: 60px;
  }

  .welcome-panel {
    padding: 16px 0;
    width: 100%;
    box-sizing: border-box;
  }

  .welcome-panel .card-grid {
    grid-template-columns: repeat(1, 1fr);
    gap: 12px;
    width: 100%;
    box-sizing: border-box;
  }

  .welcome-panel .example-heading {
    font-size: 24px;
    line-height: 28px;
    padding: 0 8px;
  }

  .welcome-panel .example-subheading {
    font-size: 14px;
    line-height: 20px;
    margin-bottom: 24px;
    padding: 0 8px;
  }
}
  .bc-carousel {
  position: relative;
  width: 100%;
  overflow: hidden;
  padding: 16px 16px 0;
  box-sizing: border-box;
}

  .bc-carousel.loading {
    opacity: 0.8;
  }

  .bc-carousel-container {
    position: relative;
    width: 100%;
    height: 200px;
    overflow: hidden;
    border-radius: 8px;
  }

  .bc-carousel-track {
    display: flex;
    flex-direction: row;
    height: 100%;
    transition: transform 0.5s ease-in-out;
    gap: 15px;
  }

  .bc-carousel-slide {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-end;
    flex-shrink: 0;
  }

  .bc-carousel-slide img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    border-radius: 8px;
  }

  .bc-carousel-slide.clickable {
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .bc-carousel-slide.clickable:hover {
    transform: scale(1.02);
  }

  .bc-carousel-slide.clickable:active {
    transform: scale(0.98);
  }

  .bc-carousel-slide.placeholder {
    cursor: default;
    opacity: 0.7;
  }

  .bc-carousel-slide.placeholder:hover {
    transform: none;
  }

  .bc-carousel-slide.loading-image {
    cursor: pointer;
    opacity: 0.9;
  }

  .bc-carousel-slide.loading-image:hover {
    transform: scale(1.01);
  }

  .bc-carousel-slide .placeholder-image {
    opacity: 0.8;
  }

  .bc-carousel-text {
    position: absolute;
    bottom: 8px;
    left: 8px;
    background: var(--primary-color);
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 300;
    max-width: calc(100% - 48px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
  }

  .bc-carousel-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 12px 16px 6px;
    background: rgb(255 255 255 / 95%);
    backdrop-filter: blur(8px);
  }

  .bc-carousel-arrow {
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 8px;
    background: var(--color-white);
    background-color: var(--color-white);
    color: var(--dark-color);
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .bc-carousel-arrow:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
  }

  .bc-carousel-arrow:focus {
    outline: 2px solid var(--dark-color);
    outline-offset: 2px;
  }

  .bc-carousel-arrow:disabled {
    background-color: var(--color-white);
    color: #ccc;
    cursor: not-allowed;
    transform: none;
    transition: none;
  }

  .bc-carousel-arrow:disabled:hover {
    background-color: var(--color-white);
    color: #ccc;
    transform: none;
    box-shadow: none;
  }

  .bc-carousel-arrow svg {
    width: 20px;
    height: 20px;
  }

  .bc-carousel-dots {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .bc-carousel-dot {
    padding: 0;
    margin: 0;
    width: 8px;
    height: 8px;
    border: none;
    border-radius: 50%;
    background: #d9d9d9;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .bc-carousel-dot:hover {
    background: #bbb;
  }

  .bc-carousel-dot.active {
    background: var(--primary-color);
  }

  .bc-carousel-dot:focus {
    outline: 2px solid var(--dark-color);
    outline-offset: 2px;
  }

  .bc-carousel-placeholder-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(255 255 255 / 10%);
    border-radius: 8px;
    opacity: 0;
    pointer-events: none;
  }

  .bc-carousel-slide.placeholder .bc-carousel-placeholder-overlay {
    opacity: 1;
    pointer-events: auto;
  }

  .bc-carousel-placeholder-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid rgb(255 255 255 / 30%);
    border-top: 2px solid rgb(255 255 255 / 80%);
    border-radius: 50%;
    animation: bc-carousel-spin 1s linear infinite;
  }

  @keyframes bc-carousel-spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @media (width >= 900px) {
    .bc-carousel-container {
      height: 200px;
    }

    .bc-carousel-slide {
      width: calc((100% - 30px) / 3);
      height: 200px;
      flex-shrink: 0;
    }

    .bc-carousel-slide img {
      width: 100%;
      height: 100%;
    }

    .bc-carousel-text {
      bottom: 8px;
      left: 8px;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12px;
    }
  }

`, ""]);
// Exports
/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = ((/* unused pure expression or super */ null && (___CSS_LOADER_EXPORT___)));


/***/ }),

/***/ 314:
/***/ ((module) => {



/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ 417:
/***/ ((module) => {



module.exports = function (url, options) {
  if (!options) {
    options = {};
  }
  if (!url) {
    return url;
  }
  url = String(url.__esModule ? url.default : url);

  // If url is already wrapped in quotes, remove them
  if (/^['"].*['"]$/.test(url)) {
    url = url.slice(1, -1);
  }
  if (options.hash) {
    url += options.hash;
  }

  // Should url be wrapped?
  // See https://drafts.csswg.org/css-values-3/#urls
  if (/["'() \t\n]|(%20)/.test(url) || options.needQuotes) {
    return "\"".concat(url.replace(/"/g, '\\"').replace(/\n/g, "\\n"), "\"");
  }
  return url;
};

/***/ }),

/***/ 601:
/***/ ((module) => {



module.exports = function (i) {
  return i[1];
};

/***/ }),

/***/ 709:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "88bebabf0ebfb130ca1c.jpg";

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "/";
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = document.baseURI || self.location.href;
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			792: 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// no jsonp function
/******/ 	})();
/******/ 	
/************************************************************************/

// UNUSED EXPORTS: initBrandConcierge

;// ./src/services/chatApi.ts
/**
 * ChatAPI Service - Handles communication with the brand concierge API
 */
// Store the Alloy instance name
let alloyInstanceName = null;
/**
 * Setup WebSDK event listeners and dispatch ready event
 */
function initializeWebSdkIntegration() {
    // Listen for instance name from WebSDK
    window.addEventListener("alloy-brand-concierge-instance", (event) => {
        const customEvent = event;
        alloyInstanceName = customEvent.detail.instanceName;
        console.warn(`WebSDK instance registered: ${alloyInstanceName}`);
    });
    // Notify WebSDK that we're ready
    window.dispatchEvent(new CustomEvent("adobe-brand-concierge-prompt-loaded"));
    console.warn("Brand Concierge ready event dispatched");
}
/**
 * Sends a chat message to the API and returns the structured response
 */
async function sendChatMessage(message) {
    try {
        // Try WebSDK if available
        if (alloyInstanceName && typeof window[alloyInstanceName] === "function") {
            console.warn(`Sending message via WebSDK instance: ${alloyInstanceName}`);
            return await window[alloyInstanceName]("sendBrandConciergeEvent", { message });
        }
        return createFallbackResponse();
    }
    catch (error) {
        console.error("Error sending chat message:", error);
        // Return a fallback response for error handling
        return createFallbackResponse();
    }
}
/**
 * Creates a fallback response in case of API failure
 */
function createFallbackResponse() {
    return {
        response: {
            message: "I'm sorry, I'm having trouble connecting to our services right now.",
            multimodalElements: {
                elements: [],
            },
        }
    };
}

;// ./src/utils/svgUtils.ts
/**
 * Utility functions to provide SVG strings for components
 */
/**
 * Returns the company logo SVG
 */
function getCompanyLogoSVG() {
    return `<svg version="1.1" id="Southwest_Logo_1_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="223px" height="34px" viewBox="0 0 223 34" enable-background="new 0 0 223 34" xml:space="preserve">
<g id="Type">
	<g>
		<path fill="#304CB2" d="M59,27.005c-0.91,0.17-1.972,0.319-3.114,0.319c-3.192-0.004-3.895-1.102-3.894-3.168V11.995h-6.006    l-0.012,12.762c-0.005,5.66,3.167,8.254,9.623,8.261c3.132,0.002,6.045-0.576,9.464-1.449V11.995H59V27.005z M78.497,27.563    c-2.184-0.002-2.485-1.03-2.484-2.678l0.007-7.845l4.982,0.005v-5.05H76.02V5.986h-6.016v6.008l-3.035,0.001v5.037l3.035,0.003    l-0.007,8.238c-0.003,3.627,0.734,7.761,6.708,7.766c1.827,0.002,3.32-0.438,4.952-0.9l-0.598-5.002    C80.175,27.393,79.401,27.563,78.497,27.563z M15.444,16.317c-1.113-0.426-2.355-0.826-3.687-1.194    c-3.506-0.99-4.585-1.543-4.584-3.082c0.001-1.818,1.35-2.653,4.494-2.65c2.583,0.002,4.878,0.67,7.212,1.547l1.262-5.891    c-2.69-1.002-5.245-1.895-8.344-1.897C4.561,3.144,0.57,7.255,0.565,12.188c-0.003,3.654,1.648,6.136,5.21,7.576    c1.046,0.422,2.252,0.84,3.588,1.233c3.928,1.206,5.072,1.771,5.071,3.282c-0.001,1.832-1.498,2.808-4.576,2.805    c-2.829-0.003-5.43-0.781-8.15-2.032l-1.259,5.943c2.969,1.172,5.926,2.041,9.483,2.044c7.362,0.007,11.181-4.115,11.185-9.063    C21.121,19.93,18.839,17.616,15.444,16.317z M94.227,10.954c-1.972-0.002-3.856,0.456-5.193,0.92V1.975h-6.007v31.013h5.988    l0.013-15.546c1.083-0.415,2.333-0.825,3.811-0.824c2.339,0.002,3.185,0.899,3.183,3.084l-0.011,13.286H102l0.011-13.939    C102.016,13.57,99.542,10.958,94.227,10.954z M33.419,10.855c-6.074-0.005-10.977,4.26-10.983,11    c-0.006,6.742,4.873,11.179,10.963,11.184c6.086,0.006,10.973-4.407,10.979-11.163S39.488,10.861,33.419,10.855z M33.404,27.139    c-2.611-0.002-4.702-1.878-4.699-5.275s2.029-5.188,4.708-5.186c2.675,0.002,4.658,1.771,4.655,5.192    C38.066,25.296,36.013,27.143,33.404,27.139z M168.117,20.206c-0.855-0.297-1.816-0.604-2.863-0.906    c-2.104-0.554-2.92-0.907-2.919-1.774c0.001-0.915,0.815-1.524,2.665-1.523c1.986,0.002,3.816,0.411,5.777,0.979l0.955-5.188    c-2.162-0.473-4.303-0.889-6.729-0.892c-5.688-0.005-8.75,2.906-8.754,6.876c-0.002,2.82,1.367,4.602,4.203,5.801    c0.801,0.341,1.743,0.686,2.812,1.021c2.217,0.64,3.297,0.9,3.297,1.901c-0.002,0.953-1.314,1.386-3.074,1.384    c-2.166-0.002-4.188-0.355-6.275-1.178l-0.934,5.154c2.584,0.736,5.008,1.22,7.697,1.222c5.981,0.006,8.664-3.128,8.668-6.995    C172.646,23.441,171.505,21.396,168.117,20.206z M145.557,10.879c-6.348-0.006-10.752,4.418-10.758,11.387    c-0.005,6.502,3.922,10.791,10.863,10.797c3.102,0.002,5.631-0.867,8.232-1.974l-0.902-4.967c-1.96,0.882-3.987,1.569-6.354,1.567    c-3.578-0.004-5.052-1.541-5.283-3.713l13.483,0.012c0,0,0.195-2.446,0.195-2.922C155.041,15.407,151.904,10.884,145.557,10.879z     M141.441,19.967c0.383-1.842,1.342-4.124,3.865-4.122c2.6,0.003,3.383,2.64,3.45,4.128L141.441,19.967z M184.49,27.563    c-2.184-0.002-2.473-1.03-2.471-2.678l0.008-7.797l5.039,0.005v-5.098h-5.041V5.986h-6.027v6.008l-3.063,0.001v5.085l3.063,0.003    l-0.008,8.19c-0.004,3.627,0.877,7.761,6.851,7.766c1.827,0.002,3.333-0.438,4.966-0.9l-0.742-5.002    C186.182,27.393,185.395,27.563,184.49,27.563z M188.49,3.219c-1.461-0.001-2.65,1.188-2.652,2.655s1.188,2.657,2.646,2.659    c1.469,0.001,2.658-1.188,2.66-2.655S189.957,3.221,188.49,3.219z M188.484,8.063c-1.23-0.001-2.148-0.892-2.148-2.188    c0.002-1.289,0.922-2.187,2.152-2.185c1.24,0.001,2.152,0.899,2.15,2.188C190.639,7.174,189.725,8.063,188.484,8.063z     M188.814,5.997c0.457-0.07,0.764-0.341,0.764-0.804c0-0.506-0.355-0.891-1.032-0.892L187.498,4.3l-0.002,3.084l0.57,0.001V6.067    c0.207,0.001,0.285,0.064,0.428,0.293l0.662,1.026h0.654l-0.633-0.955C189.035,6.218,188.93,6.083,188.814,5.997z M188.367,5.655    l-0.301-0.001l0.002-0.897l0.392,0.001c0.386,0,0.521,0.179,0.521,0.449C188.979,5.584,188.688,5.655,188.367,5.655z     M129.229,11.995l-3.754,11.548l-3.887-11.548h-5.238l-3.886,11.548l-3.755-11.548h-6.527l7.453,20.991h5.539L119,21.625    l3.766,11.361h5.539l7.452-20.991H129.229z"/>
	</g>
</g>
<g>
	<g>
		<path fill="#CCCCCC" d="M206.955,10.784c-2.029,0-3.663,0.707-4.969,1.45c-1.307-0.743-2.938-1.45-4.968-1.45    c-4.057,0-6.736,2.65-6.736,7.178c0,5.524,5.275,10.921,11.704,15.254c6.43-4.334,11.704-9.729,11.704-15.254    C213.69,13.435,211.013,10.784,206.955,10.784z"/>
		
			<linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="190.9443" y1="10.52" x2="206.4014" y2="10.52" gradientTransform="matrix(1 0 0 -1 0 35)">
			<stop offset="0" style="stop-color:#3656CC"/>
			<stop offset="0.35" style="stop-color:#304CB2"/>
			<stop offset="0.72" style="stop-color:#283B80"/>
		</linearGradient>
		<path fill="url(#SVGID_1_)" d="M190.944,18.059c0,5.648,5.956,10.902,11.042,14.38c1.464-1.002,2.976-2.152,4.415-3.416    c-6.738-5.644-13.062-10.693-15.331-12.501C190.989,17.005,190.944,17.52,190.944,18.059z"/>
		
			<linearGradient id="SVGID_2_" gradientUnits="userSpaceOnUse" x1="193.1406" y1="22.7305" x2="210.602" y2="10.5039" gradientTransform="matrix(1 0 0 -1 0 35)">
			<stop offset="0.3" style="stop-color:#E61C23"/>
			<stop offset="0.8" style="stop-color:#C3161C"/>
		</linearGradient>
		<path fill="url(#SVGID_2_)" d="M212.577,20.679c-4.883-4.027-7.84-6.077-11.011-7.98c-0.854-0.516-2.569-1.27-4.492-1.27    c-1.842,0-3.389,0.573-4.455,1.69c-0.694,0.725-1.165,1.636-1.434,2.741c2.529,1.766,9.396,6.676,16.313,12.154    C209.808,25.815,211.743,23.314,212.577,20.679z"/>
		
			<linearGradient id="SVGID_3_" gradientUnits="userSpaceOnUse" x1="203.9639" y1="24.3096" x2="213.9473" y2="17.3191" gradientTransform="matrix(1 0 0 -1 0 35)">
			<stop offset="0" style="stop-color:#FDBC11"/>
			<stop offset="0.25" style="stop-color:#FCB415"/>
			<stop offset="0.8" style="stop-color:#F89E1C"/>
		</linearGradient>
		<path fill="url(#SVGID_3_)" d="M211.343,13.122c-1.05-1.094-2.589-1.683-4.36-1.683c-1.9,0-3.348,0.614-4.357,1.162    c1.894,1.054,6.009,3.439,10.272,6.579c0.066-0.424,0.103-0.85,0.103-1.278C213,15.913,212.419,14.247,211.343,13.122z"/>
	</g>
</g>
</svg>`;
}
/**
 * Returns the microphone button SVG
 */
function getMicrophoneSVG() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.0002 15.3002C9.35351 15.3002 7.2002 13.1475 7.2002 10.5002V6.0002C7.2002 3.35294 9.35351 1.2002 12.0002 1.2002C14.6469 1.2002 16.8002 3.35294 16.8002 6.0002V10.5002C16.8002 13.1475 14.6469 15.3002 12.0002 15.3002ZM12.0002 3.0002C10.3461 3.0002 9.0002 4.3455 9.0002 6.0002V10.5002C9.0002 12.1549 10.3461 13.5002 12.0002 13.5002C13.6543 13.5002 15.0002 12.1549 15.0002 10.5002V6.0002C15.0002 4.3455 13.6543 3.0002 12.0002 3.0002Z" fill="#222222"></path>
    <path d="M19.4996 8.77979C19.0027 8.77979 18.5996 9.18291 18.5996 9.67979V10.5001C18.5996 14.1388 15.6389 17.1001 11.9996 17.1001C8.36036 17.1001 5.39961 14.1388 5.39961 10.5001V9.67979C5.39961 9.18291 4.99648 8.77979 4.49961 8.77979C4.00274 8.77979 3.59961 9.18291 3.59961 9.67979V10.5001C3.59961 14.8272 6.88965 18.3994 11.0996 18.8503V21.0001H7.19961C6.70274 21.0001 6.29961 21.4032 6.29961 21.9001C6.29961 22.397 6.70274 22.8001 7.19961 22.8001H16.7996C17.2965 22.8001 17.6996 22.397 17.6996 21.9001C17.6996 21.4032 17.2965 21.0001 16.7996 21.0001H12.8996V18.8503C17.1096 18.3994 20.3996 14.8272 20.3996 10.5001V9.67979C20.3996 9.18291 19.9965 8.77979 19.4996 8.77979Z" fill="#222222"></path>
  </svg>`;
}
/**
 * Returns the submit/send button SVG
 */
function getSendIconSVG() {
    return `<svg class="send-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.6485 9.9735C18.6482 9.67899 18.4769 9.41106 18.2059 9.29056L4.05752 2.93282C3.80133 2.8175 3.50129 2.85583 3.28171 3.03122C3.06178 3.20765 2.95889 3.49146 3.01516 3.76733L4.28678 10.008L3.06488 16.2384C3.0162 16.4852 3.09492 16.738 3.27031 16.9134C3.29068 16.9337 3.31278 16.9531 3.33522 16.9714C3.55619 17.1454 3.85519 17.182 4.11069 17.066L18.2086 10.6578C18.4773 10.5356 18.6489 10.268 18.6485 9.9735ZM14.406 9.22716L5.66439 9.25379L4.77705 4.90084L14.406 9.22716ZM4.81711 15.0973L5.6694 10.7529L14.4323 10.7264L4.81711 15.0973Z"></path>
  </svg>`;
}
/**
 * Returns the scroll to bottom button SVG
 */
function getScrollToBottomSVG() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
    <path d="M13.55029,13.71484c-.29297-.29297-.76758-.29297-1.06055,0l-1.73975,1.73975V2.76172c0-.41406-.33594-.75-.75-.75s-.75.33594-.75.75v12.6626l-1.70996-1.70947c-.29297-.29297-.76758-.29297-1.06055,0s-.29297.76758,0,1.06055l3.00537,3.00488c.14648.14648.33838.21973.53027.21973s.38379-.07324.53027-.21973l3.00488-3.00488c.29297-.29297.29297-.76758,0-1.06055Z" fill="#222" stroke-width="0"/>
  </svg>`;
}
/**
 * Returns the option arrow icon SVG
 */
function getOptionArrowSVG() {
    return `<svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 6.56445L16.5 10.0645L13 13.5645M16 10.0645H8C4.5 10.0645 2.5 9.06445 2.5 5.06445" 
      stroke="#292929" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"></path>
  </svg>`;
}
/**
 * Returns the previous arrow icon SVG for carousels
 */
function getPrevArrowSVG() {
    return `<svg viewBox="0 0 24 24">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>`;
}
/**
 * Returns the next arrow icon SVG for carousels
 */
function getNextArrowSVG() {
    return `<svg viewBox="0 0 24 24">
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
  </svg>`;
}
function getPromptArrowSVG() {
    return `<svg width="18" height="18">
            <path d="M13 6.5L16.5 10L13 13.5M16 10H8C4.5 10 2.5 9 2.5 5" 
            fill="none" stroke="black" stroke-width="2"></path></svg>`;
}

;// ./src/components/Card.ts
/**
 * Factory function to create a card element
 * @param data The card data
 * @param onClick Callback function when card is clicked
 * @returns HTMLElement for the card
 */
// eslint-disable-next-line no-unused-vars
function createCard(data, onClick) {
    // Create the card element
    const card = document.createElement("button");
    card.className = "card";
    card.setAttribute("type", "button");
    card.setAttribute("aria-label", data.text);
    // Set background color if provided
    if (data.backgroundColor) {
        card.style.backgroundColor = data.backgroundColor;
    }
    // Add background image container
    const imageContainer = document.createElement("div");
    imageContainer.className = "card-image";
    // Set the background image if provided
    if (data.image) {
        imageContainer.style.backgroundImage = `url("${data.image}")`;
        imageContainer.style.height = "178px";
    }
    card.appendChild(imageContainer);
    // Add text
    const textContainer = document.createElement("div");
    textContainer.className = "card-text";
    textContainer.textContent = data.text;
    card.appendChild(textContainer);
    // Add click handler if provided
    if (onClick) {
        card.addEventListener("click", () => onClick(data.text));
    }
    return card;
}
function createCarouselCard(data, onClick) {
    // Create the card element
    const card = document.createElement("div");
    card.className = "bc-carousel-slide clickable";
    // Add background image container
    const image = document.createElement("img");
    //image.className = "bc-carousel-slide clickable";
    // Set the background image if provided
    if (data.url) {
        image.src = data.url;
    }
    card.appendChild(image);
    // Add text
    const textContainer = document.createElement("div");
    textContainer.className = "bc-carousel-text";
    const span = document.createElement("span");
    span.innerHTML = data.title;
    //textContainer.textContent = data.title;
    textContainer.appendChild(span);
    card.appendChild(textContainer);
    // Add click handler if provided
    if (onClick) {
        card.addEventListener("click", () => onClick(data.title));
    }
    return card;
}

;// ./src/components/CardGrid.ts

/**
 * A grid that displays cards in a responsive layout
 */
class CardGrid {
    /**
     * Creates a new CardGrid
     */
    constructor(options) {
        this.items = options.items;
        this.onItemSelect = options.onItemSelect;
        this.element = this.createGridElement();
    }
    /**
     * Returns the grid element
     */
    getElement() {
        return this.element;
    }
    /**
     * Creates the grid element with cards
     */
    createGridElement() {
        // Create grid container
        const gridContainer = document.createElement("div");
        gridContainer.className = "card-grid";
        // Create cards for each item
        this.items.forEach((item) => {
            const cardElement = createCard(item, this.onItemSelect);
            gridContainer.appendChild(cardElement);
        });
        return gridContainer;
    }
}

;// ./src/components/WelcomePanel.ts

/**
 * A panel that displays a welcome message and example cards
 * for users to start a conversation
 */
class WelcomePanel {
    /**
     * Creates a new WelcomePanel
     */
    constructor(options) {
        this.examples = options.examples;
        this.onExampleSelect = options.onExampleSelect;
        this.element = this.createPanelElement();
    }
    /**
     * Returns the panel element
     */
    getElement() {
        return this.element;
    }
    /**
     * Creates the panel element with header, subheading, and example cards
     */
    createPanelElement() {
        const container = document.createElement("div");
        const header = document.createElement("h1");
        header.className = "suggestions-header";
        header.textContent = "Not sure where to start? Explore the suggested ideas below.";
        container.appendChild(header);
        // Create card grid for desktop view
        this.cardGrid = new CardGrid({
            items: this.examples,
            onItemSelect: (text) => this.onExampleSelect(text),
        });
        container.appendChild(this.cardGrid.getElement());
        return container;
    }
}

;// ./src/hooks/useSpeechRecognition.ts
/**
 * Hook to enable speech recognition functionality
 */
/**
 * Sets up speech recognition on a microphone button
 */
function setupSpeechRecognition(micButton, inputElement, 
// eslint-disable-next-line no-unused-vars
onResult) {
    // Check if the browser supports speech recognition
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    // If speech recognition is not supported, hide the microphone button
    if (!SpeechRecognitionAPI) {
        micButton.style.display = "none";
        return;
    }
    // Create a speech recognition instance
    const recognition = new SpeechRecognitionAPI();
    // Configure the speech recognition
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    // Variable to track if we're currently listening
    let isListening = false;
    // Add a class to the button when listening
    const startListening = () => {
        isListening = true;
        micButton.classList.add("listening");
        recognition.start();
    };
    // Remove the class from the button when not listening
    const stopListening = () => {
        isListening = false;
        micButton.classList.remove("listening");
        recognition.stop();
    };
    // Handle the result event
    recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join("");
        // Update the input value with the transcript
        inputElement.value = transcript;
        // If final result, stop listening and invoke the callback
        if (event.results[0].isFinal) {
            stopListening();
            onResult(transcript);
        }
    };
    // Handle the end event (can be triggered by many things, timeout, etc.)
    recognition.onend = () => {
        stopListening();
    };
    // Handle errors
    recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        stopListening();
    };
    // Toggle listening when the mic button is clicked
    micButton.addEventListener("click", (e) => {
        e.preventDefault();
        if (!isListening) {
            startListening();
        }
        else {
            stopListening();
        }
    });
}

;// ./src/components/InputBar.ts


/**
 * InputBar component that handles text input with microphone and submit buttons
 */
class InputBar {
    /**
     * Creates a new InputBar component
     */
    constructor(options) {
        this.options = {
            placeholder: "Describe your dream trip, we'll help you find it.",
            ...options,
        };
        this.element = this.createInputBarElement();
    }
    /**
     * Returns the DOM element for the InputBar
     */
    getElement() {
        return this.element;
    }
    /**
     * Sets the focus to the input field
     */
    focus() {
        this.inputElement.focus();
    }
    /**
     * Clears the input field
     */
    clear() {
        this.inputElement.value = "";
        this.toggleSubmitButton();
    }
    /**
     * Creates the input bar DOM element
     */
    createInputBarElement() {
        const container = document.createElement("div");
        container.className = "input-container";
        // Create the text input
        this.inputElement = document.createElement("input");
        this.inputElement.type = "text";
        this.inputElement.className = "chat-input";
        this.inputElement.placeholder = this.options.placeholder;
        this.inputElement.setAttribute("aria-label", "Message input");
        container.appendChild(this.inputElement);
        // Create the microphone button
        this.micButton = document.createElement("button");
        this.micButton.className = "mic-button";
        this.micButton.setAttribute("aria-label", "Voice input");
        this.micButton.innerHTML = getMicrophoneSVG();
        // Set up speech recognition for the microphone button
        setupSpeechRecognition(this.micButton, this.inputElement, (text) => {
            if (text) {
                this.inputElement.value = text;
                this.handleSubmit();
                this.toggleSubmitButton(); // Update button state after speech input
            }
        });
        container.appendChild(this.micButton);
        // Create the submit button
        this.submitButton = document.createElement("button");
        this.submitButton.className = "submit-button";
        this.submitButton.setAttribute("aria-label", "Send message");
        this.submitButton.innerHTML = getSendIconSVG();
        this.submitButton.disabled = true;
        container.appendChild(this.submitButton);
        // Add event listeners
        this.setupEventListeners();
        return container;
    }
    /**
     * Sets up event listeners for the input bar
     */
    setupEventListeners() {
        // Function to toggle submit button state based on input value
        this.inputElement.addEventListener("input", () => {
            this.toggleSubmitButton();
        });
        // Submit when the button is clicked
        this.submitButton.addEventListener("click", () => {
            this.handleSubmit();
        });
        // Submit when Enter is pressed
        this.inputElement.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                this.handleSubmit();
            }
        });
    }
    /**
     * Handles submit functionality
     */
    handleSubmit() {
        const message = this.inputElement.value.trim();
        if (message) {
            this.options.onSubmit(message);
            this.inputElement.value = "";
            // Notify about message submission
            if (this.options.onMessageSubmit) {
                this.options.onMessageSubmit();
            }
            // Update button state after clearing input
            this.toggleSubmitButton();
        }
    }
    /**
     * Toggles submit button state based on input value
     */
    toggleSubmitButton() {
        const hasText = this.inputElement.value.trim() !== "";
        this.submitButton.disabled = !hasText;
    }
}

;// ./src/components/ChatInterface.ts



/**
 * Creates the chat interface component
 */
function createChatInterface(options) {
    // Create the container for the chat interface
    const container = document.createElement("div");
    container.className = "chat-interface";
    // Create the Adobe logo (positioned at top-left of screen via CSS)
    const logo = document.createElement("div");
    logo.className = "company-logo";
    logo.innerHTML = getCompanyLogoSVG();
    document.body.appendChild(logo);
    // Define example messages data
    const examples = [
        {
            text: "Help me find a beach trip for summer getaway",
            image: "images/3.jpg",
            backgroundColor: "#304CB2",
        },
        {
            text: "Find a flight from San Jose to Las Vegas from July 1 to 10",
            image: "images/2.png",
            backgroundColor: "#304CB2",
        },
        {
            text: "Show me a beach vacation in Hawaii",
            image: "images/1.png",
            backgroundColor: "#304CB2",
        }
    ];
    const innerContainer = document.createElement("div");
    innerContainer.className = "example-messages welcome-panel";
    const heading = document.createElement("h2");
    heading.className = "example-heading";
    heading.innerHTML = "Looking for your next great getaway? Let’s find a trip that makes your heart smile!";
    innerContainer.appendChild(heading);
    container.appendChild(innerContainer);
    const divButton = document.createElement("div");
    divButton.className = "example-button";
    container.appendChild(divButton);
    // Create welcome panel with example messages
    const div = document.createElement("div");
    div.className = "example-messages welcome-panel";
    const welcomePanel = new WelcomePanel({
        examples,
        onExampleSelect: (text) => {
            options.onSubmit(text);
            fadeOutExampleMessages(welcomePanel.getElement());
        },
    });
    // Create the input section
    const inputSection = createInputSection(options.onSubmit, welcomePanel.getElement());
    divButton.appendChild(inputSection);
    div.appendChild(welcomePanel.getElement());
    container.appendChild(div);
    // Create the chat history section (positioned between examples and input)
    const chatHistory = document.createElement("div");
    chatHistory.className = "chat-history";
    container.appendChild(chatHistory);
    return container;
}
/**
 * Creates the input section component
 */
// eslint-disable-next-line no-unused-vars
function createInputSection(onSubmit, exampleMessagesElement) {
    const container = document.createElement("div");
    container.className = "input-section";
    // Create message blocker that sits behind the input
    const messageBlocker = document.createElement("div");
    messageBlocker.className = "message-blocker";
    container.appendChild(messageBlocker);
    // Create the input container using the InputBar component
    const inputBar = new InputBar({
        onSubmit: onSubmit,
        onMessageSubmit: () => {
            fadeOutExampleMessages(exampleMessagesElement);
        },
    });
    container.appendChild(inputBar.getElement());
    // Add under input message
    const underInput = document.createElement("div");
    underInput.className = "under-input-message example-messages welcome-panel";
    underInput.textContent = "Right now, Southwest Concierge helps you explore destinations and get trip ideas, booking support coming soon!";
    container.appendChild(underInput);
    return container;
}
/**
 * Fades out the example messages
 */
function fadeOutExampleMessages(element) {
    if (element.classList.contains("fade-out"))
        return;
    // Add the fade out class (which now hides immediately via CSS)
    element.classList.add("fade-out");
    // No need for setTimeout since display:none is set in CSS
}

;// ./src/components/IconButton.ts
/**
 * Creates a button with an SVG icon
 *
 * @param options The options for creating the button
 * @returns The button element
 */
function createIconButton(options) {
    // Create the button element
    const button = document.createElement("button");
    // Set the base class name
    button.className = "icon-button";
    // Set accessibility attributes
    button.setAttribute("aria-label", options.ariaLabel);
    button.setAttribute("type", "button");
    // Set disabled state if specified
    if (options.disabled) {
        button.disabled = true;
    }
    // Set the icon content
    button.innerHTML = options.icon;
    // Add click handler if provided
    if (options.onClick) {
        button.addEventListener("click", options.onClick);
    }
    return button;
}
/**
 * Updates the properties of an existing icon button
 *
 * @param button The button element to update
 * @param updates The properties to update
 */
function updateIconButton(button, updates) {
    // Update icon if provided
    if (updates.icon !== undefined) {
        button.innerHTML = updates.icon;
    }
    // Update aria-label if provided
    if (updates.ariaLabel !== undefined) {
        button.setAttribute("aria-label", updates.ariaLabel);
    }
    // Update disabled state if provided
    if (updates.disabled !== undefined) {
        button.disabled = updates.disabled;
    }
}

;// ./src/components/ChatContainer.ts
/**
 * ChatContainer component for managing the main application shell
 */


/**
 * Component that manages the main chat application shell
 */
class ChatContainer {
    /**
     * Creates a chat container
     * @param options The configuration options
     */
    constructor(options) {
        this.isScrolledToBottom = true;
        this.isActive = false;
        this.element = this.createContainerElement();
        this.scrollButton = this.createScrollButton();
        this.setupScrollHandlers(options.onStateChange);
    }
    /**
     * Gets the DOM element for this container
     * @returns The container element
     */
    getElement() {
        return this.element;
    }
    /**
     * Adds a child element to the container
     * @param element The element to add
     */
    appendChild(element) {
        this.element.appendChild(element);
    }
    /**
     * Transitions the container to the active state
     * Shows the conversation interface and hides the welcome panel
     */
    activateChat() {
        if (this.isActive)
            return;
        this.isActive = true;
        this.element.classList.remove("initial-state");
        // Check scroll position after transition
        setTimeout(() => {
            this.checkScrollPosition();
        }, 300);
        // Notify of state change if callback exists
        if (this.onStateChange) {
            this.onStateChange(true);
        }
    }
    /**
     * Creates the main container element
     * @returns The created container element
     */
    createContainerElement() {
        const container = document.createElement("div");
        container.className = "brand-concierge-container initial-state"; // Start with initial state
        return container;
    }
    /**
     * Creates the scroll-to-bottom button
     * @returns The created button
     */
    createScrollButton() {
        const button = createIconButton({
            ariaLabel: "Scroll to bottom",
            icon: getScrollToBottomSVG(),
            onClick: () => {
                window.scrollTo({
                    top: document.documentElement.scrollHeight,
                    behavior: "smooth",
                });
            },
        });
        button.className = "scroll-to-bottom";
        this.element.appendChild(button);
        return button;
    }
    /**
     * Sets up scroll and resize handlers
     * @param onStateChange Optional callback for state changes
     */
    setupScrollHandlers(
    // eslint-disable-next-line no-unused-vars
    onStateChange) {
        // Store the callback
        this.onStateChange = onStateChange;
        // Update scroll button visibility on scroll
        window.addEventListener("scroll", () => this.checkScrollPosition());
        // Also check on window resize
        window.addEventListener("resize", () => this.checkScrollPosition());
        // Initial check
        this.checkScrollPosition();
    }
    /**
     * Checks the current scroll position and updates button visibility
     */
    checkScrollPosition() {
        // Don't show scroll button in landing page mode
        if (this.element.classList.contains("initial-state")) {
            this.scrollButton.classList.remove("visible");
            return;
        }
        const scrollPosition = window.scrollY + window.innerHeight;
        const threshold = 50; // Pixels from bottom to consider "at the bottom"
        const isAtBottom = scrollPosition >= document.documentElement.scrollHeight - threshold;
        if (isAtBottom) {
            if (!this.isScrolledToBottom) {
                this.scrollButton.classList.remove("visible");
                setTimeout(() => {
                    if (this.isScrolledToBottom) {
                        this.scrollButton.style.display = "none";
                    }
                }, 300);
                this.isScrolledToBottom = true;
            }
        }
        else if (this.isScrolledToBottom) {
            this.scrollButton.style.display = "flex";
            // Use requestAnimationFrame to ensure display change is applied before adding class
            requestAnimationFrame(() => {
                this.scrollButton.classList.add("visible");
            });
            this.isScrolledToBottom = false;
        }
    }
}

;// ./node_modules/marked/lib/marked.esm.js
/**
 * marked v15.0.11 - a markdown parser
 * Copyright (c) 2011-2025, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/markedjs/marked
 */

/**
 * DO NOT EDIT THIS FILE
 * The code in this file is generated from files in ./src/
 */

/**
 * Gets the original marked default options.
 */
function _getDefaults() {
    return {
        async: false,
        breaks: false,
        extensions: null,
        gfm: true,
        hooks: null,
        pedantic: false,
        renderer: null,
        silent: false,
        tokenizer: null,
        walkTokens: null,
    };
}
let _defaults = _getDefaults();
function changeDefaults(newDefaults) {
    _defaults = newDefaults;
}

const noopTest = { exec: () => null };
function edit(regex, opt = '') {
    let source = typeof regex === 'string' ? regex : regex.source;
    const obj = {
        replace: (name, val) => {
            let valSource = typeof val === 'string' ? val : val.source;
            valSource = valSource.replace(other.caret, '$1');
            source = source.replace(name, valSource);
            return obj;
        },
        getRegex: () => {
            return new RegExp(source, opt);
        },
    };
    return obj;
}
const other = {
    codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm,
    outputLinkReplace: /\\([\[\]])/g,
    indentCodeCompensation: /^(\s+)(?:```)/,
    beginningSpace: /^\s+/,
    endingHash: /#$/,
    startingSpaceChar: /^ /,
    endingSpaceChar: / $/,
    nonSpaceChar: /[^ ]/,
    newLineCharGlobal: /\n/g,
    tabCharGlobal: /\t/g,
    multipleSpaceGlobal: /\s+/g,
    blankLine: /^[ \t]*$/,
    doubleBlankLine: /\n[ \t]*\n[ \t]*$/,
    blockquoteStart: /^ {0,3}>/,
    blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g,
    blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm,
    listReplaceTabs: /^\t+/,
    listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g,
    listIsTask: /^\[[ xX]\] /,
    listReplaceTask: /^\[[ xX]\] +/,
    anyLine: /\n.*\n/,
    hrefBrackets: /^<(.*)>$/,
    tableDelimiter: /[:|]/,
    tableAlignChars: /^\||\| *$/g,
    tableRowBlankLine: /\n[ \t]*$/,
    tableAlignRight: /^ *-+: *$/,
    tableAlignCenter: /^ *:-+: *$/,
    tableAlignLeft: /^ *:-+ *$/,
    startATag: /^<a /i,
    endATag: /^<\/a>/i,
    startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i,
    endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i,
    startAngleBracket: /^</,
    endAngleBracket: />$/,
    pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/,
    unicodeAlphaNumeric: /[\p{L}\p{N}]/u,
    escapeTest: /[&<>"']/,
    escapeReplace: /[&<>"']/g,
    escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,
    escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,
    unescapeTest: /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,
    caret: /(^|[^\[])\^/g,
    percentDecode: /%25/g,
    findPipe: /\|/g,
    splitPipe: / \|/,
    slashPipe: /\\\|/g,
    carriageReturn: /\r\n|\r/g,
    spaceLine: /^ +$/gm,
    notSpaceStart: /^\S*/,
    endingNewline: /\n$/,
    listItemRegex: (bull) => new RegExp(`^( {0,3}${bull})((?:[\t ][^\\n]*)?(?:\\n|$))`),
    nextBulletRegex: (indent) => new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ \t][^\\n]*)?(?:\\n|$))`),
    hrRegex: (indent) => new RegExp(`^ {0,${Math.min(3, indent - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),
    fencesBeginRegex: (indent) => new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:\`\`\`|~~~)`),
    headingBeginRegex: (indent) => new RegExp(`^ {0,${Math.min(3, indent - 1)}}#`),
    htmlBeginRegex: (indent) => new RegExp(`^ {0,${Math.min(3, indent - 1)}}<(?:[a-z].*>|!--)`, 'i'),
};
/**
 * Block-Level Grammar
 */
const newline = /^(?:[ \t]*(?:\n|$))+/;
const blockCode = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/;
const fences = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/;
const hr = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
const heading = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/;
const bullet = /(?:[*+-]|\d{1,9}[.)])/;
const lheadingCore = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/;
const lheading = edit(lheadingCore)
    .replace(/bull/g, bullet) // lists can interrupt
    .replace(/blockCode/g, /(?: {4}| {0,3}\t)/) // indented code blocks can interrupt
    .replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/) // fenced code blocks can interrupt
    .replace(/blockquote/g, / {0,3}>/) // blockquote can interrupt
    .replace(/heading/g, / {0,3}#{1,6}/) // ATX heading can interrupt
    .replace(/html/g, / {0,3}<[^\n>]+>\n/) // block html can interrupt
    .replace(/\|table/g, '') // table not in commonmark
    .getRegex();
const lheadingGfm = edit(lheadingCore)
    .replace(/bull/g, bullet) // lists can interrupt
    .replace(/blockCode/g, /(?: {4}| {0,3}\t)/) // indented code blocks can interrupt
    .replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/) // fenced code blocks can interrupt
    .replace(/blockquote/g, / {0,3}>/) // blockquote can interrupt
    .replace(/heading/g, / {0,3}#{1,6}/) // ATX heading can interrupt
    .replace(/html/g, / {0,3}<[^\n>]+>\n/) // block html can interrupt
    .replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/) // table can interrupt
    .getRegex();
const _paragraph = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/;
const blockText = /^[^\n]+/;
const _blockLabel = /(?!\s*\])(?:\\.|[^\[\]\\])+/;
const def = edit(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/)
    .replace('label', _blockLabel)
    .replace('title', /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/)
    .getRegex();
const list = edit(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/)
    .replace(/bull/g, bullet)
    .getRegex();
const _tag = 'address|article|aside|base|basefont|blockquote|body|caption'
    + '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption'
    + '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe'
    + '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option'
    + '|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title'
    + '|tr|track|ul';
const _comment = /<!--(?:-?>|[\s\S]*?(?:-->|$))/;
const html = edit('^ {0,3}(?:' // optional indentation
    + '<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
    + '|comment[^\\n]*(\\n+|$)' // (2)
    + '|<\\?[\\s\\S]*?(?:\\?>\\n*|$)' // (3)
    + '|<![A-Z][\\s\\S]*?(?:>\\n*|$)' // (4)
    + '|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)' // (5)
    + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)' // (6)
    + '|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)' // (7) open tag
    + '|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)' // (7) closing tag
    + ')', 'i')
    .replace('comment', _comment)
    .replace('tag', _tag)
    .replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/)
    .getRegex();
const paragraph = edit(_paragraph)
    .replace('hr', hr)
    .replace('heading', ' {0,3}#{1,6}(?:\\s|$)')
    .replace('|lheading', '') // setext headings don't interrupt commonmark paragraphs
    .replace('|table', '')
    .replace('blockquote', ' {0,3}>')
    .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
    .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
    .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
    .replace('tag', _tag) // pars can be interrupted by type (6) html blocks
    .getRegex();
const blockquote = edit(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/)
    .replace('paragraph', paragraph)
    .getRegex();
/**
 * Normal Block Grammar
 */
const blockNormal = {
    blockquote,
    code: blockCode,
    def,
    fences,
    heading,
    hr,
    html,
    lheading,
    list,
    newline,
    paragraph,
    table: noopTest,
    text: blockText,
};
/**
 * GFM Block Grammar
 */
const gfmTable = edit('^ *([^\\n ].*)\\n' // Header
    + ' {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)' // Align
    + '(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)') // Cells
    .replace('hr', hr)
    .replace('heading', ' {0,3}#{1,6}(?:\\s|$)')
    .replace('blockquote', ' {0,3}>')
    .replace('code', '(?: {4}| {0,3}\t)[^\\n]')
    .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
    .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
    .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
    .replace('tag', _tag) // tables can be interrupted by type (6) html blocks
    .getRegex();
const blockGfm = {
    ...blockNormal,
    lheading: lheadingGfm,
    table: gfmTable,
    paragraph: edit(_paragraph)
        .replace('hr', hr)
        .replace('heading', ' {0,3}#{1,6}(?:\\s|$)')
        .replace('|lheading', '') // setext headings don't interrupt commonmark paragraphs
        .replace('table', gfmTable) // interrupt paragraphs with table
        .replace('blockquote', ' {0,3}>')
        .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
        .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
        .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
        .replace('tag', _tag) // pars can be interrupted by type (6) html blocks
        .getRegex(),
};
/**
 * Pedantic grammar (original John Gruber's loose markdown specification)
 */
const blockPedantic = {
    ...blockNormal,
    html: edit('^ *(?:comment *(?:\\n|\\s*$)'
        + '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' // closed tag
        + '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))')
        .replace('comment', _comment)
        .replace(/tag/g, '(?!(?:'
        + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub'
        + '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)'
        + '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b')
        .getRegex(),
    def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
    heading: /^(#{1,6})(.*)(?:\n+|$)/,
    fences: noopTest, // fences not supported
    lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
    paragraph: edit(_paragraph)
        .replace('hr', hr)
        .replace('heading', ' *#{1,6} *[^\n]')
        .replace('lheading', lheading)
        .replace('|table', '')
        .replace('blockquote', ' {0,3}>')
        .replace('|fences', '')
        .replace('|list', '')
        .replace('|html', '')
        .replace('|tag', '')
        .getRegex(),
};
/**
 * Inline-Level Grammar
 */
const escape$1 = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/;
const inlineCode = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
const br = /^( {2,}|\\)\n(?!\s*$)/;
const inlineText = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/;
// list of unicode punctuation marks, plus any missing characters from CommonMark spec
const _punctuation = /[\p{P}\p{S}]/u;
const _punctuationOrSpace = /[\s\p{P}\p{S}]/u;
const _notPunctuationOrSpace = /[^\s\p{P}\p{S}]/u;
const punctuation = edit(/^((?![*_])punctSpace)/, 'u')
    .replace(/punctSpace/g, _punctuationOrSpace).getRegex();
// GFM allows ~ inside strong and em for strikethrough
const _punctuationGfmStrongEm = /(?!~)[\p{P}\p{S}]/u;
const _punctuationOrSpaceGfmStrongEm = /(?!~)[\s\p{P}\p{S}]/u;
const _notPunctuationOrSpaceGfmStrongEm = /(?:[^\s\p{P}\p{S}]|~)/u;
// sequences em should skip over [title](link), `code`, <html>
const blockSkip = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g;
const emStrongLDelimCore = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/;
const emStrongLDelim = edit(emStrongLDelimCore, 'u')
    .replace(/punct/g, _punctuation)
    .getRegex();
const emStrongLDelimGfm = edit(emStrongLDelimCore, 'u')
    .replace(/punct/g, _punctuationGfmStrongEm)
    .getRegex();
const emStrongRDelimAstCore = '^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)' // Skip orphan inside strong
    + '|[^*]+(?=[^*])' // Consume to delim
    + '|(?!\\*)punct(\\*+)(?=[\\s]|$)' // (1) #*** can only be a Right Delimiter
    + '|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)' // (2) a***#, a*** can only be a Right Delimiter
    + '|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)' // (3) #***a, ***a can only be Left Delimiter
    + '|[\\s](\\*+)(?!\\*)(?=punct)' // (4) ***# can only be Left Delimiter
    + '|(?!\\*)punct(\\*+)(?!\\*)(?=punct)' // (5) #***# can be either Left or Right Delimiter
    + '|notPunctSpace(\\*+)(?=notPunctSpace)'; // (6) a***a can be either Left or Right Delimiter
const emStrongRDelimAst = edit(emStrongRDelimAstCore, 'gu')
    .replace(/notPunctSpace/g, _notPunctuationOrSpace)
    .replace(/punctSpace/g, _punctuationOrSpace)
    .replace(/punct/g, _punctuation)
    .getRegex();
const emStrongRDelimAstGfm = edit(emStrongRDelimAstCore, 'gu')
    .replace(/notPunctSpace/g, _notPunctuationOrSpaceGfmStrongEm)
    .replace(/punctSpace/g, _punctuationOrSpaceGfmStrongEm)
    .replace(/punct/g, _punctuationGfmStrongEm)
    .getRegex();
// (6) Not allowed for _
const emStrongRDelimUnd = edit('^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)' // Skip orphan inside strong
    + '|[^_]+(?=[^_])' // Consume to delim
    + '|(?!_)punct(_+)(?=[\\s]|$)' // (1) #___ can only be a Right Delimiter
    + '|notPunctSpace(_+)(?!_)(?=punctSpace|$)' // (2) a___#, a___ can only be a Right Delimiter
    + '|(?!_)punctSpace(_+)(?=notPunctSpace)' // (3) #___a, ___a can only be Left Delimiter
    + '|[\\s](_+)(?!_)(?=punct)' // (4) ___# can only be Left Delimiter
    + '|(?!_)punct(_+)(?!_)(?=punct)', 'gu') // (5) #___# can be either Left or Right Delimiter
    .replace(/notPunctSpace/g, _notPunctuationOrSpace)
    .replace(/punctSpace/g, _punctuationOrSpace)
    .replace(/punct/g, _punctuation)
    .getRegex();
const anyPunctuation = edit(/\\(punct)/, 'gu')
    .replace(/punct/g, _punctuation)
    .getRegex();
const autolink = edit(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/)
    .replace('scheme', /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/)
    .replace('email', /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/)
    .getRegex();
const _inlineComment = edit(_comment).replace('(?:-->|$)', '-->').getRegex();
const tag = edit('^comment'
    + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
    + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
    + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
    + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
    + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>') // CDATA section
    .replace('comment', _inlineComment)
    .replace('attribute', /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/)
    .getRegex();
const _inlineLabel = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
const marked_esm_link = edit(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/)
    .replace('label', _inlineLabel)
    .replace('href', /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/)
    .replace('title', /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/)
    .getRegex();
const reflink = edit(/^!?\[(label)\]\[(ref)\]/)
    .replace('label', _inlineLabel)
    .replace('ref', _blockLabel)
    .getRegex();
const nolink = edit(/^!?\[(ref)\](?:\[\])?/)
    .replace('ref', _blockLabel)
    .getRegex();
const reflinkSearch = edit('reflink|nolink(?!\\()', 'g')
    .replace('reflink', reflink)
    .replace('nolink', nolink)
    .getRegex();
/**
 * Normal Inline Grammar
 */
const inlineNormal = {
    _backpedal: noopTest, // only used for GFM url
    anyPunctuation,
    autolink,
    blockSkip,
    br,
    code: inlineCode,
    del: noopTest,
    emStrongLDelim,
    emStrongRDelimAst,
    emStrongRDelimUnd,
    escape: escape$1,
    link: marked_esm_link,
    nolink,
    punctuation,
    reflink,
    reflinkSearch,
    tag,
    text: inlineText,
    url: noopTest,
};
/**
 * Pedantic Inline Grammar
 */
const inlinePedantic = {
    ...inlineNormal,
    link: edit(/^!?\[(label)\]\((.*?)\)/)
        .replace('label', _inlineLabel)
        .getRegex(),
    reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/)
        .replace('label', _inlineLabel)
        .getRegex(),
};
/**
 * GFM Inline Grammar
 */
const inlineGfm = {
    ...inlineNormal,
    emStrongRDelimAst: emStrongRDelimAstGfm,
    emStrongLDelim: emStrongLDelimGfm,
    url: edit(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, 'i')
        .replace('email', /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/)
        .getRegex(),
    _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
    del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
    text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/,
};
/**
 * GFM + Line Breaks Inline Grammar
 */
const inlineBreaks = {
    ...inlineGfm,
    br: edit(br).replace('{2,}', '*').getRegex(),
    text: edit(inlineGfm.text)
        .replace('\\b_', '\\b_| {2,}\\n')
        .replace(/\{2,\}/g, '*')
        .getRegex(),
};
/**
 * exports
 */
const block = {
    normal: blockNormal,
    gfm: blockGfm,
    pedantic: blockPedantic,
};
const inline = {
    normal: inlineNormal,
    gfm: inlineGfm,
    breaks: inlineBreaks,
    pedantic: inlinePedantic,
};

/**
 * Helpers
 */
const escapeReplacements = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};
const getEscapeReplacement = (ch) => escapeReplacements[ch];
function marked_esm_escape(html, encode) {
    if (encode) {
        if (other.escapeTest.test(html)) {
            return html.replace(other.escapeReplace, getEscapeReplacement);
        }
    }
    else {
        if (other.escapeTestNoEncode.test(html)) {
            return html.replace(other.escapeReplaceNoEncode, getEscapeReplacement);
        }
    }
    return html;
}
function cleanUrl(href) {
    try {
        href = encodeURI(href).replace(other.percentDecode, '%');
    }
    catch {
        return null;
    }
    return href;
}
function splitCells(tableRow, count) {
    // ensure that every cell-delimiting pipe has a space
    // before it to distinguish it from an escaped pipe
    const row = tableRow.replace(other.findPipe, (match, offset, str) => {
        let escaped = false;
        let curr = offset;
        while (--curr >= 0 && str[curr] === '\\')
            escaped = !escaped;
        if (escaped) {
            // odd number of slashes means | is escaped
            // so we leave it alone
            return '|';
        }
        else {
            // add space before unescaped |
            return ' |';
        }
    }), cells = row.split(other.splitPipe);
    let i = 0;
    // First/last cell in a row cannot be empty if it has no leading/trailing pipe
    if (!cells[0].trim()) {
        cells.shift();
    }
    if (cells.length > 0 && !cells.at(-1)?.trim()) {
        cells.pop();
    }
    if (count) {
        if (cells.length > count) {
            cells.splice(count);
        }
        else {
            while (cells.length < count)
                cells.push('');
        }
    }
    for (; i < cells.length; i++) {
        // leading or trailing whitespace is ignored per the gfm spec
        cells[i] = cells[i].trim().replace(other.slashPipe, '|');
    }
    return cells;
}
/**
 * Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
 * /c*$/ is vulnerable to REDOS.
 *
 * @param str
 * @param c
 * @param invert Remove suffix of non-c chars instead. Default falsey.
 */
function rtrim(str, c, invert) {
    const l = str.length;
    if (l === 0) {
        return '';
    }
    // Length of suffix matching the invert condition.
    let suffLen = 0;
    // Step left until we fail to match the invert condition.
    while (suffLen < l) {
        const currChar = str.charAt(l - suffLen - 1);
        if (currChar === c && true) {
            suffLen++;
        }
        else {
            break;
        }
    }
    return str.slice(0, l - suffLen);
}
function findClosingBracket(str, b) {
    if (str.indexOf(b[1]) === -1) {
        return -1;
    }
    let level = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === '\\') {
            i++;
        }
        else if (str[i] === b[0]) {
            level++;
        }
        else if (str[i] === b[1]) {
            level--;
            if (level < 0) {
                return i;
            }
        }
    }
    if (level > 0) {
        return -2;
    }
    return -1;
}

function outputLink(cap, link, raw, lexer, rules) {
    const href = link.href;
    const title = link.title || null;
    const text = cap[1].replace(rules.other.outputLinkReplace, '$1');
    lexer.state.inLink = true;
    const token = {
        type: cap[0].charAt(0) === '!' ? 'image' : 'link',
        raw,
        href,
        title,
        text,
        tokens: lexer.inlineTokens(text),
    };
    lexer.state.inLink = false;
    return token;
}
function indentCodeCompensation(raw, text, rules) {
    const matchIndentToCode = raw.match(rules.other.indentCodeCompensation);
    if (matchIndentToCode === null) {
        return text;
    }
    const indentToCode = matchIndentToCode[1];
    return text
        .split('\n')
        .map(node => {
        const matchIndentInNode = node.match(rules.other.beginningSpace);
        if (matchIndentInNode === null) {
            return node;
        }
        const [indentInNode] = matchIndentInNode;
        if (indentInNode.length >= indentToCode.length) {
            return node.slice(indentToCode.length);
        }
        return node;
    })
        .join('\n');
}
/**
 * Tokenizer
 */
class _Tokenizer {
    options;
    rules; // set by the lexer
    lexer; // set by the lexer
    constructor(options) {
        this.options = options || _defaults;
    }
    space(src) {
        const cap = this.rules.block.newline.exec(src);
        if (cap && cap[0].length > 0) {
            return {
                type: 'space',
                raw: cap[0],
            };
        }
    }
    code(src) {
        const cap = this.rules.block.code.exec(src);
        if (cap) {
            const text = cap[0].replace(this.rules.other.codeRemoveIndent, '');
            return {
                type: 'code',
                raw: cap[0],
                codeBlockStyle: 'indented',
                text: !this.options.pedantic
                    ? rtrim(text, '\n')
                    : text,
            };
        }
    }
    fences(src) {
        const cap = this.rules.block.fences.exec(src);
        if (cap) {
            const raw = cap[0];
            const text = indentCodeCompensation(raw, cap[3] || '', this.rules);
            return {
                type: 'code',
                raw,
                lang: cap[2] ? cap[2].trim().replace(this.rules.inline.anyPunctuation, '$1') : cap[2],
                text,
            };
        }
    }
    heading(src) {
        const cap = this.rules.block.heading.exec(src);
        if (cap) {
            let text = cap[2].trim();
            // remove trailing #s
            if (this.rules.other.endingHash.test(text)) {
                const trimmed = rtrim(text, '#');
                if (this.options.pedantic) {
                    text = trimmed.trim();
                }
                else if (!trimmed || this.rules.other.endingSpaceChar.test(trimmed)) {
                    // CommonMark requires space before trailing #s
                    text = trimmed.trim();
                }
            }
            return {
                type: 'heading',
                raw: cap[0],
                depth: cap[1].length,
                text,
                tokens: this.lexer.inline(text),
            };
        }
    }
    hr(src) {
        const cap = this.rules.block.hr.exec(src);
        if (cap) {
            return {
                type: 'hr',
                raw: rtrim(cap[0], '\n'),
            };
        }
    }
    blockquote(src) {
        const cap = this.rules.block.blockquote.exec(src);
        if (cap) {
            let lines = rtrim(cap[0], '\n').split('\n');
            let raw = '';
            let text = '';
            const tokens = [];
            while (lines.length > 0) {
                let inBlockquote = false;
                const currentLines = [];
                let i;
                for (i = 0; i < lines.length; i++) {
                    // get lines up to a continuation
                    if (this.rules.other.blockquoteStart.test(lines[i])) {
                        currentLines.push(lines[i]);
                        inBlockquote = true;
                    }
                    else if (!inBlockquote) {
                        currentLines.push(lines[i]);
                    }
                    else {
                        break;
                    }
                }
                lines = lines.slice(i);
                const currentRaw = currentLines.join('\n');
                const currentText = currentRaw
                    // precede setext continuation with 4 spaces so it isn't a setext
                    .replace(this.rules.other.blockquoteSetextReplace, '\n    $1')
                    .replace(this.rules.other.blockquoteSetextReplace2, '');
                raw = raw ? `${raw}\n${currentRaw}` : currentRaw;
                text = text ? `${text}\n${currentText}` : currentText;
                // parse blockquote lines as top level tokens
                // merge paragraphs if this is a continuation
                const top = this.lexer.state.top;
                this.lexer.state.top = true;
                this.lexer.blockTokens(currentText, tokens, true);
                this.lexer.state.top = top;
                // if there is no continuation then we are done
                if (lines.length === 0) {
                    break;
                }
                const lastToken = tokens.at(-1);
                if (lastToken?.type === 'code') {
                    // blockquote continuation cannot be preceded by a code block
                    break;
                }
                else if (lastToken?.type === 'blockquote') {
                    // include continuation in nested blockquote
                    const oldToken = lastToken;
                    const newText = oldToken.raw + '\n' + lines.join('\n');
                    const newToken = this.blockquote(newText);
                    tokens[tokens.length - 1] = newToken;
                    raw = raw.substring(0, raw.length - oldToken.raw.length) + newToken.raw;
                    text = text.substring(0, text.length - oldToken.text.length) + newToken.text;
                    break;
                }
                else if (lastToken?.type === 'list') {
                    // include continuation in nested list
                    const oldToken = lastToken;
                    const newText = oldToken.raw + '\n' + lines.join('\n');
                    const newToken = this.list(newText);
                    tokens[tokens.length - 1] = newToken;
                    raw = raw.substring(0, raw.length - lastToken.raw.length) + newToken.raw;
                    text = text.substring(0, text.length - oldToken.raw.length) + newToken.raw;
                    lines = newText.substring(tokens.at(-1).raw.length).split('\n');
                    continue;
                }
            }
            return {
                type: 'blockquote',
                raw,
                tokens,
                text,
            };
        }
    }
    list(src) {
        let cap = this.rules.block.list.exec(src);
        if (cap) {
            let bull = cap[1].trim();
            const isordered = bull.length > 1;
            const list = {
                type: 'list',
                raw: '',
                ordered: isordered,
                start: isordered ? +bull.slice(0, -1) : '',
                loose: false,
                items: [],
            };
            bull = isordered ? `\\d{1,9}\\${bull.slice(-1)}` : `\\${bull}`;
            if (this.options.pedantic) {
                bull = isordered ? bull : '[*+-]';
            }
            // Get next list item
            const itemRegex = this.rules.other.listItemRegex(bull);
            let endsWithBlankLine = false;
            // Check if current bullet point can start a new List Item
            while (src) {
                let endEarly = false;
                let raw = '';
                let itemContents = '';
                if (!(cap = itemRegex.exec(src))) {
                    break;
                }
                if (this.rules.block.hr.test(src)) { // End list if bullet was actually HR (possibly move into itemRegex?)
                    break;
                }
                raw = cap[0];
                src = src.substring(raw.length);
                let line = cap[2].split('\n', 1)[0].replace(this.rules.other.listReplaceTabs, (t) => ' '.repeat(3 * t.length));
                let nextLine = src.split('\n', 1)[0];
                let blankLine = !line.trim();
                let indent = 0;
                if (this.options.pedantic) {
                    indent = 2;
                    itemContents = line.trimStart();
                }
                else if (blankLine) {
                    indent = cap[1].length + 1;
                }
                else {
                    indent = cap[2].search(this.rules.other.nonSpaceChar); // Find first non-space char
                    indent = indent > 4 ? 1 : indent; // Treat indented code blocks (> 4 spaces) as having only 1 indent
                    itemContents = line.slice(indent);
                    indent += cap[1].length;
                }
                if (blankLine && this.rules.other.blankLine.test(nextLine)) { // Items begin with at most one blank line
                    raw += nextLine + '\n';
                    src = src.substring(nextLine.length + 1);
                    endEarly = true;
                }
                if (!endEarly) {
                    const nextBulletRegex = this.rules.other.nextBulletRegex(indent);
                    const hrRegex = this.rules.other.hrRegex(indent);
                    const fencesBeginRegex = this.rules.other.fencesBeginRegex(indent);
                    const headingBeginRegex = this.rules.other.headingBeginRegex(indent);
                    const htmlBeginRegex = this.rules.other.htmlBeginRegex(indent);
                    // Check if following lines should be included in List Item
                    while (src) {
                        const rawLine = src.split('\n', 1)[0];
                        let nextLineWithoutTabs;
                        nextLine = rawLine;
                        // Re-align to follow commonmark nesting rules
                        if (this.options.pedantic) {
                            nextLine = nextLine.replace(this.rules.other.listReplaceNesting, '  ');
                            nextLineWithoutTabs = nextLine;
                        }
                        else {
                            nextLineWithoutTabs = nextLine.replace(this.rules.other.tabCharGlobal, '    ');
                        }
                        // End list item if found code fences
                        if (fencesBeginRegex.test(nextLine)) {
                            break;
                        }
                        // End list item if found start of new heading
                        if (headingBeginRegex.test(nextLine)) {
                            break;
                        }
                        // End list item if found start of html block
                        if (htmlBeginRegex.test(nextLine)) {
                            break;
                        }
                        // End list item if found start of new bullet
                        if (nextBulletRegex.test(nextLine)) {
                            break;
                        }
                        // Horizontal rule found
                        if (hrRegex.test(nextLine)) {
                            break;
                        }
                        if (nextLineWithoutTabs.search(this.rules.other.nonSpaceChar) >= indent || !nextLine.trim()) { // Dedent if possible
                            itemContents += '\n' + nextLineWithoutTabs.slice(indent);
                        }
                        else {
                            // not enough indentation
                            if (blankLine) {
                                break;
                            }
                            // paragraph continuation unless last line was a different block level element
                            if (line.replace(this.rules.other.tabCharGlobal, '    ').search(this.rules.other.nonSpaceChar) >= 4) { // indented code block
                                break;
                            }
                            if (fencesBeginRegex.test(line)) {
                                break;
                            }
                            if (headingBeginRegex.test(line)) {
                                break;
                            }
                            if (hrRegex.test(line)) {
                                break;
                            }
                            itemContents += '\n' + nextLine;
                        }
                        if (!blankLine && !nextLine.trim()) { // Check if current line is blank
                            blankLine = true;
                        }
                        raw += rawLine + '\n';
                        src = src.substring(rawLine.length + 1);
                        line = nextLineWithoutTabs.slice(indent);
                    }
                }
                if (!list.loose) {
                    // If the previous item ended with a blank line, the list is loose
                    if (endsWithBlankLine) {
                        list.loose = true;
                    }
                    else if (this.rules.other.doubleBlankLine.test(raw)) {
                        endsWithBlankLine = true;
                    }
                }
                let istask = null;
                let ischecked;
                // Check for task list items
                if (this.options.gfm) {
                    istask = this.rules.other.listIsTask.exec(itemContents);
                    if (istask) {
                        ischecked = istask[0] !== '[ ] ';
                        itemContents = itemContents.replace(this.rules.other.listReplaceTask, '');
                    }
                }
                list.items.push({
                    type: 'list_item',
                    raw,
                    task: !!istask,
                    checked: ischecked,
                    loose: false,
                    text: itemContents,
                    tokens: [],
                });
                list.raw += raw;
            }
            // Do not consume newlines at end of final item. Alternatively, make itemRegex *start* with any newlines to simplify/speed up endsWithBlankLine logic
            const lastItem = list.items.at(-1);
            if (lastItem) {
                lastItem.raw = lastItem.raw.trimEnd();
                lastItem.text = lastItem.text.trimEnd();
            }
            else {
                // not a list since there were no items
                return;
            }
            list.raw = list.raw.trimEnd();
            // Item child tokens handled here at end because we needed to have the final item to trim it first
            for (let i = 0; i < list.items.length; i++) {
                this.lexer.state.top = false;
                list.items[i].tokens = this.lexer.blockTokens(list.items[i].text, []);
                if (!list.loose) {
                    // Check if list should be loose
                    const spacers = list.items[i].tokens.filter(t => t.type === 'space');
                    const hasMultipleLineBreaks = spacers.length > 0 && spacers.some(t => this.rules.other.anyLine.test(t.raw));
                    list.loose = hasMultipleLineBreaks;
                }
            }
            // Set all items to loose if list is loose
            if (list.loose) {
                for (let i = 0; i < list.items.length; i++) {
                    list.items[i].loose = true;
                }
            }
            return list;
        }
    }
    html(src) {
        const cap = this.rules.block.html.exec(src);
        if (cap) {
            const token = {
                type: 'html',
                block: true,
                raw: cap[0],
                pre: cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style',
                text: cap[0],
            };
            return token;
        }
    }
    def(src) {
        const cap = this.rules.block.def.exec(src);
        if (cap) {
            const tag = cap[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, ' ');
            const href = cap[2] ? cap[2].replace(this.rules.other.hrefBrackets, '$1').replace(this.rules.inline.anyPunctuation, '$1') : '';
            const title = cap[3] ? cap[3].substring(1, cap[3].length - 1).replace(this.rules.inline.anyPunctuation, '$1') : cap[3];
            return {
                type: 'def',
                tag,
                raw: cap[0],
                href,
                title,
            };
        }
    }
    table(src) {
        const cap = this.rules.block.table.exec(src);
        if (!cap) {
            return;
        }
        if (!this.rules.other.tableDelimiter.test(cap[2])) {
            // delimiter row must have a pipe (|) or colon (:) otherwise it is a setext heading
            return;
        }
        const headers = splitCells(cap[1]);
        const aligns = cap[2].replace(this.rules.other.tableAlignChars, '').split('|');
        const rows = cap[3]?.trim() ? cap[3].replace(this.rules.other.tableRowBlankLine, '').split('\n') : [];
        const item = {
            type: 'table',
            raw: cap[0],
            header: [],
            align: [],
            rows: [],
        };
        if (headers.length !== aligns.length) {
            // header and align columns must be equal, rows can be different.
            return;
        }
        for (const align of aligns) {
            if (this.rules.other.tableAlignRight.test(align)) {
                item.align.push('right');
            }
            else if (this.rules.other.tableAlignCenter.test(align)) {
                item.align.push('center');
            }
            else if (this.rules.other.tableAlignLeft.test(align)) {
                item.align.push('left');
            }
            else {
                item.align.push(null);
            }
        }
        for (let i = 0; i < headers.length; i++) {
            item.header.push({
                text: headers[i],
                tokens: this.lexer.inline(headers[i]),
                header: true,
                align: item.align[i],
            });
        }
        for (const row of rows) {
            item.rows.push(splitCells(row, item.header.length).map((cell, i) => {
                return {
                    text: cell,
                    tokens: this.lexer.inline(cell),
                    header: false,
                    align: item.align[i],
                };
            }));
        }
        return item;
    }
    lheading(src) {
        const cap = this.rules.block.lheading.exec(src);
        if (cap) {
            return {
                type: 'heading',
                raw: cap[0],
                depth: cap[2].charAt(0) === '=' ? 1 : 2,
                text: cap[1],
                tokens: this.lexer.inline(cap[1]),
            };
        }
    }
    paragraph(src) {
        const cap = this.rules.block.paragraph.exec(src);
        if (cap) {
            const text = cap[1].charAt(cap[1].length - 1) === '\n'
                ? cap[1].slice(0, -1)
                : cap[1];
            return {
                type: 'paragraph',
                raw: cap[0],
                text,
                tokens: this.lexer.inline(text),
            };
        }
    }
    text(src) {
        const cap = this.rules.block.text.exec(src);
        if (cap) {
            return {
                type: 'text',
                raw: cap[0],
                text: cap[0],
                tokens: this.lexer.inline(cap[0]),
            };
        }
    }
    escape(src) {
        const cap = this.rules.inline.escape.exec(src);
        if (cap) {
            return {
                type: 'escape',
                raw: cap[0],
                text: cap[1],
            };
        }
    }
    tag(src) {
        const cap = this.rules.inline.tag.exec(src);
        if (cap) {
            if (!this.lexer.state.inLink && this.rules.other.startATag.test(cap[0])) {
                this.lexer.state.inLink = true;
            }
            else if (this.lexer.state.inLink && this.rules.other.endATag.test(cap[0])) {
                this.lexer.state.inLink = false;
            }
            if (!this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(cap[0])) {
                this.lexer.state.inRawBlock = true;
            }
            else if (this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(cap[0])) {
                this.lexer.state.inRawBlock = false;
            }
            return {
                type: 'html',
                raw: cap[0],
                inLink: this.lexer.state.inLink,
                inRawBlock: this.lexer.state.inRawBlock,
                block: false,
                text: cap[0],
            };
        }
    }
    link(src) {
        const cap = this.rules.inline.link.exec(src);
        if (cap) {
            const trimmedUrl = cap[2].trim();
            if (!this.options.pedantic && this.rules.other.startAngleBracket.test(trimmedUrl)) {
                // commonmark requires matching angle brackets
                if (!(this.rules.other.endAngleBracket.test(trimmedUrl))) {
                    return;
                }
                // ending angle bracket cannot be escaped
                const rtrimSlash = rtrim(trimmedUrl.slice(0, -1), '\\');
                if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
                    return;
                }
            }
            else {
                // find closing parenthesis
                const lastParenIndex = findClosingBracket(cap[2], '()');
                if (lastParenIndex === -2) {
                    // more open parens than closed
                    return;
                }
                if (lastParenIndex > -1) {
                    const start = cap[0].indexOf('!') === 0 ? 5 : 4;
                    const linkLen = start + cap[1].length + lastParenIndex;
                    cap[2] = cap[2].substring(0, lastParenIndex);
                    cap[0] = cap[0].substring(0, linkLen).trim();
                    cap[3] = '';
                }
            }
            let href = cap[2];
            let title = '';
            if (this.options.pedantic) {
                // split pedantic href and title
                const link = this.rules.other.pedanticHrefTitle.exec(href);
                if (link) {
                    href = link[1];
                    title = link[3];
                }
            }
            else {
                title = cap[3] ? cap[3].slice(1, -1) : '';
            }
            href = href.trim();
            if (this.rules.other.startAngleBracket.test(href)) {
                if (this.options.pedantic && !(this.rules.other.endAngleBracket.test(trimmedUrl))) {
                    // pedantic allows starting angle bracket without ending angle bracket
                    href = href.slice(1);
                }
                else {
                    href = href.slice(1, -1);
                }
            }
            return outputLink(cap, {
                href: href ? href.replace(this.rules.inline.anyPunctuation, '$1') : href,
                title: title ? title.replace(this.rules.inline.anyPunctuation, '$1') : title,
            }, cap[0], this.lexer, this.rules);
        }
    }
    reflink(src, links) {
        let cap;
        if ((cap = this.rules.inline.reflink.exec(src))
            || (cap = this.rules.inline.nolink.exec(src))) {
            const linkString = (cap[2] || cap[1]).replace(this.rules.other.multipleSpaceGlobal, ' ');
            const link = links[linkString.toLowerCase()];
            if (!link) {
                const text = cap[0].charAt(0);
                return {
                    type: 'text',
                    raw: text,
                    text,
                };
            }
            return outputLink(cap, link, cap[0], this.lexer, this.rules);
        }
    }
    emStrong(src, maskedSrc, prevChar = '') {
        let match = this.rules.inline.emStrongLDelim.exec(src);
        if (!match)
            return;
        // _ can't be between two alphanumerics. \p{L}\p{N} includes non-english alphabet/numbers as well
        if (match[3] && prevChar.match(this.rules.other.unicodeAlphaNumeric))
            return;
        const nextChar = match[1] || match[2] || '';
        if (!nextChar || !prevChar || this.rules.inline.punctuation.exec(prevChar)) {
            // unicode Regex counts emoji as 1 char; spread into array for proper count (used multiple times below)
            const lLength = [...match[0]].length - 1;
            let rDelim, rLength, delimTotal = lLength, midDelimTotal = 0;
            const endReg = match[0][0] === '*' ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
            endReg.lastIndex = 0;
            // Clip maskedSrc to same section of string as src (move to lexer?)
            maskedSrc = maskedSrc.slice(-1 * src.length + lLength);
            while ((match = endReg.exec(maskedSrc)) != null) {
                rDelim = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];
                if (!rDelim)
                    continue; // skip single * in __abc*abc__
                rLength = [...rDelim].length;
                if (match[3] || match[4]) { // found another Left Delim
                    delimTotal += rLength;
                    continue;
                }
                else if (match[5] || match[6]) { // either Left or Right Delim
                    if (lLength % 3 && !((lLength + rLength) % 3)) {
                        midDelimTotal += rLength;
                        continue; // CommonMark Emphasis Rules 9-10
                    }
                }
                delimTotal -= rLength;
                if (delimTotal > 0)
                    continue; // Haven't found enough closing delimiters
                // Remove extra characters. *a*** -> *a*
                rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);
                // char length can be >1 for unicode characters;
                const lastCharLength = [...match[0]][0].length;
                const raw = src.slice(0, lLength + match.index + lastCharLength + rLength);
                // Create `em` if smallest delimiter has odd char count. *a***
                if (Math.min(lLength, rLength) % 2) {
                    const text = raw.slice(1, -1);
                    return {
                        type: 'em',
                        raw,
                        text,
                        tokens: this.lexer.inlineTokens(text),
                    };
                }
                // Create 'strong' if smallest delimiter has even char count. **a***
                const text = raw.slice(2, -2);
                return {
                    type: 'strong',
                    raw,
                    text,
                    tokens: this.lexer.inlineTokens(text),
                };
            }
        }
    }
    codespan(src) {
        const cap = this.rules.inline.code.exec(src);
        if (cap) {
            let text = cap[2].replace(this.rules.other.newLineCharGlobal, ' ');
            const hasNonSpaceChars = this.rules.other.nonSpaceChar.test(text);
            const hasSpaceCharsOnBothEnds = this.rules.other.startingSpaceChar.test(text) && this.rules.other.endingSpaceChar.test(text);
            if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
                text = text.substring(1, text.length - 1);
            }
            return {
                type: 'codespan',
                raw: cap[0],
                text,
            };
        }
    }
    br(src) {
        const cap = this.rules.inline.br.exec(src);
        if (cap) {
            return {
                type: 'br',
                raw: cap[0],
            };
        }
    }
    del(src) {
        const cap = this.rules.inline.del.exec(src);
        if (cap) {
            return {
                type: 'del',
                raw: cap[0],
                text: cap[2],
                tokens: this.lexer.inlineTokens(cap[2]),
            };
        }
    }
    autolink(src) {
        const cap = this.rules.inline.autolink.exec(src);
        if (cap) {
            let text, href;
            if (cap[2] === '@') {
                text = cap[1];
                href = 'mailto:' + text;
            }
            else {
                text = cap[1];
                href = text;
            }
            return {
                type: 'link',
                raw: cap[0],
                text,
                href,
                tokens: [
                    {
                        type: 'text',
                        raw: text,
                        text,
                    },
                ],
            };
        }
    }
    url(src) {
        let cap;
        if (cap = this.rules.inline.url.exec(src)) {
            let text, href;
            if (cap[2] === '@') {
                text = cap[0];
                href = 'mailto:' + text;
            }
            else {
                // do extended autolink path validation
                let prevCapZero;
                do {
                    prevCapZero = cap[0];
                    cap[0] = this.rules.inline._backpedal.exec(cap[0])?.[0] ?? '';
                } while (prevCapZero !== cap[0]);
                text = cap[0];
                if (cap[1] === 'www.') {
                    href = 'http://' + cap[0];
                }
                else {
                    href = cap[0];
                }
            }
            return {
                type: 'link',
                raw: cap[0],
                text,
                href,
                tokens: [
                    {
                        type: 'text',
                        raw: text,
                        text,
                    },
                ],
            };
        }
    }
    inlineText(src) {
        const cap = this.rules.inline.text.exec(src);
        if (cap) {
            const escaped = this.lexer.state.inRawBlock;
            return {
                type: 'text',
                raw: cap[0],
                text: cap[0],
                escaped,
            };
        }
    }
}

/**
 * Block Lexer
 */
class _Lexer {
    tokens;
    options;
    state;
    tokenizer;
    inlineQueue;
    constructor(options) {
        // TokenList cannot be created in one go
        this.tokens = [];
        this.tokens.links = Object.create(null);
        this.options = options || _defaults;
        this.options.tokenizer = this.options.tokenizer || new _Tokenizer();
        this.tokenizer = this.options.tokenizer;
        this.tokenizer.options = this.options;
        this.tokenizer.lexer = this;
        this.inlineQueue = [];
        this.state = {
            inLink: false,
            inRawBlock: false,
            top: true,
        };
        const rules = {
            other,
            block: block.normal,
            inline: inline.normal,
        };
        if (this.options.pedantic) {
            rules.block = block.pedantic;
            rules.inline = inline.pedantic;
        }
        else if (this.options.gfm) {
            rules.block = block.gfm;
            if (this.options.breaks) {
                rules.inline = inline.breaks;
            }
            else {
                rules.inline = inline.gfm;
            }
        }
        this.tokenizer.rules = rules;
    }
    /**
     * Expose Rules
     */
    static get rules() {
        return {
            block,
            inline,
        };
    }
    /**
     * Static Lex Method
     */
    static lex(src, options) {
        const lexer = new _Lexer(options);
        return lexer.lex(src);
    }
    /**
     * Static Lex Inline Method
     */
    static lexInline(src, options) {
        const lexer = new _Lexer(options);
        return lexer.inlineTokens(src);
    }
    /**
     * Preprocessing
     */
    lex(src) {
        src = src.replace(other.carriageReturn, '\n');
        this.blockTokens(src, this.tokens);
        for (let i = 0; i < this.inlineQueue.length; i++) {
            const next = this.inlineQueue[i];
            this.inlineTokens(next.src, next.tokens);
        }
        this.inlineQueue = [];
        return this.tokens;
    }
    blockTokens(src, tokens = [], lastParagraphClipped = false) {
        if (this.options.pedantic) {
            src = src.replace(other.tabCharGlobal, '    ').replace(other.spaceLine, '');
        }
        while (src) {
            let token;
            if (this.options.extensions?.block?.some((extTokenizer) => {
                if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
                    src = src.substring(token.raw.length);
                    tokens.push(token);
                    return true;
                }
                return false;
            })) {
                continue;
            }
            // newline
            if (token = this.tokenizer.space(src)) {
                src = src.substring(token.raw.length);
                const lastToken = tokens.at(-1);
                if (token.raw.length === 1 && lastToken !== undefined) {
                    // if there's a single \n as a spacer, it's terminating the last line,
                    // so move it there so that we don't get unnecessary paragraph tags
                    lastToken.raw += '\n';
                }
                else {
                    tokens.push(token);
                }
                continue;
            }
            // code
            if (token = this.tokenizer.code(src)) {
                src = src.substring(token.raw.length);
                const lastToken = tokens.at(-1);
                // An indented code block cannot interrupt a paragraph.
                if (lastToken?.type === 'paragraph' || lastToken?.type === 'text') {
                    lastToken.raw += '\n' + token.raw;
                    lastToken.text += '\n' + token.text;
                    this.inlineQueue.at(-1).src = lastToken.text;
                }
                else {
                    tokens.push(token);
                }
                continue;
            }
            // fences
            if (token = this.tokenizer.fences(src)) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                continue;
            }
            // heading
            if (token = this.tokenizer.heading(src)) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                continue;
            }
            // hr
            if (token = this.tokenizer.hr(src)) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                continue;
            }
            // blockquote
            if (token = this.tokenizer.blockquote(src)) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                continue;
            }
            // list
            if (token = this.tokenizer.list(src)) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                continue;
            }
            // html
            if (token = this.tokenizer.html(src)) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                continue;
            }
            // def
            if (token = this.tokenizer.def(src)) {
                src = src.substring(token.raw.length);
                const lastToken = tokens.at(-1);
                if (lastToken?.type === 'paragraph' || lastToken?.type === 'text') {
                    lastToken.raw += '\n' + token.raw;
                    lastToken.text += '\n' + token.raw;
                    this.inlineQueue.at(-1).src = lastToken.text;
                }
                else if (!this.tokens.links[token.tag]) {
                    this.tokens.links[token.tag] = {
                        href: token.href,
                        title: token.title,
                    };
                }
                continue;
            }
            // table (gfm)
            if (token = this.tokenizer.table(src)) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                continue;
            }
            // lheading
            if (token = this.tokenizer.lheading(src)) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                continue;
            }
            // top-level paragraph
            // prevent paragraph consuming extensions by clipping 'src' to extension start
            let cutSrc = src;
            if (this.options.extensions?.startBlock) {
                let startIndex = Infinity;
                const tempSrc = src.slice(1);
                let tempStart;
                this.options.extensions.startBlock.forEach((getStartIndex) => {
                    tempStart = getStartIndex.call({ lexer: this }, tempSrc);
                    if (typeof tempStart === 'number' && tempStart >= 0) {
                        startIndex = Math.min(startIndex, tempStart);
                    }
                });
                if (startIndex < Infinity && startIndex >= 0) {
                    cutSrc = src.substring(0, startIndex + 1);
                }
            }
            if (this.state.top && (token = this.tokenizer.paragraph(cutSrc))) {
                const lastToken = tokens.at(-1);
                if (lastParagraphClipped && lastToken?.type === 'paragraph') {
                    lastToken.raw += '\n' + token.raw;
                    lastToken.text += '\n' + token.text;
                    this.inlineQueue.pop();
                    this.inlineQueue.at(-1).src = lastToken.text;
                }
                else {
                    tokens.push(token);
                }
                lastParagraphClipped = cutSrc.length !== src.length;
                src = src.substring(token.raw.length);
                continue;
            }
            // text
            if (token = this.tokenizer.text(src)) {
                src = src.substring(token.raw.length);
                const lastToken = tokens.at(-1);
                if (lastToken?.type === 'text') {
                    lastToken.raw += '\n' + token.raw;
                    lastToken.text += '\n' + token.text;
                    this.inlineQueue.pop();
                    this.inlineQueue.at(-1).src = lastToken.text;
                }
                else {
                    tokens.push(token);
                }
                continue;
            }
            if (src) {
                const errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);
                if (this.options.silent) {
                    console.error(errMsg);
                    break;
                }
                else {
                    throw new Error(errMsg);
                }
            }
        }
        this.state.top = true;
        return tokens;
    }
    inline(src, tokens = []) {
        this.inlineQueue.push({ src, tokens });
        return tokens;
    }
    /**
     * Lexing/Compiling
     */
    inlineTokens(src, tokens = []) {
        // String with links masked to avoid interference with em and strong
        let maskedSrc = src;
        let match = null;
        // Mask out reflinks
        if (this.tokens.links) {
            const links = Object.keys(this.tokens.links);
            if (links.length > 0) {
                while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
                    if (links.includes(match[0].slice(match[0].lastIndexOf('[') + 1, -1))) {
                        maskedSrc = maskedSrc.slice(0, match.index)
                            + '[' + 'a'.repeat(match[0].length - 2) + ']'
                            + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
                    }
                }
            }
        }
        // Mask out escaped characters
        while ((match = this.tokenizer.rules.inline.anyPunctuation.exec(maskedSrc)) != null) {
            maskedSrc = maskedSrc.slice(0, match.index) + '++' + maskedSrc.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
        }
        // Mask out other blocks
        while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
            maskedSrc = maskedSrc.slice(0, match.index) + '[' + 'a'.repeat(match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
        }
        let keepPrevChar = false;
        let prevChar = '';
        while (src) {
            if (!keepPrevChar) {
                prevChar = '';
            }
            keepPrevChar = false;
            let token;
            // extensions
            if (this.options.extensions?.inline?.some((extTokenizer) => {
                if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
                    src = src.substring(token.raw.length);
                    tokens.push(token);
                    return true;
                }
                return false;
            })) {
                continue;
            }
            // escape
            if (token = this.tokenizer.escape(src)) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                continue;
            }
            // tag
            if (token = this.tokenizer.tag(src)) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                continue;
            }
            // link
            if (token = this.tokenizer.link(src)) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                continue;
            }
            // reflink, nolink
            if (token = this.tokenizer.reflink(src, this.tokens.links)) {
                src = src.substring(token.raw.length);
                const lastToken = tokens.at(-1);
                if (token.type === 'text' && lastToken?.type === 'text') {
                    lastToken.raw += token.raw;
                    lastToken.text += token.text;
                }
                else {
                    tokens.push(token);
                }
                continue;
            }
            // em & strong
            if (token = this.tokenizer.emStrong(src, maskedSrc, prevChar)) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                continue;
            }
            // code
            if (token = this.tokenizer.codespan(src)) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                continue;
            }
            // br
            if (token = this.tokenizer.br(src)) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                continue;
            }
            // del (gfm)
            if (token = this.tokenizer.del(src)) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                continue;
            }
            // autolink
            if (token = this.tokenizer.autolink(src)) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                continue;
            }
            // url (gfm)
            if (!this.state.inLink && (token = this.tokenizer.url(src))) {
                src = src.substring(token.raw.length);
                tokens.push(token);
                continue;
            }
            // text
            // prevent inlineText consuming extensions by clipping 'src' to extension start
            let cutSrc = src;
            if (this.options.extensions?.startInline) {
                let startIndex = Infinity;
                const tempSrc = src.slice(1);
                let tempStart;
                this.options.extensions.startInline.forEach((getStartIndex) => {
                    tempStart = getStartIndex.call({ lexer: this }, tempSrc);
                    if (typeof tempStart === 'number' && tempStart >= 0) {
                        startIndex = Math.min(startIndex, tempStart);
                    }
                });
                if (startIndex < Infinity && startIndex >= 0) {
                    cutSrc = src.substring(0, startIndex + 1);
                }
            }
            if (token = this.tokenizer.inlineText(cutSrc)) {
                src = src.substring(token.raw.length);
                if (token.raw.slice(-1) !== '_') { // Track prevChar before string of ____ started
                    prevChar = token.raw.slice(-1);
                }
                keepPrevChar = true;
                const lastToken = tokens.at(-1);
                if (lastToken?.type === 'text') {
                    lastToken.raw += token.raw;
                    lastToken.text += token.text;
                }
                else {
                    tokens.push(token);
                }
                continue;
            }
            if (src) {
                const errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);
                if (this.options.silent) {
                    console.error(errMsg);
                    break;
                }
                else {
                    throw new Error(errMsg);
                }
            }
        }
        return tokens;
    }
}

/**
 * Renderer
 */
class _Renderer {
    options;
    parser; // set by the parser
    constructor(options) {
        this.options = options || _defaults;
    }
    space(token) {
        return '';
    }
    code({ text, lang, escaped }) {
        const langString = (lang || '').match(other.notSpaceStart)?.[0];
        const code = text.replace(other.endingNewline, '') + '\n';
        if (!langString) {
            return '<pre><code>'
                + (escaped ? code : marked_esm_escape(code, true))
                + '</code></pre>\n';
        }
        return '<pre><code class="language-'
            + marked_esm_escape(langString)
            + '">'
            + (escaped ? code : marked_esm_escape(code, true))
            + '</code></pre>\n';
    }
    blockquote({ tokens }) {
        const body = this.parser.parse(tokens);
        return `<blockquote>\n${body}</blockquote>\n`;
    }
    html({ text }) {
        return text;
    }
    heading({ tokens, depth }) {
        return `<h${depth}>${this.parser.parseInline(tokens)}</h${depth}>\n`;
    }
    hr(token) {
        return '<hr>\n';
    }
    list(token) {
        const ordered = token.ordered;
        const start = token.start;
        let body = '';
        for (let j = 0; j < token.items.length; j++) {
            const item = token.items[j];
            body += this.listitem(item);
        }
        const type = ordered ? 'ol' : 'ul';
        const startAttr = (ordered && start !== 1) ? (' start="' + start + '"') : '';
        return '<' + type + startAttr + '>\n' + body + '</' + type + '>\n';
    }
    listitem(item) {
        let itemBody = '';
        if (item.task) {
            const checkbox = this.checkbox({ checked: !!item.checked });
            if (item.loose) {
                if (item.tokens[0]?.type === 'paragraph') {
                    item.tokens[0].text = checkbox + ' ' + item.tokens[0].text;
                    if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === 'text') {
                        item.tokens[0].tokens[0].text = checkbox + ' ' + marked_esm_escape(item.tokens[0].tokens[0].text);
                        item.tokens[0].tokens[0].escaped = true;
                    }
                }
                else {
                    item.tokens.unshift({
                        type: 'text',
                        raw: checkbox + ' ',
                        text: checkbox + ' ',
                        escaped: true,
                    });
                }
            }
            else {
                itemBody += checkbox + ' ';
            }
        }
        itemBody += this.parser.parse(item.tokens, !!item.loose);
        return `<li>${itemBody}</li>\n`;
    }
    checkbox({ checked }) {
        return '<input '
            + (checked ? 'checked="" ' : '')
            + 'disabled="" type="checkbox">';
    }
    paragraph({ tokens }) {
        return `<p>${this.parser.parseInline(tokens)}</p>\n`;
    }
    table(token) {
        let header = '';
        // header
        let cell = '';
        for (let j = 0; j < token.header.length; j++) {
            cell += this.tablecell(token.header[j]);
        }
        header += this.tablerow({ text: cell });
        let body = '';
        for (let j = 0; j < token.rows.length; j++) {
            const row = token.rows[j];
            cell = '';
            for (let k = 0; k < row.length; k++) {
                cell += this.tablecell(row[k]);
            }
            body += this.tablerow({ text: cell });
        }
        if (body)
            body = `<tbody>${body}</tbody>`;
        return '<table>\n'
            + '<thead>\n'
            + header
            + '</thead>\n'
            + body
            + '</table>\n';
    }
    tablerow({ text }) {
        return `<tr>\n${text}</tr>\n`;
    }
    tablecell(token) {
        const content = this.parser.parseInline(token.tokens);
        const type = token.header ? 'th' : 'td';
        const tag = token.align
            ? `<${type} align="${token.align}">`
            : `<${type}>`;
        return tag + content + `</${type}>\n`;
    }
    /**
     * span level renderer
     */
    strong({ tokens }) {
        return `<strong>${this.parser.parseInline(tokens)}</strong>`;
    }
    em({ tokens }) {
        return `<em>${this.parser.parseInline(tokens)}</em>`;
    }
    codespan({ text }) {
        return `<code>${marked_esm_escape(text, true)}</code>`;
    }
    br(token) {
        return '<br>';
    }
    del({ tokens }) {
        return `<del>${this.parser.parseInline(tokens)}</del>`;
    }
    link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const cleanHref = cleanUrl(href);
        if (cleanHref === null) {
            return text;
        }
        href = cleanHref;
        let out = '<a href="' + href + '"';
        if (title) {
            out += ' title="' + (marked_esm_escape(title)) + '"';
        }
        out += '>' + text + '</a>';
        return out;
    }
    image({ href, title, text, tokens }) {
        if (tokens) {
            text = this.parser.parseInline(tokens, this.parser.textRenderer);
        }
        const cleanHref = cleanUrl(href);
        if (cleanHref === null) {
            return marked_esm_escape(text);
        }
        href = cleanHref;
        let out = `<img src="${href}" alt="${text}"`;
        if (title) {
            out += ` title="${marked_esm_escape(title)}"`;
        }
        out += '>';
        return out;
    }
    text(token) {
        return 'tokens' in token && token.tokens
            ? this.parser.parseInline(token.tokens)
            : ('escaped' in token && token.escaped ? token.text : marked_esm_escape(token.text));
    }
}

/**
 * TextRenderer
 * returns only the textual part of the token
 */
class _TextRenderer {
    // no need for block level renderers
    strong({ text }) {
        return text;
    }
    em({ text }) {
        return text;
    }
    codespan({ text }) {
        return text;
    }
    del({ text }) {
        return text;
    }
    html({ text }) {
        return text;
    }
    text({ text }) {
        return text;
    }
    link({ text }) {
        return '' + text;
    }
    image({ text }) {
        return '' + text;
    }
    br() {
        return '';
    }
}

/**
 * Parsing & Compiling
 */
class _Parser {
    options;
    renderer;
    textRenderer;
    constructor(options) {
        this.options = options || _defaults;
        this.options.renderer = this.options.renderer || new _Renderer();
        this.renderer = this.options.renderer;
        this.renderer.options = this.options;
        this.renderer.parser = this;
        this.textRenderer = new _TextRenderer();
    }
    /**
     * Static Parse Method
     */
    static parse(tokens, options) {
        const parser = new _Parser(options);
        return parser.parse(tokens);
    }
    /**
     * Static Parse Inline Method
     */
    static parseInline(tokens, options) {
        const parser = new _Parser(options);
        return parser.parseInline(tokens);
    }
    /**
     * Parse Loop
     */
    parse(tokens, top = true) {
        let out = '';
        for (let i = 0; i < tokens.length; i++) {
            const anyToken = tokens[i];
            // Run any renderer extensions
            if (this.options.extensions?.renderers?.[anyToken.type]) {
                const genericToken = anyToken;
                const ret = this.options.extensions.renderers[genericToken.type].call({ parser: this }, genericToken);
                if (ret !== false || !['space', 'hr', 'heading', 'code', 'table', 'blockquote', 'list', 'html', 'paragraph', 'text'].includes(genericToken.type)) {
                    out += ret || '';
                    continue;
                }
            }
            const token = anyToken;
            switch (token.type) {
                case 'space': {
                    out += this.renderer.space(token);
                    continue;
                }
                case 'hr': {
                    out += this.renderer.hr(token);
                    continue;
                }
                case 'heading': {
                    out += this.renderer.heading(token);
                    continue;
                }
                case 'code': {
                    out += this.renderer.code(token);
                    continue;
                }
                case 'table': {
                    out += this.renderer.table(token);
                    continue;
                }
                case 'blockquote': {
                    out += this.renderer.blockquote(token);
                    continue;
                }
                case 'list': {
                    out += this.renderer.list(token);
                    continue;
                }
                case 'html': {
                    out += this.renderer.html(token);
                    continue;
                }
                case 'paragraph': {
                    out += this.renderer.paragraph(token);
                    continue;
                }
                case 'text': {
                    let textToken = token;
                    let body = this.renderer.text(textToken);
                    while (i + 1 < tokens.length && tokens[i + 1].type === 'text') {
                        textToken = tokens[++i];
                        body += '\n' + this.renderer.text(textToken);
                    }
                    if (top) {
                        out += this.renderer.paragraph({
                            type: 'paragraph',
                            raw: body,
                            text: body,
                            tokens: [{ type: 'text', raw: body, text: body, escaped: true }],
                        });
                    }
                    else {
                        out += body;
                    }
                    continue;
                }
                default: {
                    const errMsg = 'Token with "' + token.type + '" type was not found.';
                    if (this.options.silent) {
                        console.error(errMsg);
                        return '';
                    }
                    else {
                        throw new Error(errMsg);
                    }
                }
            }
        }
        return out;
    }
    /**
     * Parse Inline Tokens
     */
    parseInline(tokens, renderer = this.renderer) {
        let out = '';
        for (let i = 0; i < tokens.length; i++) {
            const anyToken = tokens[i];
            // Run any renderer extensions
            if (this.options.extensions?.renderers?.[anyToken.type]) {
                const ret = this.options.extensions.renderers[anyToken.type].call({ parser: this }, anyToken);
                if (ret !== false || !['escape', 'html', 'link', 'image', 'strong', 'em', 'codespan', 'br', 'del', 'text'].includes(anyToken.type)) {
                    out += ret || '';
                    continue;
                }
            }
            const token = anyToken;
            switch (token.type) {
                case 'escape': {
                    out += renderer.text(token);
                    break;
                }
                case 'html': {
                    out += renderer.html(token);
                    break;
                }
                case 'link': {
                    out += renderer.link(token);
                    break;
                }
                case 'image': {
                    out += renderer.image(token);
                    break;
                }
                case 'strong': {
                    out += renderer.strong(token);
                    break;
                }
                case 'em': {
                    out += renderer.em(token);
                    break;
                }
                case 'codespan': {
                    out += renderer.codespan(token);
                    break;
                }
                case 'br': {
                    out += renderer.br(token);
                    break;
                }
                case 'del': {
                    out += renderer.del(token);
                    break;
                }
                case 'text': {
                    out += renderer.text(token);
                    break;
                }
                default: {
                    const errMsg = 'Token with "' + token.type + '" type was not found.';
                    if (this.options.silent) {
                        console.error(errMsg);
                        return '';
                    }
                    else {
                        throw new Error(errMsg);
                    }
                }
            }
        }
        return out;
    }
}

class _Hooks {
    options;
    block;
    constructor(options) {
        this.options = options || _defaults;
    }
    static passThroughHooks = new Set([
        'preprocess',
        'postprocess',
        'processAllTokens',
    ]);
    /**
     * Process markdown before marked
     */
    preprocess(markdown) {
        return markdown;
    }
    /**
     * Process HTML after marked is finished
     */
    postprocess(html) {
        return html;
    }
    /**
     * Process all tokens before walk tokens
     */
    processAllTokens(tokens) {
        return tokens;
    }
    /**
     * Provide function to tokenize markdown
     */
    provideLexer() {
        return this.block ? _Lexer.lex : _Lexer.lexInline;
    }
    /**
     * Provide function to parse tokens
     */
    provideParser() {
        return this.block ? _Parser.parse : _Parser.parseInline;
    }
}

class Marked {
    defaults = _getDefaults();
    options = this.setOptions;
    parse = this.parseMarkdown(true);
    parseInline = this.parseMarkdown(false);
    Parser = _Parser;
    Renderer = _Renderer;
    TextRenderer = _TextRenderer;
    Lexer = _Lexer;
    Tokenizer = _Tokenizer;
    Hooks = _Hooks;
    constructor(...args) {
        this.use(...args);
    }
    /**
     * Run callback for every token
     */
    walkTokens(tokens, callback) {
        let values = [];
        for (const token of tokens) {
            values = values.concat(callback.call(this, token));
            switch (token.type) {
                case 'table': {
                    const tableToken = token;
                    for (const cell of tableToken.header) {
                        values = values.concat(this.walkTokens(cell.tokens, callback));
                    }
                    for (const row of tableToken.rows) {
                        for (const cell of row) {
                            values = values.concat(this.walkTokens(cell.tokens, callback));
                        }
                    }
                    break;
                }
                case 'list': {
                    const listToken = token;
                    values = values.concat(this.walkTokens(listToken.items, callback));
                    break;
                }
                default: {
                    const genericToken = token;
                    if (this.defaults.extensions?.childTokens?.[genericToken.type]) {
                        this.defaults.extensions.childTokens[genericToken.type].forEach((childTokens) => {
                            const tokens = genericToken[childTokens].flat(Infinity);
                            values = values.concat(this.walkTokens(tokens, callback));
                        });
                    }
                    else if (genericToken.tokens) {
                        values = values.concat(this.walkTokens(genericToken.tokens, callback));
                    }
                }
            }
        }
        return values;
    }
    use(...args) {
        const extensions = this.defaults.extensions || { renderers: {}, childTokens: {} };
        args.forEach((pack) => {
            // copy options to new object
            const opts = { ...pack };
            // set async to true if it was set to true before
            opts.async = this.defaults.async || opts.async || false;
            // ==-- Parse "addon" extensions --== //
            if (pack.extensions) {
                pack.extensions.forEach((ext) => {
                    if (!ext.name) {
                        throw new Error('extension name required');
                    }
                    if ('renderer' in ext) { // Renderer extensions
                        const prevRenderer = extensions.renderers[ext.name];
                        if (prevRenderer) {
                            // Replace extension with func to run new extension but fall back if false
                            extensions.renderers[ext.name] = function (...args) {
                                let ret = ext.renderer.apply(this, args);
                                if (ret === false) {
                                    ret = prevRenderer.apply(this, args);
                                }
                                return ret;
                            };
                        }
                        else {
                            extensions.renderers[ext.name] = ext.renderer;
                        }
                    }
                    if ('tokenizer' in ext) { // Tokenizer Extensions
                        if (!ext.level || (ext.level !== 'block' && ext.level !== 'inline')) {
                            throw new Error("extension level must be 'block' or 'inline'");
                        }
                        const extLevel = extensions[ext.level];
                        if (extLevel) {
                            extLevel.unshift(ext.tokenizer);
                        }
                        else {
                            extensions[ext.level] = [ext.tokenizer];
                        }
                        if (ext.start) { // Function to check for start of token
                            if (ext.level === 'block') {
                                if (extensions.startBlock) {
                                    extensions.startBlock.push(ext.start);
                                }
                                else {
                                    extensions.startBlock = [ext.start];
                                }
                            }
                            else if (ext.level === 'inline') {
                                if (extensions.startInline) {
                                    extensions.startInline.push(ext.start);
                                }
                                else {
                                    extensions.startInline = [ext.start];
                                }
                            }
                        }
                    }
                    if ('childTokens' in ext && ext.childTokens) { // Child tokens to be visited by walkTokens
                        extensions.childTokens[ext.name] = ext.childTokens;
                    }
                });
                opts.extensions = extensions;
            }
            // ==-- Parse "overwrite" extensions --== //
            if (pack.renderer) {
                const renderer = this.defaults.renderer || new _Renderer(this.defaults);
                for (const prop in pack.renderer) {
                    if (!(prop in renderer)) {
                        throw new Error(`renderer '${prop}' does not exist`);
                    }
                    if (['options', 'parser'].includes(prop)) {
                        // ignore options property
                        continue;
                    }
                    const rendererProp = prop;
                    const rendererFunc = pack.renderer[rendererProp];
                    const prevRenderer = renderer[rendererProp];
                    // Replace renderer with func to run extension, but fall back if false
                    renderer[rendererProp] = (...args) => {
                        let ret = rendererFunc.apply(renderer, args);
                        if (ret === false) {
                            ret = prevRenderer.apply(renderer, args);
                        }
                        return ret || '';
                    };
                }
                opts.renderer = renderer;
            }
            if (pack.tokenizer) {
                const tokenizer = this.defaults.tokenizer || new _Tokenizer(this.defaults);
                for (const prop in pack.tokenizer) {
                    if (!(prop in tokenizer)) {
                        throw new Error(`tokenizer '${prop}' does not exist`);
                    }
                    if (['options', 'rules', 'lexer'].includes(prop)) {
                        // ignore options, rules, and lexer properties
                        continue;
                    }
                    const tokenizerProp = prop;
                    const tokenizerFunc = pack.tokenizer[tokenizerProp];
                    const prevTokenizer = tokenizer[tokenizerProp];
                    // Replace tokenizer with func to run extension, but fall back if false
                    // @ts-expect-error cannot type tokenizer function dynamically
                    tokenizer[tokenizerProp] = (...args) => {
                        let ret = tokenizerFunc.apply(tokenizer, args);
                        if (ret === false) {
                            ret = prevTokenizer.apply(tokenizer, args);
                        }
                        return ret;
                    };
                }
                opts.tokenizer = tokenizer;
            }
            // ==-- Parse Hooks extensions --== //
            if (pack.hooks) {
                const hooks = this.defaults.hooks || new _Hooks();
                for (const prop in pack.hooks) {
                    if (!(prop in hooks)) {
                        throw new Error(`hook '${prop}' does not exist`);
                    }
                    if (['options', 'block'].includes(prop)) {
                        // ignore options and block properties
                        continue;
                    }
                    const hooksProp = prop;
                    const hooksFunc = pack.hooks[hooksProp];
                    const prevHook = hooks[hooksProp];
                    if (_Hooks.passThroughHooks.has(prop)) {
                        // @ts-expect-error cannot type hook function dynamically
                        hooks[hooksProp] = (arg) => {
                            if (this.defaults.async) {
                                return Promise.resolve(hooksFunc.call(hooks, arg)).then(ret => {
                                    return prevHook.call(hooks, ret);
                                });
                            }
                            const ret = hooksFunc.call(hooks, arg);
                            return prevHook.call(hooks, ret);
                        };
                    }
                    else {
                        // @ts-expect-error cannot type hook function dynamically
                        hooks[hooksProp] = (...args) => {
                            let ret = hooksFunc.apply(hooks, args);
                            if (ret === false) {
                                ret = prevHook.apply(hooks, args);
                            }
                            return ret;
                        };
                    }
                }
                opts.hooks = hooks;
            }
            // ==-- Parse WalkTokens extensions --== //
            if (pack.walkTokens) {
                const walkTokens = this.defaults.walkTokens;
                const packWalktokens = pack.walkTokens;
                opts.walkTokens = function (token) {
                    let values = [];
                    values.push(packWalktokens.call(this, token));
                    if (walkTokens) {
                        values = values.concat(walkTokens.call(this, token));
                    }
                    return values;
                };
            }
            this.defaults = { ...this.defaults, ...opts };
        });
        return this;
    }
    setOptions(opt) {
        this.defaults = { ...this.defaults, ...opt };
        return this;
    }
    lexer(src, options) {
        return _Lexer.lex(src, options ?? this.defaults);
    }
    parser(tokens, options) {
        return _Parser.parse(tokens, options ?? this.defaults);
    }
    parseMarkdown(blockType) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parse = (src, options) => {
            const origOpt = { ...options };
            const opt = { ...this.defaults, ...origOpt };
            const throwError = this.onError(!!opt.silent, !!opt.async);
            // throw error if an extension set async to true but parse was called with async: false
            if (this.defaults.async === true && origOpt.async === false) {
                return throwError(new Error('marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise.'));
            }
            // throw error in case of non string input
            if (typeof src === 'undefined' || src === null) {
                return throwError(new Error('marked(): input parameter is undefined or null'));
            }
            if (typeof src !== 'string') {
                return throwError(new Error('marked(): input parameter is of type '
                    + Object.prototype.toString.call(src) + ', string expected'));
            }
            if (opt.hooks) {
                opt.hooks.options = opt;
                opt.hooks.block = blockType;
            }
            const lexer = opt.hooks ? opt.hooks.provideLexer() : (blockType ? _Lexer.lex : _Lexer.lexInline);
            const parser = opt.hooks ? opt.hooks.provideParser() : (blockType ? _Parser.parse : _Parser.parseInline);
            if (opt.async) {
                return Promise.resolve(opt.hooks ? opt.hooks.preprocess(src) : src)
                    .then(src => lexer(src, opt))
                    .then(tokens => opt.hooks ? opt.hooks.processAllTokens(tokens) : tokens)
                    .then(tokens => opt.walkTokens ? Promise.all(this.walkTokens(tokens, opt.walkTokens)).then(() => tokens) : tokens)
                    .then(tokens => parser(tokens, opt))
                    .then(html => opt.hooks ? opt.hooks.postprocess(html) : html)
                    .catch(throwError);
            }
            try {
                if (opt.hooks) {
                    src = opt.hooks.preprocess(src);
                }
                let tokens = lexer(src, opt);
                if (opt.hooks) {
                    tokens = opt.hooks.processAllTokens(tokens);
                }
                if (opt.walkTokens) {
                    this.walkTokens(tokens, opt.walkTokens);
                }
                let html = parser(tokens, opt);
                if (opt.hooks) {
                    html = opt.hooks.postprocess(html);
                }
                return html;
            }
            catch (e) {
                return throwError(e);
            }
        };
        return parse;
    }
    onError(silent, async) {
        return (e) => {
            e.message += '\nPlease report this to https://github.com/markedjs/marked.';
            if (silent) {
                const msg = '<p>An error occurred:</p><pre>'
                    + marked_esm_escape(e.message + '', true)
                    + '</pre>';
                if (async) {
                    return Promise.resolve(msg);
                }
                return msg;
            }
            if (async) {
                return Promise.reject(e);
            }
            throw e;
        };
    }
}

const markedInstance = new Marked();
function marked(src, opt) {
    return markedInstance.parse(src, opt);
}
/**
 * Sets the default options.
 *
 * @param options Hash of options
 */
marked.options =
    marked.setOptions = function (options) {
        markedInstance.setOptions(options);
        marked.defaults = markedInstance.defaults;
        changeDefaults(marked.defaults);
        return marked;
    };
/**
 * Gets the original marked default options.
 */
marked.getDefaults = _getDefaults;
marked.defaults = _defaults;
/**
 * Use Extension
 */
marked.use = function (...args) {
    markedInstance.use(...args);
    marked.defaults = markedInstance.defaults;
    changeDefaults(marked.defaults);
    return marked;
};
/**
 * Run callback for every token
 */
marked.walkTokens = function (tokens, callback) {
    return markedInstance.walkTokens(tokens, callback);
};
/**
 * Compiles markdown to HTML without enclosing `p` tag.
 *
 * @param src String of markdown source to be compiled
 * @param options Hash of options
 * @return String of compiled HTML
 */
marked.parseInline = markedInstance.parseInline;
/**
 * Expose
 */
marked.Parser = _Parser;
marked.parser = _Parser.parse;
marked.Renderer = _Renderer;
marked.TextRenderer = _TextRenderer;
marked.Lexer = _Lexer;
marked.lexer = _Lexer.lex;
marked.Tokenizer = _Tokenizer;
marked.Hooks = _Hooks;
marked.parse = marked;
const options = marked.options;
const setOptions = marked.setOptions;
const use = marked.use;
const walkTokens = marked.walkTokens;
const parseInline = marked.parseInline;
const parse = (/* unused pure expression or super */ null && (marked));
const parser = _Parser.parse;
const lexer = _Lexer.lex;



;// ./src/components/CardCarousel.ts


/**
 * A reusable card carousel component that can be used for any card-based content
 */
class CardCarousel {
    /**
     * Creates a new CardCarousel
     */
    constructor(options) {
        this.cardElements = [];
        this.currentPosition = 0;
        this.items = options.items;
        this.onItemSelect = options.onItemSelect;
        this.element = this.createCarouselElement();
    }
    /**
     * Returns the carousel element
     */
    getElement() {
        return this.element;
    }
    /**
     * Creates the carousel element
     */
    createCarouselElement() {
        const carouselContainer = document.createElement("div");
        carouselContainer.className = "bc-carousel";
        // Create carousel container
        const carouselImages = document.createElement("div");
        carouselImages.className = "bc-carousel-container";
        // Create track for cards
        this.track = document.createElement("div");
        this.track.className = "bc-carousel-track";
        this.track.setAttribute("style", "transform: translateX(0%);");
        carouselImages.appendChild(this.track);
        // Create card elements from items data and add to track
        this.items.forEach((item) => {
            const cardElement = createCarouselCard(item, this.onItemSelect);
            this.cardElements.push(cardElement);
            this.track.appendChild(cardElement);
        });
        carouselContainer.appendChild(carouselImages);
        // Create navigation arrows
        this.navContainer = document.createElement("div");
        this.navContainer.className = "bc-carousel-controls";
        this.prevButton = document.createElement("button");
        this.prevButton.className = "bc-carousel-arrow bc-carousel-prev";
        this.prevButton.setAttribute("aria-label", "Previous cards");
        this.prevButton.innerHTML = getPrevArrowSVG();
        this.firstDot = document.createElement("button");
        this.firstDot.className = "bc-carousel-dot";
        this.firstDot.setAttribute("aria-label", "First slide");
        this.middleDot = document.createElement("button");
        this.middleDot.className = "bc-carousel-dot";
        this.middleDot.setAttribute("aria-label", "Middle slide");
        this.lastDot = document.createElement("button");
        this.lastDot.className = "bc-carousel-dot";
        this.lastDot.setAttribute("aria-label", "Last slide");
        // this.firstDot.innerHTML = getPrevArrowSVG();
        const dotsContainer = document.createElement("div");
        dotsContainer.className = "bc-carousel-dots";
        dotsContainer.appendChild(this.firstDot);
        dotsContainer.appendChild(this.middleDot);
        dotsContainer.appendChild(this.lastDot);
        this.nextButton = document.createElement("button");
        this.nextButton.className = "bc-carousel-arrow bc-carousel-next";
        this.nextButton.setAttribute("aria-label", "Next cards");
        this.nextButton.innerHTML = getNextArrowSVG();
        this.navContainer.appendChild(this.prevButton);
        this.navContainer.appendChild(dotsContainer);
        this.navContainer.appendChild(this.nextButton);
        carouselContainer.appendChild(this.navContainer);
        // Setup carousel functionality
        this.setupNavigationHandlers();
        // Initial setup
        // Use setTimeout to ensure the layout has rendered
        setTimeout(() => {
            this.checkIfAllCardsVisible();
            this.updateButtons();
        }, 100);
        return carouselContainer;
    }
    /**
     * Sets up event handlers for carousel navigation
     */
    setupNavigationHandlers() {
        // Button handlers
        this.prevButton.addEventListener("click", () => this.scroll("prev"));
        this.nextButton.addEventListener("click", () => this.scroll("next"));
        // Window resize handling
        window.addEventListener("resize", () => {
            // Check if all cards fit
            if (this.checkIfAllCardsVisible()) {
                this.currentPosition = 0;
            }
            else {
                this.updateButtons();
            }
        });
    }
    /**
     * Gets the dimensions of a card
     */
    getCardWidth() {
        const cardElement = this.cardElements[0];
        return cardElement.offsetWidth;
    }
    getCarouselTrackStyles() {
        const carouselTrackStyle = window.getComputedStyle(this.track);
        const marginLeft = parseInt(carouselTrackStyle.marginLeft);
        const marginRight = parseInt(carouselTrackStyle.marginRight);
        const gap = parseInt(carouselTrackStyle.gap);
        return {
            marginLeft,
            marginRight,
            gap,
        };
    }
    /**
     * Gets the width of the container
     */
    getContainerWidth() {
        return this.element.offsetWidth || 0;
    }
    /**
     * Gets the total width of all cards including margins
     */
    getTotalCardsWidth() {
        const width = this.getCardWidth();
        const { marginLeft, marginRight, gap } = this.getCarouselTrackStyles();
        return (marginLeft + // Left margin of the carousel track
            this.cardElements.length * width + // Width of all cards
            (this.cardElements.length - 1) * gap + // Gap between cards
            marginRight // Right margin of the carousel track
        );
    }
    /**
     * Gets the maximum scroll position
     */
    getMaxScroll() {
        return this.getTotalCardsWidth() - this.getContainerWidth();
    }
    /**
     * Checks if all cards fit in the container
     */
    checkIfAllCardsVisible() {
        if (!this.getContainerWidth())
            return true; // Not visible yet
        const totalCardsWidth = this.getTotalCardsWidth();
        const containerWidth = this.getContainerWidth();
        if (totalCardsWidth <= containerWidth) {
            // All cards fit, hide navigation
            this.navContainer.style.display = "none";
            // Reset position
            this.track.style.transform = "translateX(0)";
            return true;
        }
        // Not all cards fit, show navigation
        this.navContainer.style.display = "flex";
        return false;
    }
    /**
     * Updates the button states based on current position
     */
    updateButtons() {
        // Early return if all cards are visible
        if (this.checkIfAllCardsVisible()) {
            return;
        }
        // Disable prev button if at start
        this.prevButton.disabled = this.currentPosition <= 0;
        // Disable next button if at end
        this.nextButton.disabled = this.currentPosition >= this.getMaxScroll();
    }
    /**
     * Scrolls the carousel in the specified direction
     */
    scroll(direction) {
        const cardWidth = this.getCardWidth();
        const { gap } = this.getCarouselTrackStyles();
        const maxScroll = this.getMaxScroll();
        if (direction === "next" && this.currentPosition < maxScroll) {
            this.currentPosition = Math.min(this.currentPosition + cardWidth + gap, maxScroll);
        }
        else if (direction === "prev" && this.currentPosition > 0) {
            this.currentPosition = Math.max(this.currentPosition - cardWidth - gap, 0);
        }
        this.track.style.transform = `translateX(-${this.currentPosition}px)`;
        this.updateButtons();
    }
}

;// ./src/components/ChatClient.ts






/**
 * Helper function to scroll to see the latest message
 * Uses multiple techniques to ensure reliable scrolling
 */
function scrollToLatestMessage(historyElement) {
    // Use multiple techniques to ensure scrolling works reliably
    const scrollToBottom = () => {
        historyElement.scrollTop = historyElement.scrollHeight;
        // Also try scrolling the window to the bottom of the chat history
        const rect = historyElement.getBoundingClientRect();
        const bottomOfHistory = rect.bottom + window.scrollY;
        window.scrollTo({
            top: bottomOfHistory,
            behavior: "smooth",
        });
    };
    // Immediate scroll attempt
    scrollToBottom();
    // Use requestAnimationFrame to wait for the next paint
    requestAnimationFrame(() => {
        scrollToBottom();
        // Then set timeouts with increasing delays as fallbacks
        setTimeout(scrollToBottom, 50);
        setTimeout(scrollToBottom, 100);
        setTimeout(scrollToBottom, 300);
    });
}
/**
 * Renders the chat client into the target element
 */
function renderChatClient(targetElement, options) {
    // Create the chat container
    const chatContainer = new ChatContainer({
        onSubmit: (message) => {
            handleMessageSubmit(message);
        },
        onStateChange: (isActive) => {
            if (isActive) {
                targetElement.classList.add("active-state");
            }
        },
    });
    // Create the chat interface
    const chatInterface = createChatInterface({
        onSubmit: (message) => {
            // Activate the chat (transition to conversation mode)
            chatContainer.activateChat();
            // Handle the message submission
            handleMessageSubmit(message);
        },
    });
    // Append the chat interface to the container
    chatContainer.appendChild(chatInterface);
    // Append the container to the target element
    targetElement.appendChild(chatContainer.getElement());
    // Initialize WebSDK integration after UI is fully initialized
    initializeWebSdkIntegration();
    // Log initialization
    console.warn("Brand Concierge initialized");
    // Update message received callback if provided
    if (options?.onMessageReceived) {
        // eslint-disable-next-line no-unused-vars
        const originalOnMessageReceived = options.onMessageReceived;
        options.onMessageReceived = (message, role) => {
            if (originalOnMessageReceived) {
                originalOnMessageReceived(message, role);
            }
        };
    }
}
/**
 * Handles message submission from the chat interface
 */
async function handleMessageSubmit(message) {
    // Get the chat history element
    const chatHistory = document.querySelector(".chat-history");
    if (!chatHistory)
        return;
    addMessageToHistory(chatHistory, message, "user", false);
    // Scroll to the latest message after user's message is added
    scrollToLatestMessage(chatHistory);
    // Add a random delay before showing the loading indicator (750-1250ms)
    // This makes the interaction feel more natural
    const randomDelay = Math.floor(Math.random() * 501) + 750; // Random between 750-1250ms
    // eslint-disable-next-line no-unused-vars
    await new Promise((resolve) => setTimeout(resolve, randomDelay));
    // Show loading indicator
    const loadingElement = addLoadingIndicator(chatHistory);
    try {
        // Send message to the API and wait for response
        const responses = await getAllResponses(message);
        // Remove loading indicator
        if (loadingElement?.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
        }
        // Record the current number of messages before adding concierge response
        const initialMessageCount = chatHistory.querySelectorAll(".chat-message").length;
        // Process each response as a separate message
        for (const response of responses) {
            // Add the structured response to the chat history
            addStructuredMessageToHistory(chatHistory, response);
            response.promptSuggestions?.forEach(suggestion => {
                addMessageToHistory(chatHistory, suggestion, "prompt", true);
            });
            scrollToLatestMessage(chatHistory);
            // Small delay between messages for better UX
            // eslint-disable-next-line no-unused-vars
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        // Find the first concierge message that was added
        const allMessages = chatHistory.querySelectorAll(".chat-message");
        if (allMessages.length > initialMessageCount) {
            const firstConciergeBubble = allMessages[initialMessageCount];
            // Wait a moment for DOM to stabilize before scrolling
            setTimeout(() => {
                // Calculate position of the bubble relative to the viewport
                const rect = firstConciergeBubble.getBoundingClientRect();
                // Calculate desired scroll position (current scroll position plus bubble's top position, minus desired gap)
                const desiredScrollPosition = window.scrollY + rect.top - 15; // 15px gap (reduced from 17px to scroll down)
                // Smooth scroll to the desired position
                window.scrollTo({
                    top: desiredScrollPosition,
                    behavior: "smooth",
                });
                // Fallback for browsers that might not support smooth scrolling behavior
                if (!("scrollBehavior" in document.documentElement.style)) {
                    smoothScrollPolyfill(desiredScrollPosition);
                }
            }, 100); // Short delay to ensure DOM is ready
        }
        else {
            // Fallback to scrolling to the latest message if no concierge bubbles found
            scrollToLatestMessage(chatHistory);
        }
    }
    catch (error) {
        console.error("Error handling message submission:", error);
        // Remove loading indicator
        if (loadingElement?.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
        }
        // Add error message
        addMessageToHistory(chatHistory, "I'm sorry, there was an error processing your request. Please try again.", "concierge");
        // Scroll to the latest message
        scrollToLatestMessage(chatHistory);
    }
}
/**
 * Gets all responses from the API
 */
async function getAllResponses(message) {
    // Get the single response from the API
    const response = await sendChatMessage(message);
    // Check if it's a valid response
    if (!response) {
        return [];
    }
    // Return as an array (we could extend this later to handle multiple responses)
    return [response.response];
}
/**
 * Adds a structured message from the API to the chat history
 */
function addStructuredMessageToHistory(historyElement, response) {
    // Skip the main message and process each item separately
    if (response) {
        // Create a separate message element for each item
        const messageElement = document.createElement("div");
        messageElement.className = "chat-message concierge-message new-message";
        // Create the message content container
        const messageContent = document.createElement("div");
        messageContent.className = "message-content";
        const markdownHtml = marked(response.message);
        if (typeof markdownHtml === "string") {
            messageContent.innerHTML = markdownHtml;
        }
        // attach images
        if (response.multimodalElements && response.multimodalElements.elements.length > 0) {
            const carousel = new CardCarousel({
                items: response.multimodalElements.elements,
                onItemSelect: (text) => console.log("click", text),
            });
            messageContent.appendChild(carousel.getElement());
        }
        // Append the content to the message element
        messageElement.appendChild(messageContent);
        // Append the message element to the history
        historyElement.appendChild(messageElement);
        // Remove the animation class after it completes to avoid issues with future scrolling
        setTimeout(() => {
            messageElement.classList.remove("new-message");
        }, 300); // Match this to the CSS animation duration
    }
}
/**
 * Adds a regular message to the chat history
 */
function addMessageToHistory(historyElement, message, sender, clickable = false) {
    // Create the message element
    const messageElement = document.createElement("div");
    messageElement.className = `chat-message ${sender}-message new-message`;
    // Create the message content
    if (sender === "prompt") {
        const promptMessage = document.createElement("div");
        promptMessage.className = "message-content";
        const promptIcon = document.createElement("div");
        promptIcon.innerHTML = getPromptArrowSVG();
        promptMessage.appendChild(promptIcon);
        const messageContent = document.createElement("div");
        messageContent.textContent = message;
        promptMessage.appendChild(messageContent);
        messageElement.appendChild(promptMessage);
    }
    else {
        const messageContent = document.createElement("div");
        messageContent.className = "message-content";
        messageContent.textContent = message;
        messageElement.appendChild(messageContent);
    }
    // Append the message element to the history
    historyElement.appendChild(messageElement);
    if (clickable) {
        messageElement.addEventListener("click", async () => {
            await handleMessageSubmit(message).then(() => console.log("done"));
        });
    }
    // Remove the animation class after it completes to avoid issues with future scrolling
    setTimeout(() => {
        messageElement.classList.remove("new-message");
    }, 300); // Match this to the CSS animation duration
    // Scroll to make the new message visible
    scrollToLatestMessage(historyElement);
}
/**
 * Adds a loading indicator to the chat history
 */
function addLoadingIndicator(historyElement) {
    // Create the message element
    const messageElement = document.createElement("div");
    messageElement.className = "chat-message concierge-message new-message";
    // Create the message content
    const messageContent = document.createElement("div");
    messageContent.className = "message-content message-loading";
    // Create loading dots
    const loadingDots = document.createElement("div");
    loadingDots.className = "loading-dots";
    // Add three dots
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement("div");
        dot.className = "loading-dot";
        loadingDots.appendChild(dot);
    }
    // Add the dots to the message content
    messageContent.appendChild(loadingDots);
    // Add loading text
    const loadingText = document.createElement("div");
    loadingText.className = "loading-text";
    // Array of possible loading messages
    const loadingMessages = [
        "Hang tight — we're fetching your answer...",
        "Your request is being processed. We'll be right with you!",
        "Grabbing the information you need...",
        "Just a moment — we're working on your request...",
        "Checking the details for the perfect response...",
        "Your answer is on its way...",
        "Finding the best information for you...",
        "Processing your request — just a moment!",
    ];
    // Select a random message from the array
    const randomIndex = Math.floor(Math.random() * loadingMessages.length);
    loadingText.textContent = loadingMessages[randomIndex];
    messageContent.appendChild(loadingText);
    // Add the content to the message element
    messageElement.appendChild(messageContent);
    // Add the message to the history
    historyElement.appendChild(messageElement);
    // Remove the animation class after it completes to avoid issues with future scrolling
    setTimeout(() => {
        messageElement.classList.remove("new-message");
    }, 300); // Match this to the CSS animation duration
    // Scroll to make the loading indicator visible
    scrollToLatestMessage(historyElement);
    return messageElement;
}
/**
 * Polyfill for smooth scrolling in browsers that don't support it
 */
function smoothScrollPolyfill(targetY) {
    const duration = 500; // ms
    const startY = window.scrollY;
    const difference = targetY - startY;
    const startTime = performance.now();
    function step() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing function - easeInOutQuad
        const easeProgress = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        window.scrollTo(0, startY + difference * easeProgress);
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }
    requestAnimationFrame(step);
}

// EXTERNAL MODULE: ./src/styles/chatClient.css
var chatClient = __webpack_require__(717);
;// ./src/index.ts


// Define the initialization method for the client
function initBrandConcierge(targetElement) {
    // Render the chat client into the target element
    renderChatClient(targetElement);
}
// Auto-initialize if window.BrandConcierge is defined
if (typeof window !== "undefined") {
    // Initialize the BrandConcierge object if it doesn't exist
    window.BrandConcierge = window.BrandConcierge || { init: initBrandConcierge };
    // If it exists but doesn't have the init function, add it
    if (!window.BrandConcierge.init) {
        window.BrandConcierge.init = initBrandConcierge;
    }
    const container = document.getElementById("brand-concierge-mount");
    if (container) {
        initBrandConcierge(container);
    }
}

/******/ })()
;