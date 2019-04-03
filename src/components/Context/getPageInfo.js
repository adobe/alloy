export default (window, topFrameSet) => {
  const pageInfo = {};
  pageInfo.pageURL = window.location.href || window.location;
  // TODO: check "adobe_mc_ref" query string parameter for the referrer and use that if it's set
  pageInfo.referrer = topFrameSet.document.referrer;
  return pageInfo;
};
