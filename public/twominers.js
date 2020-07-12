getTwoMinersApi = function(){
    let endPoint = '/2MinersData'
    $.getJSON(endPoint,function(data){
        console.log(data)
        if(typeof data == 'object' && data && data != {}){
              let output = ['<b>2Miners</b>']
              let output2 = ['<b>2Miners LastBlocks</b>']
            //  console.log(data)
              // data needs to be sorted ?

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