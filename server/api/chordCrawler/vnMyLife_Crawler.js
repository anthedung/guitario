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

var rhythmMap = {
    'rhumba': 'http://www.vnmylife.com/mychord/rhythm/rhumba/9',
    'ballade': 'http://www.vnmylife.com/mychord/rhythm/ballade/6'
}

function crawl(rhythm) {
    request({
        method: 'GET',
        url: rhythmMap[rhythm.toLowerCase()]
    }, function(err, response, body) {
        if (err) return console.error(err);

        // Tell Cherrio to load the HTML
        $ = cheerio.load(body);

        $('div.single-article').map(function(i, link) {
            temp = cheerio.load($(link).toString());
            var chord = new Chord();

            chord.songAuthors = [];
            var songAuthors = temp('b.author').text().trim().split(/[\n\r,]+/);
            cleanedAuthors = cleanArray(songAuthors);
            cleanedAuthors.forEach( function(a){
                if (a.toLowerCase().indexOf('thơ') > -1) return;
                chord.songAuthors.push(a);
                }
            );

            chord.singers = [];
            var singers = temp('b.singer').text().trim().split(/[\n\r,]+/);
            cleaned = cleanArray(singers);
            cleaned.forEach( function(a){
                    if (a.toLowerCase().indexOf('thơ') > -1) return;
                    chord.singers.push(a);
                }
            );

            var href = temp('a').attr('href')
            if (!href.match('/mychord/lyric/')) return
            chord.creditUrl = (domain + href).trim();

            chords.push(chord);
        })

        var delay=5000;
        for (var i = 3; i < chords.length; i++){
            var c = chords[i];
                // getChord2(c.creditUrl, c);

            setTimeout(function(){
              //your code to be executed after 1 seconds
                getChord2(c.creditUrl, c);
            }, delay); 
        }
    });
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


// get chords
var options = {
  host: 'www.random.org',
  path: '/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
};

callback = function(response) {
  var str = '';

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    console.log(str);
  });
}

function getChord2(url, chord){
    http.get(url, (res) => {
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
    })
}

function chordProcessing(body, chord){
    $ = cheerio.load(body);


    chord.title = $('header h1.entry-title').text().trim();
    chord.content = $('div #cont pre').text().replace(/[\r\n]/,'').trim();
    chord.chordAuthor = 'vnmylife';
    chord.created = new Date();

    // rhythms
    chord.rhythms = [];
    var rhythms = $('header.entry-header div.above-entry-meta span.cat-links a').text().replace('Điệu:','').trim().split(/[\n\r,]+/);
    cleaned = cleanArray(rhythms);
    cleaned.forEach( function(a){
            chord.rhythms.push(a);
        }
    );

    console.log('createTerm...: '  + chord)
    upsert(chord);
}

function upsert(chord) {
  if (!isValidaChord(chord)) return {code: 500,  msg: 'invalid content. empty or something' };
  
  var res = {};
  console.log("saving..: " + chord.title);
  Chord.findOneAndUpdate({title:chord.title}, chord, {upsert:true, new:true}, function(err, doc){
    if (err) return {code: 500,  msg: err };
    return {code: 200, msg: "succesfully saved"};
  });
};

function isValidaChord(chord){
    if (!chord.content || chord.content.length < 10) {
        console.log("this song is not being updated: " + chord.title);
        return false;
    }
    return true;
}

// crawl();
