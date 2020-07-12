class intervalManager{
    constructor(intTimeouts,functions,start){
        console.log("CONSTRUCTION")
        console.log(intTimeouts)
        console.log(functions)
        console.log(start)
        if(typeof intTimeouts == 'object' && typeof functions == 'object'){

            if(intTimeouts.length == functions.length && intTimeouts.length > 0){
                this.intervals = intTimeouts
                this.timeouts = intTimeouts
                this.intervalsFunctions = functions
                this.populate()
                //return true
            }else{
                console.log("Could not construct.")
                //return false
            }
        }else{
            console.log('Passed other types\t' + intTimeouts + '\t'+functions + '\t' + start)
        }

    }
    deleteI(index){
        var newIntervals = []
        this.intervals.filter(function(interval,idx){
            if(idx !== index){
                newIntervals.push(index)
            }else{
                clearInterval(interval)
            }
        })
        this.intervals = newIntervals
    }
    stopI(index){
        clearInterval(this.intervals[index])
    }
    startI(index){
        if(typeof this.intervalsFunctions[index] == 'function')
        this.intervals[index] = setInterval(function(){
                                this.intervalsFunctions[index]()
                            },this.timeouts[index])

        // hmmm would need to pass a function
    }
    populate(){
        for(var idx in this.intervalsFunctions){
            var idxNum = parseInt(idx)
            this.intervalsFunctions[idxNum]()
        }
    }
    changeInt(index,newTimeout){
        this.intervals[index]
    }
    startAll(){
        for(var idx in this.timeouts){
            this.start(idx)
        }
    }
    stopAll(){
         for(var idx in this.timeouts){
            this.stop(idx)
        }
    }
    stop(index){
        var idxNum = parseInt(index)
        this.intervals[idxNum]=clearInterval(this.intervals[idxNum])
        //return this.intervals[idxNum]
    }
    start(index){
        var idxNum = parseInt(index)
        console.log("Starting " + idxNum + ' ' + this.timeouts[idxNum] )
        if(typeof this.timeouts[idxNum] != 'undefined'){
            if(this.timeouts[idxNum] > 3000){
                this.intervals[idxNum]=setInterval((this.intervalsFunctions[idxNum]),this.timeouts[idxNum])
            }else{
                console.log("Inappropriate timeout")
            }
        }else{
            console.log("Timeout was not defined")
            console.log(this.timeouts)
        }
    }
    status(index){
        // should return integer or undefine/null etc
        return this.intervals[index]
    }
}