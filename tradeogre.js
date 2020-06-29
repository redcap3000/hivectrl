// rewrite as module prolly!!
if(typeof config.togreKey != 'undefined' && typeof config.togreSecret != 'undefined'){
	var TradeOgre = require('tradeogre-api');
	var tradeOgre = new TradeOgre( config.togreKey, config.togreSecret );
	var tradeOgrePublic = new TradeOgre()
}else{
	return false
}
/*
	not 100% sure how to approach this yet...

	auto sell balances automatically as they are inserted
	if they meet the min. order threshold
	
*/
tOgre_wallets=[]
tOgre_orderbook={}
tOgre_orders =[]
tOgre_tickers={}


tOgre_available=true

// buy price sell price ?
/*
tOgre_tradeRules ={ 'BTC-XWP' : [] ,
					'BTC-LTC' : []}
*/
// turns a t ogre symbol into a 'normalish' one
// for display purposes mostly
function normalizeMarketSymbol(sym){
	var sym = sym.split ('-')
	if(sym.length == 2){
		return sym[1]+'-'+sym[0]
	}
}

function tickerCallback(err,resp){
//console.log('tickercall back ' + this.market)
  if (!err) {
  		var normalizedSymbol = normalizeMarketSymbol(this.market)
	  	//console.log(resp)
	  	if(resp != 'undefined' && typeof resp.body != 'undefined'){
	  		try{
  				quotes = JSON.parse(resp.body)
  			}catch(e){
  				console.log(e)
  			}
  			if(quotes && typeof quotes.success != 'undefined' && quotes.success){
				var lastTrade = parseFloat(quotes.price)
				if(typeof lastTrade == 'number'){
					if(typeof tOgre_tickers[normalizedSymbol] == 'undefined'){
						 tOgre_tickers[normalizedSymbol] = Number(0)
					}
					 tOgre_tickers[normalizedSymbol] = lastTrade
					 if(typeof redisRemote != 'undefined'){
					 	redisRemote.set('tOgre_'+normalizedSymbol,parseFloat(lastTrade))
					 }
					//tradeOgrePublic.getOrderBook(this.market,orderbookCallback.bind({market:this.market}))

				}  				
  			}
	  	}
	  }
}
//sell:Symbol:price,lotsize,btc val.

function orderbookCallback(err,resp){
  if (!err) {
  		var normalizedSymbol = normalizeMarketSymbol(this.market)

	  	if(resp != 'undefined' && typeof resp.body != 'undefined'){
	  		try{
  				orders = JSON.parse(resp.body)
  			}catch(e){
  				console.log(e)
  			}
  			if(orders){
  				var o = []
  				// could enforce trading strategies here.. i.e. create a 'price finder'
  				// that picks a price based on btc values (or avoids them)
  				if(typeof orders.success != 'undefined' && orders.success){
	  				var buyOrders = orders.buy
	  				function conFloat (value){
	  					return parseFloat(parseFloat(value).toFixed(8))
	  				}
	  				for(var p in buyOrders){
	  					var lotSize = buyOrders[p]
	  					var price = conFloat(p)
	  					var lot = conFloat(lotSize)
	  					var value = (price * lot).toFixed(8)
	  					
	  					o.push([
	  						'sell:'+normalizedSymbol,price,
	  						conFloat(lotSize),
	  						(price * lot).toFixed(8)
	  					])
	  				}
	  				var sellOrders = orders.buy
	  				for(var p in sellOrders){
	  					var lotSize = buyOrders[p]
	  					var price = conFloat(p)
	  					var lot = conFloat(lotSize)
	  					var value = (price * lot).toFixed(8)
	  					o.push([
	  						'sell:'+normalizedSymbol,price,
	  						conFloat(lotSize),
	  						conFloat(price * lot)
	  					])
	  				}
  				}
  				tOgre_orderbook = o
  			}
	  	}
	  }
}

function tradeOgreLoop (){
	tradeOgre.getBalances(function(err, resp) {
	  if (!err) {
	  	if(resp != 'undefined' && typeof resp.body != 'undefined'){
	  		//console.log(resp.body)
  			try{
  				balances = JSON.parse(resp.body)
  			}catch(e){
  				console.log(e)
  			}
  			if(balances){
  				balances = balances.balances
  			}
  			var new_wallets = []
  			for (var symbol in balances){
  				var balance = parseFloat(balances[symbol])
  				if(balance > 0){
  					// get ticker?
	  				new_wallets.push({
	  					currency : symbol,
	  					balance: balance
	  				})
  					if(symbol != 'BTC'){
  						tradeOgre.getTicker('BTC-'+symbol, tickerCallback.bind({market:'BTC-'+symbol}))

  					}else{
  						// NO BTC MARKET ON TRADE OGRE!!!!
  						//tradeOgre.getTicker('BTC-USDT', tickerCallback.bind({market:'BTC-USDT'}))
  					}
  					//console.log(symbol) + ':'+ tOgre_wallets[symbol]
  				}

  			}
  			tOgre_wallets=new_wallets
	  	}else{
	  		console.log(resp)
	  	}
	  } else {
	    console.log(err)
	  }
	});

	tradeOgre.getOrders(undefined,function(err, resp) {
		//console.log("tradeOgre get ordres")
	  if (!err) {
	  	var finalOrders = []
	  	if(resp != 'undefined' && typeof resp.body != 'undefined'){
	 		if(resp.body.length > 0){
	 			/*
					OPEN ORDERS
	 			*/
	 			var orders = resp.body
	 			orders.filter(function(o){

	 				// adhering to coinbasePro structure (MOSTLY)
	 				var newO = {
	 					id : o.uuid,
	 					price : o.price,
	 					product_id : normalizeMarketSymbol(o.market),
	 					side : o.type,
	 					amount : o.quantity,
	 					created_at: new Date(o.date * 1000)
	 				}

	 				if(o.market == 'BTC-XWP' && o.type == 'sell'){
	 					tOgre_wallets.map(function(w){
	 						return false
	 						if(w.currency == 'XWP'){
	 							var sell_amount = parseFloat(o.quantity)
	 							if(sell_amount.toFixed(5) != w.balance.toFixed(5) ){
	 								tradeOgre.cancelOrder(o.uuid,function(e,r){
	 									console.log("CANCEL ORDER")
	 									if(typeof r != 'undefined' && r){
		 									// place new order
		 									tradeOgre.sell(o.market, w.balance, o.price, function(e2,r2){
		 										console.log("Placing new sell order for " + w.balance)
		 										if(typeof r2 != 'undefined' && typeof r2.body != 'undefined' && typeof r2.body.success != 'undefined'){
		 											if(r2.body.success){
		 												console.log("Order successful")
		 											}else if(typeof r2.body.error != 'undefined'){
		 												console.log(r2.body.error)
		 												// stop loop prolly
		 											}
		 										}else{
		 											console.log("Issue with buy response.")
		 										}
		 									})

	 									}
	 								})
	 							} else{
	 								//console.log("AMOUNTS EQUAL")
	 							}
	 						}else if(w.currency == 'BTC'){
	 							// place buy order for somethin?
	 							console.log('*** BTC WALLET ***')
	 							console.log(w)
	 							if(w.balance > 0.00010000){
	 								console.log("You have enough balance for an order")
	 								// check for other open orders and simply add to those?
	 								if(orders.length > 1){
		 								orders.filter(function(o2chk){
		 									console.log("Other orders.... ")
		 									console.log(o2chk)
		 								})

	 								}else{
	 								// place buy order for what we're selling ....
		 								
	 								}
	 								if(tOgre_available){
										tradeOgre.getTicker('BTC-XWP',
											function(e,r){
			 									if(typeof e == 'undefined' || !e || e == null){
			 										if(typeof r.body != 'undefined'){
			 											//if(typeof r.body.bid != 'undefined'){
			 												console.log(JSON.parse(r.body))
			 												let res = JSON.parse(r.body)
			 												if(res){
				 												let price = parseFloat(res.bid)
				 												if(price){
				 													let subTot = w.balance/price
				 													let fee = (subTot * 0.02)
				 											
					 												tradeOgre.buy('BTC-XWP',(subTot - fee).toFixed(8)+'',price+'',function(e2,r2){
					 													//console.log(e2)
					 													var response = JSON.parse(r2.body)
					 													if(response){
					 														console.log(response)
					 													}
					 												})
				 												}
			 												}
			 											//}
			 										}	
			 									}
			 									//tradeOgre.buy('BTC-XWP',
		 								
			 								}
			 							)
									}
	 								//tradeOgre.buy(o.market)
	 							}
	 							console.log('***')
	 						}
	 					})
	 				
	 				}
	 				finalOrders.push(newO)
	 			})
	 		}else{
	 			/*
					NO OPEN ORDERS
	 			*/
	 		}
	 		tOgre_orders = finalOrders
	  		
	  	}
	  } else {
	    console.log(err)
	  }
	});
 }

var tradeCallback = function(e,r){
	if(typeof r != 'undefined'){
		if(typeof r.body != 'undefined'){
		  	return r.body
		}
    }
    if(typeof e != 'undefined' && e){
    	return e
    }
    return r
}

// sells deposits in (usually) one order
var autoDepositSell = function(sellMarket,price){
	// find existing order and add to that otherwise create order provided price
}
module.exports = {
	main_loop : function(){
		console.log("trade ogre main loop")
		tradeOgreLoop()
		 setInterval(tradeOgreLoop,10000)
	},
	tradeOgreBuy : function(product,price,size){
		//(product_id,price,size
		tradeOgre.buy(product, price, size, tradeCallback)
	},
	tradeOgreSell : function(product,price,size){
		return tradeOgre.sell(product, price, size, tradeCallback)
	},
	cancelOrder : function(uuid){
		// not totally sure what to do here....
		tradeOgre.cancelOrder(uuid,console.log)
	},
	orders : function(){
		return tOgre_orders
	},
	wallets : function(filterEmpty){
		console.log("get wallets?")
		console.log(tOgre_wallets)
		return tOgre_wallets
	},
	tickers : function(){
		return tOgre_tickers
	},
	orderbook : function(){
		return tOgre_orderbook
	}
}