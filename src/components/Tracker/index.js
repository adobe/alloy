import Request from "./Request";

const noop = () => {};

export default () => {
  let core;

  const makeServerCall = (endpoint, beforeHook, afterHook) => (
    data,
    callback = noop
  ) => {
    const request = new Request(core);
    return request.send(data, endpoint, beforeHook, afterHook, callback);
  };

  const beforeInteractHook = payload =>
    core.components.onBeforeInteract(payload);
  const onInteractResponse = response =>
    core.components.onInteractResponse(response);
  const onBeforeCollect = payload => core.components.onBeforeCollect(payload);
  const onCollectResponse = payload =>
    core.components.onCollectResponse(payload);

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
