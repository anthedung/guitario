var cheerio = require('cheerio');
var request = require('request');
var Q = require("q");
var bl = require('bl');
var Chord = require('./chord.model');
var http = require('http');
var domain = 'http://www.vnmylife.com';
var queryString = require('querystring');

// services exposed

// deprecated
// exports.crawlAll = crawlAll;
// exports.crawl = crawl;
// exports.recrawl = recrawl;

exports.findAllTitlesLowerCase = findAllTitlesLowerCase;
exports.findAllChords = findAllChords;
exports.cleanData = cleanData;

// var chords = [];
var rhythmMap = {
  'rhumba': 'http://www.vnmylife.com/mychord/rhythm/rhumba/9',
  'ballade': 'http://www.vnmylife.com/mychord/rhythm/ballade/6',
  'slowrock': 'http://www.vnmylife.com/mychord/rhythm/slow-rock/3',
  'blues': 'http://www.vnmylife.com/mychord/rhythm/blues/5',
  'chachacha': 'http://www.vnmylife.com/mychord/rhythm/chachacha/7',
  'bosanova': 'http://www.vnmylife.com/mychord/rhythm/bossa-nova/15',
  'valse': 'http://www.vnmylife.com/mychord/rhythm/valse/14',
  'boston': 'http://www.vnmylife.com/mychord/rhythm/boston/11',
  'tango': 'http://www.vnmylife.com/mychord/rhythm/tango/10',
  'slow': 'http://www.vnmylife.com/mychord/rhythm/slow/2',
  'disco': 'http://www.vnmylife.com/mychord/rhythm/disco/8'
};

var titlesGlobal = [];

/**
 * crawl existing pages, avoid putting heavy load and ddos attach on the target website with good strategy
 * 1. building rhythm pages (with paging)
 * 2. recursively retrieve list of song pages from each rhythm page to build a song list
 * 3. recursively retrieve songs whose creditUrls are not yet stored
 * @param rhythm
 * @param fromPage
 * @param limitPaganiation
 */

// deprecated
function crawlAll() {
  findAllTitlesLowerCase().then(function (titles) {
    // first load existing titles to avoid recrawl
    titlesGlobal = titles;
    //console.log('Title Global onload: ' + titlesGlobal);


    var rythmsAll = Object.keys(rhythmMap);
    //console.log(' rythmsAll: ' + rythmsAll);

    var count = rythmsAll.length;

    crawlRecursion(0, count, rythmsAll);
  });
}

function crawlRecursion(step, rCount, rythmsAll) {
  if (step >= rCount) return;

  console.log(' rythm: ' + rythmsAll[step]);
  var rhythm = rythmsAll[step];

  console.log('start crawling all....: ' + rhythm + ' pagination limit: ' + 20 + ' fromPage ' + 1);
  var pagination = '?page=';

  // setTimeout(function () {
    // for (var i = 4; i <= 10; i++) {
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

          // if body is not empty
          if (str.length > 10) {

            getListOfChordsFromRythmPage(str);
          }


          crawlRecursion(++step, rCount, rythmsAll);
        });
      }).on('error', function (e) {
        console.log('Error retrieving page: ' + url);
      });
    // }
  // }, 15000);
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
    }).on('error', function (e) {
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
  console.log('Getting list of chords... ~ body.length: ' + body.length);

  // if (err) return console.error(err);

  // Tell Cherrio to load the HTML
  $ = cheerio.load(body);
  // console.log('body: ' + body);
  // fight against cloudFare
  var ddos = $('div.attribution a').text().toString();
  if (ddos != undefined && ddos.length > 10) {
    console.log('ddos deteced: ' + ddos);
    return;
  }

  var content = $('#content').toString();
  // console.log('#content: ' + content);

  $ = cheerio.load(content);


  var chords = [];

  console.log('Getting list of chords... ~ body.length: ' + body.length);
  $('div.article-content').map(function (i, link) {
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

function crawlingEachValidChord(chords) {
  // findAllTitlesLowerCase().then(function (titles) {
  var len = chords.length;
  // console.log("\n\crawlingEachValidChord.... titles.length: " + titlesGlobal.length + " chords.length..." + len);
  setTimeout(function () {

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

        setTimeout(function () {
          getChord(c.creditUrl, c);
        }, 10000);
      }
    }
  }, 10000);
  // });
}

exports.cleanArray = cleanArray;

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
  }).on('error', function (e) {
    console.log('Error retrieving page: ' + url);
  });
}

function chordProcessing(body, chord) {
  $ = cheerio.load(body);
  // console.log('chordProcessing.body: ' + body);

  chord.title = $('header h1.entry-title').text().trim();
  chord.content = $('div #cont pre').text().trim();
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
    console.log('upsert successfully: ' + chord.title + ' ~doc.creditUrl: ' + doc.creditUrl + '\n' + doc.content);
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
  // console.log('Title Global onload: ' + titlesGlobal);
})


/**
 * mistake when crawling. Only remove the first line .\n\r => now put it back for all chords.
 */
function cleanData() {

  console.log("starting... chord's content to clean: ");

  // process line break
  findAllChords().then(function (chords) {
    for (var k = 6; k < 7; k++) {
      var c = chords[k];

      if (!c.content || c.content.length < 2) {
        console.log("\n\n this chord is empty: " + c.title);
        continue;
      }

      var content = c.content;
      console.log("\n\nchord's content to clean: " + content);

      var contentInEn = transformtoEnChars(content);

      console.log("\n\nchord's contentInEn to clean: " + contentInEn);

      var i = contentInEn.regexIndexOf(/[a-z][A-Z]/);//aB

      console.log("\n\nchord's index: " + i + ' character is: ' + content[i]);
      if (i > 0) {
        var c1 = content[i];
        var c2 = content[i + 1];

        var processedContent = content.replace(c1 + c2, c1 + ".\n" + c2);
        c.content = processedContent;
        console.log("\n\nchord's content cleaned: " + processedContent);

        console.log("\n\n");

        upsert(c);
      }
    }
  });
}

String.prototype.regexIndexOf = function (regex, startpos) {
  var indexOf = this.substring(startpos || 0).search(regex);
  return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}

transformtoEnChars = function (str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");


  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A")
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E")
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I")
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O")
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U")
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y")
  str = str.replace(/Đ/g, "D")
  // str= str.replace(/!|@|\$|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\'| |\"|\&|\#|\[|\]|~/g,"-");
  // str= str.replace(/-+-/g,"-"); //thay thế 2- thành 1-
  // str= str.replace(/^\-+|\-+$/g,"");//cắt bỏ ký tự - ở đầu và cuối chuỗi

  return str;
}

// cleanData();

