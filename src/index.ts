import * as Webpack from "webpack"
import * as Config from "webpack-chain"
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
import { InitCallback, ModuleList, ResolvedModules } from "./types"
import { dumpConfig, findAllModules, mode } from "./util"


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
 */
export function processModules(variant: string, cwd: string, buildDir: string,
    webpack: any, modules: ModuleList, init: InitCallback): Config {

    const config = new Config()
    if (init) {
        init(config)
    }

    for (let [module, opts] of Object.entries(modules)) {
        if (opts) {
            if (!allReqs[module]) {
                throw new Error(`Module not found: ${module}`)
            }

            let args = typeof opts === 'boolean' ? {} : opts
            allReqs[module](config,
                {cwd, mode, buildDir, webpack, variant},
                args,
            )
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
 * @return {Promise<webpack.Configuration[]>}
 * @param buildDir
 * @param webpack
 */
export async function webpackHelper(variants: string[],
    modules: ModuleList, cwd: string, buildDir: string, webpack: any,
    init: InitCallback): Promise<Webpack.Configuration[]> {
    allReqs = await findAllModules(cwd)

    let args = {}
    let configs = variants.map((variant) => {
        let cfg = processModules(variant, cwd, buildDir, webpack, modules, init)

        if (mode.production) {
            allReqs[variant](cfg, {cwd, buildDir, mode}, args)
        }

        let c = cfg.toConfig()
        c.name = variant
        return c
    })

    if (process.env.DUMP_CONFIG) {
        dumpConfig(configs)
    }

    return configs
}

