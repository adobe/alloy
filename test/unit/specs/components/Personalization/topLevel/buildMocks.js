import createEvent from "../../../../../../src/core/createEvent";
import createResponse from "../../../../../functional/helpers/createResponse";

export default decisions => {
  const response = createResponse({
    content: {
      handle: decisions.map(payload => ({
        type: "personalization:decisions",
        payload
      }))
    }
  });

  const actions = jasmine.createSpyObj("actions", [
    "createAction",
    "setHtml",
    "setText",
    "setAttributes",
    "swapImage",
    "setStyles",
    "rearrangeChildren",
    "removeNode",
    "replaceHtml",
    "appendHtml",
    "prependHtml",
    "insertHtmlAfter",
    "insertHtmlBefore"
  ]);

  const executeActions = (actions, modules) => {
    return Promise.resolve(actions.map(action => {
      const { type, meta } = action;
      console.log("executeActions mock", JSON.stringify(action, null, 2));
      modules[type](action);
      //console.log("executeActions mock", JSON.stringify(meta, null, 2));
      return { meta };
    }));
  };

  const config = {
    targetMigrationEnabled: true,
    prehidingStyle: "myprehidingstyle"
  };
  const logger = jasmine.createSpyObj("logger", ["warn", "error"]);
  const sendEvent = jasmine.createSpy("sendEvent");
  const eventManager = {
    createEvent,
    async sendEvent(event) {
      event.finalize();
      sendEvent(event.toJSON());
      return Promise.resolve();
    }
  };
  const getPageLocation = () => new URL("http://example.com/home");
  const window = {
    location: jasmine.createSpyObj("location", ["replace"])
  };
  const hideContainers = jasmine.createSpy("hideContainers");
  const showContainers = jasmine.createSpy("showContainers");

  return {
    actions,
    config,
    logger,
    sendEvent,
    eventManager,
    getPageLocation,
    window,
    hideContainers,
    showContainers,
    response,
    executeActions
  };
}

