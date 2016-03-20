var cheerio = require('cheerio');
var request = require('request');
var Q = require("q");
var bl = require('bl');
var Chord = require('./chord.model');
var http = require('http');
var domain = 'http://www.vnmylife.com'

// services exposed
exports.crawlAll = crawlAll;
exports.crawl = crawl;
exports.recrawl = recrawl;
exports.findAllTitlesLowerCase = findAllTitlesLowerCase;
exports.findAllChords = findAllChords;

// var chords = [];
var rhythmMap = {
  // 'rhumba': 'http://www.vnmylife.com/mychord/rhythm/rhumba/9',
  // 'ballade': 'http://www.vnmylife.com/mychord/rhythm/ballade/6',
  // 'slowrock': 'http://www.vnmylife.com/mychord/rhythm/slow-rock/3',
  'blues': 'http://www.vnmylife.com/mychord/rhythm/blues/5',
  'chachacha': 'http://www.vnmylife.com/mychord/rhythm/disco/8',
  'bosanova': 'http://www.vnmylife.com/mychord/rhythm/bossa-nova/15',
  'valse': 'http://www.vnmylife.com/mychord/rhythm/valse/14',
  'boston': 'http://www.vnmylife.com/mychord/rhythm/boston/11',
  'tango': 'http://www.vnmylife.com/mychord/rhythm/tango/10'
};

var titlesGlobal = [];

 /**
 * crawl existing pages
 * @param rhythm
 * @param fromPage
 * @param limitPaganiation
 */
function crawlAll() {
  findAllTitlesLowerCase().then(function (titles) {
    // first load existing titles to avoid recrawl
    titlesGlobal = titles;
    console.log('Title Global onload: ' + titlesGlobal);


    var rythmsAll = Object.keys(rhythmMap);
    console.log(' rythmsAll: ' + rythmsAll);

    var count = rythmsAll.length;

    crawlRecursion(0, count, rythmsAll);
  });
}

function crawlRecursion(step, rCount, rythmsAll){
  if (step >= rCount) return;

  console.log(' rythm: ' + rythmsAll[step]);
  var rhythm = rythmsAll[step];

  console.log('start crawling all....: ' + rhythm + ' pagination limit: ' + 20 + ' fromPage ' + 1);
  var pagination = '?page=';

  for (var i = 0; i <= 20; i++) {
    var url = rhythmMap[rhythm] + pagination + i;
    console.log('start crawling....: ' + url);

    http.get(url, function (res) {
      var str = '';

      //another chunk of data has been recieved, so append it to `str`
      res.on('data', function (chunk) {
        str += chunk;
      });

      //the whole response has been recieved, so we just print it out here
      res.on('end', function () {
        // console.log(str);
        getListOfChordsFromRythmPage(str);
        crawlRecursion(++step, rCount, rythmsAll);
      });
    }).on('error', function(e) {
      console.log('Error retrieving page: ' + url);
    });
  }
}

/**crawl existing pages
 *
 * @param rhythm
 * @param fromPage
 * @param limitPaganiation
 */
function crawl(rhythm, fromPage, limitPaganiation) {
  console.log('start crawling....: ' + rhythmMap[rhythm] + ' pagination limit: ' + limitPaganiation + ' fromPage ' + fromPage);
  var pagination = '?page=';

  for (var i = fromPage; i <= limitPaganiation; i++) {
    var url = rhythmMap[rhythm] + pagination + i;
    console.log('start crawling....: ' + url);

    http.get(url, function (res) {
      var str = '';

      //another chunk of data has been recieved, so append it to `str`
      res.on('data', function (chunk) {
        str += chunk;
      });

      //the whole response has been recieved, so we just print it out here
      res.on('end', function () {
        // console.log(str);
        getListOfChordsFromRythmPage(str);
      });
    }).on('error', function(e) {
      console.log('Error retrieving page: ' + url);
    });
  }
}

/**
 * find all chords to start re-crawling if for those whose contents are empty or invalid
 */
function recrawl() {
  console.log('start recrawling....');

  // find all chords to start re-crawling if for those whose contents are empty or invalid
  findAllChords().then(function (chords) {
    console.log("chords.length: " + chords.length);
    for (var i = 0; i < chords.length; i++) {
      var c = chords[i];

      if (c.content.length < 2) {
        console.log("length < 2, proceeding to re-retrieve for: " + c.title);
        getChord(c.creditUrl, c);
      }
    }
  })
}


function findAllTitlesLowerCase() {
  var deferred = Q.defer();
  Chord.find({}).select({title: 1}).exec(function (err, chords) {
    if (err) {
      deferred.reject(new Error(error));
    }
    // array of title only setting to global
    else {
      var chordTitles = chords.map(function (item) {
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


// helpers
function getListOfChordsFromRythmPage(body) {
  // if (err) return console.error(err);

  // Tell Cherrio to load the HTML
  $ = cheerio.load(body);
  var chords = [];

  console.log('Getting list of chords...');
  $('div#primary div.single-article').map(function (i, link) {
    temp = cheerio.load($(link).toString());
    var chord = new Chord();

    chord.title = temp('h3.entry-title').text().trim();

    chord.songAuthors = [];
    var songAuthors = temp('b.author').text().trim().split(/[\n\r,]+/);
    var cleanedAuthors = cleanArray(songAuthors);
    cleanedAuthors.forEach(function (a) {
        if (a.toLowerCase().indexOf('thơ') > -1) return;
        chord.songAuthors.push(a);
      }
    );

    chord.singers = [];
    var singers = temp('b.singer').text().trim().split(/[\n\r,]+/);
    var cleaned = cleanArray(singers);
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
  });

  // start crawling
  crawlingEachValidChord(chords);
}


function crawlingEachValidChord(chords){
  // findAllTitlesLowerCase().then(function (titles) {
    var len = chords.length;
    console.log("\n\nfindAllTitlesLowerCase.... titles.length: " + titlesGlobal.length + " chords.length..." + len);
    for (var i = 0; i < len; i++) {
      var c = chords[i];
      console.log("\nchecking if should retrieve for ~ c.title: " + c.title);

      var contentLongEnuf = (c.content != undefined && c.content.length > 2);
      console.log("contentLongEnuf > 2: " + contentLongEnuf);

      var titleExist = isTitleExisted(c.title, titlesGlobal);
      if (titleExist && contentLongEnuf) {
        console.log(title + " exists && contentLongEnuf: " + titleExist);
      } else {
        console.log("retrieving for title: " + c.title);
        console.log("retrieving for creditUrl: " + c.creditUrl);

        getChord(c.creditUrl, c);
      }
    }
  // });
}

function cleanArray(actual) {
  var newArray = [];
  for (var i = 0; i < actual.length; i++) {

    if (actual[i] && actual[i].length > 1) {
      newArray.push(actual[i]); // only valid names
    }
  }
  return newArray;
}

function getChord(url, chord) {
  http.get(url, function (res) {
    var str = '';

    //another chunk of data has been recieved, so append it to `str`
    res.on('data', function (chunk) {
      str += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    res.on('end', function () {
      // console.log(str);
      chordProcessing(str, chord);
    });
  }).on('error', function(e) {
    console.log('Error retrieving page: ' + url);
  });
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
  var cleaned = cleanArray(rhythms);
  cleaned.forEach(function (a) {
      chord.rhythms.push(a);
    }
  );

  upsert(chord);
}

function upsert(chord) {
  console.log("\n\n upserting for ..: " + chord.title + "  content: " + chord.content.substr(0, 10));
  console.log("creditUrl: " + chord.creditUrl);

  Chord.findOneAndUpdate({title: chord.title}, chord, {upsert: true, new: true}, function (err, doc) {
    if (err) {
      console.log('upsert err: ' + chord.title + ' ~err: ' + err.toString());
      return {code: 500, msg: err};
    }
    console.log('upsert successfully: ' + chord.title + ' ~doc.creditUrl: ' + doc.creditUrl);
    return {code: 200, msg: "succesfully saved"};
  });
}

function isTitleExisted(title, titles) {
  var isExist = false;
  if (title.length < 2) {
    return false;
  }
  for (var i = 0; i < titles.length; i++) {

    if (titles[i].toLowerCase() === title.toLowerCase()) {
      isExist = true;
      break;
    }
  }

  console.log(title + ' exists? : ' + isExist);
  return false;
}

findAllTitlesLowerCase().then(function (titles) {
  titlesGlobal = titles;
  console.log('Title Global onload: ' + titlesGlobal);
})

