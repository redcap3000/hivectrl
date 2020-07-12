// json pools
var jsonPromiseFetch = require('./jsonPromiseApi.js');
//var twoMinersPromise = new jsonPromiseFetch('https://rvn.2miners.com','api/accounts','RGuttSk2qyFDSdwbhwxSXR5G9wU21gYkdh')
//twoMinersPromise.then(res =>{
//	console.log('two miners account')
//	console.log(res)
//}) 

class poolApi {
	constructor(poolUrl,transformFunction) {
		this.poolUrl = poolUrl
		this.transFunc = (typeof transformFunction == 'function' ? transformFunction : (res)=>{return res})
		if(typeof poolUrl == 'string'){

			return this.returnPoolPromise(poolUrl)
		}else if(poolUrl.length > 0){
			let pools = []
			poolUrl.filter((p)=>{
				pools.push(this.returnPoolPromise(p))
			})
			return pools
		}
	}
	returnPoolPromise(url){
		return new jsonPromiseFetch(url).then(this.transFunc)
	}
}

module.exports = poolApi