const viewStorage = {};

const addView = (viewName, decisions) => {
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

export default () => {
  return {
    storeViews,
    get: getView
  };
};
