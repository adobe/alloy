const fireViewEndCustomEvent = () => {
  console.log("Firing Custom Event 'event-view-end'");
  var event = new CustomEvent('event-view-end');
  var obj = document.querySelector("#app");
  obj.dispatchEvent(event);
};

const fireViewStartCustomEvent = (data) => {
  console.log("Firing Custom Event 'event-view-start'");
  let event = new CustomEvent('event-view-start', data);
  document.body.dispatchEvent(event);
};

const fireActionTriggerCustomEvent = (target, data) => {
  console.log("Firing Custom Triggered Event");
  var event = new CustomEvent('event-action-trigger', data);
  var obj = target.dispatchEvent(event);
};

export {
  fireViewEndCustomEvent,
  fireViewStartCustomEvent,
  fireActionTriggerCustomEvent
}
