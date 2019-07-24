/* eslint-disable class-methods-use-this */
import zlib from "zlib";

export default class ZippedResponse {
  async unzipResponseBody(options) {
    return new Promise((resolve, reject) => {
      zlib.gunzip(options.body, async (error, buff) => {
        if (error !== null) {
          return reject(error);
        }
        if (options.toJson === true) {
          return resolve(JSON.parse(buff.toString()));
        }
        if (options.toString === true) {
          return resolve(buff.toString());
        }
        return resolve(buff);
      });
    });
  }

  async unzipLoggerResponses(options) {
    const { requests } = options.requestLogger;
    try {
      return Promise.all(
        requests.map(async (value, key) => {
          if (
            value.response &&
            value.response.headers &&
            value.response.headers["content-encoding"] === "gzip" &&
            Buffer.isBuffer(value.response.body)
          ) {
            // Update the value directly on the logger reference!
            requests[key].response.body = await this.unzipResponseBody({
              body: value.response.body,
              toJson: options.toJson,
              toString: options.toString
            });
          }
        })
      );
    } catch (er) {
      throw new Error(er);
    }
  }
}
