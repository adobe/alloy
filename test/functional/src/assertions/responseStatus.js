import { t } from "testcafe";

const responseStatus = async (networkLogs, status) => {
  await networkLogs.forEach(async req => {
    await t
      .expect(req.response.statusCode === status)
      .ok(`expected ${status} to be found in ${req.response.statusCode}`);
  });
};

export default responseStatus;
