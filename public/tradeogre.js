getTradeOgre = function(){
    let endPoint = '/tradeOgre'
    $.getJSON(endPoint,function(data){
        if(typeof data == 'object' && data){
            console.log(data)

        }
    })
}