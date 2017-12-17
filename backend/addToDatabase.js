//WARNING DO NOT RUN THIS FILE UNLESS FOR INITIAL DEVELOPMENT/TESTING.
//WILL ERASE ALL THE DATABASE INFORMATION
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

//This program adds the data from initialData.xml into the SQLite DB

var fs = require('fs'); //built in node file system module
var lineReader = require('line-reader');
var sqlite3 = require('sqlite3').verbose();

function writeWashroomsToFile(washrooms){
  var filePath = 'test.txt';
  var outStream = fs.createWriteStream(filePath);
  for (i in washrooms) {
    outStream.write(`${i}: ${washrooms[i].id}\n`);
  }
  outStream.end();
  outStream.on('finish', function() {
    console.log('Writing to ' + filePath + ' complete');
  });
}

function writeWashroomsToDatabase(washrooms){
  var db = new sqlite3.Database('washrooms.db');
  db.serialize(function() {

     //drop existing table from database
     var sqlString = "DROP TABLE IF EXISTS washrooms;";
     db.run(sqlString);

	 //create table in the current database
     sqlString = "CREATE TABLE washrooms (room_num integer, male integer, female integer, average_rating real, cleanliness real, size real , toilet_paper real, traffic real, floor integer,building text, id text);";

     db.run(sqlString);

     //use prepared statements to help prevent sql injection
     /*
     Prepared statements consist of SQL with ? parameters for data.
     Prepared statements are pre-compiled as SQL so that one cannot
     insert, or inject, SQL commands for the ? parameters.
     */
     var stmt = db.prepare("INSERT INTO washrooms (room_num,male,female,average_rating,cleanliness,size,toilet_paper,traffic,floor,building,id) VALUES (?,?,?,?,?,?,?,?,?,?,?);");
     for (var i = 0; i < washrooms.length; i++) {
   	    washroom = washrooms[i];
        stmt.run(washroom.room_num,washroom.male,washroom.female,washroom.average_rating,washroom.cleanliness,washroom.size,washroom.toilet_paper,washroom.traffic,washroom.floor,washroom.building,washroom.id);
     }
     stmt.finalize();

     db.each("SELECT id FROM washrooms;", function(err, row) {
         console.log(row.id);
     });

  });
  db.close();
}


//FILE PARSING CODE
function isTag(input){
	return input.startsWith("<");
}
function isOpeningTag(input){
	return input.startsWith("<") && !input.startsWith("</");
}
function isClosingTag(input){
	return input.startsWith("</");
}

var dataString = ''; //data between tags being collected
var openingTag = ''; //xml opening tag
var washrooms = []; //recipes parsed
var washroom = {};  //recipe being parsed

//read aLaCarteData xml file one line at a time
//and parse the data into a JSON object string
//PRERQUISITE: the file must be validated XML

lineReader.eachLine(
    'initialData.xml',
    function(line, last) {
	    str = line.trim();
		if(isOpeningTag(str)){
			openingTag = str;
			dataString = '' //clear data string
		}
		else if(isClosingTag(str)){
		   if(str === '</id>') {
			   washroom.id = dataString;
		   }
		   else if(str === '</room_num>'){
			   washroom.room_num = dataString;
		   }
       else if(str === '</male>'){
         washroom.male = dataString;
       }
       else if(str === '</female>'){
         washroom.female = dataString;
       }
       else if(str === '</average_rating>'){
         washroom.average_rating = dataString;
       }
       else if(str === '</cleanliness>'){
         washroom.cleanliness = dataString;
       }
       else if(str === '</size>'){
         washroom.size = dataString;
       }
       else if(str === '</toilet_paper>'){
         washroom.toilet_paper = dataString;
       }
       else if(str === '</traffic>'){
         washroom.traffic = dataString;
       }
       else if(str === '</floor>'){
         washroom.floor = dataString;
       }
       else if(str === '</building>'){
         washroom.building = dataString;
       }
		   else if(str === '</washroom>'){
			   washrooms.push(washroom);
			   washroom = {};
		   }
           openingTag = '';
		   //console.log("LINE " + str)
		}
		else {
			dataString += (" " + str);
		}

        if (last) {
		   //done reading file
           console.log("DONE");
 		   console.log(JSON.stringify(washrooms, null, 4));
           writeWashroomsToFile(washrooms);
           writeWashroomsToDatabase(washrooms);
		   console.log('Number of Washrooms: ' + washrooms.length);
           return false; // stop reading
           }
});