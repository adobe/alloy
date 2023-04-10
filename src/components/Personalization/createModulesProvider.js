import createPreprocessors from "./createPreprocessors";

export default ({ modules, preprocessors = createPreprocessors() }) => {
  const getModules = schema => {
    return {
      getAction: type => {
        if (!modules[schema]) {
          return undefined;
        }

        return modules[schema][type];
      },
      getPreprocessors: () => preprocessors[schema],
      getSchema: () => schema
    };
  };

  return {
    getModules
  };
};
