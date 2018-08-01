"use strict"

const express = require('express')
const pads = require('./model/pad_info')
const app = express()

// uncomment if you wan
// var pad = pads.Pad_info("ID" , "THIS IS VALUE" , "MYPAD");
// console.log("This is a new pad, id: "+ pad.id )




const server = app.listen(8080, () => console.log('Listennig to port 8080...'));