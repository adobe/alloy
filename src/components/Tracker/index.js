import createRequest from "./createRequest";

const noop = () => {};

export default () => {
  let core;

  const makeServerCall = (endpoint, beforeHook, afterHook) => (
    data,
    callback = noop
  ) => {
    const request = createRequest(core);
    return request.send(data, endpoint, beforeHook, afterHook, callback);
  };

  const beforeInteractHook = payload =>
    core.lifecycle.onBeforeInteract(payload);
  const onInteractResponse = response =>
    core.lifecycle.onInteractResponse(response);
  const onBeforeCollect = payload => core.lifecycle.onBeforeCollect(payload);
  const onCollectResponse = payload =>
    core.lifecycle.onCollectResponse(payload);

  return {
    namespace: "Tracker",
    onComponentsRegistered(_core) {
      core = _core;
    },
    interact: makeServerCall(
      "interact",
      beforeInteractHook,
      onInteractResponse
    ),
    collect: makeServerCall("collect", onBeforeCollect, onCollectResponse)
  };
};
