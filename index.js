const path = require( 'path' )
const run = require( './lib/index' )

const defaults = {
  modules: [
    'vue',
    'ts',
    ['style', {
      cssLoader: {
        modules: true,
        localIdentName: '[folder]-[name]-[local]',
      },
    }],
    'img',
    'ext',
    'devServer',
    'misc',
    'dev',
    'prod',
  ],

  variants: [
    'lib',
    'umd',
  ],
}

module.exports = {
  run,
  defaults,
}
