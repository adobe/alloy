import { ClientFunction } from "testcafe";

const addAnchorToBody = ClientFunction(cfg => {
  const anchor = document.createElement("a");
  const keys = Object.keys(cfg.attributes);
  keys.forEach(key => {
    anchor.setAttribute(key, cfg.attributes[key]);
  });
  const anchorText = document.createTextNode(cfg.text);
  anchor.appendChild(anchorText);
  document.body.appendChild(anchor);
});

export default addAnchorToBody;
