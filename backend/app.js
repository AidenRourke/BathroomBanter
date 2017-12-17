const MongoClient = require('mongodb').MongoClient

const DB_PATH = 'mongodb://bb_admin:veryverysecure@ds129166.mlab.com:29166/bathroom_banter'


MongoClient.connect(DB_PATH, function(err, db){
  if(err) console.log(`FAILED TO CONNECTED TO: ${DB_PATH}`);
  else{
    console.log(`CONNECTED TO: ${DB_PATH}`);
    var collection = db.collection('data');
    var cursor = collection.find();
    collection.find({buildings : { name : "Herzberg Laboratories" }}).toArray(function (err, docs) {

      if(err) throw err;

      docs.forEach(function (doc) {
        console.log(doc);
      });
    });

  }
});
