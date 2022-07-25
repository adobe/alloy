export default ({ logger, getLinkDetails, config }) => {
  const { onBeforeLinkClickSend } = config;
  return element => {
    if (!element) {
      return undefined;
    }
    const linkDetails = getLinkDetails(element, config);
    if (!linkDetails) {
      return undefined;
    }

    const fakeEventContent = {
      xdm: {
        eventType: "web.webinteraction.linkClicks",
        web: {
          webInteraction: {
            name: linkDetails.linkName,
            region: linkDetails.linkRegion,
            type: linkDetails.linkType,
            URL: linkDetails.linkUrl,
            linkClicks: {
              value: 1
            }
          }
        }
      },
      data: {},
      clickedElement: element
    };

    try {
      onBeforeLinkClickSend(fakeEventContent);

      return fakeEventContent.xdm;
    } catch (error) {
      logger.info(
        "An error occurred while executing the onBeforeLinkClickSend callback function.",
        error
      );
      return undefined;
    }
  };
};
