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

  function initHighlighter(routeName) {
    console.log("Config " + routeName + " initiated.");
  }

  var containerEl = document.querySelector(".contents");
  var router = new Router(containerEl, {
    onRoutePostInit: initHighlighter
  });

  router.register("/logenabled", "logenabled", {
    onPostInit: function() {
        alloy("configure", {
            logEnabled: true,
            edgeDomain: "konductor-qe.apps-exp-edge-npe-va6.experience-edge.adobeinternal.net",
            propertyId: "9999999",
            imsOrgId: "53A16ACB5CC1D3760A495C99@AdobeOrg"
          });
    }
  });

  router.register("/nologconfig", "nologconfig", {
    onPostInit: function() {
        alloy("configure", {
            edgeDomain: "konductor-qe.apps-exp-edge-npe-va6.experience-edge.adobeinternal.net",
            propertyId: "9999999",
            imsOrgId: "53A16ACB5CC1D3760A495C99@AdobeOrg"
          });
    }
  });

  router.register("/disablelog", "disablelog", {
    onPostInit: function() {
        alloy("configure", {
            logEnabled: false,
            edgeDomain: "konductor-qe.apps-exp-edge-npe-va6.experience-edge.adobeinternal.net",
            propertyId: "9999999",
            imsOrgId: "53A16ACB5CC1D3760A495C99@AdobeOrg"
          });
    }
  });

  router.register("/event", "event", {
    onPostInit: function() {
          alloy("event", {
            data: {
              key: "value"
            }
          });
    }
  });

  var initRouter = router.init.bind(router);
  window.addEventListener("load", initRouter);
  window.addEventListener("hashchange", initRouter);
})();
