
//const config = require('./config.json');

const fetch = require('node-fetch');
var openWeatherCallback = (r,e) => {
	if(typeof e != 'undefined' && e != null){
		console.log('openWeatherCallaback error:\n')
		console.log(e)	
		r.data = false
		return r
	}else if(typeof r != 'undefined'){
		return (r)
	}else{
		// other error?
		r.data = false

		return r
	}

}
var currentWeather = {}
// eagle river is 5861187
// search engine is crap. matching is CRAP. Ok there is only one city of your name in all existance.
if(typeof config.openWeatherKey != 'undefined'){
	module.exports = {
	    main_loop : function(){
	      // init
	      //this.getHourlyWeather('5861187')
	      currentWeather = this.getCurrentWeather('61.3214','-149.5678')
	      // figure out 'on the hour? to avoid calling this too frequently?'
	      setInterval(()=>{this.getCurrentWeather('61.3214','-149.5678')},60 * 15 * 1000)
	     // setInterval(()=>{this.getCurrentWeather('61.3214','-149.5678')},20 * 1000)
	    },
	    showCurrentWeather : function(){
	    	return currentWeather
	    },
	    //{"lat":61.3214,"lon":-149.5678}
	    getCurrentWeather : function(lat,lon){
	    	if(typeof lat == 'string' && typeof lon == 'string' && lat.trim() != '' && lon.trim() != ''){
	    		//&exclude=
	    		let baseUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${config.openWeatherKey}`
		    	if(baseUrl){
			    	return fetch(baseUrl, {
		            	method: 'GET',
			            //headers: {
			            //    'Authorization': `Bearer ${accessToken}`,
			            //}
			        }).then(openWeatherCallback).then(r=>{
			        	return r.json().then(d2=>{
			        		currentWeather = d2
			        		return d2
			        	})
		              
		          	})
		    	}else{
		    		console.log(`openWeather issue with base url\n${baseUrl}`)
		    		return false
		    	}
	    	}
	    },
	    getHourlyWeather : function(id){
	    	// pro.openweathermap.org/data/2.5/forecast/hourly?id={city name},{state}&appid={your api key}
	    	if(typeof id == 'string' && id.trim() != ''){
		    	let baseUrl =  `https://api.openweathermap.org/data/2.5/forecast?id=${id}&appid=${config.openWeatherKey}`
		    	if(baseUrl){
			    	return fetch(baseUrl, {
		            	method: 'GET',
			            //headers: {
			            //    'Authorization': `Bearer ${accessToken}`,
			            //}
			        }).then(openWeatherCallback).then(r=>{
		              if(r.data.length === 1){
		              }
		          	})
		    	}else{
		    		console.log(`openWeather issue with base url\n${baseUrl}`)
		    		return false
		    	}
	    	}else{
	    		return false
	    	}


	    },
	}
}else{
	console.log("openWeatherKey not found")
}