import { t, ClientFunction } from "testcafe";

export default {
  getViewportSize: ClientFunction(() => {
    const viewportDiv = document.createElement("div");
    viewportDiv.style.cssText =
      "position: fixed;top: 0;left: 0;bottom: 0;right: 0;";
    document.documentElement.insertBefore(
      viewportDiv,
      document.documentElement.firstChild
    );
    const viewportSize = {
      width: viewportDiv.offsetWidth,
      height: viewportDiv.offsetHeight
    };
    document.documentElement.removeChild(viewportDiv);

    return viewportSize;
  }),
  testRequestExpectedViewport: async (jsonRequest, expectedViewport) => {
    await t
      .expect(
        jsonRequest.events[0].xdm.environment.browserDetails.viewportWidth
      )
      .eql(expectedViewport.width);
    await t
      .expect(
        jsonRequest.events[0].xdm.environment.browserDetails.viewportHeight
      )
      .eql(expectedViewport.height);
  }
};
