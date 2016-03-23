var cheerio = require('cheerio');
var request = require('request');
var Q = require("q");
var bl = require('bl');
var Chord = require('./chord.model');
var http = require('http');
var domain = 'http://www.vnmylife.com';
var queryString = require('querystring');
var GeneralService = require('./chord.vnmylife.service');


/**
* Crawl strategy:
* 1. building all rhythm pages from predefined Map (with site with identifiable patterned paging)
* 2. building all 10-song pages recursively
* 3. building list of individual song pages recursively
* 4. validate against database to ensure only valid song url/page to be crawled
* 5. crawl individual song page recursively
* 6. persist into DB
*/

var rhythmMap = {
  // 'rhumba': 'http://www.vnmylife.com/mychord/rhythm/rhumba/9',
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

// crawlAllValidChordsToUpsert();
exports.crawlAllValidChordsToUpsert = crawlAllValidChordsToUpsert;
exports.crawlAndPersist = crawlAndPersist;

function crawlAndPersist(){
  crawlAllValidChordsToUpsert().then(function(chords){
    console.log('\n\nStarting to persist of docs persisted: ' + chords.length);
    console.log('\n\nStarting to persist of docs:\n ' + chords);
    // Chord.collection.insert(chords, function(err, docs){
    //   if(err){
    //     console.log('persistValidChordToDB error: ' + err);
    //   } else {
    //     console.log('number of docs persisted: ' + docs.length);
    //   }
    // });

    Chord.create(chords,function(err, docs){
      if(err){
        console.log('persistValidChordToDB error: ' + err);
      } else {
        console.log('number of docs persisted: ' + docs.length);
      }
    });
  })
}



function crawlAllValidChordsToUpsert(){
  var deferred = Q.defer();
  console.log('\npreparing to crawlAllValidChordsToUpsert...');

  buildListOfBasicChordsFromWebsites().then(function (basicChordsCrawled){
    GeneralService.findAllChords().then(function(chordsInDB){
      console.log('start crawlAllValidChordsToUpsert... basicChordsCrawled: ' + basicChordsCrawled.length + '  chordsInDB: ' + chordsInDB.length);

      var validChordsToCrawl = getValidChordsToCrawl(basicChordsCrawled, chordsInDB);
      console.log('\ncrawlAllValidChordsToUpsert ended... length: ' + validChordsToCrawl.length);
      // start crawling
      
      crawlFullChordRecursive(validChordsToCrawl, 0, deferred);
    }).catch(function(e){
        console.log('GeneralService.findAllChords() error: ' + e);
    });
  })

  return deferred.promise;
}

function crawlFullChordRecursive(validChordsToCrawl, counter, deferred){

  if (counter >= validChordsToCrawl.length){
    deferred.resolve(validChordsToCrawl);
    console.log("Final number of chords about to persist: " + validChordsToCrawl.length);
    return;
  }

  var chord = validChordsToCrawl[counter];

  var url = chord.creditUrl;
  console.log('startCrawling:' + url);

  http.get(url, function(res){
    var str = '';
      //another chunk of data has been recieved, so append it to `str`
      res.on('data', function (chunk) {
        str += chunk;
      });

      res.on('end', function () {
        if (str.length > 10) {
          // pars the basic info chords for each page: title + url
          console.log('\nGetting individual chords from: ' + url);

          processChord(str, chord);

          // recursion
          crawlFullChordRecursive(validChordsToCrawl, ++counter, deferred);

        }
      });
    }).on('error', function (e) {
      console.log('Error retrieving page: ' + url);

      // recursion
      crawlFullChordRecursive(validChordsToCrawl, ++counter, deferred);
    });
}

function buildVnMylifePageList(){
  var pagination = '?page=';

  var rythmsAllKeys = Object.keys(rhythmMap);
  var rhythmAllPages = [];
  for (var i = 0; i < rythmsAllKeys.length; i++){
    for (var j = 1; j < 2; j++){
      var url = rhythmMap[rythmsAllKeys[i]] + pagination + j;
      rhythmAllPages.push(url);
      console.log("buildPageList.page: " + url);
    }
  }

  return rhythmAllPages;
}


function getValidChordsToCrawl(basicChordsCrawled, chordsInDB){
  var chordsToCrawl = [];
  console.log('\nstart validating chords to crawl - getValidChordsToCrawl: ');

  var chordsInDBCreditUrls = chordsInDB.filter(function(chord){
    // non empty chords only 
    var isValidInDb = chord.title.length > 0 && chord.content.length > 10;
    // console.log('getValidChordsToCrawl isValidInDb - title:' + chord.title + " valid: " + isValidInDb);

    if (isValidInDb){
      return chord;
    }
  }).map(function (chord){

    return chord.creditUrl;
  });

  console.log('chordsInDBCreditUrls.length: ' + chordsInDBCreditUrls.length);

  for (var i = 0; i < basicChordsCrawled.length; i++){
    // if not in DB or empty in DB then eligible to crawl
    if (chordsInDBCreditUrls.indexOf(basicChordsCrawled[i].creditUrl) < 0){
      chordsToCrawl.push(basicChordsCrawled[i]);
      console.log('valid creditUrl to crawl:' + basicChordsCrawled[i].creditUrl);
    }
    // } else {
    //   console.log('invalid creditUrl to crawl:' + basicChordsCrawled[i].creditUrl);
    // }

  }

  return chordsToCrawl;
}


/*
* Template Method
*/
function buildListOfBasicChordsFromWebsites(){
  var deferred = Q.defer();

  var songPages = buildVnMylifePageList();
  var chords = [];

  crawlPagesRecursive(songPages, 0, chords, deferred)

  return deferred.promise;
}

/**
* build a full list of individual chords with title and credit urls
* making it a promise
*/
function crawlPagesRecursive(songPages, counter, chords, deferred){

  if (counter >= songPages.length) {
    deferred.resolve(chords);
    return;
  }

  var curPageUrl = songPages[counter];

  http.get(curPageUrl, function(res){
    var str = '';
    //another chunk of data has been recieved, so append it to `str`
    res.on('data', function (chunk) {
      str += chunk;
    });

    res.on('end', function () {
      if (str.length > 10) {
        // pars the basic info chords for each page: title + url
        console.log('\nGetting individual chords from: ' + curPageUrl);

        getListOfIndividualChordsBasicInfoVnMylife(str, chords);

        // recursion
        crawlPagesRecursive(songPages, ++counter, chords, deferred)
      }
    });
  }).on('error', function (e) {
    console.log('Error retrieving page: ' + curPageUrl);

    // recursion
    crawlPagesRecursive(songPages, ++counter, chords, deferred);
  });
}

function getListOfIndividualChordsBasicInfoVnMylife(body, chords){
  $ = cheerio.load(body);

  // stop when cloudFare wants me to stop!
  var ddos = $('div.attribution a').text().toString();
  if (ddos != undefined && ddos.length > 10) {
    console.log('ddos deteced: ' + ddos);
    return;
  }

  var content = $('#content').toString();
  $ = cheerio.load(content);
  console.log('Start getting list of chords... ~ body.length: ' + body.length);
  $('div.article-content').map(function (i, link) {
    temp = cheerio.load($(link).toString());
    var chord = new Chord();

    chord.title = temp('h3.entry-title').text().trim();

    chord.songAuthors = [];
    var songAuthors = temp('b.author').text().trim().split(/[\n\r,]+/);
    var cleanedAuthors = GeneralService.cleanArray(songAuthors);
    cleanedAuthors.forEach(function (a) {
        if (a.toLowerCase().indexOf('thơ') > -1) return;
        chord.songAuthors.push(a);
      }
    );

    chord.singers = [];
    var singers = temp('b.singer').text().trim().split(/[\n\r,]+/);
    var cleaned = GeneralService.cleanArray(singers);
    cleaned.forEach(function (a) {
        if (a.toLowerCase().indexOf('thơ') > -1) return;
        chord.singers.push(a);
      }
    );

    var href = temp('a').attr('href')
    if (!href.match('/mychord/lyric/')) return
    chord.creditUrl = (domain + href).trim();

    chords.push(chord);
    console.log('getListOfIndividualChordsBasicInfoVnMylife - title: ' + chord.title + '  creditUrl: ' + chord.creditUrl);
  });

  return chords;
}

function processChord(body, chord) {
  $ = cheerio.load(body);
  // console.log('chordProcessing.body: ' + body);

  chord.title = $('header h1.entry-title').text().trim();
  chord.content = $('div #cont pre').text().trim();
  chord.chordAuthor = 'vnmylife';
  chord.created = new Date();

  // rhythms
  chord.rhythms = [];
  var rhythms = $('header.entry-header div.above-entry-meta span.cat-links a').text().replace('Điệu:', '').trim().split(/[\n\r,]+/);
  var cleaned = GeneralService.cleanArray(rhythms);
  cleaned.forEach(function (a) {
      chord.rhythms.push(a);
    }
  );

  console.log('chord processed JSON.Stringify: ' + JSON.stringify(chord));

  return chord;
}