const exec = require("../helpers/exec");
const ApplicationError = require("../helpers/applicationError");
const { Writable, Readable } = require("stream");

const defer = () => {
  const deferred = {};
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
};

const createStringBackedWritableStream = () => {
  let result = "";
  class WritableStream extends Writable {
    _write(chunk, encoding, next) {
      result += chunk.toString();
      next();
    }
  };

  return [new WritableStream(), () => result];
};

describe("exec", () => {
  it("throws an ApplicationError on a non-zero exit code.", async () => {
    const [outputStream, getResult] = createStringBackedWritableStream();
    await expectAsync(exec("bad exit", "exit 42", { outputStream })).toBeRejectedWithError(ApplicationError);
  });
  it("logs the exit code", async () => {
    const [outputStream, getResult] = createStringBackedWritableStream();
    try {
      await exec("bad exit", "exit 42", { outputStream });
      fail();
    } catch (e) {
      const result = getResult();
      expect(result).toMatch(/exited with code 42/);
    }
  });
  it("logs the process name", async () => {
    const [outputStream, getResult] = createStringBackedWritableStream();
    try {
      await exec("bad exit", "exit 42", { outputStream });
      fail();
    } catch (e) {
      const result = getResult();
      expect(result).toMatch(/bad exit/);
    }
  });
  it("handles multi-line echo statements", async () => {
    const [outputStream, getResult] = createStringBackedWritableStream();
    const input = "Hello\nWorld\n"
    await exec("passthrough", `echo "${input}" | cat -`, { outputStream });
    const result = getResult();
    expect(result).toMatch(/Hello/);
    expect(result).toMatch(/World/);
  })
});
