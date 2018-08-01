'use strict'
const er_check = require('../CheckError');

// a map containing all users currently editting pads 
const LoggedInUsers = new Map();

/**
 * 
 * @param {string} pad  The id of the pad that user 
 *                      will be added (is editting)
 * @param {string} ip   The ip address of the user
 */
const add_user = (pad , ip)=>{
    // check values of input
    if (!er_check.val_ok(pad, 'string',
            'Error trying to enter in map non string as id')){
        return;
    }else if(!er_check.val_ok(ip, 'string',
            'Error trying to add in map ip with non string value')){
        return;
    } 

    // if it's first time we encounter pad
    // add it to new pair in map with a new array as value
    if (LoggedInUsers.has(pad)){
        LoggedInUsers.set(pad , [ip]);
    }else{
        LoggedInUsers[pad].push(ip);
    }
}

/**
 * 
 * @param {string array} users An array containing all the users' ip 
 *                             address that will be removed
 */
const remove_users = (users)=>{
    for (ip of users){
        if (typeof ip != 'string') { continue; }

        for ( val of LoggedInUservalues() ){
            var i = 0;
            for( arrval of val){
                if (arrval === ip){
                    val.splice(i, 1);
                }
                i++;
            }
        }
    }
}

/**
 * 
 * @param {string} pad The pad that the ip of the user exists
 * @param {string} ip  The ip of the user that will be removed
 */
const remove_user_fromPad=(pad, ip)=>{
    if (typeof pad != 'string') { return; }
    if (typeof ip != 'string') { return; }

    var i = 0;
    for(val of LoggedInUsers[pad]){
        if(val === ip){
            LoggedInUsers.splice(i,1);
        }
        i++;
    }   
}

module.export = {
    Users : LoggedInUsers,
    AddUser : add_user,
    RemoveUsers : remove_users,
    RemoveUsers_fromPad : remove_user_fromPad 
}