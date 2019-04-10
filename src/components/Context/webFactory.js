export default (window, topFrameSetProvider) => {
  let topFrameSet;

  return () => {
    topFrameSet = topFrameSet || topFrameSetProvider();

    // TODO: check "adobe_mc_ref" query string parameter for the referrer and use that if it's set
    return {
      web: {
        webPageDetails: {
          URL: window.location.href || window.location
        },
        webReferrer: {
          URL: topFrameSet.document.referrer
        }
      }
    };
  };
};
