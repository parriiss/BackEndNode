"use strict"
const mysql = require('mysql');
const express = require('express')
const RandExp = require('randexp');
const model_pad = require('../model/pad_info');
var fs = require('fs');
const app = express();
app.use(express.json());

//Map that contains the active Pads
var PadMap = new Map();

/*
Connexting to the DataBase and returnin the connection
*/

//NEED TO READ FROM CONFIG FILE FOR THE DATABASE
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


/*
Creating a new Pad and add it in the PadMap and in the DataBase
Response <----- JSON with id,name,value,NeedFlush,Update
Status Codes: 200(OK) , 400(BadRequest) , 500(Internal Server Error)
*/function CreateNewPad(req, res) {
	res.setHeader('Content-Type', 'application/json');
	var s = "NewPad";

	//INSERT IN PAD MAP
	var new_id = generate_pad_id();
	if (new_id === null) {
		res.status(500);
		return;
	}

	var file_path = "./SavedFiles/" + new_id + ".txt";
	if (!fs.existsSync("./SavedFiles/")) {
		fs.mkdirSync("./SavedFiles/");
	}

	var obj = model_pad.Pad_info(new_id, "", s);
	if (obj === null) {
		res.status(400);
		return;
	}
	PadMap.set(new_id, obj);
	fs.open(file_path, 'w', function (err, file) {
		if (err) {
			PadMap.delete(new_id);
			res.status(500);
			return;
		}
		console.log('Saved!');
	});
	var db = Database_Connect();
	var ip = req.connection.remoteAddress;
	var result = insert_pad_id_toDB(db, new_id, s, ip);
	if (result === null) {
		PadMap.delete(new_id);
		fs.unlink(fie_path, function (err) {
			if (err) { res.status(500); return; }
			console.log('File deleted!');
		});
		res.status(500);
		return;
	}

	//LOGGEDINUSERS IP's
	console.log(PadMap.get(new_id).name);
	res.status(200);
	res.send(JSON.stringify(obj));


}
/*
Generating NewId for every new Pad that is creating
*/
function generate_pad_id() {

	while (true) {
		var reg = new RandExp('[a-f0-9]{16}').gen();
		var ret = PadMap.get(reg);

		if (ret == undefined) {
			return reg;
		}


	}
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
			return;
		}
		console.log("Number of records inserted: " + result.affectedRows);
	});
	sql_insert = "INSERT INTO historyFiles SET ip=?, id=?, time=?, state=?";
	var query = db.query(sql_insert, [ip, id, date, 1], function (err, result) {
		if (err) {
			return;
		}
		console.log("Number of records inserted: " + result.affectedRows);
	});
	db.end();
}
/*
Rename A File in the database and in the PadMap
Request <----- NewName from the client
Response <----- JSON with id,NewName,value,NeedFlush,Update
Status Codes: 200(OK) , 404(Pad Not Found) , 500(Internal Server Error)
*/
function RenameFile(req, res) {
	var db = Database_Connect();
	res.setHeader('Content-Type', 'application/json');
	var pad_obj = PadMap.get(req.body.id);
	var result;
	if (pad_obj === undefined) {
		console.log("Pad not found");
		res.status(404);
		return;
	}
	PadMap.get(req.body.id).name = req.body.name;
	var json_ret = PadMap.get(req.body.id);
	result = update_filename_at_DB(db, req.body.id, req.body.name);
	if (result === null) {
		result.status(500);
		return;
	}
	res.status(200);
	res.send(JSON.stringify(json_ret));

}

function update_filename_at_DB(db, padId, newName) {
	console.log(padId, newName);
	var sql_insert = "UPDATE filesMetaData SET name=? WHERE id=?";
	var query = db.query(sql_insert, [newName, padId], function (err, result) {
		if (err) {
			return null;
		}
		console.log("Number  records inserted: " + result.affectedRows);
	});
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
	RenamePad: RenameFile


}