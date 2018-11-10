const path = require( 'path' )
const webpack = require( 'webpack' )
const { webpackHelper } = require( '@venkatperi/webpack-helper' )

let cwd = __dirname
let buildDir = 'dist'

const modules = {
  mode: true,
  vue: true,
  ts: true,
  style: true,
  img: true,
  ext: true,
  devServer: true,
  misc: true,
  dev: true,
  prod: true,
}

const variants = [
  'cjs',
  'umd',
]

module.exports = webpackHelper( variants, modules, cwd, buildDir, webpack,
  ( config ) => {
    config
      .entry( 'vue-splitter-pane' )
      .add( './src/index.ts' )

    config.output
      .path( path.resolve( __dirname, buildDir ) );
  } )

