const config = require('./config.json');
process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
});
process.on('SIGINT', () => {
    console.info('SIGINT signal received.');
    //onShutdown()
    process.exit()
});
if(typeof config.hiveosAccessToken != 'undefined' && typeof config.hiveosLogin != 'undefined' && typeof config.hiveosPass != 'undefined'){
    /*
     *
     * EXPRESS JS APP 
     * BEGIN
     *
     */
    var express = require('express');
    var app = express();

    const port = (process.env.PORT || 5000)
    app.use(express.static(__dirname + '/public'));

    app.set('port', port);

    app.listen(port, () => {
        console.log(`Hivectrl listening on port ${port}!`)
        hiveData = {}
        hiveFarms = {}
        let getAllWorkersLoop = function(){
            return getFarmWorkersGpus().then((r)=>{
                console.log(r)
            })
            // i dont think i need this...
            return getAllWorkers().then((r) => {

                let farm = []
                let filterWorkersInfo = function(worker){
                    // the final step.
                    let exclude = [ 'name','algo','gpu_info','stats']
                    result = {}
                    worker.filter(function(w){
                        var theWorker = w
                        // order a workers cards by the cardInfo field
                        var byCard = []
                        for(let k in theWorker){
                            if(exclude.indexOf(k) > -1){
                                var theRow = {}
                                if(k == 'gpu_summary'){
                                    result[k]=theWorker[k]['gpus']
                                }else if(k == 'gpu_info'){
                                    let t = theWorker[k]
                                    let rows = []
                                    t.filter(function(x){
                                        let card = x
                                        // convert power limits from 'W' to integers
                                        for(let l in card.power_limit){
                                            let limit = card.power_limit[l]
                                            if(typeof limit != 'undefined' && limit && limit != null){
                                                card.power_limit[l] = parseInt(limit.split('W')[0].trim())
                                            }
                                        }
                                        // create a more 'general' thing to help select cards of the exact same
                                        // type ... i.e. don't have to individually select 4 1060's to perform
                                        // the same operation, apply to a 'grouping'
                                        let gpuInfo = {
                                            algo:card.algo,
                                            index: card.index,
                                            bus: card.bus_id+' ' + card.bus_num,
                                            power_limit : card.power_limit,
                                            cardInfo: card.model
                                            //cardInfo: card.brand + ' - ' + card.model + ' - ' + card.details.mem
                                        }
                                        rows.push(gpuInfo)
                                        if(typeof byCard[gpuInfo.cardInfo] == 'undefined'){
                                            byCard[gpuInfo.cardInfo]=[]
                                        }
                                        byCard[gpuInfo.cardInfo].push(gpuInfo)
                                        

                                    })
                                    theRow = rows
                                }else{
                                    // gpu summary probably.... 
                                    theRow=theWorker[k]
                                }
                                result[w.name]=theRow
                            }
                        }
                    })
                    return result
                }
                // potentially write the filtered result to a datastore 
                // but for now just write to console, handy es6 syntax FTW!
                let displayWorkersInfo = console.log 
                let storeVar = function(val){
                    hiveData=val
                }
                r.filter( (f,i) => {
                    f.then(filterWorkersInfo).
                        then(storeVar).
                            catch(console.log)
                })      
            }).catch( (e) => {
                console.log("HiveOS getFarms() error")
                console.log(e)
                return false
            })
        }
        getAllWorkersLoop()
        var hiveMainInterval = setInterval(function(){getAllWorkersLoop()},7 * 1000)
    })

    app.get('/flightsheets',function(request,response){
        response.setHeader('Content-Type', 'application/json');
        getFlightsheets()
    })

    app.get('/api', function(request, response) {
        response.setHeader('Content-Type', 'application/json');
        //console.log(hiveMiners)
        response.send(JSON.stringify({
            farms:hiveFarms,
            minerstats:hiveMinerStats
        }));
    })

    app.get('/minerstats', function(request, response) {
        response.setHeader('Content-Type', 'application/json');
        //console.log(hiveMiners)
        response.send(JSON.stringify(hiveMinerStats));
    })
    
    /*
     *
     * EXPRESS JS APP 
     * END
     *
     */
    const baseUrl = 'https://api2.hiveos.farm/api/v2';
    const fetch = require('node-fetch');
    var accessToken = config.hiveosAccessToken;
    hiveMiners = {}
    hiveMinerStats = {}
    hiveFarms = {}
    hiveWorkers={}
    var mainFarmId = 0
    // returns json or a rejected promise
    var normalPromiseCb = function(r){
        if(typeof r != 'undefined'){
            if (!r.ok) {
                r.json().then(data => {
                    console.error(data.message || 'Response error');
                });
                return Promise.reject(r);
            }
            else {
                return r.json();
            }
        }else{
            console.log("Something broke the promise.")
            return false
        }
    }

    function doLogin (login, password) {
        return  fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({login, password})
        }).then(r => {
            if (!r.ok) {
                r.json().then(data => {
                    console.error(data.message || 'Response error');
                });
                return Promise.reject(r);
            }
            else {
                return r.json().then(data => {
                    accessToken = data.access_token;
                    // store elsewhere in a module export?
                    return data;
                });
            }
        })
    }

    function getAllWorkers() {
        return fetchUrl('farms').then(normalPromiseCb).then(r=>{
            const reduceMiner=function(w){
              let r = false
              if(typeof w.data != 'undefined'){
                    let farm = w.data
                    hiveFarms[farm.id] = (typeof hiveFarms[farm.id] == 'undefined' ? {} : farm)
                    r = farm
              }
              return r
            }
            if(r.data.length > 0){
                let data = []
                r.data.filter(function(farm){
                     data.push(fetchUrl(`/farms/${farm.id}/workers`).
                        then(normalPromiseCb).
                            then(reduceMiner).
                                catch(defaultError));
                })
                return data
              
            }else{
           
                return hiveFarms
            }
            return r
        });
    }
    
    function getFarms() {
        return fetchUrl('farms').then(normalPromiseCb)
    }
    function getFarmWorkersGpus() {
        return getFarms().then(function(r,e){
            if(typeof r != 'undefined' && typeof r.data != 'undefined' && r.data.length > 0){
                var farmWorkersGpus = []
                r.data.filter(function(w){
                    var farmInfo={
                        id:                     w.id,
                        name:                   w.name,
                        timezone:               w.timezone,
                        power_price:            w.power_price,
                        workers_count:          w.workers_count,
                        rigs_count:             w.rigs_count,
                        stats:                  w.stats,
                        hardware_power_draw:    w.hardware_power_draw,
                        hashrates:              w.hashrates,
                        hashrates_by_coin:      w.hashrates_by_coin
                    }
                    if(typeof hiveFarms[w.id] == 'undefined'){
                        hiveFarms[w.id]={}
                    }
                    hiveFarms[w.id]=farmInfo
                    if(hiveFarms[w.id] !== farmInfo){
                        console.log("FARM " + w.id + " UPDATED")
                        // HMM.... might be faster to just replace it rather than check.
                    }
                    farmWorkersGpus.push(fetchUrl(`farms/${w.id}/workers`).then(normalPromiseCb))        
                })
            }
            if(typeof farmWorkersGpus != 'undefined' && farmWorkersGpus.length > 0){
                return Promise.all(farmWorkersGpus)
                .then(
                    function(vals){
                        var GPUS=[]
                        vals.filter(function(v){
                            v.data.filter(function(d){
                                var worker = {}
                                var workerId = d.id
                                var farmId = d.farmId
                                // pre process
                                for(var key in d){
                                    var keys = ['id','farm_id','name','units_count',
                                                'active','ip_addresses','remote_address',
                                                'has_amd','has_nvidia','flight_sheet',
                                                'overclock','miners_summary','miners_stats',
                                                'gpu_info','gpu_summary','gpu_stats','miners_summary']
                                    if(keys.indexOf(key) > -1){
                                        if(key == 'remote_address'){
                                            worker[key]=d[key]['ip']
                                        }else if(key == 'miners_summary' || key == 'miners_stats'){
                                            worker[key]=d[key]['hashrates']
                                            if(key == 'miners_stats'){
                                                if(typeof hiveMinerStats[workerId] == 'undefined'){
                                                    hiveMinerStats[workerId]=[]
                                                }
                                                hiveMinerStats[workerId]=worker[key]
                                            }
                                        }else if(key == 'gpu_summary'){
                                            worker[key]=d[key]
                                        }else if(key == 'gpu_info'){
                                            var gpu_info = d[key]
                                            //  give ref keys to combine hashrates clientside
                                             gpu_info.filter(function(gpu){
                                                var newGpu = {
                                                    idx: gpu.index,
                                                    bus:gpu.bus,
                                                    bus_number:gpu.bus_number,
                                                    model: gpu.model,
                                                    min: gpu.power_limit.min,
                                                    max: gpu.power_limit.max,
                                                    def: gpu.power_limit.def
                                                }
                                                // for this would be accessing in a data tree
                                                // with key values ... only show the power information available
                                                var minimumGpuData={
                                                    idx: gpu.index,
                                                    min: gpu.power_limit.min,
                                                    max: gpu.power_limit.max,
                                                    def: gpu.power_limit.def,
                                                    bus_number:gpu.bus_number
                                                }
                                                if(typeof hiveMiners[gpu.worker] == 'undefined'){
                                                    hiveMiners[gpu.worker]=[]
                                                }
                                                var farmId = d.farm_id
                                                var workerId = d.id
                                               
                                                // cross ref existing worker in existing var
                                                if(typeof hiveFarms[farmId] != 'undefined'){
                                                    //hiveFarms[workerId][]
                                                    if(typeof hiveFarms[farmId]['workers'] == 'undefined'){
                                                        hiveFarms[farmId]['workers'] = {}
                                                    }
                                                    if(typeof hiveFarms[farmId]['workers'][workerId] == 'undefined'){
                                                        hiveFarms[farmId]['workers'][workerId] = {}
                                                    }
                                                    if(typeof hiveFarms[farmId]['workers'][workerId]['gpus'] == 'undefined'){
                                                        hiveFarms[farmId]['workers'][workerId]['gpus']={}
                                                    }
                                                    if(typeof hiveFarms[farmId]['workers'][workerId]['gpus'][gpu.model] == 'undefined'){
                                                        hiveFarms[farmId]['workers'][workerId]['gpus'][gpu.model]=[]
                                                    }
                                                    hiveFarms[farmId]['workers'][workerId]['gpus'][gpu.model].push(minimumGpuData)
                                                }else{
                                                    console.log("COULD NOT FIND")
                                                    // probaby return a promise rejection?
                                                    // or force refresh something then try same method again.
                                                    console.log(farmId)
                                                }
                                                GPUS.push(newGpu)
                                            })
                                        }
                                        else if(key == 'gpu_stats'){
                                            var gpuStats=d[key]
                                            var gpuRows=[]
                                            worker[key]=[]
                                            gpuStats.filter(function(g){
                                                worker[key].push({
                                                    temp: g.temp,
                                                    fan: g.fan,
                                                    power: g.power,
                                                    is_overheated: g.is_overheated,
                                                    bus_info: g.bus_id + '#'+g.bus_number
                                                })
                                            })
                                        }else{
                                            worker[key]=d[key]
                                        }
                                    }
                                }
                            })
                            if(typeof miners_stats != 'undefined' && typeof miners_stats.hashrates != 'undefined'){
                                miners_stats.hashrates.filter(function(m){
                                    var newM={}
                                    // filter fields; im using all except dual mined coins.
                                    var fields=['miner','ver','algo','coin','hash','shares']
                                    for(var k in m){
                                        if(fields.indexOf(k) > -1){
                                            newM[k]=m[k]
                                        }
                                    }
                                })
                            }
                        })
                        return GPUS
                    }).catch(defaultError)
                }else{
                    // no farms to lookup
                    console.log('farmWorkersGpus - undefined')
                }
        })
    }
    // IN PROGRESS!! Once i figure out how to deflate the gzip response properly
    function getFlightsheets(){
        // pass farmId to this one
        // get famrs first
        getFarms().then(function(r,e){
            var farms = []
            if(typeof e == 'undefined' || e == null || !e){
                // check for data attr.
                if(typeof r != 'undefined' && typeof r.data != 'undefined'){
                    r.data.filter(function(f){
                        farms.push(f.id)
                    })
                }
            }
            return farms
        }).then(function(farms){
            farms.filter(function(f){
                fetchUrl('farms/'+f+'/fs').then(function(r,e){
                    console.log('fetch farms flight sheet' + f + ' error?:' + e)
                    // TODO Either use something other than fetch / fetchURL (prolly request..)
                    // the returned response is a gzip !!! WHAT A PAIN IN THE ASS.
                    console.log(r.body)

                })

            })
        })
        //return fetchUrl('farms/'+farmId+'/fs').then(normalPromiseCb)
    }

    function defaultError(e){
        console.log('General error')
        if(typeof e.message != 'undefined'){
            console.log(e.message)
        }else{
            console.log(e)
        }
    }
    function getWorkers() {
        if(mainFarmId !== 0){
            return fetchUrl(`farms/${mainFarmId}/workers`).then(normalPromiseCb).catch(defaultError);
        }else{
            // getting farms internally?
            console.log("Populating mainFarmId from 'getWorkers'")
            return this.getFarms().then.getWorkers()
        }
    }
    function fetchUrl(url){
        if(typeof accessToken != 'undefined' && accessToken != config.hiveosAccessToken){
            return fetch(`${baseUrl}/${url}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    }
                })
        }else if(typeof config.hiveosAccessToken != 'undefined' && typeof config.hiveosLogin != 'undefined' && typeof config.hiveosPass != 'undefined'){
            return doLogin(config.hiveosLogin, config.hiveosPass).then(function(){
                return fetchUrl(url)
            }).catch(defaultError)
        }
    }

    module.exports = {
        //getFlightsheets: function(){
        //    return getFlightsheets().catch(defaultError)
        //},
        getAllLocalData : function(){
            return{
                farms: hiveFarms,
                miners: hiveMiners
            }
        },
        getFarms : function(){
            return hiveFarms
        },
        getAllWorkers : function(){
            return getAllWorkers().catch(defaultError)
        },
        getMiners : function(){
            return hiveMiners;
        },
        // encompasses 'getFarms'
        getFarmWorkersGpus : function(){
            return getFarmWorkersGpus().catch(defaultError)
        },
        launchUrl : function(){

        }
    }
}else{
    throw new Error("config.json not found.")
}