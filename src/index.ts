import * as Webpack from "webpack"
import * as Config from "webpack-chain"
import Logger from './Logger'
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
import { Env, InitCallback, Modules, ResolvedModules, Variants } from "./types"
import { dumpConfig, findAllModules, mode } from "./util"

const LOG = Logger('webpack-helper')

export let allReqs: ResolvedModules = {}

/**
 *
 * @param modules
 * @param cwd
 * @param init
 * @param buildDir
 * @param webpack
 * @param variant
 * @return {Config}
 * @param env
 */
export function processModules(variant: string,
    cwd: string,
    buildDir: string,
    webpack: any,
    modules: Modules,
    env: Env,
    init: InitCallback): Config {

    LOG.i('processModules', variant, modules)

    const config = new Config()
    config.context(cwd)
    if (init) {
        init(config)
    }

    for (let [module, opts] of Object.entries(modules)) {
        if (opts) {
            if (!allReqs[module]) {
                throw new Error(`Module not found: ${module}`)
            }
            LOG.i('module', module, opts)


            let args = typeof opts === 'boolean' ? {} : opts
            allReqs[module](config,
                {cwd, mode, buildDir, webpack, variant, env},
                args,
            )
        }
    }
    return config
}

/**
 *
 * @param config
 * @return {any | string}
 */
function speedMeasure(config: Webpack.Configuration): Webpack.Configuration {
    const SMR = require('speed-measure-webpack-plugin')
    const smr = new SMR()
    return smr.wrap(config)
}

/**
 *
 * @return {Promise<webpack.Configuration[]>}
 * @param variants
 * @param modules
 * @param cwd
 * @param buildDir
 * @param webpack
 * @param init
 */
export async function webpackHelper(
    variants: Variants,
    // modules: Modules,
    cwd: string,
    buildDir: string,
    webpack: any,
    init: InitCallback): Promise<Webpack.Configuration[]> {

    const env: Env = {}

    LOG.i('init', variants, cwd, buildDir)

    allReqs = await findAllModules(cwd)

    let args = {}
    let configs = []

    for (let [variant, modules] of Object.entries(variants)) {
        let cfg = await processModules(variant,
            cwd, buildDir, webpack,
            modules, env, init)

        allReqs[variant](cfg, {cwd, buildDir, mode, env}, args)

        let c = cfg.toConfig()
        c.name = variant
        if (modules.speedMeasure) {
            c = speedMeasure(c)
        }
        configs.push(c)
    }


    if (process.env.DUMP_CONFIG) {
        dumpConfig(configs)
    }

    return configs
}

