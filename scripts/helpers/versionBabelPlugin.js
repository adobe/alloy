import { createRequire } from "module";

const require = createRequire(import.meta.url);

const version = null;
const getVersion = ({ opts: { cwd } }) => {
  if (version) {
    return version;
  }

  // eslint-disable-next-line import/no-dynamic-require
  const packageJson = require(`${cwd}/package.json`);
  return packageJson.version;
};

export default (_ref) => {
  const t = _ref.types;

  return {
    visitor: {
      // __VERSION__
      ReferencedIdentifier(path, state) {
        const identifier = state.opts.identifier;
        const transform = identifier === undefined ? true : identifier; // 默认转换

        const define = state.opts.define || "__VERSION__"; // 默认值
        if (transform && path.node.name === define) {
          path.replaceWith(t.valueToNode(getVersion(state)));
        }
      },
      // "__VERSION__"
      StringLiteral(path, state) {
        const stringLiteral = state.opts.stringLiteral;
        const transform = stringLiteral === undefined ? true : stringLiteral;

        const define = state.opts.define || "__VERSION__";
        if (transform && path.node.value === define) {
          path.replaceWith(t.valueToNode(getVersion(state)));
        }
      },
    },
  };
};
