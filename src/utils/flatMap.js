export default (array, mapFunction) => {
  return Array.prototype.concat.apply([], array.map(mapFunction));
};
