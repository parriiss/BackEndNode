'use strict'

const er_check = require('../CheckError');

/**
 * 
 * @param   {string} value    String that has a change (update) for pad
 * @param   {number} start    Position that change starts from
 * @param   {number} end      Position that change starts from
 * @returns {object}
 * An object that represents an update on the pad
 */
function new_pad_upd(value, start ,end ){
    
    // check types of object
    if( !er_check.val_ok(value , 'string' ,
            'Error value of pad_update not string')){
        return;
    }else if( !er_check.val_ok(start, 'number' ,
            'Error pad_update start not a number' )){
        return;
    }else if(!er_check.val_ok(end, 'number' ,
            'Error pad_update end not a number' )){
        return;
    }else if(end < 0 || start < 0){
        console.trace('Pad_upd start/end invalid values');
        return;
    }

    // return new object
    return {value ,start , end};
}

/**
 * 
 * @param   {string} id       The id of the newpad NOT NULL 
 * @param   {string} value    The contents of the pad
 * @param   {string} name     The name of the pad NOT NULL
 * 
 * @returns {object} 
 * An object that represents a pad that is editted.
 * Null if invalid values are given  
 */
function new_pad_info(id, value, name){
    //  check values of

    if( !er_check.val_ok(id , 'string', 'Id of pad_info is not string') ){ return; }
    else if( !er_check.val_ok(value, 'string' , 'Value of pad_info is not string') ){ return; }
    else if( !er_check.val_ok(name , 'string' , 'Name of pad_info is not a string')){ return; } 

    var Needs_flushing = false;
    var Updates = [];

    /**
     * 
     * @param   {string} val    Value of string to update pad 
     * @param   {number} st     Offset of where the char replacement starts 
     * @param   {number} en     Offset of where the char replacement ends 
     * 
     * @returns {boolean}       True if succesfull false if not
     * 
     *  Does executes the update in the value of the pad and
     *  adds to updates array a new update with values provided
     */
    const Do_update = (val , st , en) => {
        var upd = Pad_update(val, st , en);
        if (st > value.length || en > value.length){
            console.trace('Request out of bounds\nbounds:'+
                    value.length+' request start:'+st+
                        ' request end:'+en);
            return false;
        }

        value = value.slice(0,st)+val+value.slice(en ,length(value));

        this.Updates.push(upd);
        return true;
    }

    const Rmv_updates = () => {  this.Updates = [];   }

    /**
     * Get contents of this pad from pad 
     * the file that it's referencing 
     */
    const Get_Contents= ()=>{
        // Read file
        // save contents of file in value
    }

    /**
     *  Update the contents of the file
     *  that pad is refering to
     */
    const Update_file = ()=>{
        // check if pad needs flushing
        if (this.Needs_flushing){
            // get find the right file
            // try and update it's contents
            // set needs_flushing to false if successful
            this.Needs_flushing = false;
        }
    }

    return { id , value, name , Needs_flushing , Updates , Rmv_updates , Update_file , Get_Contents , Do_update};
}

module.exports = {
    
    Pad_update: new_pad_upd,
    Pad_info: new_pad_info

}