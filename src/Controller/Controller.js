"use strict"

const mysql = require('mysql');
const RandExp = require('randexp');
const model_pad = require('../model/pad_info');
const model_request = require('../model/request_info');
const config = require('../config.json')
const user = require('../model/users_info');
const config = require('../config.json');
var fs = require('fs');

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
function Database_Connect() {
	var con = mysql.createConnection({
		host: config.Database.address,
		user: config.Database.user,
		password: config.Database.pass,
		database: config.Database.name
	});

	con.connect(function (err) {
		if (err) return null;
		console.log("Connected to DB!");
	});
	console.log(PadMap.size);
	return con;
}


//TODO LoadPad
function LoadPad(req, res) {

}

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
		res.status(500).send();
		return;
	}

	var file_path = config.FilesDir + new_id + ".txt";
	if (!fs.existsSync(config.FilesDir)) {
		fs.mkdirSync(config.FilesDir);
	}

	var obj = model_pad.Pad_info(new_id, "", s);
	if (obj === null) {
		res.status(400).send();
		return;
	}

	PadMap.set(new_id, obj);
	fs.open(file_path, 'w', function (err, file) {
		if (err) {
			PadMap.delete(new_id);
			res.status(500).send();
			return;
		}
		console.log('Saved!');
	});

	var db = Database_Connect();
	if (db === null) {
		res.status(500).send();
		return;
	}
	var ip = req.connection.remoteAddress;
	var result = insert_pad_id_toDB(db, new_id, s, ip);
	db.end();
	if (result === null) {
		PadMap.delete(new_id);
		fs.unlink(file_path, function (err) {
			if (err) { res.status(500).send(); return; }
			console.log('File deleted!');
		});
		res.status(500).send();
		return;
	}

	//LOGGEDINUSERS IP's
	user.AddUser(new_id, ip);
	console.log(PadMap.get(new_id).name);
	res.status(200);
	res.send(JSON.stringify(obj));
}


/**
 * Generating NewId for every new Pad that is creating	 
 * @returns {string} Returns the id that it has been generated
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
@param {mysqlConnection} db
@param {string} id
@param {string} name
@param {string} ip
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
		res.status(404).send();
		return;
	}

	PadMap.get(req.body.id).name = req.body.name;
	var json_ret = PadMap.get(req.body.id);

	var db = Database_Connect();
	// REMEMBER TO CLOSE CONNECTION TO DATABASE!!!!
	result = update_filename_at_DB(db, req.body.id, req.body.name);
	db.end();

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
 * @returns null on Error/newName on success
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
	return newName;
}

/**
 * Delete a file from DB,locally and the map
 * 200(OK) / 404(Pad Not Found) / 500(Internal Server Error)
 * @param {http request} req 
 * @param {http request} res 
 */function DeleteFile(req, res) {
	var pad_obj = PadMap.get(req.body.id);
	if (pad_obj === undefined) {
		console.log("Pad not found");
		res.status(404).send();
		return;
	}
	var recPath = "./" + pad_obj.id + "-Backup" + ".txt";

	var originalPath = config.FilesDir + pad_obj.id + ".txt";
	var result = CreateBackupFile(originalPath, recPath);
	if (result === null) {
		res.status(500).send();
		return;
	}
	fs.unlink(originalPath, (err) => {
		if (err) {
			fs.rename(recPath, originalPath, (err) => {
				if (err) {
					res.status(500).send();
					return;
				}
				console.log('renamed complete');
			});

		}
		console.log('successfully deleted ' + originalPath);
	});
	var db = Database_Connect();
	if (db === null) {
		fs.rename(recPath, originalPath, (err) => {
			if (err) {
				res.status(500).send();
				return;
			}
			console.log('renamed complete');
		});
		res.status(500).send();
		return;
	}
	result = deletePadFromDB(db, pad_obj.id);
	db.end();
	if (result === null) {
		fs.rename(recPath, originalPath, (err) => {
			if (err) {
				res.status(500).send();
				return;
			}
			console.log('renamed complete');
		});
		res.status(500).send();
		return;
	}
	PadMap.delete(pad_obj.id);
	fs.unlink(recPath, (err) => {
		if (err) {
			return;
		}
		console.log('successfully deleted' + recPath);
	});
	res.status(200);
	res.send();
}


/**
 * @param {string} originalPath
 * @param {string} recPath
 */

function CreateBackupFile(originalPath, recPath) {
	fs.open(recPath, 'w', function (err, file) {
		if (err) {
			res.status(500).send();
			return null;
		}
		console.log('Saved!');
	});
	fs.createReadStream(originalPath).pipe(fs.createWriteStream(recPath));
	return 1;
}
/**
 * @param {mysqlConnection} db
 * @param {string} 			pid Id of the Pad
 *
 *  @returns null on error/Empty string on success
 */

function deletePadFromDB(db, pid) {
	var sql_insert = "DELETE FROM filesMetaData where id=? ";
	var query = db.query(sql_insert, [pid], function (err, result) {
		if (err) {
			return null;
		}
	});


	sql_insert = "DELETE  FROM historyFiles WHERE id=?";
	var query = db.query(sql_insert, [pid], function (err, result) {
		if (err) {
			return null;
		}
	});
	return "";

}
/**
 * 
 * @param {http request} req 
 * @param {http request} res 
 * 
 * Status Codes 404(File not Found in Map)/200 Status ok
 */
function EmptyDocument(req, res) {
	var pad_obj = PadMap.get(req.body.id);
	if (pad_obj === undefined) {
		console.log("Pad not found");
		res.status(404).send();
		return;
	}
	var originalPath = config.FilesDir + pad_obj.id + ".txt";
	fs.truncate(originalPath, 0, function () { console.log('Truncation of the file <' + originalPath + '> done') })
	res.status(200).send();
}

/**
 * 
 * @param {http request} req 
 * @param {http responce} res
 * 
 * Returns to client a json with the language 
 * backend is written with. 
 */
function About(req, res) {
	res.set('Content-Type', 'application/json');
	res.send({ Lang: 'NodeJS' });
}

/**
 * 
 * @param {http request} 	req 
 * @param {http responce} 	res
 * 
 * Receives a JSon representing a request to update 
 * pad 
 */
function Edit(req, res) {
	res.setHeader('Content-Type', 'application/json');

	var saved = model_request.new_req(req.body.Pad_ID,
		req.body.Value,
		req.body.Start,
		req.body.End,
		new Date(req.body.Req_Date * 1000),
		req.body.Is_update_request);

	if (saved === null) {
		res.status(400).send();
		return;
	}


	res.status(202);
	res.send();
}

/**
 * Starts the function that checks for saved
 * requests and makes the according update
 * 
 */
function StartServing() {
	const serve = () => {
		// possible need for sorting here
		Requests.sort(model_request.byDate)

		for (i in Requests) {
			var pad = PadMap[v.pad_id];

			if (pad != null) {
				if (!pad.Do_update(Requests[i].value,
					Requests[i].start, Requests[i].end)) {
					// possible error handling
				}

				// no race conditions for requests array 
				// since nodejs runs on a single thread
			} else {
				console.log('Unable to find pad:' + Requests[i].pad_id);

				// possible error handling

			}

			// Remove element from the array
			Requests.splice(i, 1);
		} // end-of for-in loop

	};	// end-of serve function 

	// star serving requests every 4s
	setInterval(serve, 4000);
};

module.exports = {

	NewPad: CreateNewPad,
	RenamePad: RenameFile,
	DeletePad: DeleteFile,
	EmptyPad: EmptyDocument,
	About: About,
	Edit: Edit

}