import { t } from "testcafe";

const responseStatus = async (networkLogs, status) => {
  for (let i = 0; i < networkLogs.length; i += 1) {
    const req = networkLogs[i];
    // TODO: Check why some requests don't have responses.
    // TODO: It looks like test cafe might not be handling gzip correctly.
    if (!req.response) {
      // eslint-disable-next-line no-await-in-loop
      await t
        .expect(req.response.statusCode === status)
        .ok(`expected ${status} to be found in ${req.response.statusCode}`);
    }
  }
};

export default responseStatus;
