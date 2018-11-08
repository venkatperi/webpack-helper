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

const { mode, findAllModules, dumpConfig } = require( './util' )

let allReqs = {}

/**
 *
 * @param modules
 * @param cwd
 * @param init
 * @param buildDir
 * @param webpack
 */
function processModules( { variant, modules, cwd, buildDir, webpack }, init ) {
  const Config = require( 'webpack-chain' )
  const config = new Config()
  if ( init )
    init( config )

  for ( let [module, opts] of Object.entries( modules ) ) {
    if ( opts ) {
      if ( !allReqs[module] )
        throw new Error( `Module not found: ${module}` )

      let args = typeof opts === 'boolean' ? {} : opts
      args.args = args.args || {}
      allReqs[module]( config, {
        cwd,
        mode,
        buildDir,
        webpack,
        variant,
        ...args,
      } )
    }
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
 * @param buildDir
 * @param webpack
 */
async function processVariants( { variants, modules, cwd, buildDir = 'dist', webpack }, init ) {
  allReqs = await findAllModules( { cwd } )

  let args = {}
  let configs = variants.map( ( variant ) => {
    let cfg = processModules( {
      modules,
      cwd,
      buildDir,
      webpack,
      variant,
    }, init )

    if ( mode.production )
      allReqs[variant]( cfg, { cwd, buildDir, args } )

    let c = cfg.toConfig()
    c.name = variant
    return c
  } )

  if ( process.env.DUMP_CONFIG )
    dumpConfig( configs )

  return configs
}

module.exports = processVariants
