"use strict";
const  control = require('./Controller/Controller');
const model_pad = require('./model/pad_info');
const http = require('http');
var express = require('express');
var app = express();
app.use(express.json());
app.post('/CreateNewPad', control.NewPad);
app.post('/RenameFile', control.RenamePad);
var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});