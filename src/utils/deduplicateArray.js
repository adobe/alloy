const REFERENCE_EQUALITY = (a, b) => a === b;

const findIndex = (array, item, isEqual) => {
  for (let i = 0; i < array.length; i += 1) {
    if (isEqual(array[i], item)) {
      return i;
    }
  }
  return -1;
};

export default (array, isEqual = REFERENCE_EQUALITY) => {
  return array.filter(
    (item, index) => findIndex(array, item, isEqual) === index
  );
};
