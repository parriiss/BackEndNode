"use strict";
const mysql = require('mysql');
const RandExp = require('randexp');

//Map that contains the active Pads
let PadMap = new Map();
module.exports = class Controller {

	/*
	Connexting to the DataBase and returnin the connection
	*/
	Database_Connect() {
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
	LoadPad(req, res) {

	}


	//TODO CreateNewPad
	CreateNewPad(req, res) {
		res.setHeader('Content-Type', 'application/json');
		var s = "NewPad";

		//INSERT IN PAD MAP

		var new_id = this.generate_pad_id();
		if (new_id === null) {
			res.status(500);
			return;
		}



		PadMap.set(new_id, s);

		var db = this.Database_Connect();
		var ip = req.connection.remoteAddress;
		var result = this.insert_pad_id_toDB(db, new_id, s,ip);
		if (result === null) {
			res.status(500);
			return;
		}

		//LOGGEINUSERS IP's

		//SEND RESPONSE JSON




		res.send(JSON.stringify({ id: new_id, name: s }));


	}
	/*
	Generating NewId for every new Pad that is creating
	*/
	generate_pad_id() {
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
	insert_pad_id_toDB(db, id, name,ip) {
		var date=new Date();
		console.log(date);
		var sql_insert = "INSERT INTO filesMetaData SET id=? , name=?";
		var query = db.query(sql_insert, [id, name], function (err, result) {
			if (err) {
				throw err;
				return;
			}
			console.log("Number of records inserted: " + result.affectedRows);
		});
		sql_insert="INSERT INTO historyFiles SET ip=?, id=?, time=?, state=?";
		var query = db.query(sql_insert, [ip,id,date, 1], function (err, result) {
			if (err) {
				throw err;
				return;
			}
			console.log("Number of records inserted: " + result.affectedRows);
		});
	}
	//TODO RenameFile
	RenameFile(req, res) {

	}
	//TODO DeleteFile
	DeleteFile(req, res) {

	}
	//TODO EmptyDocument
	EmptyDocument(req, res) {

	}
	//TODO About
	About(req, res) {

	}
	//TODO Upd_PUT
	Upd_PUT(req, res) {

	}
	//TODO GetLoggedInUsers
	GetLoggedInUsers(req, res) {

	}
	//TODO GetPadHistory
	GetPadHistory(req, res) {

	}



}
