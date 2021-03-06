// names.js
var parse = require("csv-parse");
var fs = require('fs');

var csv_path = [
	"First_Names.csv",
	"Last_Names.csv"
	];

var prefixes = process.env.CSV_PREFIX || "./names/CSV_Database_of_";

csv_path[0] = prefixes + csv_path[0];
csv_path[1] = prefixes + csv_path[1];

var _ = module.exports = {};

_.Data = function(c){
	this.firstnames = [];
	this.lastnames = [];

	var root = this;
	var st = fs.createReadStream(csv_path[0]).pipe(
		parse({}, function(err, data){
			root.firstnames = data;
			c && c();
		}));
	//c && st.on('finish', c);
	// fs.createReadStream(__dirname+csv_path[0]).pipe(
	// 	parse({}, function(err, data){
	// 		console.log(data);
	// 		this.lastnames.push(data);
	// 	})
	// 	);
}

/*
Use case as follow

var name = require("../names"); //if your file is in subfolder or whatever, put relative path

var data = new name.Data(function(){
	//Will be called once names get initialised

	for (var i = 0; i < data.firstnames.length; ++i) {
		console.log(data.firstnames[i]); //access to one first name and do staff
	}

	//for now lastnames is not retrieved since i didnt need it, can do by uncomment code above
	//and add a bit of additional staff
});

*/