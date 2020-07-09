process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
});
process.on('SIGINT', () => {
    console.info('SIGINT signal received.');
    //onShutdown()
    process.exit()
});


//check for env vars first
fromEnv=false
if(typeof process.env.hiveosAccessToken != 'undefined'){
	fromEnv = true
	config = {}
	config.hiveosAccessToken = process.env.hiveosAccessToken
	if(typeof process.env.hiveosLogin != 'undefined'){
		config.hiveosLogin = process.env.hiveosLogin
		if(typeof process.env.hiveosPass != 'undefined'){
			config.hiveosPass = process.env.hiveosPass
            // load openweather stuff
            if(typeof process.env.openWeatherKey != 'undefined'){
                config.openWeatherKey = process.env.openWeatherKey
            }	
		}else{
			fromEnv = false
		}
	}else{
		fromEnv = false
	}
}else{
    console.log("ENV not found")
}
if(!fromEnv){
//fall back to local
    const fs = require('fs')
    try{
        if (fs.existsSync('./config.json')) {
        //file exists
            config = require('./config.json')
        }else{
            config={}
        }
    }catch(e){
        console.log("error with configuration")
        console.log(e)
        config={}
    }
}


if(typeof config.nicehashKey != 'undefined' && typeof config.nicehashSecret != 'undefined'){
    const NicehashJS = require('nicehashjs2')
    const nhClient = new NicehashJS({
        name: 'kS',
        apiKey: config.nicehashKey, 
        apiSecret: config.nicehashSecret
    })
    console.log(nhClient.getMiningRigsStats(function(e,r){
        console.log(e)
        console.log(r)
    }))
}



// to do /config validator
// steps - on boot - check for change to card order
// on storage store a reference that holds the name of the card + config settings
// match config settings to card type 
// implement 'save order' and 'restore order'
// will apply settings via the card name (try to generate GUID)
// generate GUID of cards
// save map of GUID + card settings (voltage,core,memory,fan)
// generate GUID based on 'order'

// if above changes run the changer or as requested

// always boot os into mantience mode to perform above check
// idea is to save down time when changing card order so that troubleshooting
// is faster (to avoid having to reconfigure cards one by one while hoping whatever miner
// doesnt crash)
if(typeof config.hiveosAccessToken != 'undefined' && typeof config.hiveosLogin != 'undefined' && typeof config.hiveosPass != 'undefined'){
    var tradeOgre = require('./tradeogre.js');
    var openWeather = require('./openweather.js')
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
        getFlightsheets().then(function(){
              //  console.log(hiveFlightsheets)
        }).catch(defaultError)

        let getAllWorkersLoop = function(){
            
            return getFarmWorkersGpus()

            // i dont think i need this...
          
        }
   
        getAllWorkersLoop()
        var hiveMainInterval = setInterval(function(){getAllWorkersLoop()},7 * 1000)
        // trade ogre interval 30 seconds?
        if(typeof tradeOgre != 'undefined' && tradeOgre && typeof tradeOgre.main_loop() != 'undefined'){
            tradeOgre.main_loop()
        }
        if(typeof openWeather != 'undefined' && openWeather){
            openWeather.main_loop()
        }

    })

    app.get('/flightsheets',function(request,response){
        response.setHeader('Content-Type', 'application/json');
        response.send(JSON.stringify( hiveFlightsheets ) )
        //getFlightsheets()
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
    if(typeof tradeOgre != 'undefined' && tradeOgre){
        app.get('/tradeOgre', function(request, response) {
            response.setHeader('Content-Type', 'application/json');
            //console.log(hiveMiners)
            let r = {
                wallets : tradeOgre.wallets(),
                orders : tradeOgre.orders()
            }
            response.send(JSON.stringify(r));
        })
    }

    if(typeof openWeather != 'undefined' && openWeather){
        app.get('/openWeather', function(request, response) {
            response.setHeader('Content-Type', 'application/json');
            response.send(JSON.stringify(openWeather.showCurrentWeather()));
        })     
    }

    app.get('/hivepost/:directive',function(request,response){
        //if(typeof request.params != 'undefined' && typeof request.params['directive'] != 'undefined'){
        //    console.log(request.params)
        //}
        response.send(JSON.stringfy(false))
        return false
    })


    const baseUrl = 'https://api2.hiveos.farm/api/v2';
    const fetch = require('node-fetch');
      // for specific 
    app.get('/herominers-swp/:walletaddress',function(request,response){
        var baseUrl="https://swap.herominers.com/api/live_stats?address="
        if(typeof request.params != 'undefined' && typeof request.params['walletaddress'] != 'undefined'){
            //console.log("SWP LOOKUP BEGIN")
            //console.log(baseUrl+request.params['walletaddress'])
             return fetch(baseUrl+request.params['walletaddress'], 
                    {
                    //method: 'GET' 
                    },function(err,response){
                        //console.log(err)
                        //console.log(response)
                        if(typeof response.data != 'undefined'){
                            response.end(JSON.stringify(response.data))
                        }
                    })
             
        }
        return response.end(JSON.stringify(false))
    })

    /*
     *
     * EXPRESS JS APP 
     * END
     *
     */
    var accessToken = config.hiveosAccessToken;
    hiveMiners = {}
    hiveMinerStats = {}
    hiveFarms = {}
    hiveWorkers={}
    hiveFlightsheets={}

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
        //console.log("GET FARMWORKERS GPUS")
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
                        hashrates_by_coin:      w.hashrates_by_coin,
                        // slightly repetitve???
                        gpu_stats :             w.gpu_stats
                    }
                    if(typeof hiveFarms[w.id] == 'undefined'){
                        hiveFarms[w.id]={}
                    }
                    hiveFarms[w.id]=farmInfo
                    if(hiveFarms[w.id] !== farmInfo){
                        //console.log("FARM " + w.id + " UPDATED")
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
                         var gpuStatsAgg = []
                        vals.filter(function(v){
                            v.data.filter(function(d){
                               // console.log(d)
                               // throw false
                                var worker = {}
                                workerId = d.id
                                farmId = d.farm_id
                                // pre process
                                gpu_stats = {}
                                // create linked list for power stat 
                                if(typeof d['gpu_stats'] != 'undefined'){
                                    d['gpu_stats'].filter(function(s){
                                        //console.log(s)
                                        if(typeof gpu_stats.bus_number == 'undefined'){
                                            gpu_stats[s.bus_id] = s.power
                                        }
                                    })
                                }
                                //console.log(gpu_stats)
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
                                                    def: gpu.power_limit.def,
                                                    bus_id : gpu.bus_id
                                                }
                                                // for this would be accessing in a data tree
                                                // with key values ... only show the power information available
                                                var minimumGpuData={
                                                    idx: gpu.index,
                                                    min: gpu.power_limit.min,
                                                    max: gpu.power_limit.max,
                                                    def: gpu.power_limit.def,
                                                    bus_number:gpu.bus_number,
                                                    bus_id : gpu.bus_id
                                                }
                                                if(typeof hiveMiners[gpu.worker] == 'undefined'){
                                                    hiveMiners[gpu.worker]=[]
                                                }
                                                var farmId = d.farm_id
                                                var workerId = d.id
                                               
                                                if(typeof gpu_stats[gpu.bus_id] != 'undefined'){
                                                    minimumGpuData.power = gpu_stats[gpu.bus_id]
                                                }else{
                                                    //console.log('gpu stat missing')
                                                    //console.log(gpu_stats)
                                                }
                                                //console.log(minimumGpuData)
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
                                                    //console.log("COULD NOT FIND")
                                                    // probaby return a promise rejection?
                                                    // or force refresh something then try same method again.
                                                    //console.log(farmId)
                                                }
                                                GPUS.push(newGpu)
                                            })
                                        }
                                        else{
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
                        var final = []
                        // ALL OF THIS JUST TO GET ONE THING THATS MISSING?
                        // HIVEOS API U NEED TO FIX YOURSELF. This is why people are
                        // running away from your solution because your web UI is barely functional
                        // which would explain the API , heaps and heaps of unneeded abstractions.
                       
                        GPUS.filter(function(g){
                            var newG = g
                            var busN = g.bus_number+''
                            if(typeof gpuStatsAgg[busN] != 'undefined'){
                                var thePower = gpuStatsAgg[busN].power
                            }
                            // get current model and match
                            var theGpus =  hiveFarms[farmId]['workers'][workerId]['gpus'][g.model]
             
                            var gpuMatch = false
                            if(typeof gpu_stats != 'undefined' && typeof theGpus != 'undefined'){
                                //console.log(g.bus_id)
                                //console.log(gpu_stats[g.bus_id])
                                theGpus.filter(function(iGpu,iGpuIdx){
                                    if(iGpu.bus_id === g.bus_id){
                                        gpuMatch = Number(iGpuIdx)
                                    }
                                })
                                if(gpuMatch){
                                    hiveFarms[farmId]['workers'][workerId]['gpus'][g.model][gpuMatch].power = thePower
                                }
//                                hiveFarms[farmId]['workers'][workerId]['gpus']
                            
                              
                            }
                            // not working since i dont have reference to workerId at this point?!
                            final.push(newG)
                        })
                        // apply gpu stats here??
                        return final
                    }).catch(defaultError)
                }else{
                    // no farms to lookup
                    //console.log('farmWorkersGpus - undefined')
                }
        })
    }
    // IN PROGRESS!! Once i figure out how to deflate the gzip response properly
    function getFlightsheets(){
        // pass farmId to this one
        // get famrs first
        return getFarms().then(function(r,e){
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
            var sheets= []

            farms.filter(function(f){
                fetchUrl('farms/'+f+'/fs',true).then(function(r,e){
                    //console.log('fetch farms flight sheet' + f + ' error?:' + e)
                    // TODO Either use something other than fetch / fetchURL (prolly request..)
                    // the returned response is a gzip !!! WHAT A PAIN IN THE ASS.
                    //console.log(r.json())
                    sheets.push(r)
                    //console.log(r)
                    return r.json()

                    //return r
                }).then(function(data){
                    var r = {}
                    data=data.data
                    data.filter(function(d){
                        // do more conditional filtering... especially on 'items'
                        // storing farm id > id in keyvalues
                        var itm= d.items
                        var itmKeys=['coin','pool','miner','pool_urls','miner_config']
                        var items = []

                        itm.filter(function(item){
                            var newItm={}
                            for(var itmKey in item){
                                if(itmKeys.indexOf(itmKey) > -1){
                                    if(itmKey=='miner_config'){
                                        var m_conf=item[itmKey]
                                        item[itmKey]={
                                            algo: m_conf.algo,
                                            user_config: m_conf.user_config,
                                            connection_var: [m_conf.user,m_conf.pass,m_conf.server,m_conf.port,m_conf.template]
                                        }
                                    }
                                    newItm[itmKey]= item[itmKey]
                                }
                                items.push(newItm)
                                
                            }    
                        })
                        
                        var filtered = { 
                            name: d.name,
                            is_favorite:false,
                            groups: d.items
                        }
                        if(typeof r[d.id] == 'undefined'){
                            r[d.id]={}
                        }
                        r[d.id]=filtered
                    })
                    if(typeof hiveFlightsheets[f] == 'undefined'){
                        hiveFlightsheets[f]=[]
                    }
                    hiveFlightsheets[f]=r
                    //sheets.push(data)
                }).catch(function(err){
                    console.log(err)
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
            //console.log("Populating mainFarmId from 'getWorkers'")
            return this.getFarms().then.getWorkers()
        }
    }
    function fetchUrl(url){
        if(typeof accessToken != 'undefined' && accessToken != config.hiveosAccessToken){
            return fetch(`${baseUrl}/${url}`, {
                    method: 'GET',
                    compress:true,
                    gzip:true,
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
        getFlightsheets: function(){
            return hiveFlightsheets
            //return getFlightsheets().catch(defaultError)
        },
        forceFlightRefresh:function(){
            return getFlightsheets().then(function(){
                return hiveFlightsheets
            }).catch(defaultError)

        },
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
