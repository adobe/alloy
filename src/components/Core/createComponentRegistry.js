const intersection = (a, b) => a.filter(x => b.includes(x));

export default () => {
  const components = [];

  const getListOfCommands = () =>
    components.reduce((all, c) => all.concat(Object.keys(c.commands)), []);

  function findExistingCommands(newComponent) {
    return intersection(
      getListOfCommands(),
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
    },
    findComand(name) {
      let command;

      components.some(component => {
        const isCommandFound = Object.keys(component.commands || {}).find(
          c => c === name
        );

        if (isCommandFound) {
          command = component.commands[name].bind(component);
          return true;
        }
        return false;
      });

      return command;
    }
  };
};
