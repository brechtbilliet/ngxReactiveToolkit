const tsc = require('typescript');
const tsConfig = require('./tsconfig.jest.json');

module.exports = {
    process(src, path) {
        if (path.endsWith('.ts')) {
            // when we are dealing with typescript files
            // it's important to compile it to javascript first
            // and afterwards compile it through babel
            const compiled = tsc.transpile(src, tsConfig.compilerOptions, path, []);
            return transpileJs(compiled);
        }
        if (path.endsWith('.js')) {
            return transpileJs(src);
        }
        return src;
    }
};

function transpileJs(src) {
    return require('babel-core').transform(
        src, {
            sourceMap: true,
            "presets": ["es2015", "stage-0"]
        });
}