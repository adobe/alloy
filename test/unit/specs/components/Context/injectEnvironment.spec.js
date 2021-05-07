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
          offsetWidth: 1005,
          offsetHeight: 1006
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
          offsetWidth: -10,
          offsetHeight: -20
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
          offsetWidth: -10,
          offsetHeight: -42
        }
      }
    },
    {
      environment: {
        type: "browser",
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

  run(
    "handles 0 height and width",
    {
      document: {
        documentElement: {
          offsetWidth: 0,
          offsetHeight: 0
        }
      }
    },
    {
      environment: {
        type: "browser",
        browserDetails: {
          viewportWidth: 0,
          viewportHeight: 0
        }
      }
    }
  );
  run(
    "handles floating point height and width",
    {
      document: {
        documentElement: {
          offsetWidth: 10,
          offsetHeight: 4.2
        }
      }
    },
    {
      environment: {
        type: "browser",
        browserDetails: {
          viewportWidth: 10,
          viewportHeight: 4
        }
      }
    }
  );
});
