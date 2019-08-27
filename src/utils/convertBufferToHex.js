export default buffer => {
  return Array.prototype.map
    .call(new Uint8Array(buffer), item => `00${item.toString(16)}`.slice(-2))
    .join("");
};
