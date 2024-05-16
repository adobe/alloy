import { createRequire } from "module";
import ApplicationError from "./applicationError.js";

const require = createRequire(import.meta.url);

// Use concurrently for its great log handling and prefix capabilities
const concurrently = require("concurrently");

// even though I'm only ever running one thing at a time.

const exec = async (name, command, options = {}) => {
  try {
    const { result } = await concurrently(
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
    await result;
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

export default exec;
