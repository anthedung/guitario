'use strict';

angular.module('guitariosApp')
  .service('ChordService', function () {
    // AngularJS will instantiate a singleton by calling "new" on this function

    this.join = function(arr){
      var joined = arr.join(', ');

      if (joined.length > 20) {
        joined = joined.substring(0,20) + "...";
      }
      return joined;
    }


    this.getStandardDescLength = function(description) {
		// console.log("getStandardDescLength " + description );
		description = '' + description;
		if (description.length < 160) {
		  return description+"...";
		} else {
		  return description.substring(0, 160) + "...";
		}
	}

	this.transformtoEnChars = function(str){
		str= str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a");
		str= str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e");
		str= str.replace(/ì|í|ị|ỉ|ĩ/g,"i");
		str= str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o");
		str= str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u");
		str= str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y");
		str= str.replace(/đ/g,"d");
		// str= str.replace(/!|@|\$|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\'| |\"|\&|\#|\[|\]|~/g,"-");
		// str= str.replace(/-+-/g,"-"); //thay thế 2- thành 1-
		// str= str.replace(/^\-+|\-+$/g,"");//cắt bỏ ký tự - ở đầu và cuối chuỗi

		return str;
	}

	this.breakContentIntoLines = function(content){
		console.log(content);
		
		content =  (''+content).replace(/[\.\n\r]/g,'.<br>').toString();
		return content;
	}

    
  });