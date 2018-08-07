'use strict'

const check = require('../CheckError');

/**
 * 
 * @param {string} pad_id               The id of the pad request is for Not null
 * @param {string} value                The value of the update that is requested Not null
 * @param {string} date                 When the request was send
 * @param {number} start                Position that we start replacing chars from pad
 * @param {number} end                  Position that we end replacing chars in pad
 * @param {boolean} Is_update_request   Boolean that signals it is a special edit req that
 *                                       asks if anything has changed
 * 
 * Returns an object that represents the request that
 * was received for pad editting
 */
function Req_info(pad_id , value , start, end, date , Is_update_request){
    if( !check.val_ok(pad_id, 'string', 'Invalid padid for request')){
        return;
    }else if( !check.val_ok(value, 'string', 'Invalide value for request')){
        return;
    }else if( !check.val_ok(start, 'number', 'Invalid start for request')){

    }
    if(date === null){
        console.trace('Invalid date of request');
        return;
    }

    return {pad_id , value , start, end , date , Is_update_request};
}


module.exports = {
    new_req     : Req_info,
    Requests    : Requests
};