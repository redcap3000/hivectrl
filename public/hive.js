  getHiveData = function(){
    var endPoint = '/api'
    $.getJSON(endPoint,function(data){
        if(typeof data != 'undefined'){
            var minerStats= data.minerstats
            /*
                {467468: Array(2)}467468: Array(2)0: algo: "cuckaroo29s"bus_numbers: (6) [1, 4, 5, 12, 13, 16]coin: "XWP"fans: (6) [33, 26, 38, 26, 22, 22]hashes: (6) [0.0046500000000000005, 0.00319, 0.00459, 0.00309, 0.00316, 0.00315]miner: "gminer"temps: (6) [62, 66, 63, 66, 64, 64]__proto__: Object1: {miner: "cryptodredge", algo: "mtp", coin: "XZC", hashes: Array(5), temps: Array(5), …}length: 2__proto__: Array(0)__proto__: Object

            */
            // reform minerStats for easier referencing ?
            var minerStatsRef={}
            var hashratesByCoinRef={}
            for(var farm in data.farms){
                var minerStats_digest=['<ul>']
                var miners_stats =[]
                 for(var workerId in minerStats){
                    var miners = minerStats[workerId]
                    miners.filter(function(w){
                        if(typeof minerStatsRef[workerId] == 'undefined'){
                            minerStatsRef[workerId] ={}
                        }
                        var minerWorkerGuid=w.miner+'_'+w.algo+'_'+w.coin
                        if(typeof minerStatsRef[workerId][w.miner] == 'undefined'){

                        }
                        var concatDatas=[]
                        function busFilter(b,i){
                            var b2 = b+''
                            var row = {
                                workerId : workerId,
                                bus_number : b,
                                fans : w.fans[i],
                                hashes: w.hashes[i],
                                temps : w.temps[i],
                                algo : w.algo,
                                coin : w.coin
                            }
                           if(typeof hisHash[workerId+''] == 'undefined'){
                                hisHash[workerId+'']={}
                           }
                           if(typeof hisHash[workerId+''][b+''] == 'undefined'){
                                hisHash[workerId+''][b+'']=[]
                           }
                           if(w.hashes[i] != hisHash[workerId+''][b+''][hisHash[workerId+''][b+''].length-1]){
                                hisHash[workerId+''][b+''].push(w.hashes[i])
                            }
                            if(typeof miners_stats[workerId] == 'undefined'){
                                miners_stats[workerId] = {}
                            }
                            if(typeof miners_stats[workerId][b2] == 'undefined'){
                                miners_stats[workerId][b2] ={}
                            }
                            miners_stats[workerId][b2]=row
                        }
                        if(typeof w.bus_numbers != 'undefined'){
                            w.bus_numbers.filter(busFilter)
                        }else if(typeof w.bus_number != 'undefined'){
                            busFilter(parseInt(w.bus_number),0)
                            // bus numbers not provided
                        }else{
                            if(typeof w.hashes != 'undefined'){
                                // use index as busid
                                var c = 0
                                while(c< w.hashes.length){
                                    var c2 = c+''
                                    var row={
                                        workerId : workerId,
                                        bus_number : c,
                                        fans : w.fans[c],
                                        hashes: w.hashes[c],
                                        temps : w.temps[c],
                                        algo : w.algo,
                                        coin : w.coin
                                    }
                                    if(typeof hisHash[workerId+''] == 'undefined'){
                                        hisHash[workerId+'']={}
                                    }
                                    if(typeof hisHash[workerId+''][c+''] == 'undefined'){
                                        hisHash[workerId+''][c+'']=[]
                                    }
                                    if(w.hashes[c] != hisHash[workerId+''][c+''][hisHash[workerId+''][c+''].length-1]){
                                        hisHash[workerId+''][c+''].push(w.hashes[c])
                                    }
                                    if(typeof miners_stats[workerId] == 'undefined'){
                                        miners_stats[workerId] = {}
                                    }
                                    if(typeof miners_stats[workerId][c2] == 'undefined'){
                                        miners_stats[workerId][c2] ={}
                                    }
                                    miners_stats[workerId][c2]=row
                                    c++
                                }
                            }
                            // some miners like xmr dont provide bus numbers for whatever reason so use a different field and count index
                        }
                    })
                }
                var output=[]
                var f = data.farms[farm]
                var fieldsNames=[
                  //  'Idle Power Draw',
                    'Name',
                    //'Price/Watt',
                    'Total Rigs',
                    'Online',
                    //'Tz',
                ]
                var values = [
             //   f.hardware_power_draw,
                f.name,
                //f.power_price,
                f.rigs_count,
                f.stats.workers_online,
                //f.timezone
                //f.hashrates_by_coin.coin,
                //f.hashrates_by_coin.algo,
                //f.hashrates_by_coin.hashrate
                ]
                values.filter(function(val,idx){
                    var keyName = fieldsNames[idx]
                    // hacky stuff for shorten display output
                    if(keyName == 'Name'){
                        output.push('<h4>')
                    }
                    output.push( (keyName != 'Name' && keyName != 'Tz' && keyName != 'Online' ? keyName + ' : ' : (keyName == 'Online' ? '/' : ' '))+' ' +val )
                    if(keyName == 'Tz'){
                        output.push('</h4>')
                    }
                    
                })
                //output.push(' ')
                if(output.length > 2){
                    writeToDom('hiveFarmData',output.join(' '))
                }
                if(typeof f !='undefined' && typeof f.hashrates_by_coin != 'undefined'){
                    var hashrates_by_coin=['<span class="hrByCoin">']
                    f.hashrates_by_coin.filter(function(hr){
                        hashrates_by_coin.push('<h4>')
                        var hrate_check = parseFloat(hr.hashrate)
                        if(hrate_check < 1.0){
                            hr.hashrate =(hrate_check*1000).toFixed(2) + ' h/s' 
                        }else if(hrate_check > 1000){
                            hr.hashrate =(hrate_check/1000).toFixed(3) + ' kh/s' 
                        }else if(hrate_check > 10000){
                            hr.hashrate =(hrate_check/10000).toFixed(4) + ' mh/s' 
                        }else if(!hrate_check){
                            return false
                        }
                        hashrates_by_coin.push( hr.algo + ' @ ' + hr.hashrate + '<span class="hrByCoinImg">'+  returnCoinImgPath(hr.coin) +'</span>')
                        if(typeof hashratesByCoinRef[hr.algo] == 'undefined'){
                            hashratesByCoinRef[hr.algo] = {}
                        }
                        if(typeof hashratesByCoinRef[hr.algo][hr.coin] == 'undefined'){
                            hashratesByCoinRef[hr.algo][hr.coin]=hr.hashrate
                        }
                        hashrates_by_coin.push('</h4>')
                    })
                    hashrates_by_coin.push('</span>')
                }
                var workers_digest=[]
                var workers_ref={}
                var workerClickGuids = []
                // reorder/ remove workers without reporting GPU's? workers
                // tie into interface option to support showing/hiding offline rigs
                var reOrder={}
                for(var wId in f.workers){
                    theWorker = f.workers[wId]
                    if(typeof miners_stats[wId] != 'undefined'){
                        reOrder[wId]={}
                        reOrder[wId]=f.workers[wId]
                    }
                    //console.log(theWorker)
                }
                //if(reOrder.length !== f.workers.length){
                f.workers=reOrder
                //}
                for(var workerId in f.workers){
                    var theWorker = f.workers[workerId]
                    workers_digest.push('<h3>'+workerId+'</h3>')
                    for(var gpuModel in theWorker.gpus){
                        var wrk = theWorker.gpus[gpuModel]
                        // need to cross reference workerId here..
                        var domGuid = 'w-'+workerId
                        // generate guid from gpu indexes
                        // also check for identical algo kind to append the info to model instead of dom
                        wrk.filter(function(ww){
                            domGuid += '_'+ww.idx
                        })
                        //workers_digest.push('<h4 id="'+domGuid+'">' + gpuModel + '</h4>')
                        //attach click handler
                        workerClickGuids.push(domGuid)
                        // prefilter to generate the colorcoding grading based on the nearby cards?
                        /*

                            MAKE NEW CHART TO TRACK POWER 

                        */
                        wrk.filter(function(w){
                            var cardStats=undefined
                            if(typeof miners_stats[workerId] != 'undefined' && typeof miners_stats[workerId][w.bus_number+''] != 'undefined'){
                                // WORKER HASH|RATE VISUALISATION THINGEE AROUND HERE
                                cardStats = miners_stats[workerId][w.bus_number+'']
                                var cHashRate=convertHashrate(cardStats.hashes,true)
                                var cHashRateString = convertHashrate(cardStats.temps)
                                var cTemp = w.power/parseFloat(convertHashrate(cardStats.hashes))

                                // divide power by rate?

                                var fanStyle = 'background-color:'+d3ColorCodeInverse(cardStats.fans)+';'
                                if(typeof hashratesByCoinRef[cardStats.algo] != 'undefined' && typeof hashratesByCoinRef[cardStats.algo][cardStats.coin] != 'undefined'){
                                    // this is terrible.fix
                                    if(typeof hashratesByCoinRef[cardStats.algo][cardStats.coin].split == 'function'){
                                        var totalSpeed = hashratesByCoinRef[cardStats.algo][cardStats.coin].split(' ')[0]
                                        if(typeof totalSpeed != 'undefined' && totalSpeed){
                                            totalSpeed = parseFloat(totalSpeed)
                                            var adjustedColor = (totalSpeed/cHashRate) * wrk.length
                                        }else{
                                            var adjustedColor = cHashRate
                                        }
                                        //var hashrateStyle = 'background-color:'+d3ColorCodeS(adjustedColor)+';'
                                        // probably get values from some kind of max/min temp to express
                                        // the relationship a bit better than this....   
                                        var hashrateStyle = 'background-color:'+d3ColorCodeInverse(cHashRate)+';'
                                    }
                                }else{
                                    var hashrateStyle = 'background-color:none;'
                                }
                                if(typeof cTemp != 'undefined'){
                                    var cTempStyle='background-color:'+d3ColorCodeInverse(cTemp*15)+';'
                                }else{
                                    var cTempStyle=''
                                }
                                var historicalHashrates='<tr><td colspan="4">'
                                if(typeof hisHash[workerId] != 'undefined' && typeof hisHash[workerId][w.bus_number+''] != 'undefined'){
                                    var hh = hisHash[workerId][w.bus_number+'']
                                     function percIncrease(a, b) {
                                        let percent;
                                        a = parseFloat(a)
                                        b = parseFloat(b)
                                        if(b !== 0) {
                                            if(a !== 0) {
                                                percent = (b - a) / a * 100;
                                            } else {
                                                percent = b * 100;
                                            }
                                        } else {
                                            percent = - a * 100;            
                                        }       
                                        return Math.floor(percent);
                                    }
                                    // keep the number of elements in hh to 50
                                    var shouldShift = false
                                    hh.filter(function(hashrate,i){
                                        if(i < 50){
                                            var perIn= (i > 1 ? percIncrease(convertHashrate(hashrate),convertHashrate(hh[i-1])) : 0)
                                            var hrStyle = d3ColorCodeNegative(convertHashrate(hashrate) * perIn)
                                            historicalHashrates += "<div class='hhBox' style='background-color:"+hrStyle+";'>&nbsp;</div>"
                                        }else{
                                            // clear ?
                                            // OVERFLOW?
                                            shouldShift = true
                                        }
                                    })
                                    if(shouldShift){
                                        hh.shift()
                                    }else{
                                    }
                                    historicalHashrates += "</td></tr>"
                                }
                                workers_digest.push(
                                    '<table><tbody><tr>'+
                                    //returnCoinImgPath(cardStats.coin)+
                                    //'</td><td><small>'+
                                     // w.idx+ ' : <span>' + cardStats.algo+ ' @ '+
                                   
                                    // cHashRateString + '</span>'+
                                    //'</small></td>
                                    '<td  class="wrk_temp" style="'+
                                    cTempStyle+'"></td><td class="wrk_fans" style="'+
                                    fanStyle+'">&nbsp;</td><td class="wrk_algo_info" style="'+
                                    hashrateStyle+'">&nbsp;</td></tr>'+
                                    historicalHashrates
                                    +'</tbody></table>')

                            }else{
                                //workers_digest.push('<ul><li><span>'+w.idx+'</span></li></ul>')
                            }
                            // fans hashes temps
                            // for combining with data below
                            if(typeof workers_ref[workerId] == 'undefined'){
                                workers_ref[workerId]={}
                            }
                            if(typeof workers_ref[workerId][w.bus_number] == 'undefined'){
                                workers_ref[workerId][w.bus_number]={}
                            }
                            // data to pass/ref
                            workers_ref[workerId][w.bus_number]=gpuModel
                        })
                    }
                     // workers_digest.push('</ul>')
                }
            }
           
            if(typeof hashrates_by_coin != 'undefined'){
                if(hashrates_by_coin.length > 2){
                    writeToDom('hiveHashrateData',hashrates_by_coin.join('\n'))
                }
            }
            if(workers_digest.length > 2){
                var docElement = document.getElementById('hiveWorkersData')
                docElement.innerHTML=''
                workers_digest.filter(function(o){
                    docElement.innerHTML += o
                })
                writeToDom('hiveWorkersData',workers_digest)
                /*
                if(workerClickGuids.length > 0){
                    workerClickGuids.filter(function(wrkr){
                        document.getElementById(wrkr).addEventListener("click",function(){
                            var idxs= wrkr.split('_')
                            var workerId=idxs.shift()
                            selectedCard= this.innerHTML.trim('')
                            selectedCardIdxs=idxs
                            selectedWorkerId=workerId.split('-')[1]
                            // these are the indexes.. 
                        })
                    })
                }
                */
            }
        }
    })
}
getHiveFlightsheets = function(){
let endPoint = '/flightsheets'
$.getJSON(endPoint,function(data){
    if(typeof data == 'object' && data)
    // assemble farm id/flightsheet id and name (if available)
    var rows=[]
    for(var farmId in data){
        // FARM
        let farm = data[farmId]
        for(var fsId in farm){
            // FLIGHTSHEET ID
            let fs = farm[fsId]
            let toShow = {
                farmId:farmId,
                id: fsId
            }
            if(typeof fs.name != 'undefined'){
                toShow['name']=fs.name
            }else{
                toShow['name']='Untitled'
            }
            if(typeof fs['groups'] != 'undefined'){
                // probably do stuff here for groups....
                toShow['groups']=fs['groups']
            }
            rows.push(toShow)
        }
    }
    if(rows.length>0){
        let result=[]
        rows.filter(function(r){
            // use farmId+id for GUID
            let guid = r.farmId+'-'+r.id
            let line = '<tr id="'+guid+'"><td>'+r.name+'</td><td>'
            // hightlight /move flightsheets in use to top
            // show 'favored' flightsheets after active
            // option to hide 'untitled' flightsheets
            r.groups.filter(function(g){
                var iLine = '<ul><li>'+g.coin+' - '+(g.miner_config.algo ? g.miner_config.algo :'')+'</li><li> '+( g.miner_config.user_config ?  g.miner_config.user_config :'ALL') +'</li><li><!--'+g.wal_id+'--></ul>'
                line += iLine
                // reform 'miner_conf:user_config' to only show devices
                // co link wallet info prolly.... TODO
            })
            line+='</td>'
            result.push(line)
        })
        writeToDom('hiveFlightsheets',result)
        // attach click events
    }
})
}