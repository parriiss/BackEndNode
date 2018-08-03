'use strict'

const model_pad = require('./model/pad_info');
const  Con = require('./Controller/Controller');
const express = require('express');
const app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json);
app.post('/RenameFile', (req, res) => pad.RenameFile(req,res));

//app.get('/RenameFile',Con.RenameFile);
/*

app.get('/', (req , res) => {
    var ip = req.header('x-forwarded-for') ||
		req.connection.remoteAddress;
	console.log('IP:%s arrived at homepage!!!' , ip);
	res.send('<h1>Hello there welcome to my page</h1>');
});
*/


const port = process.env.port || 5000;
const server = app.listen(port, () => console.log('Listennig to port:'+port));