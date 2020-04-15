export default imsOrgId => {
  return `kndctr_${imsOrgId.replace(/[@]+?/, "_")}_consent`;
};
