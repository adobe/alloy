export default (window, topFrameSet) => {
  // TODO: check "adobe_mc_ref" query string parameter for the referrer and use that if it's set
  return {
    "xdm:web": {
      "xdm:webPageDetails": {
        "xdm:URL": window.location.href || window.location
      },
      "xdm:webReferrer": {
        "xdm:URL": topFrameSet.document.referrer
      }
    }
  };
};
