'use strict';

angular.module('guitariosApp')
  .controller('MainCtrl', function ($http) {
    var vm = this;
    vm.chords = [];
    vm.bannerVisible = true;
    vm.chipRhythms = {};

    $http.get('/api/chords').success(function(chords) {
      vm.chords = chords;
      // console.log(chords);
      console.log(vm.chords);

    });

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

      for (var i = 0 ; i < vm.chords.length; i++){

        // if rythms includes or content of the song exists => due to scrawling
        if(vm.chords[i].rhythms.indexOf(rhythm) > -1 && vm.chords[i].content.length > 3){
          vm.chordsByRhythm.push(vm.chords[i]);
        }
      }

      vm.selectedRythm = rhythm;
      console.log("showChords: " + vm.chordsVisible)
      console.log("selectedChip: " + rhythm)
      vm.chipRhythms[rhythm] = 'clickedrhythmChip';
      console.log("vm.chipRhythms[rhythm]: " + rhythm + "  "+ vm.chipRhythms[rhythm])

    }

    vm.join = function(arr){
      return arr.join(', ');
    }

    // vm.hideChords = function(){
    //   vm.chordsVisible = false;
    //   console.log("hideChords: " + vm.chordsVisible)
    // }

    vm.getStandardDescLength = function(description) {
        console.log("getStandardDescLength " + description );
        if ('' + description.length < 160) {
          return description+"...";
        } else {
          return description.substring(0, 160) + "...";
        }
      }

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
        return (chord.title.indexOf(lowercaseQuery) > -1);
      };
    }


    vm.getSelectedChipIndex = function(event) {       
      var selectedChip = angular.element(event.currentTarget).controller('mdChips').selectedChip;
      alert(selectedChip);
    } 

    // test data

    vm.rythms = ['Rhumba', 'Ballade', 'Blues', 'Slow Rock', 'Chachacha', 'Tango', 'Boston', 'Slow',  'Valse', ];
  });
