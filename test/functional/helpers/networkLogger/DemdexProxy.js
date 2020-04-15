import { RequestHook } from "testcafe";

const env = process.env.EDGE_ENV || "int";

// This proxy will only get called if we hit the prod demdex endpoint.
// If the test EDGE_ENV is supposed to hit the `int` endpoints, we transform
// prod to int; otherwise, it's business as usual.
const transformProdToInt = requestOptions => {
  if (env === "prod") return;

  const demdexProd = "adobedc.demdex.net";
  const demdexInt = "adobedc-int.demdex.net";

  const replace = options => {
    Object.keys(options).forEach(option => {
      // option e.g: url, host, headers {}...
      const optionValue = options[option];

      if (typeof optionValue === "string" && optionValue.includes(demdexProd)) {
        options[option] = options[option].replace(demdexProd, demdexInt);
      }

      if (typeof optionValue === "object" && optionValue != null) {
        replace(optionValue);
      }
    });
  };

  replace(requestOptions);
};

/* eslint-disable */
class DemdexProxy extends RequestHook {
  constructor(requestFilterRules, responseEventConfigureOpts) {
    super(requestFilterRules, responseEventConfigureOpts);
  }

  async onRequest({ requestOptions }) {
    transformProdToInt(requestOptions);
  }

  async onResponse() {
    // Do nothing. TestCafe will throw an error if we don't provide this.
  }
}

export default DemdexProxy;
