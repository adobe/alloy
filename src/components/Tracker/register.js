import Core from "../Core";
import Tracker from "./index";

function register() {
  const tracker = new Tracker();
  Core.registerComponent(tracker);
  return tracker;
}

export default register;
