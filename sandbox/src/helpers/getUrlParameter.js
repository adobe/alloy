/**
 * @param {string} name
 * @returns {string | null}
 */
export default (name) => {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
};
