// dump to backup
// mongodump --db guitarios-dev --collection chords --out "/Users/anthedung/AProgramming/MEAN/dbbackup/$(date +%Y%m%d-%H%M%S)/"

// MongoDB remove duplicates
var duplicates = [];
result = db.chords.aggregate([
  {
    $match: {
      creditUrl: {"$ne": ''}
    }
  },
  {
    $group: {
      _id: {creditUrl: "$creditUrl"},
      dups: {"$addToSet": "$_id"},
      count: {"$sum": 1}
    }
  },
  {
    $match: {
      count: {"$gt": 1}
    }
  }
]);
result.forEach(function (doc) {
  doc.dups.shift();
  doc.dups.forEach(function (dupId) {
      duplicates.push(dupId);
    }
  )
});
printjson(duplicates);
db.chords.remove({_id: {$in: duplicates}})


// create unique index on creditUrl - each creditUrl should exist only 1
db.chords.createIndex({creditUrl: 1}, {unique: true})


// update all title to contains
db.chords.find().forEach(function (chord) {
  chord.titleEn = transformtoEnChars(chord.title);
  db.chords.save(chord);
});


// mongorestore -dir /Users/anthedung/AProgramming/MEAN/dbbackup/vnmylifeRhythmsonly-echordsAll-20160327-084549/guitarios-dev/ --drop
// db.copyDatabase("ir","guitarios-dev")

// db.chords.find({$and:[{chordAuthor:'vnmylife'},{'rhythms':{$size: 0}}]})


// mlab
// mongo ds025459.mlab.com:25459/heroku_h3xb8w9l 
// mongodb://heroku_h3xb8w9l:f9kmb6suasqjp31lsbavrhhfbanthe321@ds025459.mlab.com:25459/heroku_h3xb8w9l

// mongorestore -h ds025459.mlab.com:25459 -d heroku_h3xb8w9l -c chords -u heroku_h3xb8w9l -p f9kmb6suasqjp31lsbavrhhfbanthe321 chords.bson

