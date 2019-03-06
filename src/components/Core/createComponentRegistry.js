const intersection = (a, b) => a.filter(x => b.includes(x));

export default () => {
  const components = [];

  function findExistingCommands(newComponent) {
    const existingComands = components.reduce(
      (all, c) => all.concat(Object.keys(c.commands)),
      []
    );
    return intersection(
      existingComands,
      Object.keys(newComponent.commands || {})
    );
  }

  return {
    register(component) {
      const existingCommands = findExistingCommands(component);

      if (existingCommands.length) {
        throw new Error(
          `[ComponentRegistry] Could not register ${component.namespace} ` +
            `because it has existing command(s): ${existingCommands.join(",")}`
        );
      } else {
        components.push(component);
      }
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
