/* eslint-disable class-methods-use-this */
import { t, RequestLogger } from "testcafe";

export default class Page {
  constructor() {
    this.edgeGateway = RequestLogger(/edgegateway\.azurewebsites/, {
      logRequestHeaders: true,
      logRequestBody: true,
      stringifyRequestBody: false,
      logResponseBody: true,
      stringifyResponseBody: false,
      logResponseHeaders: true
    });
    this.alloyQe = RequestLogger(/alloyqe\.azurewebsites/, {
      logRequestHeaders: true,
      logRequestBody: true,
      stringifyRequestBody: false,
      logResponseBody: true,
      stringifyResponseBody: false,
      logResponseHeaders: true
    });
  }

  async loggerContains(logger, substring) {
    return t
      .expect(logger.contains(record => record.request.url.match(substring)))
      .ok();
  }

  async loggerNotContains(logger, substring) {
    return t
      .expect(logger.contains(record => record.request.url.match(substring)))
      .notOk();
  }
}
