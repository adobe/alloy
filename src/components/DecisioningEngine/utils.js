import debounce from "../../utils/debounce";

export const createRestoreStorage = (storage, storageKey) => {
  return defaultValue => {
    const stored = storage.getItem(storageKey);
    if (!stored) {
      return defaultValue;
    }

    try {
      return JSON.parse(stored);
    } catch (e) {
      return defaultValue;
    }
  };
};

export const createSaveStorage = (storage, storageKey, debounceDelay = 150) => {
  return debounce(value => {
    storage.setItem(storageKey, JSON.stringify(value));
  }, debounceDelay);
};
