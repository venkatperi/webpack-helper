/*
 * //  Copyright 2018, Venkat Peri.
 * //
 * //  Permission is hereby granted, free of charge, to any person obtaining a
 * //  copy of this software and associated documentation files (the
 * //  "Software"), to deal in the Software without restriction, including
 * //  without limitation the rights to use, copy, modify, merge, publish,
 * //  distribute, sublicense, and/or sell copies of the Software, and to permit
 * //  persons to whom the Software is furnished to do so, subject to the
 * //  following conditions:
 * //
 * //  The above copyright notice and this permission notice shall be included
 * //  in all copies or substantial portions of the Software.
 * //
 * //  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * //  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * //  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
 * //  NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * //  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * //  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * //  USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import * as Config from "webpack-chain"
import { ModuleArgs, ModuleFn, ModuleOpts } from "../types"

let moduleName = 'autodll-webpack-plugin'
let moduleFriendlyName = 'autoDll'
const defaultOpts = {
    filename: '[name].js',
    entry: {vendor: []},
}

let fn: ModuleFn = (config: Config, opts: ModuleOpts, args: ModuleArgs) => {
    const Plugin = require(moduleName)

    config.plugin(moduleFriendlyName)
          .use(Plugin, [Object.assign({context: opts.cwd}, defaultOpts)])
          .when(config.module.rules.has('vue'),
              plugin => plugin.tap((_args) => {
                  let res = Object.assign({}, _args[0])
                  if (res.entry.vendor.indexOf('vue') < 0) {
                      res.entry.vendor.push('vue')
                  }
                  return [res]
              }))
          .tap(_args => [Object.assign({}, _args[0], args.plugin)])

}

module.exports = Object.assign(fn, {
    __deps: [moduleName],
})

