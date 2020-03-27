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
  getThirdParty() {
    return domains[env].third;
  },
  getFirstParty() {
    return domains[env].first;
  }
};
