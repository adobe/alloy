import Request from "./Request";

export default function Tracker() {
  let core;

  Object.defineProperty(this, "namespace", {
    get() {
      return "Tracker";
    }
  });

  this.onComponentsRegistered = coreInstance => (core = coreInstance);

  const makeServerCall = (endpoint, beforeHook, afterHook) => (
    data,
    callback
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

  this.interact = makeServerCall(
    "interact",
    beforeInteractHook,
    onInteractResponse
  );
  this.collect = makeServerCall("collect", onBeforeCollect, onCollectResponse);
}
