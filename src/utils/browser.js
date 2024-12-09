export default ({ window, document }) => {
  return {
    addStyleElement(content) {

    },
    removeElement(node) {

    },
    getElementById(id) {

    },
    addHtml(html, action) {

    },
    displayIframeContent(htmlContent, clickHandler) {

    },
    getReferrer() {

    },
    getQueryParam(param) {

    },
    addClickListener(listener) {
      document.addEventListener("click", listener, true);
    },
    getGlobal(name) {

    },
    setGlobal(name, value) {

    },
    getHostname() {

    },
    getSessionStorageItem(namespace, name) {

    },
    setSessionStorageItem(namespace, name, value) {

    },
    clearSessionStorage(namespace) {

    },
    getLocalStorageItem(namespace, name) {

    },
    setLocalStorageItem(namespace, name, value) {

    },
    clearLocalStorage(namespace) {

    },
    redirect(url, preserveHistory) {

    },
    getLocation() {

    },
    getTitle() {

    }
  }
};
