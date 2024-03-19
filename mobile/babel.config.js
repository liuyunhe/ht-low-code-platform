module.exports = {
    presets: [
        [
            '@vue/app',
            {
                useBuiltIns: 'entry',
                polyfills: [
                    'es6.array.iterator',
                    'es6.promise',
                    'es7.promise.finally',
                    'es6.symbol',
                    'es7.array.includes',
                    'es6.string.includes',
                    'es6.array.find',
                    'es6.array.from',
                    'es6.object.assign'
                ]
            }
        ]
    ],
    plugins: [
        ['import', {
            libraryName: 'vant',
            libraryDirectory: 'es',
            style: true
        }, 'vant'],
        "@babel/plugin-proposal-optional-chaining",
        "@babel/plugin-proposal-nullish-coalescing-operator"
    ]
};