import createWebInstance from "./index.js";

// Entry point when the page snippet is included
export default ({ components }) => {
  const instanceNames = window.__alloyNS;
  instanceNames.map((instanceName) => {
    const instance = createWebInstance({ components, instanceName });
    const queue = window[instanceName].q;
    queue.push = instance;
    queue.forEach(instance);
  });
}
