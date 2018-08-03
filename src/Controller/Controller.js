"use strict"
const mysql = require('mysql');
const RandExp = require('randexp');
var bodyParser = require('body-parser');

//Map that contains the active Pads
var PadMap = new Map();

/*
Connexting to the DataBase and returnin the connection
*/
function Database_Connect() {
	var con = mysql.createConnection({
		host: "127.0.0.1",
		user: "root",
		password: "root",
		database: "onlineEditor"
	});

	con.connect(function (err) {
		if (err) throw err;
		console.log("Connected to DB!");
	});
	console.log(PadMap.size);
	return con;
}


//TODO LoadPad
function LoadPad(req, res) {

}


//TODO CreateNewPad
function CreateNewPad(req, res) {
	res.setHeader('Content-Type', 'application/json');
	var s = "NewPad";

	//INSERT IN PAD MAP

	var new_id = this.generate_pad_id();
	if (new_id === null) {
		res.status(500);
		return;
	}


	var obj = new_pad_info(new_id, "", s);
	if (obj === null) {
		res.status(500);
		return;
	}
	PadMap.set(obj);

	var db = this.Database_Connect();
	var ip = req.connection.remoteAddress;
	var result = this.insert_pad_id_toDB(db, new_id, s, ip);
	if (result === null) {
		res.status(500);
		return;
	}

	//LOGGEINUSERS IP's

	//SEND RESPONSE JSON



	res.status(200);
	res.send(JSON.stringify({ id: new_id, name: s }));


}
/*
Generating NewId for every new Pad that is creating
*/
function generate_pad_id() {
	var found = 0;
	while (true) {
		var reg = new RandExp('[a-f0-9]{16}').gen();
		PadMap.forEach(function (value, key) {
			if (key == reg) {
				found = 1;
			}
		});
		if (!found)
			break;


	}
	return reg;
}
/*
Inserting newPad in DataBase
*/
function insert_pad_id_toDB(db, id, name, ip) {
	var date = new Date();
	console.log(date);
	var sql_insert = "INSERT INTO filesMetaData SET id=? , name=?";
	var query = db.query(sql_insert, [id, name], function (err, result) {
		if (err) {
			throw err;
			return;
		}
		console.log("Number of records inserted: " + result.affectedRows);
	});
	sql_insert = "INSERT INTO historyFiles SET ip=?, id=?, time=?, state=?";
	var query = db.query(sql_insert, [ip, id, date, 1], function (err, result) {
		if (err) {
			throw err;
			return;
		}
		console.log("Number of records inserted: " + result.affectedRows);
	});
}
//TODO RenameFile
function RenameFile(req, res) {
	//var json_obj = JSON.parse(req.body);
	//res.status(200);
	console.log("AAAAAAAAAAA");
	//console.log(json_obj.id);
}
//TODO DeleteFile
function DeleteFile(req, res) {

}
//TODO EmptyDocument
function EmptyDocument(req, res) {

}
//TODO About
function About(req, res) {

}
//TODO Upd_PUT
function Upd_PUT(req, res) {

}
//TODO GetLoggedInUsers
function GetLoggedInUsers(req, res) {

}
//TODO GetPadHistory
function GetPadHistory(req, res) {

}



module.exports = {
    
   NewPad: CreateNewPad,
   RenamePad:RenameFile


}