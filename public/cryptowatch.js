/*

    Primary use case is to switch 8 screens at a time with 'presets'

    Optimization could occur when user input is disabled across charts (probably should be default)

    Should implement compression techniques to avoid repeated array elements (if string versus array kinda stuff)

    Options menu for chartsets is generated from global variable 'preset'
    potentially pull this out and run as 'standalone' for front-end stuff

    Presets are automatically generated and added to a button bar at the top of the screen,
    


    [

        'preset title',
        [ 'exchange-name1', 'exchange-name2'..],
        [ 'market-name1', 'market-name2'..]

    ]
    
*/
selectedPreset = false
selectedTimeframe = '15m'
preset = 
[
    [
        'btc-usd',
        [   'coinbasepro', 'bitfinex', 'kraken', 'bitstamp', 'gemini','bittrex','liquid','binance-us'] ,
        [   'BTCUSD', 'BTCUSD',   'BTCUSD', 'BTCUSD', 'BTCUSD', 'BTCUSD','BTCUSD','BTCUSD']
    ],

     [
        'ltc-usd',
        [   'coinbasepro', 'bitfinex', 'kraken', 'bitstamp',  'gemini', 'bittrex', 'liquid','binance-us'] ,
        [   'LTCUSD', 'LTCUSD', 'LTCUSD', 'LTCUSD', 'LTCUSD', 'LTCUSD', 'LTCUSD', 'LTCUSD']
    ],
     [
        'eth-usd',
        [   'coinbasepro', 'bitfinex', 'kraken', 'bitstamp', 'gemini','bittrex','liquid','binance-us'] ,
        [   'ETHUSD', 'ETHUSD',   'ETHUSD', 'ETHUSD', 'ETHUSD', 'ETHUSD','ETHBTC','ETHUSD']
    ],
    [
        'btc-usdc',
        [   'binance', 'poloniex', 'coinbasepro', 'hitbtc', 'liquid', 'kraken', 'gateio', 'cexio'] ,
        [   'BTCUSDC', 'BTCUSDC', 'BTCUSDC', 'BTCUSDC', 'BTCUSDC', 'BTCUSDC', 'BTCUSDC', 'BTCUSDC']
    ],
    [
        'btc-usdt',
        [   'binance','huobi','okex','hitbtc','bitz','poloniex','gateio','bitfinex'],
        [   'BTCUSDT', 'BTCUSDT', 'BTCUSDT','BTCUSDT', 'BTCUSDT', 'BTCUSDT', 'BTCUSDT','BTCUSDT']
    ],
    [
        'btc-allTares',
        [   'binance','huobi','okex','hitbtc','bitz','coinbasepro','bitfinex','kraken'],
        [   'BTCUSDT','BTCUSDT','BTCUSDT','BTCUSDT','BTCUSDT','BTCUSD','BTCUSD','BTCUSD']
    ],
    [
        'coinbase-pro-usd',
        [   'coinbasepro','coinbasepro','coinbasepro','coinbasepro','coinbasepro','coinbasepro','coinbasepro','coinbasepro'],
        [   'BTCUSD','ETHUSD','LTCUSD','BCHUSD','EOSUSD','DASHUSD','XLMUSD','XTZUSD']
    ],
    [
        'zcoin',
        [   'huobi','huobi','binance','binance','binance','hitbtc','hitbtc','bittrex'],
        [   'XZCUSDT','XZCBTC','XZCBTC','XZCETH','XZCBTC','XZCBTC','XZCUSDT','XZCBTC']
    ],
    [ 'btc-zcoin',
        [   'huobi'  ,'hitbtc','binance','bittrex','huobi','hitbtc','binance','bittrex'],

        [   'BTCUSDT','BTCUSDT','BTCUSDT','BTCUSD','XZCUSDT','XZCUSDT','XZCBTC','XZCBTC']
    ],
    [ 'btc-ltc',
        [   'huobi'  ,'hitbtc','binance','bittrex','huobi','hitbtc','binance','bittrex'],

        [   'BTCUSDT','BTCUSDT','BTCUSDT','BTCUSD','LTCUSDT','LTCUSDT','LTCBTC','LTCBTC']
    ],
     [ 'btc-beam',
        [  'binance' , 'gateio','binance'  ,'gateio','binance','gateio','binance','gateio'],

        [   'BTCUSDT', 'BTCUSDT','BEAMBTC','BEAMUSDT','BEAMUSDT','BEAMBTC','BEAMBNB','BEAMETH']
    ],
    [ 'LTC-XZC',
        [   'hitbtc','binance','hitbtc','binance','hitbtc','binance','binance','hitbtc'],

        [   'BTCUSDT','BTCUSDT','XZCBTC','XZCBTC','LTCBTC','LTCBTC','LTCUSDT','LTCUSDT']
    ],
    [ 'RVN',
        [   'binance','binance','bittrex','bittrex','binance','bittrex','okex','okex'],

        [   'BTCUSDT','RVNUSDT','BTCUSDT','RVNUSDT','RVNBTC','RVNBTC','RVNUSDT','RVNBTC']
    ],
]

var timeframes = [  
                        '15m',
                        '1m', 
                        '3m', 
                        '5m', 
                        '30m', 
                        '1h', 
                        '2h', 
                        '4h', 
                        '6h', 
                        '12h', 
                        '1d', 
                        '3d', 
                        '1w'
                ]

var colorPresets = [    'standard',
                        'candycane',
                        'albuquerque',
                        'epaper',
                        'delek',
                        'blueprint',
                        'ballmer',
                        'bushido',
                        'ishihara'
]

var exchanges = [   null,
                    "bitFlyer",
                    "bitflyer",
                    "Bittrex",
                    "bittrex",
                    "Gemini",
                    "gemini",
                    "Luno",
                    "luno",
                    "Gate.io",
                    "gateio",
                    "Bitfinex",
                    "bitfinex",
                    "Kraken",
                    "kraken",
                    "CEX.IO",
                    "cexio",
                    "Bisq",
                    "bisq",
                    "BitMEX",
                    "bitmex",
                    "Okex",
                    "okex",
                    "Kraken Futures",
                    "kraken-futures",
                    "Liquid",
                    "liquid",
                    "Quoine",
                    "quoine",
                    "BitBay",
                    "bitbay",
                    "HitBTC",
                    "hitbtc",
                    "Binance",
                    "binance",
                    "Binance.US",
                    "binance-us",
                    "Huobi",
                    "huobi",
                    "Poloniex",
                    "poloniex",
                    "Coinbase Pro",
                    // this is weird AF... my system uses coinbasepro , they use coinbase-pro - only switched out when using embed api
                    "coinbasepro",
                    "Bitstamp",
                    "bitstamp",
                    "Bit-Z",
                    "bitz",
                    "Bithumb",
                    "bithumb",
                    "Coinone",
                    "coinone",
                    "DEX (aggregated)",
                    "dex-aggregated",
                    "OKCoin",
                    "okcoin"
                ]


// used to determine document widths/heights 
// works for two rows only
var calcWindowSize = function(){
    var n = 8
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight|| e.clientHeight|| g.clientHeight;
    var divisor = 1;
    graphHeight = y 
    if(n % 4 === 0 && n > 6){
        divisor = 4
        if(n > 4){
            graphHeight = graphHeight/2
        }
        // keep full i
    }else if(n == 6 || n == 5){

        divisor = 3
        graphHeight = (graphHeight/2)

    }else if(n  === 4){
        divisor = 2
        graphHeight = graphHeight/2
        // full width
    }else if(n % 3 === 0 || n < 5){
        if(n > 4){
            graphHeight = graphHeight/2
        }
        divisor = 3
    }else if(n % 2 === 0){
        divisor = 2
    }else{
        divisor = n
    }
    graphWidth = (x / (divisor)) - 15
    //make adjustment for sidebar?

    return [graphWidth,graphHeight]
}

// change name this is generate chartForm but not using it anyway
var generateChart = function(target,selectedExchange,selectedSymbol,selectedColorPreset){
    return true
    var chart = document.getElementById(target)
  
    if(typeof chart != 'undefined' && chart){
        // destroy first?
        chart.innerHTML = ''
        var theForm = '<form><input type="text" value="'+selectedSymbol+'"/>'
      
        theForm += '<select id="'+target+'_exchange'+'">'
        exchanges.filter(function(e,i){
            if(i>0 && i%2 === 0){
                var exchangeTitle = exchanges[i-1]
                theForm += '<option'+(selectedExchange === e ? ' selected':'')+' value="'+e+'">'+exchangeTitle+'</option>'
            }
        })
        theForm += '</select>'
        theForm += '<select id="'+target+'_colorPreset">'

        colorPresets.filter(function(p){
            theForm += '<option>'+p+'</option>'
        })
    
        theForm += '</select>'
        chart.innerHTML = theForm + '</form>'
    }
}

var embedChart = function(target,exchange,symbol,timeframe,width,height){
    if(typeof exchange == 'undefined'){
        exchange = 'binance'
    }
    if(typeof symbol == 'undefined'){
        symbol = 'BTCUSD'
    }
    if(typeof timeframe == 'undefined'){
        timeframe = '15m'
    }
    if(typeof width == 'undefined'){
        width = graphWidth
    }
    if(typeof height == 'undefined'){
        height = graphHeight
    }
    if(exchange == 'coinbasepro'){
        exchange = 'coinbase-pro'
    }
    var chart = new cryptowatch.Embed(exchange, symbol, {
      width: width,
      height: height,
      timePeriod : timeframe
    });
    if(chart){
        if(document.getElementById(target) != 'undefined' && document.getElementById(target)){
            document.getElementById(target).innerHTML=''
            chart.mount('#'+target)
        }else{
            console.log("TARGET NOT FOUND")
        }
        return true
    }
    return false
}

var buildGrid = function(exchanges,symbols){
    var chartCount = exchanges.length
    for(var x = 0; x < chartCount;x++){
        generateChart('cc_'+(x+1),exchanges[x],symbols[x],selectedTimeframe)
        embedChart('ccc_'+(x+1),exchanges[x],symbols[x],selectedTimeframe)
    }
}

var loadPreset = function(number,timeframe){
    calcWindowSize()
    var p =  (typeof preset[number] != 'undefined' && preset[number] && typeof preset[number][0] != 'undefined' && typeof preset[number][1] != 'undefined' ? preset[number] : false)
    if(p){
        selectedPreset = number
        buildGrid(p[1],p[2])
        return true
    }
    return false
}

generatePresetsMenu = function(targetId){
    if(typeof targetId == 'undefined'){
        targetId = 'ccButtons'
    }
    // generate menu to select preset and attach event listener for click
    var target = document.getElementById(targetId)
    preset.filter(function(p,i){
        var title = p[0]
        var exchanges = p[1]
        var symbols = p[2]
        var button = document.createElement("button");
        button.innerHTML = title;
        target.appendChild(button);
        button.addEventListener ("click", function() {
          loadPreset(i)
        });
    })
    // generate timeframe menu
    var menu = document.createElement("select")
    menu.id = 'tfSelect'
    timeframes.filter(function(f){
        var option = document.createElement("option")
        option.text = f;
        menu.add(option);
    })
    // handle timeframe menu change, reload charts with selected preset
    menu.addEventListener('change',function(){
        var option = document.getElementById('tfSelect').value;
        if(typeof option != 'undefined' && option){
            if(timeframes.indexOf(option) > -1){
                selectedTimeframe = option
                if(selectedPreset){
                    loadPreset(selectedPreset,option)
                }
                return true
            }           
        }
        return false
    })
    target.appendChild(menu)
    return true
}
