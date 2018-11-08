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

const path = require( 'path' );
const { findAllModules, findModule, existsp, npmInstall, readdirp, execp } = require( './util' )

const defaultDeps = ['webpack:>=4', 'webpack-cli:>=3',
  'webpack-chain:>=5']


async function installDeps( modules, opts = {} ) {
  let deps = [...defaultDeps]

  for ( let [name, m] of Object.entries( modules ) ) {
    let dep = m.__deps || []
    deps.push( ...dep )
  }

  if ( opts.isLocal ) {
    let peer = {}
    for ( let d of deps ) {
      let parts = d.split( ':' )
      peer[parts[0]] = parts.length > 1 ? parts[1] : ''
    }
    console.log( JSON.stringify( peer ) )
  }
  else {
    let names = deps.map( x => x.split( ':' )[0] )
    await npmInstall( names, {
      saveDev: true,
      output: true,
      cwd: opts.cwd,
    } )
  }
}

async function install() {
  let cwd = process.cwd()
  let basePath = path.resolve( __dirname, '..' )
  let isLocal = cwd === basePath

  try {
    let modules = await findAllModules( { cwd } )

    isLocal = false
    await installDeps( modules, { cwd, isLocal } )
  } catch ( e ) {
    console.log( e )
  }
}


module.exports = install()
