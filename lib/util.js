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


const statp = promisify( fs.stat )
const existsp = fileExists
const readdirp = promisify( fs.readdir )

async function dirExists( dir ) {
  try {
    let stat = await statp( dir )
    return stat.isDirectory()
  } catch ( e ) {
    if ( e.errno !== -2 )
      throw e
  }
}

async function fileExists( file ) {
  try {
    let stat = await statp( file )
    return stat.isFile()
  } catch ( e ) {
    if ( e.errno !== -2 )
      throw e
  }
}

async function findUp( name, dir = __dirname ) {
  let res = await fileExists( path.resolve( dir, name ) )
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


let modulePaths = process.env.WEBPACK_HELPER_MODULE_PATH
modulePaths = modulePaths ? modulePaths.split( ';' ) : []

async function findModule( name, { cwd } ) {
  let dirs = [cwd, ...modulePaths, __dirname]

  for ( let d of dirs ) {
    let mod = path.resolve( d, name )
    if ( await fileExists( mod ) )
      return mod
  }

  throw new Error( `Module not found: '${name}` )
}


async function findAllModules( { cwd } ) {
  let dirs = [cwd, ...modulePaths, __dirname]
  let modules = {}

  for ( let d of dirs ) {
    let wdir = path.resolve( d, 'webpack' )
    if ( await dirExists( wdir ) ) {
      let files = (await readdirp( wdir )).filter(
        f => !f.startsWith( '_' )
          && f.endsWith( '.js' )
          && f !== 'index.js' ).map( x => path.resolve( wdir, x ) )

      for (let f of files ) {
        let name = path.basename(f).split('.')[0]
        modules[name] = require( f )
      }
    }
  }

  return modules
}

function dumpConfig( config ) {
  const { inspect } = require( 'util' )
  console.log( inspect( config, { depth: 10, colors: true } ) )
}

module.exports = {
  readdirp,
  getMode,
  mode,
  execp,
  findUp,
  findPackage,
  npmInstall,
  existsp,
  findModule,
  modulePaths,
  findAllModules,
  fileExists,
  dirExists,
  dumpConfig
}
