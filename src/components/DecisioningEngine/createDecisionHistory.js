import { createRestoreStorage, createSaveStorage } from "./utils";

const STORAGE_KEY = "history";
export default ({ storage }) => {
  const restore = createRestoreStorage(storage, STORAGE_KEY);
  const save = createSaveStorage(storage, STORAGE_KEY);

  const history = restore({});

  const recordDecision = id => {
    if (typeof history[id] !== "number") {
      history[id] = new Date().getTime();
      save(history);
    }
    return history[id];
  };

  return { recordDecision };
};
