export default (instanceName, settings = {}) => {
  const { imsOrgId, edgeConfigId } = settings;

  window[instanceName]("configure", {
    edgeConfigId,
    orgId: imsOrgId,
    context: ["web"],
    debugEnabled: true,
    targetMigrationEnabled: true
  });

  return window[instanceName];
};
