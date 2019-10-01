
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


let farms = hiveOS.getAllWorkers().then((r) => {
	let farm = []

	let filterWorkersInfo = function(worker){
		// the final step.
		let exclude = [	'password','platform','tag_ids',
						'mirror_url','ip_addresses','remote_addresses',
						'vpn','has_amd','has_nvidia',
						'lan_config','migrated','has_octofan',
						'versions','commands']

		var result = {}
		for(let k in worker[0]){
			if(exclude.indexOf(k) == -1){
				console.log(':'+k+':')
				//console.log(worker[0][k])
				//result[k]={}
				result[k]=worker[0][k]
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
