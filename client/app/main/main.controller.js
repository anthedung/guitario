'use strict';

angular.module('guitariosApp')
  .controller('MainCtrl', function ($http, ChordService, $log, $q) {
    var vm = this;
    vm.chords = [];
    vm.bannerVisible = true;
    vm.chipRhythms = {};

    $http.get('/api/chords').success(function (chords) {

      /*
       1. keep only valid content chords
       2. add no intonation to chords for search - remove Vietnamese songs
       */
      vm.chords = ChordService.processChords(chords);
      console.log("vm.chords.length: " + vm.chords.length)
      
      // console.log(chords);
      // console.log('vm.chords: ' + vm.chords + "");

      vm.randomChordsForGlobe = getRandomSubarray(vm.chords, 6);

      // ensure canvas will start with some delays
      setTimeout(function () {
        startCanvas();
      }, 500);

      // console.log("vm.randomChordsForGlobe: " + vm.randomChordsForGlobe);

    });

    vm.addSelected = function(ele){
      angular.element(ele).addClass('selected');
    }

    // chords processing
    vm.toggleShowChords = function (rhythm, ele) {
      angular.element(ele).addClass('anthe-selected hihi');
      $(ele).addClass('selected');
      //console.log('  added selected: ' + Object.keys(ele));
      if (!vm.selectedRythm || vm.selectedRythm == rhythm) {
        vm.chordsVisible = !vm.chordsVisible;
        vm.bannerVisible = !vm.bannerVisible;

        if (vm.selectedRythm == rhythm) {
          vm.selectedRythm = undefined;
          // startCanvas();

          // cleared selected chips
          vm.chipRhythms = {}

          return;
        }
      }
      console.log("toggleShowChords: " + vm.chordsVisible)

      vm.chordsByRhythm = [];

      if (rhythm === 'Everything') {
        vm.chordsByRhythm = vm.chords;

      } else {
        console.log('ChordService.selectChordsByRhythm processing...' + vm.chordsByRhythm);

        ChordService.selectChordsByRhythm(rhythm, 20).then(function(chords){
          vm.chordsByRhythm = chords;
          console.log('ChordService.selectChordsByRhythm - vm.chordsByRhythm ' + vm.chordsByRhythm);
          console.log("vm.chordsByRhythm.length: " + vm.chordsByRhythm.length)

        });

        // var promise = ChordService.selectChordsByRhythm(rhythm, 20);
        // promise.then(function(greeting) {
        //   alert('Success: ' + greeting);
        // }, function(reason) {
        //   alert('Failed: ' + reason);
        // });
      }

      console.log("vm.chordsByRhythm.length: " + vm.chordsByRhythm.length)

      vm.selectedRythm = rhythm;
      console.log("showChords: " + vm.chordsVisible)
      console.log("selectedChip: " + rhythm)
      vm.chipRhythms = {}
      vm.chipRhythms[rhythm] = 'clickedrhythmChip';
      console.log("vm.chipRhythms[rhythm]: " + rhythm + "  " + vm.chipRhythms[rhythm])
    }

    vm.join = ChordService.join;

    // vm.hideChords = function(){
    //   vm.chordsVisible = false;
    //   console.log("hideChords: " + vm.chordsVisible)
    // }

    vm.getStandardDescLength = ChordService.getStandardDescLength;

    vm.deleteThing = function (thing) {
      $http.delete('/api/chords/' + thing._id);
    };

    vm.simulateQuery = false;
    vm.isDisabled = false;
    // list of `state` value/display objects
    vm.querySearch = querySearch;
    vm.selectedItemChange = selectedItemChange;
    vm.searchTextChange = searchTextChange;
    vm.randomChord = randomChord;
    function randomChord(state) {
      // alert("Sorry! You'll need to create a Constituion for " + state + " first!");
    }

    // ******************************
    // Internal methods
    // ******************************
    /**
     * Search for chords... use $timeout to simulate
     * remote dataservice call.
     */
    function querySearch(query) {
      var results = query ? vm.chords.filter(createFilterFor(query)) : vm.chords,
        deferred;
      // if (vm.simulateQuery) {
      //   deferred = $q.defer();
      //   $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
      //   return deferred.promise;
      // } else {
      return results;
      // }
    }

    function searchTextChange(text) {
      $log.info('Text changed to ' + text);
    }

    function selectedItemChange(item) {
      $log.info('Item changed to ' + JSON.stringify(item));
    }

    /**
     * Create filter function for a query string
     */
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(chord) {
        return
        (chord.title.toLowerCase().indexOf(lowercaseQuery) > -1)
        || (chord.titleEnChar.toLowerCase().indexOf(lowercaseQuery) > -1)
      };
    }


    vm.getSelectedChipIndex = function (event) {
      var selectedChip = angular.element(event.currentTarget).controller('mdChips').selectedChip;
      alert(selectedChip);
    }

    // test data

    vm.rythms = ['Rhumba', 'Ballade', 'Blues', 'Slow', 'Chachacha', 'Tango', 'Disco'];
    vm.rythms34 = ['Everything', 'Boston', 'Slow Rock', 'Valse'];


    // helpers
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

    function getChordTitlesFromChords(arr) {
      return arr.map(function (chord) {
        if (chord.title.length > 20)
          return chord.title.substring(0, 17) + "...";
        return chord.title;
      });
    }

  });
