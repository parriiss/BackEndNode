"use strict"

const mysql = require('mysql');
const RandExp = require('randexp');
const model_pad = require('../model/pad_info');
const model_request = require('../model/request_info');
const config = require('../config.json')

/*
	***IMPORTANT***
	Probably must not start a new app, sounds really bad.
	check about this in the near future

	const express = require('express')
	var fs = require('fs');
	const app = express();
	app.use(express.json());
*/


// Array containing arrived requests
var Requests = [];
// Map that contains the active Pads
var PadMap = new Map();

/*
	Connecting to the DataBase and returnin the connection
*/
//NEED TO READ FROM CONFIG FILE FOR THE DATABASE
function Database_Connect() {
	var con = mysql.createConnection({
		host: config.Database.address,
		user: config.Database.user,
		password: config.Database.pass,
		database: config.Database.name
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

*/
/**
 * 	Creating a new Pad and add it in the PadMap and in the DataBase
 *	Response <----- JSON with id,name,value,NeedFlush,Update
 *	Status Codes: 200(OK) if success 
 *			400(BadRequest) if json in request is not right
 *			500(Internal Server Error)
 * 
 * @param {http request} req 
 * @param {http request} res 
 */
function CreateNewPad(req, res) {
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


/**
 * Generating NewId for every new Pad that is creating	 
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
/**
 *Inserting newPad in DataBase
 */
function insert_pad_id_toDB(db, id, name, ip) {
	var date = new Date();
	console.log(date);
	
	//insert new pad info to pads database 
	var sql_insert = "INSERT INTO filesMetaData SET id=? , name=?";
	var query = db.query(sql_insert, [id, name], function (err, result) {
		if (err) {
			return;
		}
		console.log("Number of records inserted: " + result.affectedRows);
	});

	// insert into history new date for session start
	sql_insert = "INSERT INTO historyFiles SET ip=?, id=?, time=?, state=?";
	var query = db.query(sql_insert, [ip, id, date, 1], function (err, result) {
		if (err) {
			return;
		}
		console.log("Number of records inserted: " + result.affectedRows);
	});
	db.end();
}


/**
 * Rename A File in the database and in the PadMap
 * Returns to Client Status Codes: 
 * 		200(OK) / 404(Pad Not Found) / 500(Internal Server Error)
 * 
 * @param {http request} req 	NewName from the client
 * @param {http request} res	JSON with id,NewName,value,NeedFlush,Update	 
 */
function RenameFile(req, res) {
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
	
	var db = Database_Connect();	
	// REMEMBER TO CLOSE CONNECTION TO DATABASE!!!!
	result = update_filename_at_DB(db, req.body.id, req.body.name);
	
	if (result === null) {
		result.status(500);
		return;
	}
	
	res.status(200);
	res.send(JSON.stringify(json_ret));
}

/**
 * Changes the name of a pad in the database 
 * 
 * @param {object} db 		Holds an already open connection to the database  
 * @param {string} padId 	String of the id of the pad to be editted
 * @param {string} newName 	String of the new name for pad  
 * 
 * @returns ????????????
 */
function update_filename_at_DB(db, padId, newName) {
	console.log(padId, newName);
	var sql_insert = "UPDATE filesMetaData SET name=? WHERE id=?";
	var query = db.query(sql_insert, [newName, padId], function (err, result) {
		if (err) {
			return null;
		}

		console.log("Number records inserted: " + result.affectedRows);
	});
}

//TODO DeleteFile
function DeleteFile(req, res) {}

/**
 * 
 * @param {http request} req 
 * @param {http request} res 
 */
function EmptyDocument(req, res) {

}

/**
 * 
 * @param {http request} req 
 * @param {http responce} res
 * Returns to client a json with the language 
 * backend is written with. 
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
	res.setHeader('Content-Type' , 'application/json');

    var saved = model_request.new_req(req.body.Pad_ID , 
					req.body.Value,
					req.body.Start,
					req.body.End,
					new Date(req.body.Req_Date*1000),
					req.body.Is_update_request);
    
    if (saved === null){
        res.status(400).send();
        return;
    } 

	
	res.status(202);
	res.send();
}

/**
 * Starts the function that checks for saved
 * requests and makes the according update
 */
function StartServing(){
	const serve = () => {
		// possible need for sorting here

		for (var v of Requests){
			var pad = PadMap[v.pad_id];
			if(pad != null){
				if ( !pad.Do_update(v.value,v.start , v.end) ){
					// possible error handling
				}

				// TODO Remove element from the array
			}else{
				console.trace('Unable to find pad:'+v.pad_id);
				
				// possible error handling

			}

		} 
	};

	// star serving requests every 4s
	setInterval(serve , 4000);
};

module.exports = {

	NewPad: CreateNewPad,
	RenamePad: RenameFile,
	About : About,
    Edit : Edit

}