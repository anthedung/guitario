'use strict';

angular.module('guitariosApp')
  .service('ChordService', function () {
    // AngularJS will instantiate a singleton by calling "new" on this function

    this.join = function (arr) {
      var joined = arr.join(', ');

      if (joined.length > 20) {
        joined = joined.substring(0, 20) + "...";
      }
      return joined;
    }


    this.getStandardDescLength = function (description, length) {
      // console.log("getStandardDescLength " + description );
      length = length || 160;
      description = '' + description;
      if (description.length < length) {
        return description + "...";
      } else {
        return description.substring(0, length) + "...";
      }
    }

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

      return str;
    }

    this.decorateContent = function (content) {
      content = this.breakContentIntoLines(content);
      content = this.removeInitialCounting(content);

      return content;
    }

    // 1.   2.
    this.removeInitialCounting = function (content) {
      content = ('' + content).replace(/[0-9]\. /, '');
      return content;
    }


    this.breakContentIntoLines = function (content) {
      console.log(content);

      content = ('' + content).replace(/[\.\n\r]/g, '<br>').toString();

      return content;
    }

    this.selectChordsByRhythm = function (rhythm, chords) {
      var chordsByRhythm = [];

      if (rhythm === 'Everything') {
        chordsByRhythm = chords;
      } else {
        for (var i = 0; i < chords.length; i++) {

          // if rythms includes or content of the song exists => due to scrawling
          if (chords[i].rhythms.indexOf(rhythm) > -1 && chords[i].content.length > 3) {
            chordsByRhythm.push(chords[i]);
          }
        }
      }

      selectedRythm = rhythm;
      return chordsByRhythm;
    }


  });
