const path = require( 'path' )
const { findPackage } = require( '../lib/util' )

describe( 'util', function () {
  describe( 'package location', async function () {
    let dir = await findPackage(path.resolve(__dirname, '../..'))
    console.log(dir)
  } )
} )
