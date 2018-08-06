'use strict'
const util = require('util');
const model_pad = require('../model/pad_info');
const check = require('../CheckError');
const model_request = require('../model/request_info');

// ***CAREFUL WHEN MERGING***
let PadMap = new Map();
let Requests = [];

/**
 * 
 * @param {http request} req 
 * @param {http responce} res
 * Returns to client a json with the language 
 * backend is written with. 
function req_info(pad_id , value , start, end, date , Is_update_request){
 * 
 */
function About(req , res){
    res.set('Content-Type', 'application/json');
    res.send({Lang : 'NodeJS'});
}

/**
 * 
 * @param {http.request} req 
 * @param {http.responce} res
 * Receives a JSon representing a request to update 
 * pad 
 */
function Edit(req , res){
    console.log(req.body);
    var saved = model_request.new_req(req.body.Pad_ID , 
        req.body.Value,
        req.body.Start,
        req.body.End,
        req.body.Req_date,
        req.body.is_update);
    
    if (saved === null){
        res.status(400).send();
        return
    } 

    console.log('Received:\n\t'+util.inspect(req.body));
    console.log('Saved: '+util.inspect(saved));

    res.status(202);
    res.send();
}


module.exports = {
    About : About,
    Edit : Edit
};