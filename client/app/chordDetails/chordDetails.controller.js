'use strict';

var baseUrl = '/api/chords/';
var baseUrlByRhythms = '/api/chords/rhythms/';

angular.module('guitariosApp')
  .controller('ChordDetailsCtrl', function ($http, $stateParams, $sce, $timeout, ChordService, $log, $q) {
    var vm = this;
    vm.chords
    // temporarily put here
    var limit = 4;
    console.log('$stateParams: ' + $stateParams.id);
    vm.doComplete = function () {
      refreshUsedChords();
    };


    $http.get(baseUrl + $stateParams.id).success(function (chord) {
      vm.chord = chord;
      // console.log(chords);
      //console.log('vm.chord: ' + vm.chord);
      vm.brokenContent = ChordService.decorateContent(vm.chord.content);
      //console.log('vm.brokenContent: ' + vm.brokenContent);

      // convert html for content
      vm.trustedContentHtml = $sce.trustAsHtml(vm.brokenContent);
      vm.selectedRhythm = chord.rhythms[0];
      vm.chordsByRhythm = [];
      vm.selectedSinger = vm.chord.singers[0];

      ChordService.selectChordsByRhythm(vm.selectedRhythm, limit).then(function (chords) {
        vm.chordsByRhythm = ChordService.processChords(chords);
      })

      ChordService.selectChordsBySinger(vm.selectedSinger, limit).then(function (chords) {
        vm.chordsBySinger = ChordService.processChords(chords);
      })

      vm.allChords = ChordService.findAllChords(chord.content);
      vm.songTone = ChordService.findLastChord(chord.content);
      console.log('vm.songTone: ' + vm.songTone);
      vm.allChordsWithClass = ChordService.findAllChordsWithClass(vm.allChords);
      console.log('vm.allChordsWithClass.length: ' + vm.allChordsWithClass.length);
      vm.allChordsJoinedStrHtml = $sce.trustAsHtml(ChordService.join(vm.allChordsWithClass, true, ' '));
      console.log('vm.allChordsJoinedStr: ' + vm.allChordsJoinedStrHtml);

      console.log('timeout to ensure event is loaded: refreshing...');
      $timeout(function () {
        refreshUsedChords();
      }, 50);
      console.log('refreshUsedChords: ending...');

    });


    vm.join = ChordService.join;
    vm.getStandardDescLength = ChordService.getStandardDescLength;
    vm.decorateContent = ChordService.decorateContent;
    vm.selectChordsByRhythm = ChordService.selectChordsByRhythm;
    vm.trustAsHtml = ChordService.trustAsHtml;


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
      var results = query ? vm.chordsByRhythm.filter(createFilterFor(query)) : vm.chordsByRhythm,
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
