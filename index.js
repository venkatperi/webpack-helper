const path = require( 'path' )
const run = require( './lib/index' )
// const { findPackage } = require( './lib/lib/index' )
// const packageDir = findPackage( path.resolve( __dirname, '..' ) )
// if ( !packageDir )
//   throw new Error( 'No package.json found?' )

const defaults = {
  modules: [
    ['vue', {}],
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
