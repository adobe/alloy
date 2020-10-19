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

const envForPageUrl = alloyEnv || env;

const alloyTestPageUrl = `https://alloyio.com/functional-test/${alloyPages[envForPageUrl]}`;
export default alloyTestPageUrl;

const alloyWithVisitorTestPageUrl = `https://alloyio.com/functional-test/${alloyWithVisitorPages[envForPageUrl]}`;
export { alloyWithVisitorTestPageUrl };

// eslint-disable-next-line no-console
console.log("EDGE ENV:", env);
// eslint-disable-next-line no-console
console.log("ALLOY ENV:", alloyEnv);
// eslint-disable-next-line no-console
console.log("ALLOY PAGE:", alloyTestPageUrl);
// eslint-disable-next-line no-console
console.log("ALLOY VISITOR PAGE:", alloyWithVisitorTestPageUrl);
