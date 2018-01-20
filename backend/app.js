
// ==================================================================================
// Declaration of constant variables and imports of node modules
require('dotenv').config();
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const http = require('http');
const https = require('https');
const express = require('express');
const PORT = process.env.PORT || 8080
const app = express();

var googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_KEY,
});


let db = new sqlite3.Database('./washrooms.db',sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

let db1 = new sqlite3.Database('./buildings.db',sqlite3.OPEN_READWRITE, (err) => {
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
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
// ==================================================================================


// ==================================================================================
// API GET Requests

//Gets closest buildings from Coord
//Exaple Request: http://localhost:3000/getLocationFromCoord?latitude=45.3820829&longitude=-75.6994726
app.get('/getBuildingsFromCoord', (request, res) => {
  var buildingsArray = [];
  var returnObj = {};
  var latitude = request.query.latitude;
  var longitude = request.query.longitude;
  var sqlQuery = 'SELECT name, lat, long FROM buildings;';
  db1.all(sqlQuery,[],(err,rows)=>{
    if(err)
    throw err;
    rows.forEach((element)=>{
        var building = {name: element.name, lat: element.lat, long: element.long};
        buildingsArray.push(building);
      });
      var coords = [];
      for (var i = 0; i < buildingsArray.length; i++) {
        coords.push(buildingsArray[i].lat + ',' + buildingsArray[i].long);
      }
      googleMapsClient.distanceMatrix({
        origins: latitude + ',' + longitude,
        destinations: coords,
        mode: 'walking'
      }, function(err, response) {
        if (!err) {
          var arrayOfBuildingObjs = [];
          for (var i = 0; i < response.json.rows[0].elements.length; i++) {
              arrayOfBuildingObjs.push({name:buildingsArray[i].name, distance:response.json.rows[0].elements[i].distance.value });
              console.log(buildingsArray[i].name + ' is ' + response.json.rows[0].elements[i].distance.value + 'm away.');
          }
          arrayOfBuildingObjs.sort(function(a, b){return a.distance-b.distance});
          console.log(arrayOfBuildingObjs);
          var returnArray = [];
          for (var i = 0; i < arrayOfBuildingObjs.length; i++) {
            returnArray.push(arrayOfBuildingObjs[i].name);
          }
		  returnObj.listOfBuildings = returnArray;
          res.json(returnObj);
        }
        else{
          console.log(err);
        }
      });
  });

});
//Gets a list for all the buildings
app.get('/listOfBuildings', (request, response) => {
  var returnObject = {};
  var listOfBuildings = [];
  var sqlQuery = 'SELECT name FROM buildings;';
  db1.all(sqlQuery,[],(err,rows)=>{
    if(err)
    throw err;
    rows.forEach((element)=>{
        console.log('Building: ' + element.building);
        listOfBuildings.push(element.building);
    });
    returnObject.listOfBuildings = listOfBuildings;
    response.json(returnObject);
  });

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
    returnObject.listOfFloors = listOfFloors;
    response.json(returnObject);
  });
});

// Gets a list of washrooms on floor for a building
// Example Request: http://localhost:3000/listOfWashroomsOnFloor?building=Herzberg+Laboratories&floor=4&sort=average_rating
app.get('/listOfWashroomsOnFloor', (request, response) => {
  var returnObject = {};
  var listOfWashrooms = [];
  var sqlQuery = 'SELECT id, room_num FROM washrooms WHERE building LIKE "%' + request.query.building + '%" AND floor = "'+ request.query.floor + '" ORDER BY ' + request.query.sort + ' DESC;';
  db.all(sqlQuery,[],(err,rows)=>{
    if(err)
    throw err;
    rows.forEach((element)=>{
      if(listOfWashrooms.indexOf(element.room_num) == -1){
        console.log(request.query.building + ' has Washroom ' + element.room_num + ' on floor ' + request.query.floor);
        listOfWashrooms.push(element.id);
      }
    });
	  returnObject.listOfWashrooms = listOfWashrooms;
  response.json(returnObject);
  });

});

// Gets a specific washroom for a ID
// Example Request: http://localhost:3000/washroom?id=HP4125
app.get('/washroom', (request, response) => {
  var returnObj = {};
  var sqlQuery = 'SELECT male,female,average_rating,cleanliness,size,toilet_paper,traffic,id FROM washrooms WHERE id LIKE "%' + request.query.id + '%";';
  db.all(sqlQuery,[],(err,rows)=>{
    if(err)
    throw err;
    rows.forEach((element)=>{
      returnObj.male = element.male;
      returnObj.female = element.female;
      returnObj.average_rating = element.average_rating;
      returnObj.cleanliness = element.cleanliness;
      returnObj.size = element.size;
      returnObj.toilet_paper = element.toilet_paper;
      returnObj.traffic = element.traffic;
      returnObj.id = element.id;
      console.log(returnObj);
      response.json(returnObj);
    });
  });
});

// ==================================================================================

app.listen(PORT, err => {
  if(err) console.log(err)
  else {
    console.log(`Server listening on port: ${PORT}`)
  }
});
