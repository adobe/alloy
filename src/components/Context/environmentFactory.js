const getWebGLRenderer = document => {
  const canvas = document.createElement("canvas");
  const gl =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

  if (gl == null) {
    return null;
  }

  const glInfo = gl.getExtension("WEBGL_debug_renderer_info");

  if (glInfo == null) {
    return null;
  }

  const result = gl.getParameter(glInfo.UNMASKED_RENDERER_WEBGL);

  if (result == null) {
    return null;
  }

  return result;
};

export default (window, document, dateProvider) => {
  const webGLRenderer = getWebGLRenderer(document);

  return () => {
    const date = dateProvider();
    const {
      innerWidth,
      innerHeight,
      navigator: {
        connection: { effectiveType }
      }
    } = window;
    return {
      "xdm:environment": {
        "xdm:browserDetails": {
          "xdm:viewportWidth": innerWidth,
          "xdm:viewportHeight": innerHeight,
          "xdm:webGLRenderer": webGLRenderer
        },
        "xdm:connectionType": effectiveType,
        "xdm:placeContext": {
          "xdm:localTime": date.toISOString(),
          "xdm:localTimezoneOffset": date.getTimezoneOffset()
        }
      }
    };
  };
};
