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


// db.copyDatabase("ir","guitarios-dev")
// mongorestore -dir /Users/anthedung/AProgramming/MEAN/dbbackup/20160325-133622/guitarios-dev/ --drop


