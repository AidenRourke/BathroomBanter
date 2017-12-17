
// ==================================================================================
// Declaration of constant variables and imports of node modules
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const http = require('http');
const express = require('express');
const PORT = process.env.PORT || 3000
const app = express();

let db = new sqlite3.Database('./washrooms.db',sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

// ==================================================================================


// ==================================================================================
// Middleware declaration
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// ==================================================================================


// ==================================================================================
// API GET Requests

//Gets a list for all the buildings
app.get('/listOfBuildings', (request, response) => {
  var returnObject = {};
  var listOfBuildings = [];
  var sqlQuery = 'SELECT building FROM washrooms;';
  db.all(sqlQuery,[],(err,rows)=>{
    if(err)
      throw err;
    rows.forEach((element)=>{
      if(listOfBuildings.indexOf(element.building) == -1){
        console.log('Building: ' + element.building);
        listOfBuildings.push(element.building);
      }
    });
  });
  returnObject.listOfBuildings = listOfBuildings;
  return(returnObject);
});

// Gets a list of floors for a building
// Example Request: http://localhost:3000/listOfFloors?building=Herzberg+Laboratories
app.get('/listOfFloors', (request, response) => {
  var returnObject = {};
  var listOfFloors = [];
  var sqlQuery = 'SELECT floor FROM washrooms WHERE building LIKE "%' + request.query.building + '%";';
  db.all(sqlQuery,[],(err,rows)=>{
    if(err)
      throw err;
    rows.forEach((element)=>{
      if(listOfFloors.indexOf(element.floor) == -1){
        console.log(request.query.building + ' has Floor: ' + element.floor);
        listOfFloors.push(element.floor);
      }
    });
  });
  returnObject.listOfFloors = listOfFloors;
  return(returnObject);
});

// ==================================================================================

app.listen(PORT, err => {
  if(err) console.log(err)
  else {
    console.log(`Server listening on port: ${PORT}`)
  }
});
