import { ChildProcess, exec, ExecException } from "child_process";
import * as fs from "fs"
import * as path from "path"
import { promisify } from "util"
import Logger from "./Logger"
import { ExecpOptions, Mode, ResolvedModules } from "./types"

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

const LOG = Logger('WH:util')

const statp = promisify(fs.stat)
const readdirp = promisify(fs.readdir)

let _modulePaths = process.env.WEBPACK_HELPER_MODULE_PATH
let modulePaths = _modulePaths ? _modulePaths.split(';') : []

let m = getMode()

export const mode: Mode = {
    value: m,
    production: m === 'production',
    development: m === 'development',
}

export async function dirExists(dir: string): Promise<boolean> {
    try {
        let stat = await statp(dir)
        return stat.isDirectory()
    } catch (e) {
        if (e.errno !== -2) {
            throw e
        }
        return false
    }
}

export async function fileExists(file: string): Promise<boolean> {
    try {
        let stat = await statp(file)
        return stat.isFile()
    } catch (e) {
        if (e.errno !== -2) {
            throw e
        }
        return false
    }
}

export async function findUp(name: string,
    dir = __dirname): Promise<string | null> {
    let res = await fileExists(path.resolve(dir, name))
    if (res) {
        return dir
    }
    let parent = path.resolve(dir, '..')
    if (parent.length > 0 && parent !== dir) {
        return await findUp(name, parent)
    }
    return null
}

export async function findPackage(dir: string): Promise<string | null> {
    return await findUp('package.json', dir)
}

export function execp(cmd: string, opts?: ExecpOptions): Promise<any> {
    return new Promise((resolve, reject) => {
        const child: ChildProcess = exec(cmd, opts,
            (err: ExecException | null, stdout: string | Buffer,
                stderr: string | Buffer) =>
                err ? reject(err) : resolve({stdout, stderr,}));

        if (opts && opts.stdout) {
            child.stdout.pipe(opts.stdout);
        }
        if (opts && opts.stderr) {
            child.stderr.pipe(opts.stderr);
        }
    })
}

export function getMode(): string {
    let m = 'development'
    if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
        m = 'production'
    }
    return m
}

export async function npmInstall(packages: string | Array<string>,
    opts: any = {}): Promise<void> {
    if (packages.length === 0 || !packages || !packages.length) {
        throw new Error('No packages found')
    }

    if (typeof packages === 'string') {
        packages = [packages];
    }

    const cmdString = 'npm install '
        + packages.join(' ') + ' '
        + (opts.global ? ' -g' : '')
        + (opts.save ? ' --save' : '')
        + (opts.saveDev ? ' --save-dev' : '')
        + (opts.legacyBundling ? ' --legacy-bundling' : '')
        + (opts.noOptional ? ' --no-optional' : '')
        + (opts.ignoreScripts ? ' --ignore-scripts' : '');

    console.log(cmdString)

    await execp(cmdString, {
        encoding: 'utf8',
        cwd: opts.cwd,
        stdout: process.stdout,
        stderr: process.stderr,
    })
}


export async function findModule(name: string,
    {cwd}: { cwd: string }): Promise<any> {
    let dirs = [cwd, ...modulePaths, __dirname]

    for (let d of dirs) {
        let mod = path.resolve(d, name)
        if (await fileExists(mod)) {
            return mod
        }
    }

    throw new Error(`Module not found: '${name}`)
}


export async function findAllModules(cwd: string): Promise<ResolvedModules> {
    let dirs: string[] = [cwd, ...modulePaths, __dirname]
    let modules: ResolvedModules = {}

    LOG.i('findAllModules', cwd)

    for (let d of dirs) {
        let wdir = path.resolve(d, 'webpack')
        if (await dirExists(wdir)) {
            LOG.i('loading modules from', wdir)
            let files: string[] = (await readdirp(wdir))
                .filter((f: string) => !f.startsWith('_')
                    && f.endsWith('.js')
                    && f !== 'index.js')
                .map((x: string) => path.resolve(wdir, x))

            for (let f of files) {
                let name = path.basename(f).split('.')[0]
                try {
                    LOG.i('require', name)
                    modules[name] = require(f)
                } catch (e) {
                    LOG.e(name, e)
                }
            }
        }
    }

    return modules
}

export function dumpConfig(config: any): void {
    const {inspect} = require('util')
    console.log(inspect(config, {depth: 10, colors: true}))
}

