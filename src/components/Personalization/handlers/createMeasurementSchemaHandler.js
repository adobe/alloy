import { MEASUREMENT_SCHEMA } from "../constants/schema";

export default ({ next }) => args => {
  const { handle: { items } } = args;

  // If there is a measurement schema in the item list,
  // just return the whole proposition unrendered. (i.e. do not call next)
  if (!items.some(item => item.schema === MEASUREMENT_SCHEMA)) {
    next(args);
  }
};
