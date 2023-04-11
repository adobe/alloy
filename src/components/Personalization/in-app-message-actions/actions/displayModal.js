import { addStyle, removeElements } from "../utils";

const STYLE_TAG_ID = "alloy-messaging-modal-styles";
const ELEMENT_TAG_ID = "alloy-messaging-modal";
const MODAL_CSS_CLASSNAME = "alloy-modal";

const closeModal = () => {
  removeElements(MODAL_CSS_CLASSNAME);
};
const showModal = ({ buttons = [], content }) => {
  removeElements(MODAL_CSS_CLASSNAME);

  addStyle(
    STYLE_TAG_ID,
    `.alloy-modal {
      display: none;
      width: 100%;
      height: 100%;
      position: fixed;
      left: 0;
      top: 0;
      background: rgba(0, 0, 0, 0.3);
      z-index: 999;
    }
    .alloy-modal--show { display: flex; }
    .alloy-align-center {
      justify-content: center;
    }
    .alloy-align-vertical {
      align-items: center;
    }
    .alloy-modal-container {
      position: relative;
      width: 100%;
      max-width: 600px;
      max-height: 800px;
      padding: 20px;
      margin: 12px;
      background: #fff;
    }
    .alloy-modal-content {
      margin: 15px 0;
      vertical-align: top;
      text-align: left;
    }
    .alloy-modal-close--x {
      font-size: 30px;
      position: absolute;
      top: 3px;
      right: 10px;
    }
    .alloy-modal-close--x:hover {
      cursor: pointer;
    }
    .alloy-modal-buttons button {
      margin-right: 5px;
    }`
  );

  const modal = document.createElement("div");
  modal.id = ELEMENT_TAG_ID;
  modal.className = `${MODAL_CSS_CLASSNAME} alloy-align-center alloy-align-vertical alloy-modal--show`;

  const modalContainer = document.createElement("div");
  modalContainer.className = "alloy-modal-container";

  const closeButton = document.createElement("a");
  closeButton.className = "alloy-modal-close alloy-modal-close--x";
  closeButton.innerText = "✕";
  closeButton.addEventListener("click", closeModal);
  closeButton.setAttribute("aria-hidden", "true");

  const modalContent = document.createElement("div");
  modalContent.className = "alloy-modal-content";
  modalContent.innerHTML = content;

  const modalButtons = document.createElement("div");
  modalButtons.className = "alloy-modal-buttons";

  buttons.forEach(buttonDetails => {
    const button = document.createElement("button");
    button.className = "alloy_modal_button alloy-modal-close";
    button.innerText = buttonDetails.title;
    button.addEventListener("click", closeModal);
    modalButtons.appendChild(button);
  });

  modalContainer.appendChild(closeButton);
  modalContainer.appendChild(modalContent);
  modalContainer.appendChild(modalButtons);

  modal.appendChild(modalContainer);
  document.body.append(modal);
};

export default settings => {
  return new Promise(resolve => {
    const { meta } = settings;

    showModal(settings);

    resolve({ meta });
  });
};
