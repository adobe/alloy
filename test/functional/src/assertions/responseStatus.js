import { t } from "testcafe";

const responseStatus = (networkLogs, status) => {
  return Promise.all(
    networkLogs.map(req => {
      // TODO: Check why some requests don't have responses.
      // TODO: It looks like test cafe might not be handling gzip correctly.
      if (!req.response) {
        return Promise.resolve();
      }

      return t
        .expect(req.response.statusCode === status)
        .ok(`expected ${status} to be found in ${req.response.statusCode}`);
    })
  );
};

export default responseStatus;
