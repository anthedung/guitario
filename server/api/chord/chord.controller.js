'use strict';

var _ = require('lodash');
var Chord = require('./chord.model');
<<<<<<< Updated upstream
var Crawler = require('./chord.vnmylife.service');
=======
var ChordGeneralService = require('./chord.service.js');
>>>>>>> Stashed changes
var VnMylifeCrawler = require('./chord.vnmylife.crawl.service');

// Get list of chords
exports.index = function (req, res) {
  var limit = req.query.limit || 20;
  console.log('chords limit: '  + limit);
  Chord.find(function (err, chords) {
    if (err) {
      return handleError(res, err);
    }
    // console.log(".index chords: " + chords);
    return res.status(200).json(chords);
  }).limit(limit);
};

// Get a single chord
exports.show = function (req, res) {
  Chord.findById(req.params.id, function (err, chord) {
    if (err) {
      return handleError(res, err);
    }
    if (!chord) {
      return res.status(404).send('Not Found');
    }
    return res.json(chord);
  });
};

// Creates a new chord in the DB.
exports.create = function (req, res) {
  console.log("creating...." + req.body.title)
  Chord.create(req.body, function (err, chord) {
    if (err) {
      return handleError(res, err);
    }
    return res.status(201).json(chord);
  });
};

// Updates an existing chord in the DB.
exports.update = function (req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Chord.findById(req.params.id, function (err, chord) {
    if (err) {
      return handleError(res, err);
    }
    if (!chord) {
      return res.status(404).send('Not Found');
    }
    var updated = _.merge(chord, req.body);
    updated.save(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.status(200).json(chord);
    });
  });
};

// Deletes a chord from the DB.
exports.destroy = function (req, res) {
  Chord.findById(req.params.id, function (err, chord) {
    if (err) {
      return handleError(res, err);
    }
    if (!chord) {
      return res.status(404).send('Not Found');
    }
    chord.remove(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}

// anthe
exports.crawlVnMylifeAll = function (req, res) {
  Crawler.crawlAll();
}

exports.crawlVnMylife = function (req, res) {
  Crawler.crawl(req.params.rhythm, req.params.fromPage, req.params.limitPaganiation);
}

exports.recrawl = function (req, res) {
  Crawler.recrawl();
}

exports.crawlMp3 = function (req, res) {
  console.log(req.params.fromPage, req.params.limitPaganiation)
  Crawler.crawlMp3(req.params.fromPage, req.params.limitPaganiation);
}

// exports.cleanData = function (req, res) {
//   Crawler.cleanData();
// }

exports.findAllTitles = function (req, res) {
  Chord.find({}).select({title: 1, _id: 1}).exec(function (err, chords) {
    if (err) {
      return handleError(res, err);
    }

    console.log('findAllTitles: ' + chords);
    var count = 0;
    chords = chords.map(function (item) {
      count++;
      return item.title;
    })

    var resMap = {
      data: chords,
      validCount: count
    };

    return res.status(200).json(resMap);
  });
}

exports.findAllTitlesWithContent = function (req, res) {
  Chord.find({}).select({title: 1, content: 1}).exec(function (err, chords) {
    if (err) {
      return handleError(res, err);
    }

    var count = 0;
    chords = chords.map(function (item) {
      if (item.content.length < 2) return '';

      count++;
      return item.title;
    })


    var resMap = {
      data: chords,
      validCount: count
    };
    return res.status(200).json(resMap);
  });
}

exports.findChordsByRhythm = function (req, res) {
  var q = Chord.find({rhythms: req.params.rhythm}).sort({'created': -1}).limit(req.params.limit);

  q.exec(function (err, chords) {
    if (err) {
      return handleError(res, err);
    }

    return res.status(200).json(chords);
  });
};

exports.findChordsByGeneric = function (req, res) {
  var category = req.params.category;
  var query = {};
  query[category] = req.params.categoryValue;
  console.log('findChordsByGeneric ~ query: ' + query);
  var q = Chord.find(query).sort({'created': -1}).limit(req.params.limit);

  q.exec(function (err, chords) {
    if (err) {
      return handleError(res, err);
    }

    return res.status(200).json(chords);
  });
};

<<<<<<< Updated upstream
exports.crawlAllValidChordsToUpsert = function(req, res){
  if (req.params.target == 'vnmylife'){
    VnMylifeCrawler.crawlAndPersist();
  }
}
=======
exports.crawlAllValidChordsToUpsert = function (req, res) {
  if (req.query.test) {
    console.log("\n\n crawl testing only");
    VnMylifeCrawler.crawlAllValidChordsToUpsert();
  } else if (req.params.target == 'vnmylife') {
    VnMylifeCrawler.crawlAndPersist();
  }
};

exports.search = function (req, res) {
  var query = req.query.q;
  var regQuery = new RegExp(query, "i")
  console.log('search.query: ' + regQuery);
  Chord.find({'titleEn': regQuery}).sort({title: 1}).exec(function (err, chords) {
    if (err) {
      return handleError(res, err);
    }
    return res.status(200).json(chords);
  });
}

>>>>>>> Stashed changes
