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
    vm.toggleShowChords = function(rhymth){
      if (!vm.selectedRythm || vm.selectedRythm == rhymth){
        vm.chordsVisible = !vm.chordsVisible;
        vm.bannerVisible = !vm.bannerVisible;

        if (vm.selectedRythm == rhymth){
          vm.selectedRythm = undefined;
          return;
        }
      }

      vm.chordsByRhymth = [];

      for (var i = 0 ; i < vm.chords.length; i++){
        if(vm.chords[i].rhymth == rhymth){
          vm.chordsByRhymth.push(vm.chords[i]);
        }
      }

      vm.selectedRythm = rhymth;
      console.log("showChords: " + vm.chordsVisible)
      console.log("selectedChip: " + rhymth)
      vm.chipRhythms[rhymth] = 'clickedRhymthChip';
      console.log("vm.chipRhythms[rhymth]: " + rhymth + "  "+ vm.chipRhythms[rhymth])

    }


    // vm.hideChords = function(){
    //   vm.chordsVisible = false;
    //   console.log("hideChords: " + vm.chordsVisible)
    // }

    vm.getStandardDescLength = function(description) {
        console.log("getStandardDescLength " + description );
        if ('' + description.length < 80) {
          return description+" "+description+"...";
        } else {
          return description.substring(0, 80) + " " + description.substring(0, 80) + "...";
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

    vm.rythms = ['Rhumba', 'Ballade', 'Flamenco', 'Disco', 'Slow Rock', 'Slow'];

  });
