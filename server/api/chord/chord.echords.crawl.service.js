var cheerio = require('cheerio');
var request = require('request');
var Q = require("q");
var bl = require('bl');
var Chord = require('./chord.model');
var http = require('http');
var domain = 'http://www.e-chords.com';
var queryString = require('querystring');
var GeneralService = require('./chord.service.js');


/**
 * Flow: Famous artists => each artists song => song
 * Crawl strategy:
 * 1. building all rhythm pages from predefined Map (with site with identifiable patterned paging)
 * 2. building all 10-song pages recursively
 * 3. building list of individual song pages recursively
 * 4. validate against database to ensure only valid song url/page to be crawled
 * 5. crawl individual song page recursively
 * 6. persist into DB
 */

var START_FROM = 1;
var END_PAGE = 1;
var START_ARTIST_NO = 4; // index = 0
var END_ARTIST_NO = 2000000000;
var END_SONG_NO = 2000000000;
var rhythmMap = {

'3 Doors Down' : 'http//www.e-chords.com/chords/3-doors-down',
'4 Non Blondes' : 'http//www.e-chords.com/chords/4-non-blondes',
'A Great Big World' : 'http//www.e-chords.com/chords/a-great-big-world',
'Adele' : 'http//www.e-chords.com/chords/adele',
'Aerosmith' : 'http//www.e-chords.com/chords/aerosmith',
'Ariana Grande' : 'http//www.e-chords.com/chords/ariana-grande',
'Ben E. King' : 'http//www.e-chords.com/chords/ben-e-king',
'Bill Withers' : 'http//www.e-chords.com/chords/bill-withers',
'Bob Dylan' : 'http//www.e-chords.com/chords/bob-dylan',
'Bob Marley' : 'http//www.e-chords.com/chords/bob-marley',
'Boyce Avenue' : 'http//www.e-chords.com/chords/boyce-avenue',
'Bruno Mars' : 'http//www.e-chords.com/chords/bruno-mars',
'Bryan Adams' : 'http//www.e-chords.com/chords/bryan-adams',
'Christina Perri' : 'http//www.e-chords.com/chords/christina-perri',
'Coldplay' : 'http//www.e-chords.com/chords/coldplay',

// batch 2

'Creedence Clearwater Revival' : 'http//www.e-chords.com/chords/creedence-clearwater-revival',
'David Bowie' : 'http//www.e-chords.com/chords/david-bowie',
'David Crowder Band' : 'http//www.e-chords.com/chords/david-crowder-band',
'Drake' : 'http//www.e-chords.com/chords/drake',
'Eagles' : 'http//www.e-chords.com/chords/eagles',
'Ed Sheeran' : 'http//www.e-chords.com/chords/ed-sheeran',
'Ellie Goulding' : 'http//www.e-chords.com/chords/ellie-goulding',
'Elton John' : 'http//www.e-chords.com/chords/elton-john',
'Elvis Presley' : 'http//www.e-chords.com/chords/elvis-presley',
'Eric Clapton' : 'http//www.e-chords.com/chords/eric-clapton',
'Extreme' : 'http//www.e-chords.com/chords/extreme',
'Fleetwood Mac' : 'http//www.e-chords.com/chords/fleetwood-mac',
'Frank Sinatra' : 'http//www.e-chords.com/chords/frank-sinatra',
'Frozen' : 'http//www.e-chords.com/chords/frozen',
'Green Day' : 'http//www.e-chords.com/chords/green-day',
"Guns N' Roses" : 'http//www.e-chords.com/chords/guns-n-roses',
'Hillsong United' : 'http//www.e-chords.com/chords/hillsong-united',
'Hozier' : 'http//www.e-chords.com/chords/hozier',
"Israel Kamakawiwo'ole" : 'http//www.e-chords.com/chords/israel-kamakawiwoole',
'James Blunt' : 'http//www.e-chords.com/chords/james-blunt',
'Jason Mraz' : 'http//www.e-chords.com/chords/jason-mraz',
'Jeff Buckley' : 'http//www.e-chords.com/chords/jeff-buckley',
'Jessie J' : 'http//www.e-chords.com/chords/jessie-j',
'John Denver' : 'http//www.e-chords.com/chords/john-denver',
'John Legend' : 'http//www.e-chords.com/chords/john-legend',
'John Lennon' : 'http//www.e-chords.com/chords/john-lennon',
'Journey' : 'http//www.e-chords.com/chords/journey',
'Justin Bieber' : 'http//www.e-chords.com/chords/justin-bieber',
'Led Zeppelin' : 'http//www.e-chords.com/chords/led-zeppelin',
'Lukas Graham' : 'http//www.e-chords.com/chords/lukas-graham',
'Magic!' : 'http//www.e-chords.com/chords/magic',
'Maroon 5' : 'http//www.e-chords.com/chords/maroon-5',
'Metallica' : 'http//www.e-chords.com/chords/metallica',
'Neil Young' : 'http//www.e-chords.com/chords/neil-young',
'Nirvana' : 'http//www.e-chords.com/chords/nirvana',
'Oasis' : 'http//www.e-chords.com/chords/oasis',
'Passenger' : 'http//www.e-chords.com/chords/passenger',
'Pink Floyd' : 'http//www.e-chords.com/chords/pink-floyd',
'Radiohead' : 'http//www.e-chords.com/chords/radiohead',
'Red Hot Chili Peppers' : 'http//www.e-chords.com/chords/red-hot-chili-peppers',
'REM' : 'http//www.e-chords.com/chords/rem',
'Ronan Keating' : 'http//www.e-chords.com/chords/ronan-keating',
'Rufus Wainwright' : 'http//www.e-chords.com/chords/rufus-wainwright',
'Sam Smith' : 'http//www.e-chords.com/chords/sam-smith',
'Shawn Mendes' : 'http//www.e-chords.com/chords/shawn-mendes',
'The Animals' : 'http//www.e-chords.com/chords/the-animals',
'The Beatles' : 'http//www.e-chords.com/chords/the-beatles',
'The Cranberries' : 'http//www.e-chords.com/chords/the-cranberries',
'The Rolling Stones' : 'http//www.e-chords.com/chords/the-rolling-stones',
'Traditional' : 'http//www.e-chords.com/chords/traditional',
'Van Morrison' : 'http//www.e-chords.com/chords/van-morrison',
'Weezer' : 'http//www.e-chords.com/chords/weezer',
'Wiz Khalifa' : 'http//www.e-chords.com/chords/wiz-khalifa'

  // batch all 5
  // 'Famous artist': 'http://www.e-chords.com/chords'
};

// crawlAllValidChordsToUpsert();
exports.crawlAllValidChordsToUpsert = crawlAllValidChordsToUpsert;
exports.crawlAndPersist = crawlAndPersist;
exports.buildListOfBasicChordsFromWebsites = buildListOfBasicChordsFromWebsites;

function crawlAndPersist() {
  var t0  = Date.now();
  console.log("\n\nCrawlAndPersist start: "  + t0);

  crawlAllValidChordsToUpsert().then(function (chords) {
    console.log('\n\nStarting to persist of docs persisted: ' + chords.length);

    Chord.create(chords, function (err, docs) {
      if (err) {
        console.log('persistValidChordToDB error: ' + err);
      } else {
        console.log('number of docs persisted: ' + chords.length);
      }
      var t1 = Date.now();
      console.log("\n\nCrawlAndPersist took " + (t1 - t0) + " milliseconds for " + chords.length + " chords");
    });
  })
}

function crawlAllValidChordsToUpsert() {
  var deferred = Q.defer();
  console.log('\npreparing to crawlAllValidChordsToUpsert...');

  buildListOfBasicChordsFromWebsites().then(function (basicChordsCrawled){
    GeneralService.findAllChords().then(function(chordsInDB){
      console.log('start crawlAllValidChordsToUpsert... basicChordsCrawled: ' + basicChordsCrawled.length + '  chordsInDB: ' + chordsInDB.length);

      var validChordsToCrawl = getValidChordsToCrawl(basicChordsCrawled, chordsInDB);
      console.log('\ncrawlAllValidChordsToUpsert ended... length: ' + validChordsToCrawl.length);
      // start crawling
      
      crawlFullChordRecursive(validChordsToCrawl, 0, deferred);
    })
    .catch(function(e){
        console.log('GeneralService.findAllChords() error: ' + e.stack);
    })
  })

  return deferred.promise;
}

function crawlFullChordRecursive(validChordsToCrawl, counter, deferred){

  if (counter >= validChordsToCrawl.length || counter >= END_SONG_NO){
    deferred.resolve(validChordsToCrawl);
    console.log("Final number of chords about to persist: " + validChordsToCrawl.length);
    return;
  }

  var chord = validChordsToCrawl[counter];

  var url = chord.creditUrl;
  console.log('\n\nstartCrawling:' + url);

  http.get(url, function(res){
    if (res.statusCode > 300 && res.statusCode < 400 && res.headers.location) {
      console.log('Page redirected: ' + res.statusCode + '  ' + url);
      // recursion
      crawlFullChordRecursive(validChordsToCrawl, ++counter, deferred);

    } else {
      res.setEncoding('utf8');
      var str = '';
        //another chunk of data has been recieved, so append it to `str`
        res.on('data', function (chunk) {
          str += chunk;
        });

      res.on('end', function () {
        if (str.length > 10) {
          // pars the basic info chords for each page: title + url
          console.log('crawlFullChordRecursive url: ' + url);
            processChord(str, chord);

            // recursion
            crawlFullChordRecursive(validChordsToCrawl, ++counter, deferred);

          }
        });
    }
    }).on('error', function (e) {
      console.log('Error retrieving page: ' + url);

      // recursion
      crawlFullChordRecursive(validChordsToCrawl, ++counter, deferred);
    });
}

function buildEChordsPageList(){
  var pagination = '/#results-';

  var rythmsAllKeys = Object.keys(rhythmMap);
  var rhythmAllPages = [];
  for (var i = 0; i < rythmsAllKeys.length; i++){
    for (var j = START_FROM; j <= END_PAGE; j++){
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
    var isValidInDb = chord.title!=undefined && chord.title.length > 0 && chord.content!=undefined && chord.content.length > 10;
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
      console.log(i + ' valid creditUrl crawl: ' + basicChordsCrawled[i].creditUrl);
    }
  }

  return chordsToCrawl;
}


/* STEP 1
* Template Method
*/
function buildListOfArtirstFromWebsites(){
  var deferred = Q.defer();

  var songPages = buildEChordsPageList();
  var artirsts = []; // {name: Adele, artistLink: /chords/adele }

  console.log('buildListOfArtirstFromWebsites...');
  crawlArtistPagesRecursive(songPages, 0, artirsts, deferred);

  return deferred.promise;
}

/* STEP 2
* Template Method
*/
function buildListOfBasicChordsFromWebsites(){
  var deferred = Q.defer();

 // {name: Adele, artistLink: /chords/adele }

  buildListOfArtirstFromWebsites().then(function (artirsts){
    var chords = [];
    console.log('buildListOfBasicChordsFromWebsites... artirsts.length: ' + artirsts.length);
    crawlSongPagesRecursive(artirsts, START_ARTIST_NO, chords, deferred);
  })
  

  return deferred.promise;
}

/** STEP 1
* build a full list of individual artists page
* making it a promise
*/
function crawlArtistPagesRecursive(songPages, counter, artirsts, deferred){

  // if (counter >= 2) {
  if (counter >= songPages.length ) {
    deferred.resolve(artirsts);
    return;
  }

  var curPageUrl = songPages[counter];

  http.get(curPageUrl, function(res){

    if (res.statusCode > 300 && res.statusCode < 400 && res.headers.location) {
      console.log('Page redirected: ' + res.statusCode + '  ' + curPageUrl);
      // recursion
      crawlArtistPagesRecursive(songPages, ++counter, artirsts, deferred);         
    } else {
      res.setEncoding('utf8');
      var str = '';
      //another chunk of data has been recieved, so append it to `str`
      res.on('data', function (chunk) {
        str += chunk;
      });

      res.on('end', function () {
        if (str.length > 10) {
          // pars the basic info artirsts for each page: title + url
          console.log('\nGetting individual artirst from: ' + curPageUrl);

          getListOfIndividualArtirstEchords(str, artirsts);

          // recursion
          crawlArtistPagesRecursive(songPages, ++counter, artirsts, deferred)
        }
      });
    }
  }).on('error', function (e) {
    console.log('Error retrieving page: ' + curPageUrl);

    // recursion
    crawlArtistPagesRecursive(songPages, ++counter, artirsts, deferred);
  });
}

function getListOfIndividualArtirstEchords(body, artirsts){
  $ = cheerio.load(body);

  // stop when cloudFare wants me to stop!
  var ddos = $('div.attribution a').text().toString();
  if (ddos != undefined && ddos.length > 10) {
    console.log('ddos deteced: ' + ddos);
    return;
  }

  var content = $('ul#results').toString();
  $ = cheerio.load(content);
  console.log('Start getting list of chords... ~ body.length: ' + body.length);
  $('li').map(function (i, link) {
    temp = cheerio.load($(link).toString());
    // console.log('\nli ~ $(link).toString(): ' + $(link).toString());

    temp('div.lista').map(function (i, link) {
      var temp3 = cheerio.load($(link).toString());

      var artist = {}; //{name: Adele, url: /chords/adele }
      artist.version = 1;

      artist.name = temp3('p.nome-artista a').text().trim();
      artist.url = domain + "/" + temp3('p.nome-artista a').attr('href').trim();

      artirsts.push(artist);
      console.log('getListOfIndividualArtirstEchords - name: ' + artist.name + '  url: ' + artist.url);
    });
  });

  return artirsts;
}

/**
* build a full list of individual chords with title and credit urls
* making it a promise
*/
function crawlSongPagesRecursive(artists, counter, chords, deferred){

  if (counter >= artists.length || counter >= END_ARTIST_NO) {
    console.log('\crawlSongPagesRecursive total chords: ' + chords.length);

    deferred.resolve(chords);
    return;
  }

  var curPageUrl = artists[counter].url;
  console.log('\crawlSongPagesRecursive: ' + curPageUrl);

  http.get(curPageUrl, function(res){
    if (res.statusCode > 300 && res.statusCode < 400 && res.headers.location) {
      console.log('Page redirected: ' + res.statusCode + '  ' + curPageUrl);
      // recursion
      crawlSongPagesRecursive(artists, ++counter, chords, deferred)
    } else {
      res.setEncoding('utf8');
      var str = '';
      //another chunk of data has been recieved, so append it to `str`
      res.on('data', function (chunk) {
        str += chunk;
      });

      res.on('end', function () {
        if (str.length > 10) {
          // pars the basic info chords for each page: title + url
          console.log('\nGetting individual chords from: ' + curPageUrl);

          var singers = [artists[counter].name];
          console.log('\crawlSongPagesRecursive singers: ' + singers);
          getListOfIndividualChordsBasicInfoEChords(str, chords, singers);

          // recursion
          crawlSongPagesRecursive(artists, ++counter, chords, deferred)
        }
      });
  }}).on('error', function (e) {
    console.log('Error retrieving page: ' + curPageUrl);

    // recursion
    crawlSongPagesRecursive(artists, ++counter, chords, deferred);
  });
}

function getListOfIndividualChordsBasicInfoEChords(body, chords, singers){
  $ = cheerio.load(body);

  // stop when cloudFare wants me to stop!
  // var ddos = $('div.attribution a').text().toString();
  // if (ddos != undefined && ddos.length > 10) {
  //   console.log('ddos deteced: ' + ddos);
  //   return;
  // }

  var content = $('ul#results').toString();

  $ = cheerio.load(content);
  console.log('Start getting list of chords... ~ body.length: ' + body.length);
  $('div.lista').map(function (i, link) {
    
    // console.log('getListOfIndividualChordsBasicInfoEChords $(link).toString(): ' + $(link).toString());
    var temp = cheerio.load($(link).toString());
    var chord = new Chord();
    chord.version = 1;

    chord.title = temp('div.track a').attr('title').trim();
    console.log('getListOfIndividualChordsBasicInfoEChords - title: ' + chord.title );

    var href = temp('div.track a').attr('href')
    chord.creditUrl = (domain + "/" + href).trim();

    chord.titleEn = GeneralService.transformtoEnChars(chord.title);

    chord.singers = singers;

    chords.push(chord);
    console.log('getListOfIndividualChordsBasicInfoEChords - title: ' + chord.title + '  creditUrl: ' + chord.creditUrl);
  });

  return chords;
}

function processChord(body, chord) {
  var $ = cheerio.load(body);
  // console.log('chordProcessing.body: ' + body);

  chord.content = $('div.coremain pre').text().trim();
  chord.chordAuthor = 'echords';
  chord.created = new Date();

  // rhythms -- doesn't seem to exist
  // chord.rhythms = [];
  // var rhythms = $('header.entry-header select#dieunhac option:selected').map(function (i, link) {
  //     return $(link).text().replace('Điệu', '').replace(':', '').replace(/\(.*\)/,'').trim().split(/[\n\r,]+/);
  // });
  // // console.log('processChord - select#dieunhac: ' + rhythms.length + ' ' + rhythms.join("-"));
  // rhythms = GeneralService.cleanArray(rhythms);
  // console.log('processChord - cleaned select#dieunhac: ' + rhythms.length + ' ' + rhythms.join("-"));

  // var invalid = (rhythms == null || rhythms.length < 1);
  // console.log('processChord - rhythms < 1 select#dieunhac: '+ invalid + ' ' + rhythms);
  // if (invalid){
  //   rhythms = $('header.entry-header div.above-entry-meta span.cat-links a').text().replace('Điệu', '').replace(':','').trim().split(/[\n\r,]+/);
  //   console.log('processChord - rhythms < 1: span.cat-links a: '+  rhythms);
  // }
  // var cleaned = GeneralService.cleanArray(rhythms);
  // cleaned.forEach(function (a) {
  //   if (a !== '--Bạn chọn giúp điệu nhạc cho bài này nhé--')
  //     chord.rhythms.push(a);
  //   }
  // );

  console.log('chord processed JSON.Stringify: ' + JSON.stringify(chord));

  return chord;
}