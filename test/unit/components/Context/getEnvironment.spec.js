import getEnvironment from "../../../../src/components/Context/environmentFactory";

describe("Context::getEnvironment", () => {
  const mywindow = {
    screen: { width: 1001, height: 1002 },
    innerWidth: 1003,
    innerHeight: 1004,
    navigator: { connection: { effectiveType: "myConnectionType" } }
  };
  const mycanvas = {
    getContext: () => {
      return null;
    }
  };
  const mydocument = {
    createElement: () => {
      return mycanvas;
    }
  };

  it("works", () => {
    const date = new Date(1553550978123);
    console.log(date.getTimezoneOffset());
    expect(getEnvironment(mywindow, mydocument, date)).toEqual({
      environment: {
        browserDetails: {
          viewportWidth: 1003,
          viewportHeight: 1004,
          webGLRenderer: null
        },
        connectionType: "myConnectionType",
        placeContext: {
          localTime: "2019-03-25T21:56:18.123Z",
          // browsers don't have support for setting the timezone on a date object, because of
          // this I cannot have hard-coded integer here because depending on the default
          // timezone of the browser you are testing with you will get different results.
          localTimezoneOffset: date.getTimezoneOffset()
        }
      }
    });
  });
});
