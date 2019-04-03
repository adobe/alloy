const osControl = require("os");
const fsControl = require("fs");
const pathFileNameChrome = "reports/Chrome.json";
const pathFileNameFirefox = "reports/Firefox.json";
const jsonChrome = require("../../../" + pathFileNameChrome);
const jsonFirefox = require("../../../" + pathFileNameFirefox);
const browserMetadata = require("./metadata.json");
let osName = osControl.platform();
let osRelease = osControl.release();

if (osName === "darwin") {
  osName = "osx";
}
let platformData = {
  name: osName,
  version: osRelease
};

browserMetadata.metadataChrome.platform = platformData;
browserMetadata.metadataFirefox.platform = platformData;

function prepareJson() {
  for (let index of jsonChrome) {
    index.metadata = browserMetadata.metadataChrome;
  }
  for (let index of jsonFirefox) {
    index.metadata = browserMetadata.metadataFirefox;
  }
  fsControl.writeFile(
    pathFileNameChrome,
    JSON.stringify(jsonChrome, null, 2),
    "utf-8",
    function(err) {
      if (err) {
        return console.log(err);
      }
    }
  );
  fsControl.writeFile(
    pathFileNameFirefox,
    JSON.stringify(jsonFirefox, null, 2),
    "utf-8",
    function(err) {
      if (err) {
        return console.log(err);
      }
    }
  );
}

prepareJson();
