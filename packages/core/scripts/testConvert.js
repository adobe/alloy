#!/usr/bin/env node

import { execSync as exec } from "child_process";
import fs from "fs";
import path from "path";
import babel from "@babel/core";

const getFilesRecursively = (directory, files) => {
  const filesInDirectory = fs.readdirSync(directory);
  for (let i = 0; i < filesInDirectory.length; i += 1) {
    const file = filesInDirectory[i];
    const absolute = path.join(directory, file);
    if (fs.statSync(absolute).isDirectory()) {
      getFilesRecursively(absolute, files);
    } else {
      files.push(absolute);
    }
  }
};

const addTopImport = (output) => {
  let optionalImports = [
    "beforeEach",
    "afterEach",
    "afterAll",
    "describe",
    "it",
    "expect",
  ];
  const requiredImports = ["vi"];

  let importIndex = output.indexOf("import") - 1;

  if (importIndex < -1) {
    importIndex = output.indexOf("License.\n*/") + 11;
  }

  optionalImports = optionalImports.filter((i) => output.indexOf(i) !== -1);

  output = `${output.slice(0, importIndex)}\nimport { ${requiredImports.concat(optionalImports.join(", "))} } from 'vitest';\n${output.slice(importIndex + 1)}`;
  return output;
};

const start = 0;
const end = 400;

exec("mkdir -p ./vtest/unit");
// exec("rm -rf ./vtest/unit/*");
//
if (!fs.existsSync("./vtest/unit/constants")) {
  exec("cp -r ./test/unit/constants ./vtest/unit/constants");
}

if (!fs.existsSync("./vtest/unit/helpers")) {
  exec("cp -r ./test/unit/helpers ./vtest/unit/helpers");
}
exec("mkdir -p ./vtest/unit/specs");

const t = babel.types;
const f = [];
getFilesRecursively("./vtest/unit/helpers", f);
getFilesRecursively("./test/unit/specs", f);

f.sort((a, b) => {
  const z = [
    "responsesMock/eventResponses.js",
    "resetMocks.js",
    "functional/helpers/createResponse.js",
  ];

  for (let i = 0; i < z.length; i += 1) {
    if (a.includes(z[i])) {
      return -1;
    }

    if (b.includes(z[i])) {
      return 1;
    }
  }

  return 0;
});

for (let fileIndex = start; fileIndex < f.length; fileIndex += 1) {
  const filePath = f[fileIndex];
  const newDir = path.dirname(filePath).replace(/^test\/unit/, "vtest/unit");
  const newFilePath = path.join(newDir, path.basename(filePath));

  if (!fs.existsSync(newFilePath)) {
    let output = babel.transformFileSync(filePath, {
      plugins: [
        {
          visitor: {
            Identifier(babelPath) {
              if (babelPath.node.name === "callFake") {
                // callFake => mockImplementation
                babelPath.replaceWith(t.identifier("mockImplementation"));
              } else if (babelPath.node.name === "and") {
                if (babelPath.parentPath.node.type === "MemberExpression") {
                  babelPath.parentPath.replaceWith(
                    babelPath.parentPath.get("object"),
                  );
                }
              } else if (babelPath.node.name === "returnValue") {
                babelPath.replaceWith(t.identifier("mockReturnValue"));
              } else if (
                ["toBeTrue", "toBeFalse"].includes(babelPath.node.name)
              ) {
                const booleanValue = babelPath.node.name === "toBeTrue";
                babelPath.replaceWith(t.identifier("toBe"));

                let v = babelPath;
                while (v.parentPath.type !== "ExpressionStatement") {
                  v = v.parentPath;
                }

                v.replaceWith(
                  t.callExpression(v.get("callee").node, [
                    t.booleanLiteral(booleanValue),
                  ]),
                );

                v.stop();
              } else if (babelPath.node.name === "expectAsync") {
                const v = babelPath.findParent(
                  (p) => p.type === "ReturnStatement",
                );

                if (!v) {
                  return;
                }

                let command = "resolves.toBe";
                if (
                  v
                    .get("argument.arguments")
                    .map((n) => n.node.type)
                    .includes("ObjectExpression")
                ) {
                  command = "resolves.toStrictEqual";
                }

                if (
                  ["toBeRejectedWithError", "toBeRejected"].includes(
                    v.get("argument.callee.property").node.name,
                  )
                ) {
                  command = "rejects.toThrowError";
                }

                if (v.get("argument.callee.property").node.name !== "then") {
                  const vPath = v.get("argument.callee.property");
                  vPath.replaceWith(t.identifier(`${command}`));
                  vPath.stop();
                }

                babelPath.replaceWith(t.identifier("expect"));
              } else if (babelPath.node.name === "toThrowMatching") {
                const parent = babelPath.findParent(
                  (p) => p.type === "CallExpression",
                );
                const regExp = parent.get(
                  "arguments.0.body.body.0.argument.callee.object",
                );
                parent
                  .get("callee.property")
                  .replaceWith(t.identifier("toThrowError"));
                parent.get("arguments.0").replaceWith(regExp);
              } else if (babelPath.node.name === "returnValues") {
                const callExpression = babelPath.findParent((p) =>
                  p.isCallExpression(),
                );

                const args = callExpression
                  .get("arguments")
                  .map((n) => n.node.name);

                callExpression.replaceWithSourceString(
                  `${callExpression.get("callee.object").node.name}.${args.map((v) => `mockReturnValueOnce(${v})`).join(".")}`,
                );
              } else if (babelPath.node.name === "toHaveBeenCalledOnceWith") {
                const callExpression = babelPath
                  .findParent((p) => p.isExpressionStatement())
                  .get("expression");

                const args = callExpression.get("arguments").map((a) => a.node);

                babelPath.replaceWith(t.identifier("toHaveBeenNthCalledWith"));

                callExpression.replaceWith(
                  t.callExpression(callExpression.get("callee").node, [
                    t.identifier("1"),
                    ...args,
                  ]),
                );
              } else if (babelPath.node.name === "toBeResolvedTo") {
                babelPath.replaceWith(t.identifier("resolves.toStrictEqual"));
              } else if (babelPath.node.name === "callThrough") {
                const parentMemberExpression = babelPath.findParent((p) =>
                  p.isMemberExpression(),
                );
                const parentCallExpression = parentMemberExpression.findParent(
                  (pp) => pp.isCallExpression(),
                );
                const object = parentMemberExpression.get("object");
                parentCallExpression.replaceWith(object);
              } else if (babelPath.node.name === "calls") {
                const parentPath = babelPath.parentPath.parentPath;
                const callExpressionPath = babelPath.findParent((p) =>
                  p.isCallExpression(),
                );
                if (callExpressionPath) {
                  const pathToKeep = callExpressionPath.get("callee");
                  const args = callExpressionPath.get("arguments");
                  if (parentPath.isMemberExpression()) {
                    babelPath.parentPath.parentPath.replaceWith(
                      babelPath.parentPath,
                    );
                    callExpressionPath.replaceWith(pathToKeep);

                    babelPath.replaceWith(
                      t.identifier(`mock.calls[${args[0]}]`),
                    );
                  }
                }
              }
            },

            MemberExpression(babelPath) {
              if (
                babelPath.node.object.name === "jasmine" &&
                babelPath.node.property.name === "createSpy"
              ) {
                babelPath.parentPath.replaceWith(
                  t.callExpression(
                    t.memberExpression(t.identifier("vi"), t.identifier("fn")),
                    [],
                  ),
                );
              } else if (
                babelPath.node.object.name === "jasmine" &&
                [
                  "stringMatching",
                  "any",
                  "objectContaining",
                  "stringContaining",
                  "arrayContaining",
                ].includes(babelPath.node.property.name)
              ) {
                babelPath.replaceWith(
                  t.memberExpression(
                    t.identifier("expect"),
                    babelPath.node.property,
                  ),
                );
              }
            },

            CallExpression(babelPath) {
              if (
                babelPath.node.callee.type === "MemberExpression" &&
                babelPath.node.callee.object.name === "jasmine" &&
                babelPath.node.callee.property.name === "createSpyObj"
              ) {
                // jasmine.createSpyObj => object with mocks
                const args = babelPath.get("arguments");
                let newProps = [];

                for (let a = 0; a < args.length; a += 1) {
                  const obj = args[a];

                  if (obj && obj.type === "ObjectExpression") {
                    const objectProperties = obj.get("properties");

                    for (let i = 0; i < objectProperties.length; i += 1) {
                      const v = objectProperties[i].get("value");
                      const n = v.node;

                      newProps.push(
                        t.objectProperty(
                          t.identifier(
                            objectProperties[i].get("key").node.name,
                          ),
                          t.callExpression(
                            t.memberExpression(
                              t.callExpression(
                                t.memberExpression(
                                  t.identifier("vi"),
                                  t.identifier("fn"),
                                ),
                                [],
                              ),
                              t.identifier("mockReturnValue"),
                            ),
                            [n],
                          ),
                        ),
                      );
                    }
                  } else if (obj && obj.type === "ArrayExpression") {
                    try {
                      // obj.node.elements
                      newProps = newProps.concat(
                        obj.node.elements.map((element) =>
                          t.objectProperty(
                            t.identifier(element.value),
                            t.identifier("vi.fn()"),
                          ),
                        ),
                      );
                    } catch {
                      // Catch all errors.
                    }
                  }
                }

                if (newProps.length) {
                  babelPath.replaceWith(t.objectExpression(newProps));
                }
              } else if (
                babelPath.node.callee.type === "Identifier" &&
                babelPath.node.callee.name === "spyOn"
              ) {
                // spyOn => vi.spyOn
                const v = babelPath.get("callee");
                v.replaceWith(
                  t.memberExpression(t.identifier("vi"), t.identifier("spyOn")),
                );
              } else if (babelPath.get("callee").node.name === "done") {
                babelPath.remove();
              }
            },
          },
        },
      ],
    }).code;

    output = addTopImport(output);
    exec(`mkdir -p ${newDir}`);
    if (
      ![
        "vtest/unit/specs/components/Personalization/dom-actions/action.spec.js",
        "vtest/unit/specs/components/Personalization/dom-actions/dom/insertBefore.spec.js",
        "vtest/unit/specs/components/Personalization/dom-actions/swapImage.spec.js",
        "vtest/unit/specs/components/Personalization/dom-actions/remapHeadOffers.spec.js",
        "vtest/unit/specs/components/RulesEngine/constants.spec.js",
        "vtest/unit/specs/karmaEntry.spec.cjs",
        "vtest/unit/specs/utils/cookieJar.spec.js",
        "vtest/unit/specs/utils/fireImage.spec.js",
        "vtest/unit/specs/utils/querystring.spec.js",
        "vtest/unit/specs/utils/request/createRequest.spec.js",
        "vtest/unit/specs/utils/request/createRequestPayload.spec.js",
        "vtest/unit/specs/utils/uuid.spec.js",
      ].includes(newFilePath)
    ) {
      exec(`touch ${newFilePath}`);
      fs.writeFileSync(newFilePath, output);
      console.log(`Converted ${newFilePath}`, fileIndex);
    }
  } else {
    console.log(`Skipping ${newFilePath}`, fileIndex);
  }

  if (fileIndex === end) {
    break;
  }
}
