'use strict';

angular.module('guitariosApp')
  .controller('MainCtrl', function ($http, ChordService, $log) {
    var vm = this;
    vm.chords = [];
    vm.bannerVisible = true;
    vm.chipRhythms = {};

    $http.get('/api/chords').success(function(chords) {

      /*
      1. keep only valid content chords
      2. add no intonation to chords for search - remove Vietnamese songs
      */
      vm.chords = processChords(chords);
      // console.log(chords);
      // console.log('vm.chords: ' + vm.chords + "");

      vm.randomChordsForGlobe = getChordTitlesFromChords(getRandomSubarray(vm.chords, 6));
      console.log("vm.randomChordsForGlobe: " + vm.randomChordsForGlobe );

    });

    function processChords(chords){
      // remove empty chords
      var refinedChords = [];
      for (var i = 0 ; i < chords.length; i++){
        if (chords[i].content.length > 10){
          var c = chords[i]
          c.titleEnChar = ChordService.transformtoEnChars(c.title);
          // c.contentEnChar = ChordService.transformtoEnChars(c.content);

          refinedChords.push(c);
        }
      }

      return refinedChords;
    }

    // chords processing
    vm.toggleShowChords = function(rhythm){
      if (!vm.selectedRythm || vm.selectedRythm == rhythm){
        vm.chordsVisible = !vm.chordsVisible;
        vm.bannerVisible = !vm.bannerVisible;

        if (vm.selectedRythm == rhythm){
          vm.selectedRythm = undefined;
          return;
        }
      }

      vm.chordsByRhythm = [];

      if(rhythm === 'Everything'){
        vm.chordsByRhythm = vm.chords;
      } else {
        for (var i = 0 ; i < vm.chords.length; i++){

          // if rythms includes or content of the song exists => due to scrawling
          if(vm.chords[i].rhythms.indexOf(rhythm) > -1 && vm.chords[i].content.length > 3){
            vm.chordsByRhythm.push(vm.chords[i]);
          }
        }
      }

      vm.selectedRythm = rhythm;
      console.log("showChords: " + vm.chordsVisible)
      console.log("selectedChip: " + rhythm)
      vm.chipRhythms[rhythm] = 'clickedrhythmChip';
      console.log("vm.chipRhythms[rhythm]: " + rhythm + "  "+ vm.chipRhythms[rhythm])

    }

    vm.join = ChordService.join;

    // vm.hideChords = function(){
    //   vm.chordsVisible = false;
    //   console.log("hideChords: " + vm.chordsVisible)
    // }

    vm.getStandardDescLength = ChordService.getStandardDescLength;

    vm.deleteThing = function(thing) {
      $http.delete('/api/chords/' + thing._id);
    };

    vm.simulateQuery = false;
    vm.isDisabled    = false;
    // list of `state` value/display objects
    vm.querySearch   = querySearch;
    vm.selectedItemChange = selectedItemChange;
    vm.searchTextChange   = searchTextChange;
    vm.randomChord = randomChord;
    function randomChord(state) {
      alert("Sorry! You'll need to create a Constituion for " + state + " first!");
    }
    // ******************************
    // Internal methods
    // ******************************
    /**
     * Search for chords... use $timeout to simulate
     * remote dataservice call.
     */
    function querySearch (query) {
      var results = query ? vm.chords.filter( createFilterFor(query) ) : vm.chords,
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


    vm.getSelectedChipIndex = function(event) {       
      var selectedChip = angular.element(event.currentTarget).controller('mdChips').selectedChip;
      alert(selectedChip);
    } 

    // test data

    vm.rythms = ['Rhumba', 'Ballade', 'Blues', 'Slow', 'Chachacha', 'Tango', 'Disco'];
    vm.rythms34 = ['Everything', 'Boston', 'Slow Rock', 'Valse' ];
    

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
        return arr.map(function(chord){
          if (chord.title.length > 20)
            return chord.title.substring(0, 17) + "...";
          return chord.title;
        });
    }

  });
