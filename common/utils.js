const { AEP_COOKIE_PREFIX } = require("./aepEdgeClient");

/**
 * Returns the request address, extracted from client request URL
 * @param req client request object
 * @returns {string} request address
 */
function getAddress(req) {
  return `${req.protocol}://${req.headers.host}${req.originalUrl}`;
}

/**
 * @param res response object to be returned to the client
 * @param template handlebars template
 * @param templateVariables object with handlebars template variables
 */
function sendResponse({ res, template, templateVariables }) {
  res.set({
    "Content-Type": "text/html",
    Expires: new Date().toUTCString(),
  });

  res.status(200).send(template(templateVariables));
}

module.exports = {
  getAddress,
  sendResponse,
};
