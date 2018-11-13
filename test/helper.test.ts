import 'mocha'
import { webpackHelper } from '../'
import { expect } from 'chai';

describe('webpack helper', () => {

    it('generates a webpack config function', () => {
        expect(webpackHelper([])).to.be.a.instanceOf(Function)
    })

})

