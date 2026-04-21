import { spawn } from "child_process";

const toPromise = (func) => {
  return new Promise((resolve, reject) => {
    const callback = (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    };
    func(callback);
  });
};

export default (command, options) => {
  return toPromise((callback) =>
    spawn(command, options, { stdio: "inherit" }).on("exit", callback),
  );
};
