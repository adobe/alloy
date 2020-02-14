/* eslint-disable */
!(function(n, o) {
  o.forEach(function(o) {
    n[o] ||
      ((n.__alloyNS = n.__alloyNS || []).push(o),
      (n[o] = function() {
        const u = arguments;
        return new Promise(function(i, l) {
          n[o].q.push([i, l, u]);
        });
      }),
      (n[o].q = []));
  });
})(window, ["alloy", "instance2"]);
