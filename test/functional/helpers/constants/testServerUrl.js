const env = process.env.EDGE_ENV || "int";
const alloyEnv = process.env.ALLOY_ENV;

const alloyPages = {
  int: "alloyTestPage.html",
  prod: "latestAlloyTestPage.html"
};

const alloyWithVisitorPages = {
  int: "alloyVisitorTestPageInt.html",
  prod: "alloyVisitorTestPageProd.html"
};

const alloyWithVisitorTestPageUrl = `https://alloyio.com/functional-test/${alloyWithVisitorPages[alloyEnv]}`;

export { alloyWithVisitorTestPageUrl };

const getAlloyTestPageUrl = () => {
  console.log("EDGE ENV:", env);
  console.log("ALLOY ENV:", alloyEnv);
  let pageUrl;
  if (alloyEnv) {
    pageUrl = alloyPages[alloyEnv];
  } else {
    pageUrl = alloyPages[env];
  }
  console.log("ALLOY PAGE:", pageUrl);
  return pageUrl;
};

export default `https://alloyio.com/functional-test/${getAlloyTestPageUrl()}`;
