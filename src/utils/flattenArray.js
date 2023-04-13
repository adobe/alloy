const flattenArray = (items = []) => {
  const flat = [];

  if (!Array.isArray(items)) {
    return items;
  }

  items.forEach(item => {
    if (Array.isArray(item)) {
      flat.push(...flattenArray(item));
    } else {
      flat.push(item);
    }
  });

  return flat;
};

export default flattenArray;
