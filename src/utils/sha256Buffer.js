const encodeText = str => {
  if (window.TextEncoder) {
    return new TextEncoder("utf-8").encode(str);
  }
  // IE 11, which doesn't have TextEncoder
  const cleanString = unescape(encodeURIComponent(str));
  return new Uint8Array(cleanString.split("").map(char => char.charCodeAt(0)));
};

export default message => {
  const data = encodeText(message);
  const crypto = window.msCrypto || window.crypto;
  const result = crypto.subtle.digest("SHA-256", data);
  if (result.then) {
    return result;
  }
  // IE 11, whose result is a CryptoOperation object instead of a promise
  return new Promise((resolve, reject) => {
    result.addEventListener("complete", () => {
      resolve(result.result);
    });
    result.addEventListener("error", () => {
      reject();
    });
  });
};
