const path = require( 'path' )
// const run = require( './webpack' )
const { run } = require( '@venkatperi/webpack-helper' )
const pkg = require( './package.json' )

const modules = [
  'mode',
  ['vue', {}],
  'ts',
  ['style', {
    cssLoader: {
      modules: false,
      localIdentName: '[name]-[local]',
    },
  }],
  'img',
  'ext',
  'devServer',
  'misc',
  'dev',
  'prod',
  ['chunkHashReplace', {
    src: 'index.html',
    dest: 'dist/index.html',
  }],
]
const variants = [
  'umd',
]

let cwd = __dirname
module.exports = run( { variants, modules, cwd }, ( config ) => {
  config
    .entry( 'simple-example' )
    .add( './src/main.ts' )

  config.baseUrl = '/dist'

  config.output
    .path( path.resolve( __dirname, './dist' ) );
} )

