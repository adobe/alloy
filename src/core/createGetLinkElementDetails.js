// eslint-disable-next-line import/no-named-as-default
import createGetLinkDetails from "../components/ActivityCollector/createGetLinkDetails";

export default (window, logger) => {
  return config => {
    const { onBeforeLinkClickSend } = config;
    return element => {
      if (!element) {
        return undefined;
      }
      const getLinkDetails = createGetLinkDetails(window, config);
      const linkDetails = getLinkDetails(element);
      if (!linkDetails) {
        return undefined;
      }
      const xdm = {
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
      };

      const tempContent = {
        xdm,
        data: {},
        clickedElement: element
      };
      try {
        const shouldLinkBeCounted = onBeforeLinkClickSend(tempContent);

        if (shouldLinkBeCounted) {
          return tempContent.xdm;
        }

        return undefined;
      } catch (error) {
        logger.info(
          "An error occurred while executing the onBeforeLinkClickSent callback function.",
          error
        );
        return undefined;
      }
    };
  };
};
