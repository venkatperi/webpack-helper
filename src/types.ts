import { ExecOptionsWithStringEncoding } from "child_process"
import { Writable } from "stream";
import * as Webpack from "webpack"
import * as Config from "webpack-chain"

export type Lifecycle = 'process' | 'pre' | 'post'

export type Mode = {
    value: string;
    production: boolean;
    development: boolean
}

export type InitCallback = (config: Config, variant: string) => void

export type ModuleOpts = {
    cwd?: string,
    buildDir?: string,
    variant?: string,
    webpack?: any
    isLocal?: boolean
    mode: Mode,
    env: Env
}

export type ModuleFn = (config: Config, opts: ModuleOpts,
    args: ModuleArgs) => void

export type WrapFn = (config: Webpack.Configuration, opts: ModuleOpts,
    args: ModuleArgs) => Webpack.Configuration

export type ModuleProps = {
    __deps: Array<string>
    wrap?: WrapFn
}

export type HelperModule = ModuleFn & ModuleProps

export type ExecpOptions = ExecOptionsWithStringEncoding & {
    stdout?: Writable
    stderr?: Writable
}

export type ResolvedModules = {
    [k in string]: HelperModule
}

export type Modules = {
    [k in string]: any
}

export type Variants = {
    [k in string]: Modules
}

export type ModuleArgs = {
    [k in string]: any
}

export type Env = { [k in string]: any }
