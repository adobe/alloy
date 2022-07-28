import { assign } from "../../utils";

export default returnValues => {
  // Merges all returned objects from all `onResponse` callbacks into
  // a single object that can later be returned to the customer.
  const lifecycleOnResponseReturnValues = returnValues.shift() || [];
  const consumerOnResponseReturnValues = returnValues.shift() || [];
  const lifecycleOnBeforeRequestReturnValues = returnValues;

  return assign(
    {},
    ...lifecycleOnResponseReturnValues,
    ...consumerOnResponseReturnValues,
    ...lifecycleOnBeforeRequestReturnValues
  );
};
