getTwoMinersApi = function(){
    let endPoint = '/2MinersData'
    $.getJSON(endPoint,function(data){
        console.log(data)
        if(typeof data == 'object' && data && data != {}){
           let output = ['<b>2Miners</b>']
           let output2 = ['<b>2Miners LastBlocks</b>']
            //  console.log(data)
              // data needs to be sorted ?
              /*
                // preprocess to generate scaled colors based on highest lowest values ?


              */
           let twoMinerHashrates = {}
           let twoMinerIndexes={}
           for(let coin in data){
                let coinSet = data[coin]
                for(let fieldName in coinSet){
                    if(fieldName != 'lastBlock'){
                        if(typeof coinSet[fieldName] != 'undefined' && typeof coinSet[fieldName].hr != 'undefined'){
                            let hashrate = parseFloat(coinSet[fieldName].hr)
                            if(hashrate && typeof hashrate == 'number'){
                                if(typeof twoMinerHashrates[coin] == 'undefined'){
                                    twoMinerHashrates[coin]=[]
                                }
                                if(typeof twoMinerIndexes[coin] == 'undefined'){
                                    twoMinerIndexes[coin]=[]
                                }
                                twoMinerHashrates[coin].push(hashrate)
                                twoMinerIndexes[coin].push(fieldName)
                            }
                        }
                    }else{

                    }
                }
            }
            topHashRates =
            {}
            for(let coin in twoMinerIndexes){
                let rigNames = twoMinerIndexes[coin]
                let topHashRate = false
                let topHashRateCoin = false
                let topHashRateIndx = false
                for(let rigIndex in twoMinerIndexes[coin]){
                    if((!topHashRate && !topHashRateCoin) || (topHashRate < twoMinerHashrates[coin][rigIndex] ) ){
                        topHashRate= twoMinerHashrates[coin][rigIndex]
                        topHashRateCoin = coin
                        topHashRateIndx = rigIndex
                      //  topHashRate = twoMinerHashrates[coin][rigIndex]
                    }
                    console.log(topHashRate,topHashRateCoin,topHashRateIndx)
                    topHashRates[topHashRateCoin]=topHashRateIndx
                }
                //topHashRates[topHashRateCoin]={}

                
                //let hashrate = twoMinerHashrates[coin]
               // console.log(rigName + '\t' + hashrate)
            }
            for(let coin in data){
                let coinSet = data[coin]
                for(let fieldName in coinSet){
                    if(fieldName != 'lastBlock'){
                        // this is a rig!
                        let rigName = fieldName
                        let aRig = coinSet[fieldName]
                        if(aRig.online){
                            output.push('<tr><td>'+rigName+'</td><td>'+aRig.hr +'&nbsp; mh/s</td><td>'+returnCoinImgPath(coin)+'</td><td>&nbsp;</td><td>&nbsp;</td></tr>')
                        }
                    }else{
                        let lastBlock = coinSet[fieldName]
                        let t =  lastBlock.split(' ')
                        let timeColorCoding = t[1]
                        let lastBlockNumber = parseInt(t[0])
                        console.log(topHashRates[coin] + coin)
                        let lastBlockStyle = false
                        if(timeColorCoding == 'seconds' || timeColorCoding == 'minutes' ){
                            lastBlockStyle = 'style="background-color:'+ d3.interpolatePiYG(lastBlockNumber/((timeColorCoding == 'seconds' ? 10:24)))+';"'
                        }
                           output2.push('<tr><td'+(lastBlockStyle? ' ' + lastBlockStyle:'')+'>'+returnCoinImgPath(coin)+'</td><td>'+lastBlock +' ago</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>')
                        }
                        // last block process elsewhere prolly
                            
                }
            }
            if(output.length > 1){
              writeToDom('twoMinersData','<table><tbody>'+output.join('\n')+'</tbody></table>')
              writeToDom('twoMinersDataLastBlocks','<table><tbody>'+output2.join('\n')+'</tbody></table>')
                 //  let permitFields = ['rigName','speedAccepted','algorithm','difficulty','profitability']
            }
                 
        }
    })
}