import { spawn } from "child_process";

export default (command, args) =>
  new Promise((resolve, reject) => {
    spawn(command, args, { stdio: "inherit" })
      .on("exit", (code) => {
        if (code === 0) {
          resolve(code);
        } else {
          reject(new Error(`${command} exited with code ${code}`));
        }
      })
      .on("error", reject);
  });
