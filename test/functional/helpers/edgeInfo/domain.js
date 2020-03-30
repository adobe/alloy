const env = process.env.EDGE_ENV || "int";

const domains = {
  int: {
    third: "edge-int.adobedc.net",
    first: "firstparty-int.alloyio.com"
  },
  prod: {
    third: "edge.adobedc.net",
    first: "firstparty.alloyio.com"
  }
};

export default {
  thirdParty: domains[env].third,
  firstParty: domains[env].first
};
