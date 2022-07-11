const Handlebars = require("handlebars");
const fs = require("fs");
const { isUndefined } = require("@adobe/target-tools");

Handlebars.registerHelper("safeString", function (inputData) {
  return new Handlebars.SafeString(inputData);
});

const templateCache = {};

function loadHandlebarsTemplate(
  fileName = "index",
  templatesPath = "src/templates"
) {
  if (isUndefined(templateCache[fileName])) {
    templateCache[fileName] = Handlebars.compile(
      fs
        .readFileSync(
          `${process.cwd()}/${templatesPath}/${
            fileName.length === 0 ? "index" : fileName
          }.handlebars`
        )
        .toString()
    );
  }

  return templateCache[fileName];
}

module.exports = {
  loadHandlebarsTemplate,
};
