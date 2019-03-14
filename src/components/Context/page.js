import window from "@adobe/reactor-window";

export const getPageInfo = (w, topFrameSet) => {
  const pageInfo = {};
  pageInfo.pageURL = w.location.href || w.location;
  // TODO: check "adobe_mc_ref" query string parameter for the referrer and use that if it's set
  pageInfo.referrer = topFrameSet.document.referrer;
  return pageInfo;
};

export const getTopFrameSet = w => {
  let topFrameSet = w;
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

let topFrameSet;
export default () => {
  topFrameSet = topFrameSet || getTopFrameSet(window);

  return getPageInfo(window, topFrameSet);
};
