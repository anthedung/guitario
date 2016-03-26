'use strict';

var baseUrl = '/api/chords/';

angular.module('guitariosApp')
  .service('ChordService', function ($q, $http, $sce,) {
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
      var regex = /\[\w*]/gi, result, indices = [];
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
      description = '' + description;
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

      // bonus
      content = ('' + content).replace(/\[\[/g, '[');
      content = ('' + content).replace(/\]\]/g, ']');

      return content;
    };


    this.breakContentIntoLines = function (content) {
      // console.log(content);
      console.log('breakContentIntoLines before: ' + content);
      content = ('' + content).replace(/\n\r/g,'\r').replace(/[\.\n\r]/g, '<br>').toString();
      content = ('' + content).replace(/<br><br>/g,'<br>').toString();

      console.log('breakContentIntoLines after: ' + content);
      return content;
    };

    this.addSpanClassForChords = function (content) {
      // console.log(content);

      content = ('' + content).replace(/\[/g, '[<span class="guitarios_chord">').toString();
      content = ('' + content).replace(/\]/g, '</span>]').toString();

      return content;
    };

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
      // remove empty chords
      var refinedChords = [];
      for (var i = 0; i < chords.length; i++) {
        if (chords[i].content.length > 10) {
          var c = chords[i]
          c.content = removeInitialCounting(c.content);

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
  });
