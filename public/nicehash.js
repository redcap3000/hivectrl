 getNicehashApi = function(){
let endPoint = '/nicehashData'
$.getJSON(endPoint,function(data){
    if(typeof data == 'object' && data){
        if(typeof data.activeWorkers != 'undefined'){
            if(data.activeWorkers.length > 0){
                let nhWorkers = []
                let omitFields = ['unpaidAmount','xnsub']
                let rejectFields = ['speedRejectedTotal','speedRejectedR1Target','speedRejectedR2Stale','speedRejectedR3Duplicate','speedRejectedR4NTime','speedRejectedR5Other']
                let timeFields = ['statsTime','timeConnected']
                data.activeWorkers.filter(function(w){
                    let wrk = {}
                    wrk.rejections={}
                    wrk.time={}
                    for(let k in w){
                        if(omitFields.indexOf(k) == -1 && rejectFields.indexOf(k) == -1 && timeFields.indexOf(k) == -1){
                            wrk[k] = w[k]
                        }else if(rejectFields.indexOf(k) > -1 && timeFields.indexOf(k) == -1){
                            // handle this gracefully?
                            wrk.rejections[k]= w[k]
                        }else if(timeFields.indexOf(k) > -1){
                            wrk.time[k]= new Date(w[k] * 1000)
                        }
                    }
                    /*
                    algorithm: "DAGGERHASHIMOTO"
                    difficulty: 0.8
                    profitability: 0.000776135593220339
                    rigName: "ETHMONSTER"
                    speedAccepted: 266.64473249139803
                    speedRejectedR1Target: 0
                    speedRejectedR2Stale: 0
                    speedRejectedR3Duplicate: 0
                    speedRejectedR4NTime: 0
                    speedRejectedR5Other: 0
                    speedRejectedTotal: 0
                    statsTime: 1594428801000
                    timeConnected: 1594406086307
                    unpaidAmount: "0.00002105"
                    xnsub: true
                    */
                    nhWorkers.push(wrk)
                })
                if(nhWorkers.length > 0){
                    let f = ['<b>Nicehash</b><table><thead><tr>']

                    let permitFields = ['rigName','speedAccepted','algorithm']
                    //,'difficulty','profitability']
                   /* permitFields.filter(function(tf){
                        if(tf == 'speedAccepted'){
                            f.push('<th>rate</th>')

                        }else if(tf == 'rigName'){
                            f.push('<th>Name</th>')
                        }else{
                            f.push('<th>'+tf+'</th>')

                        }
                    })*/
                    f.push('</tr></thead><tbody>')
                    nhWorkers.filter(function(w2){
                        let ff = ['<tr>']
                        permitFields.filter(function(x){
                            if(x == 'profitability' || x == 'speedAccepted'){
                                 if(x == 'speedAccepted'){
                                         ff.push('<td>'+w2[x].toFixed(2)+' mh/s</td>')
                                    }else{
                                        ff.push('<td>'+w2[x].toFixed(8)+'</td>')    
                                    }
                           }else{
                                if(w2[x] == 'DAGGERHASHIMOTO'){
                                    ff.push('<td>ethhash</td>')
                                }else{
                                    ff.push('<td>'+w2[x]+'</td>')
                                }
                           }
                        })
                        ff.push('</tr>')
                        f.push(ff.join('\n'))
                    })

                    writeToDom('nicehashData','<table>'+f.join('\n')+'</tbody></table>')
                }
            }
        }
    }
})
}