expect  = require('chai').expect;
should = require('chai').should();



const port = (process.env.PORT || 5500)

require('../index.js')

it('Enviornment Variables',function(done){
    //process.env.hiveosAccessToken
	expect(process.env.hiveosAccessToken).to.be.string
    expect(process.env.hiveosLogin).to.be.string
    expect(process.env.hiveosLogin).to.be.string
	done()
})

it('Hive Miners Variable',function(done){
    expect(hiveMiners).to.be.an('object')
    done()
})
/* TODO
 it('Waiting 30 seconds for data',function(done){
    this.timeout(1000 * 30)
    console.log(hiveMiners[0])
    //expect()
    done()
})
*/