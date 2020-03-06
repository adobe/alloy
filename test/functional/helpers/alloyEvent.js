// triggers an alloy event (note this can block with 'await' if consent is not yet provided)
import { ClientFunction } from "testcafe";

export default ClientFunction(args => {
  return { promise: window.alloy("event", args) };
});
