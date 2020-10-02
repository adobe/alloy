import { ClientFunction } from "testcafe";

const addAnchorToBody = ClientFunction(cfg => {
  const buildNode = ({ element = "a", attributes = {}, children, text }) => {
    const node = document.createElement(element);
    const keys = Object.keys(attributes);
    keys.forEach(key => {
      node.setAttribute(key, attributes[key]);
    });
    if (text) {
      node.appendChild(document.createTextNode(cfg.text));
    }
    if (children) {
      children.forEach(child => {
        node.appendChild(buildNode(child));
      });
    }
    return node;
  };

  document.body.appendChild(buildNode(cfg));
});

export default addAnchorToBody;
