// Use concurrently for its great log handling and prefix capabilities

const concurrently = require("concurrently");
const ApplicationError = require("./applicationError");

// even though I'm only ever running one thing at a time.

const exec = async (name, command, options = {}) => {
  try {
    await concurrently(
      [
        {
          name,
          command,
        },
      ],
      {
        prefix: "[{time} {name}]",
        timestampFormat: "HH:mm:ss.SSS",
        ...options,
      },
    );
  } catch (e) {
    if (!e.message) {
      // when a command fails, concurrently rejects with an array of objects.
      throw new ApplicationError(
        "Previous command exited with non-zero exit code.",
      );
    }
    throw e;
  }
};

module.exports = exec;
