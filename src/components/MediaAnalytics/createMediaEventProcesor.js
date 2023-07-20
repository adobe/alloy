import MediaEvents from "./MediaConstants/MediaEvents";

export default ({ playerCache }) => {
  return ({ playerId, xdm }) => {
    const { eventType } = xdm;
    if (eventType === MediaEvents.AD_START) {
    }
  };
};
