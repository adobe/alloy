
export default ({ collect }) => ({ decisionsMeta, viewName }) => {
  if (decisionsMeta.length > 0) {
    // TODO just add the code for collect here
    return collect({ decisionsMeta, viewName });
  } else {
    return Promise.resolve();
  }
};
