'use strict'

const control = require('./Controller/Controller');
const express = require('express');
const app = express();
const config = require('./config.json')


app.use(express.json());

// for testing only
app.get('/', (req , res) => {
    var ip = req.header('x-forwarded-for') ||
		req.connection.remoteAddress;
	console.log('IP:%s arrived at homepage!!!' , ip);
	res.send('<h1>Hello there welcome to my page</h1>');
});

app.get('/About', control.About);

app.put('/Edit', control.Edit);

app.post('/CreateNewPad', control.NewPad);
app.post('/RenameFile', control.RenamePad);
app.delete('/DeleteFile',control.DeletePad);
const server = app.listen(config.ListeningPort , function(){
	console.log('Listening to port:'+config.ListeningPort+'...');
});
