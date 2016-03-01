'use strict';

angular.module('guitariosApp')
  .controller('ChordsByRhythmCtrl', function ($http, $stateParams, $sce, $timeout, ChordService, $location, $log, $q) {
    var vm = this;
    vm.join = ChordService.join;
    vm.getStandardDescLength = ChordService.getStandardDescLength;
    vm.selectedRhythm = $stateParams.rhythm;
    vm.chords = [];
    vm.chipRhythms = {}
    vm.chipRhythms[vm.selectedRhythm] = 'clickedrhythmChip';

    var rhythm = $stateParams.rhythm;
    var LIMIT = 40, pageNoToScroll = 1;
    vm.chordsByRhythm = [];
    loadRhythms(rhythm);


    // pagination
    startStopScroll();

    function startStopScroll() {
      vm.scrollShouldDisable = true;
      vm.scrollShouldDisable = false;
    }


    vm.nextPage = function () {
      // TODO: identify bottom page instead of stopping at 20 like this
      if (vm.busy) return;
      // temporary stop to retrieve data


      // to stop scrolling if nolonger in same page
      vm.stillInScope = true;

      loadRhythms(vm.selectedRhythm)
    }

    vm.addSelected = function (ele) {
      angular.element(ele).addClass('selected');
    }


    vm.toggleShowChords = function (rhythm) {
      if (vm.selectedRhythm == rhythm) {
        vm.scrollShouldDisable = true;
        return;
      }

      //  	vm.scrollShouldDisable = true;
      // $location.url('chordsByRhythm/'+rhythm);
      // return;


      console.log("vm.rythm.selected: " + rhythm);

      vm.chordsByRhythm = [];
      vm.scrollShouldDisable = false;
      pageNoToScroll = 1;

      loadRhythms(rhythm);
      resetSelectedChips(rhythm);
    }

    function resetSelectedChips(rhythm) {
      vm.selectedRhythm = rhythm;
      vm.chipRhythms = {}
      vm.chipRhythms[rhythm] = 'clickedrhythmChip';
    }

    function loadRhythms(rhythm) {
      // console.log('loadRhythms.rhythm: ' + rhythm);
      if (rhythm === 'Everything') {
        ChordService.selectChordsNoFilter(LIMIT, pageNoToScroll).then(function (chords) {
          console.log("vm.chordsByRhythm.length: " + rhythm + '  ' + vm.chordsByRhythm.length);

          addMoreChordsToRhythm(chords);
          checkIfShouldStopScrolling(chords);
        });
      } else {
        ChordService.selectChordsByRhythm(rhythm, LIMIT, pageNoToScroll).then(function (chords) {
          console.log("vm.chordsByRhythm.length: " + rhythm + '  ' + vm.chordsByRhythm.length);

          addMoreChordsToRhythm(chords);
          checkIfShouldStopScrolling(chords);
        });
      }
    }

    function checkIfShouldStopScrolling(chords) {
      console.log('pageNoToScroll: ' + pageNoToScroll);
      // console.log('vm.scrollShouldDisable: ' + vm.scrollShouldDisable);
      console.log('vm.stillInScope: ' + vm.stillInScope);

      if (chords.length < 1 || pageNoToScroll > 20) {
        console.log('vm.scrollShouldDisable: ' + vm.scrollShouldDisable);
        vm.scrollShouldDisable = true;
      } else {
        vm.scrollShouldDisable = false;
      }
    }

    function addMoreChordsToRhythm(chords) {
      pageNoToScroll = pageNoToScroll + 1;
      for (var i = 0; i < chords.length; i++) {
        if (vm.chordsByRhythm.indexOf(chords[i]) < 0)
          vm.chordsByRhythm.push(chords[i]);
      }
    }

    vm.rythms34 = ['Everything', 'Boston', 'Slow Rock', 'Valse', 'Twist', 'Pop'];
    vm.rythms = ['Slow', 'Blues', 'Rhumba', 'Ballade', 'Chachacha', 'Tango', 'Disco', 'Rock'];

    // SEARCH
    vm.searchRemote = true;
    vm.isDisabled = false;
    // list of `state` value/display objects
    vm.querySearch = querySearch;
    vm.selectedItemChange = selectedItemChange;
    vm.searchTextChange = searchTextChange;
    vm.randomChord = randomChord;
    function randomChord(state) {
      // alert("Sorry! You'll need to create a Constituion for " + state + " first!");
    }

    function querySearch(query) {
      $http.get('api')
      var results = query ? vm.chords.filter(createFilterFor(query)) : vm.chords,
        deferred;
      if (vm.searchRemote) {
        deferred = $q.defer();
        var url = 'api/chords/search?q=';
        $http.get(url + query).success(function (chords) {
          deferred.resolve(chords);
        })

        return deferred.promise;
      } else {
        return results;
      }
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
  });
