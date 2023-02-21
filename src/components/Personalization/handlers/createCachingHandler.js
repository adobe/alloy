import { VIEW_SCOPE_TYPE } from "../constants/scopeType";

export default ({ next }) => args => {
  const { proposition } = args;
  const {
    scopeDetails: {
      characteristics: {
        scopeType
      }
    }
  } = proposition.getHandle();

  if (scopeType === VIEW_SCOPE_TYPE) {
    proposition.cache();
  }

  // this proposition may contain items that need to be rendered or cached by other handlers.
  next(args);
};
