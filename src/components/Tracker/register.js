import Core from "../Core";
import createTracker from "./index";

function register() {
  const tracker = createTracker();
  Core.registerComponent(tracker);
}

export default register;
