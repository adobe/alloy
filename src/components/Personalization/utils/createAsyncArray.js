
export default () => {
  let latest = Promise.resolve([]);
  return {
    add(promise) {
      latest = latest.then(existingPropositions => {
        return promise.then(newPropositions => {
          return existingPropositions.concat(newPropositions);
        }).catch(() => {
          return existingPropositions;
        });
      });
    },
    clear() {
      const oldLatest = latest;
      latest = Promise.resolve([]);
      return oldLatest;
    }
  }
};
