import { expect } from 'chai';
import 'mocha'
import { webpackHelper } from '../src'

let variants = ['cjs']
let modules = ['dev', 'prod']
let cwd = __dirname
let buildDir = 'dist'

describe('webpack helper', () => {

    it('generates a webpack config function', () => {
        expect(webpackHelper([])).to.be.a.instanceOf(Function)
    })


    // it('validates args', async () => {
    //     const helper = webpackHelper([])
    //     await helper(variants, modules, cwd, buildDir, undefined, (x) => {
    //
    //     })
    // })


})

