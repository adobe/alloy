const viewStorage = {};

const addView = (viewName, decisions) => {
  viewStorage[viewName] = decisions;
};

const getView = viewName => {
  return viewStorage[viewName];
};

export default () => {
  return {
    push: addView,
    get: getView
  };
};
