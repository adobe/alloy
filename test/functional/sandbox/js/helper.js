/* eslint-disable */
(function() {
  function Router(contentEl, routerConfig) {
    if (!contentEl) {
      throw new Error("[Router] needs a content element.");
    }

    var routes = {};

    return {
      register: function(path, templateId, lifecycle) {
        routes[path] = {
          name: templateId,
          template: document.getElementById(templateId),
          lifecycle: lifecycle || {}
        };
      },
      init: function() {
        var url = location.hash.slice(1) || "/";
        var route = routes[url];

        if (route) {
          var routeLifecycle = route.lifecycle;

          routerConfig.onRoutePreInit &&
            routerConfig.onRoutePreInit(route.name);
          routeLifecycle.onPreInit && routeLifecycle.onPreInit(route.name);

          contentEl = route.template;

          routerConfig.onRoutePostInit &&
            routerConfig.onRoutePostInit(route.name, contentEl);
          routeLifecycle.onPostInit &&
            routeLifecycle.onPostInit(route.name, contentEl);
        }
      }
    };
  }

  function initHighlighter(routeName) {}

  var containerEl = document.querySelector(".contents");
  var router = new Router(containerEl, {
    onRoutePostInit: initHighlighter
  });

  router.register("/getLibraryInfo", "getLibraryInfo", {
    onPostInit: function() {
      alloy("getLibraryInfo").then(console.log);
    }
  });

  router.register("/debugTrue", "debugTrue", {
    onPostInit: function() {
      alloy("debug", {
        enabled: true
      });
    }
  });

  router.register("/debugFalse", "debugFalse", {
    onPostInit: function() {
      alloy("debug", {
        enabled: false
      });
    }
  });

  router.register("/debugEnabled", "debugEnabled", {
    onPostInit: function() {
      alloy("configure", {
        debugEnabled: true,
        configId: "9999999",
        orgId: "53A16ACB5CC1D3760A495C99@AdobeOrg",
        edgeBasePath: window.edgeBasePath
      });
    }
  });

  router.register("/configlogenable", "configlogenable", {
    onPostInit: function() {
      alloy("configure", {
        errorsEnabled: false,
        debugEnabled: true,
        edgeBasePath: window.edgeBasePath
      });
    }
  });

  router.register("/nologconfig", "nologconfig", {
    onPostInit: function() {
      alloy("configure", {
        configId: "9999999",
        orgId: "53A16ACB5CC1D3760A495C99@AdobeOrg",
        edgeBasePath: window.edgeBasePath
      });
    }
  });

  router.register("/disablelog", "disablelog", {
    onPostInit: function() {
      alloy("configure", {
        debugEnabled: false,
        configId: "9999999",
        orgId: "53A16ACB5CC1D3760A495C99@AdobeOrg",
        edgeBasePath: window.edgeBasePath
      });
    }
  });

  router.register("/event", "event", {
    onPostInit: function() {
      alloy("event", {
        // TODO: Change data to match final XDM schema.
        xdm: {
          key: "value"
        }
      }).catch(ex => {
        console.log(ex);
      });
    }
  });

  var initRouter = router.init.bind(router);
  window.addEventListener("load", initRouter);
  window.addEventListener("hashchange", initRouter);
})();
