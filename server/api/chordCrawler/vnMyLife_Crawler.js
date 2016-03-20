var cheerio = require('cheerio');
var request = require('request');
var chords = []


var domain = 'http://www.vnmylife.com'
request({
    method: 'GET',
    url: 'http://www.vnmylife.com/mychord/rhythm/rhumba/9'
}, function(err, response, body) {
    if (err) return console.error(err);

    // Tell Cherrio to load the HTML
    $ = cheerio.load(body);

    $('div.single-article').map(function(i, link) {
        // console.log('div.single-article: ' + link + "   "+  $(link).toString())
        temp = cheerio.load($(link).toString());

        var chord = {}
    
        

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

        // console.log('chord.creditUrl: ' + chord.creditUrl);
        // console.log('chord.songAuthor: ' + chord.songAuthors);
        // console.log('chord.singers: ' + chord.singers);


        // console.log('chord: ' + JSON.stringify(chord))
        chords.push(chord);
    })

    // console.log('chords: ' + chords);

    for (var i = 0; i < chords.length; i++){
        var c = chords[i];
        getChord(c.creditUrl, c);
    }

    // console.log('getting chord... ' + imageURLs[0]);

    // getChord(imageURLs[0], chord);
});

function cleanArray(actual) {
  var newArray = new Array();
  for (var i = 0; i < actual.length; i++) {

    if (actual[i] && actual[i].length > 1) {
      newArray.push(actual[i]); // only valid names
    }
  }
  return newArray;
}

// var ChordSchema = new Schema({
//     title: String,
//     content: String,
//     rhymth: [],
//     songAuthor: [],
//     chordAuthor: String,
//     singers: [],
//     version: Number,
//     created: Date,
//     mp3s: [],
//     videos: [],
//     active: Boolean
// });

function getChord(url, chord){
    request({
        method: 'GET',
        url: url
    }, function(err, response, body) {
        if (err) return console.error(err);

        // Tell Cherrio to load the HTML
        $ = cheerio.load(body);


        // var header = $('header.entry-header').text().split(/\r?\n/g);
        // console.log('header: ' + header);
        chord.title = $('header h1.entry-title').text().trim();
        chord.content = $('div #cont pre').text().trim();
        chord.songAuthor = $('header b.author').text().trim();
        chord.chordAuthor = 'vnmylife';

        // rhythms
        var rhythms = $('header.entry-header div.above-entry-meta span.cat-links a').text().replace('Điệu:','').trim();
        cleaned = cleanArray(rhythms);
        cleaned.forEach( function(a){
                if (a.toLowerCase().indexOf('thơ') > -1) return;
                chord.rhythms.push(a);
            }
        );


        // console.log('chord.content: ' + chord.content);
        // console.log('chord.title: ' + chord.title);
        // console.log('chord.songAuthor: ' + chord.songAuthor);

        console.log('\n\nchord: ' + JSON.stringify(chord))
    });
}

