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


const { exec } = require( 'child_process' )
const fs = require( 'fs' );
const { promisify } = require( 'util' );
const path = require( 'path' )


const existsp = promisify( fs.exists )
const readdirp = promisify(fs.readdir)

async function findUp( name, dir = __dirname ) {
  let res = await existsp( path.resolve( dir, name ) )
  if ( res ) return dir
  let parent = path.resolve( dir, '..' )
  if ( parent.length > 0 && parent !== dir )
    return await findUp( name, parent )
}

async function findPackage( dir ) {
  return await findUp( 'package.json', dir )
}

function execp( cmd, opts ) {
  opts || (opts = {});
  return new Promise( ( resolve, reject ) => {
    const child = exec( cmd, opts,
      ( err, stdout, stderr ) => err ? reject( err ) : resolve( {
        stdout: stdout,
        stderr: stderr,
      } ) );

    if ( opts.stdout ) {
      child.stdout.pipe( opts.stdout );
    }
    if ( opts.stderr ) {
      child.stderr.pipe( opts.stderr );
    }
  } )
}

function getMode() {
  let m = 'development'
  if ( process.env.NODE_ENV && process.env.NODE_ENV === 'production' )
    m = 'production'
  return m
}

let m = getMode()

const mode = {
  value: m,
  production: m === 'production',
  development: m === 'development',
}


async function npmInstall( packages, opts = {} ) {
  if ( packages.length === 0 || !packages || !packages.length ) {
    throw new Error( 'No packages found' )
  }

  if ( typeof packages === 'string' ) packages = [packages];

  const cmdString = 'npm install '
    + packages.join( ' ' ) + ' '
    + (opts.global ? ' -g' : '')
    + (opts.save ? ' --save' : '')
    + (opts.saveDev ? ' --save-dev' : '')
    + (opts.legacyBundling ? ' --legacy-bundling' : '')
    + (opts.noOptional ? ' --no-optional' : '')
    + (opts.ignoreScripts ? ' --ignore-scripts' : '');

  console.log( cmdString )

  await execp( cmdString, {
    cwd: opts.cwd,
    stdout: process.stdout,
    stderr: process.stderr,
  } )
}

module.exports = {
  readdirp,
  getMode,
  mode,
  execp,
  findUp,
  findPackage,
  npmInstall,
  existsp
}
