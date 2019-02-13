export default () => {
  const components = [];

  return {
    register(component) {
      components.push(component);
    },
    getByNamespace(namespace) {
      return components.find(component => component.namespace === namespace);
    },
    getAll() {
      // Slice so it's a copy of the original lest components
      // try to manipulate it. Maybe not that important.
      return components.slice();
    }
  };
};
