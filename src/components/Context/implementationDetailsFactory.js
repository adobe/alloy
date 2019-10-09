export default version => {
  return () => {
    return {
      implementationDetails: {
        name: "https://ns.adobe.com/experience/alloy",
        version,
        environment: "web"
      }
    };
  };
};
