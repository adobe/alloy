let viewStorage;

const addView = (viewName, decisions) => {
  if (viewStorage === undefined) {
    viewStorage = {};
  }
  viewStorage[viewName] = decisions;
};

const storeViews = decisions => {
  Object.keys(decisions).forEach(scope => {
    addView(scope, decisions[scope]);
  });
};

const getView = viewName => {
  return viewStorage[viewName];
};

const isStoreInitialized = () => {
  return !(viewStorage === undefined);
};

export default () => {
  return {
    storeViews,
    getView,
    isStoreInitialized
  };
};
