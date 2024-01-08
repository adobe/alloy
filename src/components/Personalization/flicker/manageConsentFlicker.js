export default ({ consent, hideContainers, showContainers }) => {

  consent.getConsent().then(state => {
    if (state === OUT) {
      showContainers();
    }
    if (state === IN) {
      hideContainers();
    }
  });
};
