const env = process.env.EDGE_ENV || "int";

const pageName = {
  int: "alloyTestPage.html",
  prod: "latestAlloyTestPage.html"
};

const alloyWithVisitorPages = {
  int: "alloyVisitorTestPageInt.html",
  prod: "alloyVisitorTestPageProd.html"
};

const alloyWithVisitorTestPageUrl = `https://alloyio.com/functional-test/${alloyWithVisitorPages[env]}`;

export { alloyWithVisitorTestPageUrl };

export default `https://alloyio.com/functional-test/${pageName[env]}`;
