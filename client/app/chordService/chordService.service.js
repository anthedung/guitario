'use strict';

var baseUrl = '/api/chords/';

angular.module('guitariosApp')
  .service('ChordService', function ($q, $http, $sce) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    this.join = function join(arr, isJoinFull, separator, length) {
      if (!arr) return;

      // console.log(arr);
      var arr = arr;
      isJoinFull = isJoinFull || false;
      length = length || 20;
      separator = separator || ', ';

      var joined = arr.join(separator);

      if (!isJoinFull) {
        if (joined.length > length) {
          joined = joined.substring(0, length) + "...";
        }
      }

      return joined;
    };

    this.findAllChords = function (content) {
      var regex = /\[.*?]/gi, result, indices = [];
      while ((result = regex.exec(content))) {
        // only set, no duplicate
        if (indices.indexOf(result.toString()) < 0) {
          indices.push(result.toString());
        }
      }

      // console.log('this.findAllChords: ' + indices);
      return indices;
    };

    this.findLastChord = function (content) {
      var regex = /\[\w*]/gi, result, indices = [];
      while ((result = regex.exec(content))) {
        // only set, no duplicate
        indices.push(result.toString());
      }

      // console.log('this.findAllChords: ' + indices);
      return (indices[indices.length - 1])
        ? (indices[indices.length - 1]).toString().replace('[', '').replace(']', '')
        : '';
    };

    this.findAllChordsWithClass = function (chords) {
      chords = chords.map(function (chord) {
        return addClassToChord(chord);
      });

      return chords;
    };


    function addClassToChord(chord) {
      chord = '' + chord;
      var value = chord.replace(/[\[\]]/g, '');
      //console.log('addClassToChord.value: ' + value);

      chord = '<span class="guitarios_chord_drawing" value="' + value + '">' + chord + ' </span>';

      //console.log('this.findAllChords: ' + chord);
      return chord;
    };

    this.getStandardDescLength = function (description, length) {
      length = length || 160;
      description = '' + removeInvalidChars(description);
      if (description.length < length) {
        return description + "...";
      } else {
        return description.substring(0, length) + "...";
      }
    };

    this.transformtoEnChars = function (str) {
      str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
      str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
      str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
      str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
      str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
      str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
      str = str.replace(/đ/g, "d");
      // str= str.replace(/!|@|\$|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\'| |\"|\&|\#|\[|\]|~/g,"-");
      // str= str.replace(/-+-/g,"-"); //thay thế 2- thành 1-
      // str= str.replace(/^\-+|\-+$/g,"");//cắt bỏ ký tự - ở đầu và cuối chuỗi

      str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A")
      str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E")
      str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I")
      str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O")
      str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U")
      str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y")
      str = str.replace(/Đ/g, "D")

      return str;
    };

    this.decorateContent = function (content) {
      content = this.removeInitialCounting(content);
      content = this.removeInvalidChars(content);
      content = this.breakContentIntoLines(content);
      content = this.addSpanClassForChords(content);

      return content;
    };

    // 1.   2.
    this.removeInitialCounting = function (content) {
      return removeInitialCounting(content);
    }

    var removeInitialCounting = function (content) {
      content = ('' + content).replace(/[0-9]\. /g, '');

      return content;
    }

    this.removeInvalidChars = function (content) {
      return removeInvalidChars(content);
    }

    var removeInvalidChars = function (content) {
      // bonus -- remove double [[ | ]]
      content = ('' + content).replace(/\[\[/g, '[');
      content = ('' + content).replace(/\]\]/g, ']');
      content = ('' + content).replace(/�/g, '-');

      return content;
    }


    this.breakContentIntoLines = function (content) {
      // console.log(content);
      //console.log('breakContentIntoLines before: ' + content);
      content = ('' + content).replace(/\n\r/g, '\r').replace(/[\.\n\r]/g, '<br>').toString();
      content = ('' + content).replace(/<br><br>/g, '<br>').toString();

      //console.log('breakContentIntoLines after: ' + content);
      return content;
    }

    this.addSpanClassForChords = function (content) {
      // console.log(content);

      content = ('' + content).replace(/\[/g, '[<span class="guitarios_chord">').toString();
      content = ('' + content).replace(/\]/g, '</span>]').toString();

      return content;
    }

    this.selectChordsNoFilter = function (limit, pageNo) {
      var limit = limit || 7;
      var url = 'api/chords' + '?p=' + pageNo + '&limit=' + limit;
      ;
      var deferred = $q.defer();
      $http.get(url).success(function (chords) {
        chords = processChords(chords);

        deferred.resolve(chords);
      })

      return deferred.promise;
    }

    this.selectChordsByRhythm = function (rhythm, limit, pageNo) {
      var limit = limit || 5;
      var pageNo = pageNo || 1;

      var url = baseUrl + 'rhythms' + '/' + rhythm + '?p=' + pageNo + '&limit=' + limit;
      console.log('selectChordsByRhythm: ' + url)
      var deferred = $q.defer();

      $http.get(url).success(function (chords) {
        console.log('Service - selectChordsByRhythm: ' + chords);
        chords = processChords(chords);

        deferred.resolve(chords);
      })

      return deferred.promise;
    }

    this.selectChordsBySinger = function (singer, limit, pageNo) {
      var limit = limit || 5;
      var pageNo = pageNo || 1;

      var url = baseUrl + 'singers' + '/' + singer + '?p=' + pageNo + '&limit=' + limit;
      console.log('selectChordsBySinger: ' + url)
      var deferred = $q.defer();

      $http.get(url).success(function (chords) {
        console.log('Service - selectChordsBySinger: ' + chords);
        chords = processChords(chords);

        deferred.resolve(chords);
      })

      return deferred.promise;
    }

    this.selectRandomSingers = function (limit) {
      var limit = limit || 15;

      var url = baseUrl + 'randomSingers?limit=' + limit;
      console.log('selectRandomSingers: ' + url)
      var deferred = $q.defer();

      $http.get(url).success(function (singers) {
        console.log('Service - selectRandomSingers: ' + singers);
        deferred.resolve(singers);
      })

      return deferred.promise;
    }

    /*
     1. keep only valid content chords
     2. add no intonation to chords for search - remove Vietnamese songs
     */
    this.processChords = function (chords) {
      return processChords(chords);
    }

    var processChords = function (chords) {
      console.log("processing chords: " + chords.length);
      // remove empty chords
      var refinedChords = [];
      for (var i = 0; i < chords.length; i++) {
        if (chords[i].content != undefined && chords[i].content.length > 10) {
          var c = chords[i]
          c.content = removeInitialCounting(c.content);
          c.title = removeInvalidChars(c.title);

          c.singers.forEach(function (singer) {
            return removeInvalidChars(singer);
          });

          c.songAuthors.forEach(function (author) {
            return removeInvalidChars(author);
          });

          refinedChords.push(c);
        }
      }

      return refinedChords;
    }

    this.trustAsHtml = function (url) {
      return $sce.trustAsResourceUrl(url);
    }

    this.getRandomSubarray = function (arr, size) {
      return getRandomSubarray(arr, size);
    }

    function getRandomSubarray(arr, size) {
      var shuffled = arr.slice(0), i = arr.length, min = i - size, temp, index;
      while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
      }
      return shuffled.slice(min);
    }

    this.isMobileBrowser = function(){
      return isMobileBrowser();
    }

    var isMobileBrowser = function() {
      var check = false;
      (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
      return check;
    }

    //option: s:singer, r:rhythms, a:all
    this.prepareChips = function prepareChips(vm, option) {
      var rhythms = ['Boston', 'Slow Rock', 'Valse', 'Twist', 'Pop','Slow', 'Blues', 'Rhumba', 'Ballade', 'Chachacha', 'Tango', 'Disco', 'Rock'];
      var singers = ['Aerosmith', 'Adele', 'Ariana Grande', 'Ben E. King', 'Bob Dylan', 'Bob Marley', 'Boyce Avenue', 'Bruno Mars', 'Bryan Adams', 'Christina Perri', 'Coldplay',
        'Creedence Clearwater Revival', 'David Bowie', 'David Crowder Band', 'Drake', 'Eagles', 'Ed Sheeran', 'Ellie Goulding', 'Elton John', 'Elvis Presley', 'Eric Clapton', 'Extreme', 'Fleetwood Mac', 'Frank Sinatra', 'Frozen', 'Green Day', "Guns N' Roses", 'Hillsong United', 'Hozier', "Israel Kamakawiwo'ole", 'James Blunt', 'Jason Mraz', 'Jeff Buckley', 'Jessie J', 'John Denver', 'John Legend', 'John Lennon', 'Journey', 'Justin Bieber', 'Led Zeppelin', 'Lukas Graham', 'Magic!', 'Maroon 5', 'Metallica', 'Neil Young', 'Nirvana', 'Oasis', 'Passenger', 'Pink Floyd'];
      var first = 6;
      var last = 8;

      singers = singers.filter(function (singer) {
        return singer.length < 9;
      });


      if (isMobileBrowser()) {
        first = 3;
        last = 3;
      }

      if (!option || option === 'a'){
        vm.rhythms = getRandomSubarray(rhythms, first);
        vm.singers = getRandomSubarray(singers, last);
        vm.line1Href = 'chordsByRhythm';
        vm.line2Href = 'chordsBySinger';

        if (isMobileBrowser()){
          vm.rhythms[1] = 'Everything';
        } else {
          vm.rhythms[0] = 'Everything';
        }
      } else if (option === 'r'){
        // vm.rhythms = getRandomSubarray(rhythms, first);
        vm.line1Href = 'chordsByRhythm';
        vm.line2Href = 'chordsByRhythm';
        var line1 = [];
        var line2 = [];

        for (var i = 0; i < first; i++){
          line1.push(rhythms[i]);
        }
        var max = last+first;
        for (var i = first; i < max && i < rhythms.length; i++){
          if (rhythms[i] != undefined && rhythms[i].length > 0) {
            line2.push(rhythms[i]);
          } else {
            max++;
          }
        }
        console.log('prepareChips line2: ' + line2.length);
        vm.rhythms = getRandomSubarray(line1, first);
        vm.singers = getRandomSubarray(line2, line2.length);
        

      } else if (option === 's') {
        vm.line1Href = 'chordsBySinger';
        vm.line2Href = 'chordsBySinger';
        var line1 = [];
        var line2 = [];

        for (var i = 0; i < first; i++){
          line1.push(singers[i]);
        }
        var max = last+first;
        for (var i = first; i < max && i < singers.length; i++){
          if (singers[i] != undefined && singers[i].length > 0) {
            line2.push(singers[i]);
          } else {
            max++;
          }
        }
        console.log('prepareChips line2: ' + line2.length);
        vm.rhythms = getRandomSubarray(line1, first);
        vm.singers = getRandomSubarray(line2, line2.length);
      }
    }
  });


