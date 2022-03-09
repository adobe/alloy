import addRenderAttemptedToDecisions from "./addRenderAttemptedToDecisions";

export default (decisions = [], renderDecisions) => {
  const resultingObject = {
    propositions: addRenderAttemptedToDecisions({
      decisions,
      renderAttempted: renderDecisions
    })
  };
  if (!renderDecisions) {
    resultingObject.decisions = decisions;
  }
  return resultingObject;
};
