const tsc = require('typescript');
const tsConfig = require('./tsconfig.jest.json');

module.exports = {
  process(src, path) {
    if (path.endsWith('.ts') || path.endsWith('.js')) {
      return tsc.transpile(src, tsConfig.compilerOptions, path, []);
    }

    return src;
  }
};
