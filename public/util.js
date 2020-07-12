
function writeToDom(id,data){
    var docElement = document.getElementById(id)
    if(typeof data != 'undefined'){
        docElement.innerHTML=''
    }
    if(typeof data != 'undefined' && typeof data.filter == 'function'){
        data.filter(function(o){
            docElement.innerHTML += o
        })   
    }else{
        if(typeof data != 'undefined'){
            docElement.innerHTML = data
        }
    }
}
function colorRefScale(){
    var step = 5
    var count = 1
    var r = []
    while(count < 100/step){
        var style = 'background-color:'+d3ColorCodeInverse(step * count)+';'
        r.push('<div style="'+style+'">'+step*count+'</div>')
        count++
    }
    writeToDom('colorRefScale',r)
}
function convertHashrate(num,showRate){
    var hrate_check = parseFloat(num)
    if(!hrate_check){
        return false
    }
    if(hrate_check < 1.0){
        hr =(hrate_check*1000).toFixed(2) + (typeof showRate != 'undefined'? ' h/s':'') 
    }else if(hrate_check > 1000){
        hr =(hrate_check/1000).toFixed(3) + (typeof showRate != 'undefined'? ' kh/s':'')
    }else if(hrate_check > 10000){
        hr =(hrate_check/10000).toFixed(4) + (typeof showRate != 'undefined'? ' mh/s':'') 
    }
    if(typeof hr != 'undefined'){
        return hr
    }else{
        return Number(0)
    }
}

 unixTS_to_date= function(unix_timestamp){
                var date = new Date(unix_timestamp * 1000);
                // Hours part from the timestamp
                var hours = date.getHours();
                // Minutes part from the timestamp
                var minutes = "0" + date.getMinutes();
                // Seconds part from the timestamp
                var seconds = "0" + date.getSeconds();
                // Will display time in 10:30:23 format
                var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
                return formattedTime
            }
            kelvinToFahrenheit = function(k){
                k = parseFloat(k)
                k = k - 273.15
                return Math.floor(k * (9/5) + 32);
            }
function getDeviceIndexPrefix(miner,devices){
    // miner = 'ccminer'
    // devices = [0,1,2,3]
    var crossRX = {
        'mtp' : 'cryptodredge',
        'cuckaroo29s' : 'gminer',
        'x16rv2' : 'trex',
        // beam
        '150_5': 'gminer'
    }
    if(typeof crossRX[miner] != 'undefined'){
        miner = crossRX[miner]
    }
    var prefixes = {
        'ccminer' : ['-d',' '],
        'gminer' : ['--devices',' '],
        'trex' : ['"devices": "',',','"'],
        'cryptodredge' : ['-d',',']
    }
    if(typeof prefixes[miner] != 'undefined'){
        prefixes = prefixes[miner]
        if(prefixes.length == 3){
            // this is a json type, the last element is what to end the line with
            // aka json
            return prefixes[0] +  devices.join(prefixes[1]) +prefixes[2]
        }else{
            return prefixes[0] + ' ' + devices.join(prefixes[1]) 
            // most other configurations
        }
    }
    return false
}
function getDeviceSeperator(miner){
    // for seperating the devices, could be ' ' or usually ','
}          
function returnCoinImgPath(coin){
    if(typeof coin != 'undefined'){
        return '<img src="https://the.hiveos.farm/icons/'+coin.toLowerCase()+'.png" alt="" class="coinImg">'
    }else{
        return ''
    }
}
function d3ColorCodeNegative(percent){
    percent = parseFloat(percent)
    if(percent  < 0){
       colorCode = d3.interpolateOrRd(Math.abs(percent/100))
    }else{
        colorCode = d3.interpolateYlGn(percent/100)
    }
    return colorCode
}
function d3ColorCodeSimple(aFloat){
    return d3.interpolateGreens(aFloat/10)
    
}
function d3ColorCodeHour(aFloat){
    return d3.interpolatePiYG(aFloat/24)
    
}
// for values like fan speeds, higher is red, lower is blue mids are green/yellow
function d3ColorCodeInverse(percent){
    percent = parseFloat(percent)
    return d3.interpolateTurbo(percent/100)
}
// for temperatures blues are cold red are warm
function d3ColorCodeTemp(percent){
    percent = parseFloat(percent)
    return d3.interpolatePuOr(percent/100)
       
}
// for basic white-greens for stuff like hashrates
function d3ColorCodeS(percent){
    percent = parseFloat(percent)

    return d3.interpolateGreens( ( percent/100 ) )
}

function d3ColorCodePwrHash(val){
    if(val > 3 && val < 6){
        // arbitrary will have to analyize all values in the list to make a real color scale from
        // highest hash rate/power to lowest
        // this is probably eth hash (I HOPE)
        return d3.interpolateGreens( ( val/3.95 ) )
        
    }else{
        // take a best guess that the value is an integer?
        return d3.interpolateGreens( ( val/5 ) )
    }
}
 function d3ColorCodeP(percent){
    percent = parseFloat(percent)
    return d3.interpolateGreens(percent/100000)
}
// for clouds
 function d3ColorCodeC(percent){
    percent = parseFloat(percent)
    return d3.interpolateGreys(percent/100)
}
function d3ColorCodeDirection(degrees){
    return d3.interpolateViridis(degrees/360  )
    
}