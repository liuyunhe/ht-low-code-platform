// 

module.exports = {
  presets: [
    [
      '@vue/app', {
        // polyfills: [
        //   es6.promise,
        //   es6.symbol,
        // ],
        useBuiltIns: 'entry'
      }
    ]
  ],
  "plugins": [
    "@babel/plugin-proposal-export-default-from",
    "@babel/plugin-proposal-optional-chaining",
    "@babel/plugin-proposal-nullish-coalescing-operator",
    "@babel/plugin-proposal-numeric-separator"
  ]
}