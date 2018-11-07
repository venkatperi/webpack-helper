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
const { existsp, npmInstall, readdirp, execp } = require( './util' )

const defaultDeps = ['webpack', 'webpack-cli', 'webpack-chain']

async function findModule( name, { cwd } ) {
  let baseName = `webpack/${name}`
  let mod = path.resolve( cwd, baseName )
  if ( await existsp( mod ) )
    return mod

  mod = path.resolve( __dirname, baseName )
  if ( await existsp( mod ) )
    return mod

  throw new Error( `Module not found: '${name}` )
}

async function installDeps( modules, opts = {} ) {
  let deps = [...defaultDeps]

  for ( let m of modules ) {
    let c = require( await findModule( m, opts ) )
    if ( c.__deps )
      deps.push( ...c.__deps )
  }

  await npmInstall( deps, {
    saveDev: true,
    output: true,
    cwd: opts.cwd,
  } )
}

async function install() {
  console.log( 'working dir: ${opts.cwd}' )
  try {
    let files = await readdirp( path.resolve( __dirname, 'webpack' ) )
    const list = files.filter(
      f => !f.startsWith( '_' )
        && f.endsWith( '.js' )
        && f !== 'index.js' )

    await installDeps( list, {
      cwd: process.cwd(),
    } )
  } catch ( e ) {
    console.log( e )
  }
}


module.exports = install()