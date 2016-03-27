var cheerio = require('cheerio');
var request = require('request');
var Q = require("q");
var bl = require('bl');
var Chord = require('./chord.model');
var http = require('http');
var domain = 'http://www.vnmylife.com';
var queryString = require('querystring');
var GeneralService = require('./chord.service.js');

/*
* crawl song links recursively
* 1. build valid crawling list from DB
* 2. crawl recursively
*/

var base = "http://www.vnmylife.com/api/audio/chiasenhac?q=";

function crawlMp3(fromPage, limitPaganiation) {
  console.log('preparing  crawlMp3Recursive:' + fromPage + '   ' + limitPaganiation);
  fromPage = parseInt(fromPage, 10);
  limitPaganiation = parseInt(limitPaganiation, 10);



  findAllChords().then(function (chords) {
    if (limitPaganiation >= chords.length) {
      limitPaganiation = chords.length - 1;
    }
    console.log('starting  crawlMp3Recursive:' + fromPage + '   ' + limitPaganiation);

    crawlMp3Recursive(chords, fromPage, limitPaganiation);
  });
}

function crawlMp3Recursive(chords, fromPage, limitPaganiation) {
    // console.log('crawlMp3Recursive... fromPage: ' + fromPage + ' limitPaganiation: ' + limitPaganiation);
    // console.log('crawlMp3Recursive... chords.length: ' + chords.length);
    fromPage = parseInt(fromPage, 10);
    limitPaganiation = parseInt(limitPaganiation, 10);

    if (fromPage > limitPaganiation) {return;}

    var chord = chords[fromPage];
    console.log('crawlMp3Recursive... chord.content.length: ' + chord.content.length + ' mp3.length: ' + chord.mp3s.length);

    if (chord.content.length > 10 && chord.mp3s.length < 1) {
      console.log('crawlMp3 :' + chord.title);
      console.log('crawlMp3 creditUrl: ' + chord.creditUrl);

      var baseUrl = base + encodeURIComponent(chord.title);
      console.log('api url: ' + baseUrl);
      http.get(baseUrl, function(res){
        var str = '';

            //another chunk of data has been recieved, so append it to `str`
            res.on('data', function (chunk) {
              str += chunk;
            });

            //the whole response has been recieved, so we just print it out here
            res.on('end', function () {
              //chordProcessing(str, chord);
              // setTimeout(function() {
                console.log("successfuly hitting url, now processing..mp3: " + chord.title);
                processBodyGetMp3(str, chord);
                crawlMp3Recursive(chords, ++fromPage, limitPaganiation);
              // }, 1000);
            });
      }).on('error', function (e) {
        console.log('Error retrieving page: ' + chord.title+'. Continues..');
        crawlMp3Recursive(chords, ++fromPage, limitPaganiation);

      });
    } else {
      crawlMp3Recursive(chords, ++fromPage, limitPaganiation);
    }

    // }
}

function processBodyGetMp3(body, chord) {

  var $ = cheerio.load(body);
  // console.log('processBodyGetMp3 - body:' + body);

  var ddos = $('div.attribution a').text().toString();
  if (ddos != undefined && ddos.length > 10) {
    console.log('ddos deteced: ' + ddos);
    return;
  }

  console.log('crawlMp3 successfully getting...processing: ');

  var musicLinks = [];
  $('div.article-content').map(function (i, link) {
    var temp = cheerio.load($(link).toString());
    var song = {};
    song.singers = [];

    var singersStr = temp('span.singer a').text().trim().split(/[\n\r,]+/);
    var cleaned = cleanArray(singersStr);
    cleaned.forEach(function (a) {
        if (a.toLowerCase().indexOf('thơ') > -1) return;
        song.singers.push(a);
      }
    );
    console.log('processBodyGetMp3 singer: ' + song.singers);

    song.musicLink = temp('audio source').attr('src').toString();
    console.log('processBodyGetMp3 source: ' + song.musicLink);

    musicLinks.push(song);
    //console.log('processBodyGetMp3 song: ' + song);
  });

  chord.mp3s = musicLinks;

  //return chord;
  upsert(chord);
  //chord.
}
