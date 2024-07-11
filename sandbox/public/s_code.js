alloy("configure", {
  clickCollectionEnabled: true,
  clickCollection: {
    internalLinkEnabled: true,
    externalLinkEnabled: true,
    downloadLinkEnabled: true,
    sessionStorageEnabled: false,
    eventGroupingEnabled: true,
    filterClickDetails: (props) => {
      console.log("filterClickDetails", props);
    },
  },
  datastreamId: "76d1c882-2642-44ff-ad8e-ce32050d13d4",
  orgId: "97D1F3F459CE0AD80A495CBE@AdobeOrg",
  debugEnabled: true,
  onBeforeLinkClickSend: function (options) {
    const xdm = options.xdm;
    const data = options.data;
    console.log(
      ">>>>> Here is the options passed to onBeforeLinkClickSend:\n",
      JSON.stringify(options, null, 2),
    );
    console.log(
      "options.clickedElement: " +
        JSON.stringify(options.clickedElement, null, 2),
    );
  },
  onBeforeEventSend: function (options) {
    // const xdm = options.xdm;
    // const data = options.data;
    // console.log("onBeforeEventSend ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️");
    // // // TODO: Remove output to limit spam a bit
    // console.log(`XDM: ${JSON.stringify(options.xdm, null, 2)}`);
    // console.log(`DATA: ${JSON.stringify(options.data, null, 2)}`);
    // console.log("onBeforeEventSend ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️");
    // // Augment the Web SDK data with a prefix to differentiate it from the AppMeasurement data
    // const activitymap =
    //   options?.data?.__adobe?.analytics?.c?.a?.activitymap;
    // if (activitymap) {
    //   activitymap.page = `Web SDK ${activitymap.page}`;
    //   activitymap.link = `Web SDK ${activitymap.link}`;
    //   activitymap.region = `Web SDK ${activitymap.region}`;
    // }
    // const webPageDetails = xdm?.web?.webPageDetails;
    // if (webPageDetails && webPageDetails.name) {
    //   webPageDetails.name = `Web SDK ${webPageDetails.name}`;
    // }
    // return true;
  },
});
