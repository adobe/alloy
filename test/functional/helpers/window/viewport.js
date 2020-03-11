import { t, ClientFunction } from "testcafe";

export default {
  getViewportSize: ClientFunction(() => {
    return {
      width: window.top.innerWidth,
      height: window.top.innerHeight
    };
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
