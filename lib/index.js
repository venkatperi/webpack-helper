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
const { findModule, mode, findAllModules } = require( './util' )

let allReqs = {}

function dumpConfig( config ) {
  const { inspect } = require( 'util' )
  console.log( inspect( config, { depth: 10, colors: true } ) )
}

async function findModules( modules, { cwd } ) {
  let res = {}
  for ( let m of modules ) {
    res[m] = await findModule( m, { cwd } )
  }
  return res
}

/**
 *
 * @param modules
 * @param cwd
 * @param init
 */
function processModules( { modules, cwd }, init ) {
  const config = new Config()
  if ( init )
    init( config )

  for ( const _x of modules ) {
    let args = { cwd }
    let module = _x
    if ( Array.isArray( module ) ) {
      if ( module.length > 1 )
        args = Object.assign( {}, args, module[1] )
      module = module[0]
    }
    if ( !allReqs[module] )
      throw new Error( `Module not found: ${module}` )

    allReqs[module]( config, args )
  }
  return config
}

/**
 *
 * @param variants
 * @param modules
 * @param cwd
 * @param init
 * @return {Promise<*>}
 */
async function processVariants( { variants, modules, cwd }, init ) {
  // allReqs = await findModules( [...variants, ...modules], { cwd } )
  allReqs = await findAllModules( { cwd } )

  let configs = variants.map( ( x ) => {
    let cfg = processModules( { modules, cwd }, init )
    if ( mode.production )
      allReqs[x]( cfg, { cwd } )

    let c = cfg.toConfig()
    c.name = x
    return c
  } )

  if ( process.env.DUMP_CONFIG )
    dumpConfig( configs )

  return configs
}

module.exports = processVariants
