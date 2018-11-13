import { ExecOptionsWithStringEncoding } from "child_process"
import { Writable } from "stream";
import * as Config from "webpack-chain"

export type Mode = {
    value: string;
    production: boolean;
    development: boolean
}

export type InitCallback = (config: Config) => void

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

export type ModuleDeps = {
    __deps: Array<string>
}

export type HelperModule = ModuleFn & ModuleDeps

export type ExecpOptions = ExecOptionsWithStringEncoding & {
    stdout?: Writable
    stderr?: Writable
}

export type ResolvedModules = {
    [k in string]: HelperModule
}

export type ModuleList = {
    [k in string]: any
}


export type ModuleArgs = {
    [k in string]: any
}

export type Env = { [k in string]: any }
