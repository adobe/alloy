import fetch from "node-fetch";
import FormData from "form-data";

const throwRequestFailedError = details => {
  const error = new Error(
    `Request failed while swapping the jwt token. ${details}`
  );
  error.code = REQUEST_FAILED;
  throw error;
};

const throwUnexpectedResponseError = details => {
  const error = new Error(
    `Unexpected response received while swapping the jwt token. ${details}`
  );
  error.code = UNEXPECTED_RESPONSE_BODY;
  throw error;
};

export default ({ imsUrl, clientId, clientSecret, jwtToken }) => {

  const form = new FormData();
  form.append('client_id', clientId);
  form.append('client_secret', clientSecret);
  form.append('jwt_token', jwtToken);

  const postOptions = {
    method: 'POST',
    body: form,
    headers: form.getHeaders()
  };

  return fetch(`${imsUrl}/ims/exchange/jwt/`, postOptions)
    .catch(e => throwRequestFailedError(e.message))
    .then(res => {
      return res.json().then(data => {
        return {
          ok: res.ok,
          json: data
        };
      });
    })
    .then(({ ok, json }) => {
      const { access_token, error, error_description } = json;
      if (ok && access_token) {
        return json;
      }

      if (error && error_description) {
        const swapError = new Error(error_description);
        swapError.code = error;
        throw swapError;
      } else {
        throwUnexpectedResponseError(
          `The response body is as follows: ${JSON.stringify(json)}`
        );
      }
    });
}
