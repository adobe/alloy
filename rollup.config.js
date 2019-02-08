import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/atag.js',
    format: 'umd',
    name: 'atag'
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({
      babelrc: false,
      presets: [['@babel/env', { 
        modules: false,
        targets: {
          "ie": 10
        }
      }]]
  })
  ]
};
