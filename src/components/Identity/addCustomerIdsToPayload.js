export default (customerIdState, customerIdChanged, payload) => {
  const idNames = Object.keys(customerIdState);
  idNames.forEach(idName => {
    payload.addIdentity(idName, customerIdState[idName]);
  });
  payload.mergeMeta({ identity: { customerIdChanged } });
};
