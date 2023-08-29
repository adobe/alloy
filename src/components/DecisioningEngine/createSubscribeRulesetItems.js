import {
  arrayOf,
  callback as callbackType,
  objectOf,
  string
} from "../../utils/validation";

const validateOptions = ({ options }) => {
  const validator = objectOf({
    surface: string().required(),
    schemas: arrayOf(string()).uniqueItems(),
    callback: callbackType().required()
  }).noUnknownFields();

  return validator(options);
};

export default () => {
  let subscriptionHandler;
  let surfaceIdentifier;
  let schemasFilter;

  const run = ({ surface, schemas, callback }) => {
    subscriptionHandler = callback;
    surfaceIdentifier = surface;
    schemasFilter = schemas instanceof Array ? schemas : undefined;
  };

  const optionsValidator = options => validateOptions({ options });

  const refresh = propositions => {
    if (!subscriptionHandler || !surfaceIdentifier) {
      return;
    }

    const result = propositions
      .filter(payload => payload.scope === surfaceIdentifier)
      .reduce((allItems, payload) => {
        const { items = [] } = payload;

        return [
          ...allItems,
          ...items.filter(item =>
            schemasFilter ? schemasFilter.includes(item.schema) : true
          )
        ];
      }, [])
      .sort((a, b) => b.data.qualifiedDate - a.data.qualifiedDate);

    if (result.length === 0) {
      return;
    }

    subscriptionHandler.call(null, { items: result });
  };

  return {
    refresh,
    command: {
      optionsValidator,
      run
    }
  };
};
