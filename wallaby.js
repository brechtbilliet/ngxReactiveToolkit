process.env.BABEL_ENV = 'test';

module.exports = function (wallaby) {
    const path = require('path');
    const ts = require(path.join(wallaby.localProjectDir, 'node_modules/typescript'));
    return {
        files: [
            'src/**/*.ts',
            '!src/**/*.spec.ts',
            'package.json'
        ],
        tests: [
            'src/**/*.spec.ts',
        ],
        env: {
            type: 'node',
            runner: 'node'
        },
        compilers: {
            'src/**/*.ts': wallaby.compilers.typeScript(Object.assign(require('./tsconfig.jest.json'), {typescript: ts}))
        },
        testFramework: 'jest',
        debug: true,
        bootstrap: function (wallaby) {
            wallaby.testFramework.configure({
                'globals': {
                    '__TS_CONFIG__': 'tsconfig.jest.json'
                },
                'setupTestFrameworkScriptFile': './test-bundle.js'
            });
        }
    };
};
