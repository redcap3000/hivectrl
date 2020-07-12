getOpenWeather = function(){
let endPoint = '/openWeather'
$.getJSON(endPoint,function(data){
    console.log('getopenweather')
    if(typeof data == 'object' && data){
        let current = (typeof data.current != 'undefined'?data.current : false)
        let currentHourly = (typeof data.hourly != 'undefined' ? data.hourly : false)
        let currentDaily = (typeof data.daily != 'undefined' ? data.daily : false)
        let currentString = ['<ul>']
        if(current){
            for(var k in current){
                if(typeof current[k] == 'object' && typeof current[k].filter == 'function'){
                    // array with objects
                    current[k].filter(function(o){
                        for(var k2 in o){
                              currentString.push('<li>'+k2+ o[k2]+'</li>') 
                        }
                    })
                }else if(typeof current[k] == 'string' || typeof current[k] == 'number'){
                    if(['dt','sunrise','sunset'].indexOf(k) > -1){
                        currentString.push('<li>'+k+' '+unixTS_to_date(current[k])+'</li>')
                    
                    }else if(['temp','feels_like','dew_point'].indexOf(k) > -1){
                         currentString.push('<li>'+k+' '+kelvinToFahrenheit(current[k])+'</li>')
                    }else{
                        currentString.push('<li>'+k+' '+current[k]+'</li>')
                    }
                }
            }                            
            currentString.push('</ul>')
        }
        let rString = '<h4>Hourly Weather</h4><table><tbody>'
        if(typeof currentHourly != 'undefined'){
            //let currentHourlyString  = ''
            currentHourly.filter(function(o,x){
                // dt,temp,feels_like,pressure,humidity,temp,weather,wind_deg,wind_speed
                let obj = {}
                let temps = ['temp','feels_like','temp','dew_point']
                for(var k in o){
                    let s = '<li>'
                    if(k == 'dt'){
                        s += unixTS_to_date(o[k])
                        obj.date = unixTS_to_date(o[k])
                    }else if(temps.indexOf(k) > -1){
                        // temps
                        s += k+ ' : '+kelvinToFahrenheit(o[k])
                        obj[k] = ''
                        obj[k] = kelvinToFahrenheit(o[k])
                    }else if(k == 'weather'){
                        // todo word images for current conditions
                    }else{
                        obj[k] = o[k]
                        s += k + ' ' + o[k]
                    }
                    s+='</li>'
                    //currentHourlyString += s
                }
                if(typeof obj.wind_speed != 'undefined'){
                    let n = []
                    for(var k2 in obj){
                        if(k2 == 'temp' || k2 == 'feels_like' || k2 == 'dew_point'){
                            n.push("<td style='background-color:"+d3ColorCodeTemp(obj[k2])+";'></td>")
                        }else if(k2 == 'wind_speed'){
                            n.push("<td style='background-color:"+d3ColorCodeSimple(obj[k2])+";'></td>")
                        }else if(k2 == 'clouds'){
                            n.push("<td style='background-color:"+d3ColorCodeC(obj[k2])+";'></td>")
                        }else if(k2 == 'humidity'){
                            n.push("<td style='background-color:"+d3ColorCodeTemp(obj[k2])+";'></td>")
                        }else if(k2 == 'pressure'){
                              //n += "<td style='background-color:"+d3ColorCodeP(obj[k2])+";'>"
                        }else if(k2 == 'wind_deg'){
                            n.push("<td style='background-color:"+d3ColorCodeDirection(obj[k2])+";'></td>")
                           // n.push("<td>"+obj[k2]+"</td>")
                        }else if(k2 == 'date'){
                            // convert time into color?
                            var time = obj[k2].split(':').shift()
                            n.push("<td style='background-color:"+d3ColorCodeHour(time)+";'></td>")
                        }
                    }
                    // perform rearrange
                    n.unshift('<tr style="height:6px;">')
                    n.push('</tr>')
                    rString+=n.join('\n')
                }
            })
        }
        writeToDom('openWeatherData',rString)

        if(typeof currentDaily != 'undefined' && currentDaily){
            // todo for real.... 
            return false
            let currentDailyR = ['<table><thead><tr><th></th><th>rise</th><th>set</th><th>temps</th><th>feels like</th><th>pressure</th><th>humidity</th><th>dew point</th><th>wind speed</th><th>wind direction</th><th>clouds</th></tr></thead><tbody>']
            currentDaily.filter(function(o,x){
                // dt,temp,feels_like,pressure,humidity,temp,weather,wind_deg,wind_speed
                let obj = {}
                let temps = ['temp','feels_like','temp','dew_point']
                let tempsI = ['day','min','max','night','eve','morn']
                for(var k in o){
                    let s = '<td>'
                    if(k == 'dt' || k == 'sunrise' || k == 'sunset'){
                        if(k != 'dt'){
                            s += unixTS_to_date(o[k])
                            obj.date = unixTS_to_date(o[k])
                        }
                    }else if(temps.indexOf(k) > -1){
                        // temps
                        console.log(o[k])
                        if(typeof o[k] == 'object'){
                            let dailyTemps = o[k]
                            if(x === 0 ){
                                var innerTable = ['<table class="iTable"><thead><tr><th>day</th><th>eve</th><th>morn</th><th>night</th>']
                                if(typeof dailyTemps.min != 'undefined' && typeof dailyTemps.max != 'undefined'){
                                    innerTable.push('<th>low</th><th>high</th>')
                                }
                                innerTable.push('</tr></thead><tbody><tr>')
                            }else{
                                var innerTable = ['<table  class="iTable"><tbody><tr>']
                            }
                            let tempObject = {
                                day : dailyTemps.day,
                                eve : dailyTemps.eve,
                                morn : dailyTemps.morn,
                                night  : dailyTemps.night,
                                low  : (dailyTemps.min ? dailyTemps.min : false),
                                high : (dailyTemps.max ? dailyTemps.max : false),
                            }
                            for(let k2 in dailyTemps){
                                //if(tempsI.indexOf(k2) > -1){
                                      // day,min,max,night,eve,morn
                                        // these are often listed out of order...
                                        // appropriate order :
                                if(dailyTemps[k2]){
                                    let theTemp = kelvinToFahrenheit(dailyTemps[k2])
                                    innerTable.push('<td style="background-color:'+d3ColorCodeTemp(theTemp)+'">'+  theTemp + '</td>')
                                }
                            }
                            innerTable.push('</tr></tbody></table>')
                            s+=innerTable.join('\n') + '</td>'
                        }else{
                            s += kelvinToFahrenheit(o[k])
                            obj[k] = ''
                            obj[k] = kelvinToFahrenheit(o[k])
                        }
                    }else if(k == 'weather'){
                        // todo word images for current conditions
                    }else{

                         if(k == 'temp' || k == 'feels_like' || k == 'dew_point'){
                            s +=("<td style='background-color:"+d3ColorCodeTemp(o[k])+";'>")
                        }else if(k == 'wind_speed'){
                            s +=("<td style='background-color:"+d3ColorCodeSimple(o[k])+";'>")
                        }else if(k == 'clouds'){
                            s +=("<td style='background-color:"+d3ColorCodeC(o[k])+";'>")
                        }else if(k == 'humidity'){
                            s +=("<td style='background-color:"+d3ColorCodeTemp(o[k])+";'>")
                        }else if(k == 'pressure'){
                            s += "<td style='background-color:"+d3ColorCodeP(o[k])+";'>"
                        }else if(k == 'wind_deg'){
                            s+=("<td style='background-color:"+d3ColorCodeDirection(o[k])+";'>"+o[k])
                            //n.push("<td>"+obj[k2]+"</td>")
                        }else if(o[k] != ''){
                            s +=  '<td>'+o[k]
                        }
                    }
                    //if(o[k] != ''){
                        s+='</td>'
                    //}
                    currentDailyR.push(s)
                }
                currentDailyR.unshift('<tr>')
                currentDailyR.push('</tr>')                                
            })
            writeToDom('openWeatherData2',currentDailyR.join('\n')+'</tbody></table>') 
        }
    }
})
}