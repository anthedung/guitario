var cheerio = require('cheerio');
var request = require('request');
var chords = []

var Q = require("q");
var chordController = require('../chord/chord.controller');
var bl = require('bl');
var Chord = require('../chord/chord.model');
var http = require('http');

var domain = 'http://www.vnmylife.com'
exports.crawl = crawl;
exports.recrawl = recrawl;

var rhythmMap = {
  'rhumba': 'http://www.vnmylife.com/mychord/rhythm/rhumba/9',
  'ballade': 'http://www.vnmylife.com/mychord/rhythm/ballade/6'
}

function recrawl() {
  console.log('start recrawling....');

  findAllChords().then(function (chords) {
    console.log("chords.length: " + chords.length);
    for (var i = 0; i < chords.length; i++) {
      var c = chords[i];

      // code to be executed after 1 seconds
      if (c.content.length < 2) {
        console.log("length < 2, proceeding to re-retrieve for: " + c.title);
        getChord(c.creditUrl, c);
      }
    }
  })
}

function crawl(rhythm, fromPage, limitPaganiation) {
  // console.log('start crawling....: '  + rhythmMap[rhythm]);
  console.log('start crawling....: ' + rhythmMap[rhythm] + ' pagination limit: ' + limitPaganiation + ' fromPage ' + fromPage);

  var pagination = '?page=';

  for (var i = fromPage; i <= limitPaganiation; i++) {
    var url = rhythmMap[rhythm] + pagination + i;
    console.log('start crawling....: ' + url);

    http.get(url, (res) = > {
      var str = '';

    res.on('err', function (e) {
      console.log('Error retrieving page: ' + url);
    })
    //another chunk of data has been recieved, so append it to `str`
    res.on('data', function (chunk) {
      str += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    res.on('end', function () {
      // console.log(str);
      getCrawList(str);
    });
  })
  }
}

function cleanArray(actual) {
  var newArray = new Array();
  for (var i = 0; i < actual.length; i++) {

    if (actual[i] && actual[i].length > 1) {
      newArray.push(actual[i]); // only valid names
    }
  }
  return newArray;
}

function getChord(url, chord) {
  http.get(url, (res) = > {
    var str = '';

  res.on('err', function (e) {
    console.log('Error retrieving page: ' + url);
  })

  //another chunk of data has been recieved, so append it to `str`
  res.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  res.on('end', function () {
    // console.log(str);
    chordProcessing(str, chord);
  });
})
}

function chordProcessing(body, chord) {
  $ = cheerio.load(body);

  chord.title = $('header h1.entry-title').text().trim();
  chord.content = $('div #cont pre').text().replace(/[\r\n]/, '').trim();
  chord.chordAuthor = 'vnmylife';
  chord.created = new Date();

  // rhythms
  chord.rhythms = [];
  var rhythms = $('header.entry-header div.above-entry-meta span.cat-links a').text().replace('Điệu:', '').trim().split(/[\n\r,]+/);
  // console.log('Rhythms: ' + $('header.entry-header div.above-entry-meta span.cat-links a').text().replace('Điệu:','').trim())
  var cleaned = cleanArray(rhythms);
  cleaned.forEach(function (a) {
      chord.rhythms.push(a);
    }
  );

  upsert(chord);
}

function upsert(chord) {
  // insert everything, can rescrawl later
  // if (!isValidChord(chord)) return {code: 500,  msg: 'invalid content. empty or something' };

  var res = {};

  console.log("\n\n upserting for ..: " + chord.title + "  content: " + chord.content.substr(0, 10));
  console.log("creditUrl: " + chord.creditUrl);

  Chord.findOneAndUpdate({title: chord.title}, chord, {upsert: true, new: true}, function (err, doc) {
    if (err) {
      console.log('upsert err: ' + chord.title + ' ~err: ' + err.toString());
      return {code: 500, msg: err};
    }
    console.log('upsert successfully: ' + chord.title + ' ~creditUrl: ' + chord.creditUrl);
    return {code: 200, msg: "succesfully saved"};
  });
};

function isValidChord(chord) {
  if (!chord.content || chord.content.length < 10) {
    console.log("this song is not being updated: " + chord.title);
    return false;
  }
  return true;
}

// crawl();


// helpers - to be moved
function findAllTitlesLowerCase() {
  var deferred = Q.defer();
  Chord.find({}).select({title: 1}).exec(function (err, chords) {
    if (err) {
      deferred.reject(new Error(error));
    }
    // array of title only setting to global
    else {
      chordTitles = chords.map(function (item) {
        return item.title.toLowerCase();
      })
    }

    deferred.resolve(chordTitles);
  });

  return deferred.promise;

}

function findAllChords() {
  var deferred = Q.defer();
  Chord.find(function (err, chords) {
    if (err) {
      deferred.reject(new Error(error));
    } else {
      deferred.resolve(chords);
    }
  });

  return deferred.promise;
}

function isTitleExisted(title, titles) {
  // console.log('isTitleExisted titles.length: ' + titles.length);
  // console.log('isTitleExisted title.length: ' + title.length);

  var isExist = false;
  if (title.length < 2) {
    // console.log(title + ' isTitleExisted length < 2: ' + isExist);
    return false;
  }
  for (var i = 0; i < titles.length; i++) {

    if (titles[i].toLowerCase() === title.toLowerCase()) {
      isExist = true;
      break;
    }
  }

  console.log(title + ' isTitleExisted : ' + isExist);

  // var exist = titles.indexOf(title.toLowerCase()) > -1;

  return false;
}

function getCrawList(body) {
  // if (err) return console.error(err);

  // Tell Cherrio to load the HTML
  $ = cheerio.load(body);

  console.log('Getting list of chords...');
  $('div#primary div.single-article').map(function (i, link) {
    temp = cheerio.load($(link).toString());
    var chord = new Chord();

    chord.title = temp('h3.entry-title').text().trim();

    chord.songAuthors = [];
    var songAuthors = temp('b.author').text().trim().split(/[\n\r,]+/);
    cleanedAuthors = cleanArray(songAuthors);
    cleanedAuthors.forEach(function (a) {
        if (a.toLowerCase().indexOf('thơ') > -1) return;
        chord.songAuthors.push(a);
      }
    );

    chord.singers = [];
    var singers = temp('b.singer').text().trim().split(/[\n\r,]+/);
    cleaned = cleanArray(singers);
    cleaned.forEach(function (a) {
        if (a.toLowerCase().indexOf('thơ') > -1) return;
        chord.singers.push(a);
      }
    );

    var href = temp('a').attr('href')
    if (!href.match('/mychord/lyric/')) return
    chord.creditUrl = (domain + href).trim();


    chords.push(chord);
    console.log('JSON.stringify(chord)): ' + JSON.stringify(chord));
  })

  findAllTitlesLowerCase().then(function (titles) {
    var len = chords.length;
    console.log("\n\nfindAllTitlesLowerCase.... titles.length: " + titles.length + " chords.length..." + len);
    for (var i = 0; i < len; i++) {
      var c = chords[i];
      console.log("\nchecking if should retrieve for ~ c.title: " + c.title);

      var contentLongEnuf = (c.content != undefined && c.content.length > 2);
      console.log("contentLongEnuf > 2: " + contentLongEnuf);

      var titleExist = isTitleExisted(c.title, titles);
      if (titleExist && contentLongEnuf) {
        console.log(title + " exists && contentLongEnuf: " + titleExist);
      } else {
        console.log("retrieving for title: " + c.title);
        console.log("retrieving for creditUrl: " + c.creditUrl);

        getChord(c.creditUrl, c);
      }
    }
  });
};
