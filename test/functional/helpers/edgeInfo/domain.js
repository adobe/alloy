const env = process.env.EDGE_ENV || "int";

const domains = {
  int: {
    thirdParty: "edge-int.adobedc.net",
    firstParty: "firstparty-int.alloyio.com"
  },
  prod: {
    thirdParty: "edge.adobedc.net",
    firstParty: "firstparty.alloyio.com"
  }
};

export default domains[env];
