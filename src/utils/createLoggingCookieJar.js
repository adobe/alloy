import { cookieJar } from ".";

export default ({ logger }) => {

  return {
    set(key, value, options) {
      if (logger.enabled) {
        const props = Object.keys(options).map(optionKey => {
          const optionValue = optionKey === "expires" ? options[optionKey].toUTCString() : options[optionKey];
          return options[optionKey] === true ? `${optionKey};` : `${optionKey}=${optionValue};`;
        }).join(" ");
        logger.info(`Setting cookie: ${key}=${value}; ${props}`);
      }
      cookieJar.set(key, value, options);
    },
    ...cookieJar
  }
}
