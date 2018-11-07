//  Copyright 2018, Venkat Peri.
//
//  Permission is hereby granted, free of charge, to any person obtaining a
//  copy of this software and associated documentation files (the
//  "Software"), to deal in the Software without restriction, including
//  without limitation the rights to use, copy, modify, merge, publish,
//  distribute, sublicense, and/or sell copies of the Software, and to permit
//  persons to whom the Software is furnished to do so, subject to the
//  following conditions:
//
//  The above copyright notice and this permission notice shall be included
//  in all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
//  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
//  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
//  NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
//  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
//  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
//  USE OR OTHER DEALINGS IN THE SOFTWARE.

const Config = require( 'webpack-chain' )
const { mode } = require( './util' )

function dumpConfig( config ) {
  const { inspect } = require( 'util' )
  console.log( inspect( config, { depth: 10, colors: true } ) )
}

function processModules( { modules, cwd }, init ) {
  const config = new Config()

  init( config )

  modules.forEach( _x => {
    let args = { cwd }
    let x = _x
    if ( Array.isArray( x ) ) {
      if ( x.length > 1 )
        args = Object.assign( {}, args, x[1] )
      x = x[0]
    }
    return require( `./webpack/${x}` )( config, args );
  } );
  return config
}

function processVariants( { variants, modules, cwd }, init ) {
  let configs = variants.map( x => {
    let cfg = processModules( { modules, cwd }, init )
    if ( mode.production )
      require( `./webpack/${x}` )( cfg, { cwd } )

    cfg.name = x
    return cfg
  } ).map( x => x.toConfig() )

  if ( process.env.DUMP_CONFIG )
    dumpConfig( configs )

  return configs
}

module.exports = processVariants
