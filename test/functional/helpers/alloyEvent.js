// triggers an alloy event (note this can block with 'await' if consent is not yet provided)
import { ClientFunction } from "testcafe";

export default ClientFunction((arg1, arg2) => {
  let eventName;
  let eventArguments;

  if (typeof arg1 === "object" && arg1 !== null) {
    eventName = "event";
    eventArguments = arg1 || {};
  } else {
    eventName = arg1;
    eventArguments = arg2 || {};
  }
  return { promise: window.alloy(eventName, eventArguments) };
});
