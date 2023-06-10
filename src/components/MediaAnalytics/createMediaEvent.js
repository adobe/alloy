import injectTimestamp from "../Context/injectTimestamp";

export default ({ eventType, mediaCollection }) => {
  const xdm = {
    eventType,
    mediaCollection
  };

  const timestamp = injectTimestamp(() => new Date());
  timestamp(xdm);

  return { xdm };
};
