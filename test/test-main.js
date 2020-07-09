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

 it('Waiting 5 seconds for data',function(done){

    this.timeout(1000 * 6)

    setTimeout(function () {
        console.log(hiveFarms.hashrates)

        expect(hiveFarms).to.be.an('object')
        for(var farm in hiveFarms){
            var theFarm = hiveFarms[farm]
            var theWorkers = [] 

            for(var wkr in theFarm.workers){
                theWorkers.push(theFarm.workers[wkr].gpus)
            }
            theWorkers.filter(function(w){
                for(var grx in w){
                    w[grx].filter(function(cardData){
                        console.log(cardData)
                    })
                }    
            })
            //console.log(theWorkers)
            
            /*
             {   id: 53778,
                 name: 'redcap3000 farm',
                 timezone: 'America/Anchorage',
                 power_price: 0.19,
                 workers_count: 3,
                 rigs_count: 3,
                 stats:
                  { workers_online: 2,
                    workers_offline: 0,
                    workers_overheated: 1,
                    workers_overloaded: 0,
                    workers_invalid: 0,
                    workers_low_asr: 0,
                    rigs_online: 2,
                    rigs_offline: 0,
                    gpus_online: 10,
                    gpus_offline: 1,
                    gpus_overheated: 2,
                    asics_online: 0,
                    asics_offline: 0,
                    boards_online: 0,
                    boards_offline: 0,
                    boards_overheated: 0,
                    cpus_online: 0,
                    power_draw: 1492,
                    power_cost: 0.28,
                    asr: 99.55 },
                 hardware_power_draw: 120,
                 hashrates: [ [Object] ],
                 hashrates_by_coin: [ [Object] ],
                 gpu_stats: undefined,
                 workers: { '467468': [Object], '471231': [Object], '514929': [Object] } } }
            */

        }
        done();
      }, 1000 * 5);


    //expect(hiveFarms).to.be.an('object')
    //console.log(hiveMiners[0])
    //expect()
    //done()
})