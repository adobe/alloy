import { VIEW_SCOPE_TYPE } from "../constants/scopeType";

export default ({ next }) => args => {
  const { proposition } = args;
  const {
    scopeDetails: {
      characteristics: {
        scopeType
      } = {}
    } = {}
  } = proposition.getHandle();

  if (scopeType === VIEW_SCOPE_TYPE) {
    proposition.cache();
  }

  // this proposition may contain items that need to be rendered or cached by other handlers.
  next(args);
};

/*
import { assign } from "../../utils";

export const createViewCacheManager = () => {
  const viewStorage = {};
  let storeViewsCalledAtLeastOnce = false;
  let previousStoreViewsComplete = Promise.resolve();

  const storeViews = viewTypeHandlesPromise => {
    storeViewsCalledAtLeastOnce = true;
    previousStoreViewsComplete = previousStoreViewsComplete
      .then(() => viewTypeHandlesPromise)
      .then(viewTypeHandles => {
        const decisions = viewTypeHandles.reduce((handle, memo) => {
          const { scope } = handle;
          memo[scope] = memo[scope] || [];
          memo[scope].push(handle);
        }, {});
        assign(viewStorage, decisions);
      })
      .catch(() => {});
  };

  const getView = viewName => {
    return previousStoreViewsComplete.then(() => viewStorage[viewName] || []);
  };

  const isInitialized = () => {
    return storeViewsCalledAtLeastOnce;
  };
  return {
    storeViews,
    getView,
    isInitialized
  };
};
*/
