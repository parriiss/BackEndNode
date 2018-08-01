'use strict'

// Contains a single function (add more if you want)
// for checking the type of a value and printing a message an the stack trace of 
// where check returned negative
module.exports = {
    val_ok : (val, check, msg) => {
        if (typeof val != check){
            console.trace(msg)
            return false;
        }
        return true;
    }
}