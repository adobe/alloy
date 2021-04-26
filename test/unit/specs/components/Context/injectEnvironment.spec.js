import injectEnvironment from "../../../../../src/components/Context/injectEnvironment";

describe("Context::injectEnvironment", () => {
  const run = (description, mywindow, expectedXdm) => {
    it(description, () => {
      const xdm = {};
      injectEnvironment(mywindow)(xdm);
      expect(xdm).toEqual(expectedXdm);
    });
  };

  run(
    "uses the correct width and height",
    {
      screen: { width: 1001, height: 1002 },
      innerWidth: 1003,
      innerHeight: 1004,
      document: {
        documentElement: {
          clientWidth: 1005,
          clientHeight: 1006
        }
      }
    },
    {
      environment: {
        type: "browser",
        browserDetails: {
          viewportWidth: 1005,
          viewportHeight: 1006
        }
      }
    }
  );

  run(
    "handles negative width and height",
    {
      document: {
        documentElement: {
          clientWidth: -10,
          clientHeight: -20
        }
      }
    },
    {
      environment: {
        type: "browser"
      }
    }
  );

  run(
    "handles negative width",
    {
      document: {
        documentElement: {
          clientWidth: -10,
          clientHeight: 42
        }
      }
    },
    {
      environment: {
        type: "browser",
        browserDetails: {
          viewportHeight: 42
        }
      }
    }
  );

  run(
    "handles missing width and height",
    {
      document: {
        documentElement: {}
      }
    },
    {
      environment: {
        type: "browser"
      }
    }
  );

  run(
    "handles missing documentElement",
    {
      document: {}
    },
    {
      environment: {
        type: "browser"
      }
    }
  );
});
