const zlib = require("zlib");

const getResponseBody = request => {
  const encoding = request.response.headers["content-encoding"];
  const bodyBuffer = request.response.body;
  let decompressedBody;
  switch (encoding) {
    case "deflate":
      decompressedBody = zlib.inflateRawSync(bodyBuffer);
      break;
    case "gzip":
      decompressedBody = zlib.gunzipSync(bodyBuffer);
      break;
    default:
      decompressedBody = bodyBuffer;
  }
  return decompressedBody.toString();
};

export default getResponseBody;
