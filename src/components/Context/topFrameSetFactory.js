export default window => {
  return () => {
    let topFrameSet = window;
    const { location } = topFrameSet;
    try {
      let { parent } = topFrameSet;
      while (
        parent &&
        parent.location &&
        location &&
        String(parent.location) !== String(location) &&
        topFrameSet.location &&
        String(parent.location) !== String(topFrameSet.location) &&
        parent.location.host === location.host
      ) {
        topFrameSet = parent;
        ({ parent } = topFrameSet);
      }
    } catch (e) {
      // default to whatever topFrameSet is set
    }
    return topFrameSet;
  };
};
