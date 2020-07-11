import config from './config'
import NicehashV2Api from './nicehashV2API'

var log = function () {
	return console.log(...arguments);
}

var algo, pool, order;

const api = new NicehashV2Api(config);

// get server time - required
api.getTime()
	.then(() => {
		log('server time', api.time)
		log('--')
	})

	// get algo settings
	/// api/v2/mining/rigs/activeWorkers/
	.then(() => api.get('/main/api/v2/mining/rigs/activeWorkers/'))
	.then(res => {
		//algo = res.miningAlgorithms[0]; // SCRYPT
		log(res);
		//log('--')
	})

	// get balance
	// .then(() => api.get('/main/api/v2/accounting/accounts2'))
	// .then(res => {
	// 	log('accounts', res);
	// })

	

	.catch(err => {
		if(err && err.response) log(err.response.request.method,err.response.request.uri.href);
		log('ERROR', err.error || err);
	})
