const { Writable } = require("stream");
const exec = require("../helpers/exec");
const ApplicationError = require("../helpers/applicationError");

const createStringBackedWritableStream = () => {
  let result = "";
  class WritableStream extends Writable {
    // eslint-disable-next-line no-underscore-dangle, class-methods-use-this
    _write(chunk, encoding, next) {
      result += chunk.toString();
      next();
    }
  }

  return [new WritableStream(), () => result];
};

describe("exec", () => {
  it("throws an ApplicationError on a non-zero exit code.", async () => {
    const [outputStream] = createStringBackedWritableStream();
    await expectAsync(
      exec("bad exit", "exit 42", { outputStream }),
    ).toBeRejectedWithError(ApplicationError);
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
    const input = "Hello\nWorld\n";
    await exec("passthrough", `echo "${input}" | cat -`, { outputStream });
    const result = getResult();
    expect(result).toMatch(/Hello/);
    expect(result).toMatch(/World/);
  });
});
