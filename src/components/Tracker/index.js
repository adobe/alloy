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

  const makeHookCall = hook => (...args) => core.lifecycle[hook](...args);

  return {
    namespace: "Tracker",
    onComponentsRegistered(_core) {
      core = _core;
    },
    interact: makeServerCall(
      "interact",
      makeHookCall("onBeforeViewStart"),
      makeHookCall("onViewStartResponse")
    ),
    collect: makeServerCall(
      "collect",
      makeHookCall("onBeforeEvent"),
      makeHookCall("onEventResponse")
    )
  };
};
