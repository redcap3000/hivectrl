
/*
	example of how to load from the context of another script
	(change require from ./index.js to hivectr when installed as a module
	in your own project)

	edit config.json with your hiveos api/login info

	Good example of a pattern I learned through trial and error. Seems to work.
	Maybe its common. IDK.

	This could be baked into the main library but it complicates it unnessarily
	to perform this all properly with the full advantage of async javascript.

	-- wont relogin each time access key is needed
*/
const hiveOS = require('../index.js')

let getAllWorkers = function(){
	return hiveOS.getAllWorkers().then((r) => {
		let farm = []

		let filterWorkersInfo = function(worker){
			// the final step.
			let exclude = [	'name','algo','gpu_summary','gpu_info','stats']

			var result = {}
			for(let k in worker[0]){
				//console.log(worker[0][k])
				if(exclude.indexOf(k) > -1){

					console.log(':'+k+':')
					//
					//result[k]={}
					if(k == 'gpu_summary'){
						result[k]=worker[0][k]['gpus']
					}else if(k == 'gpu_info'){
						let t = worker[0][k]
						let rows = []
						t.filter(function(x){
							let card = x
							console.log(card)
							let gpuInfo = {
								algo:card.algo,
								bus_id: card.bus_id,
								bus_number: card.bus_number,
								index: card.index,
								power_limit : card.power_limit,
								cardInfo: card.brand + ' - ' + card.model + ' - ' + card.details.mem
							}
							rows.push(gpuInfo)

						})
							
						//console.log(rows)
						result[k] = rows
					}else{
						result[k]=worker[0][k]
					}
				}else{
					//console.log(k)
				}
			}
			return result

		}
		// potentially write the filtered result to a datastore 
		// but for now just write to console, handy es6 syntax FTW!
		let displayWorkersInfo = console.log 
		r.filter( (f,i) => {
			f.then(filterWorkersInfo).
				then(displayWorkersInfo).
					catch(console.log)
		})		
	}).catch( (e) => {
		console.log("HiveOS getFarms() error")
		console.log(e)
		return false
	})
}

getAllWorkers().then(setTimeout(getAllWorkers,15 * 1000)).catch((e)=>{
	console.log('getAllWorkers_interval error')
	console.log(e)
})
