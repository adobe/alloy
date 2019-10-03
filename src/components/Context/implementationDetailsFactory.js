export default version => {
  return event => {
    event.mergeXdm({
      implementationDetails: {
        name: "https://ns.adobe.com/experience/alloy",
        version,
        environment: "web"
      }
    });
  };
};
