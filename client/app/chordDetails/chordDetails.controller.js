'use strict';

var baseUrl = '/api/chords/';
var baseUrlByRhythms = '/api/chords/rhythms/';

angular.module('guitariosApp')
  .controller('ChordDetailsCtrl', function ($http, $stateParams, $sce, $timeout, ChordService) {
    var vm = this;

    console.log('$stateParams: ' + $stateParams.id);
    vm.doComplete = function() {
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


      // temporarily put here
      var limit = 4;
      var url = baseUrlByRhythms + vm.selectedRhythm + '/' + limit;
      $http.get(url).success(function (chords) {
        vm.chordsByRhythm = ChordService.processChords(chords);
      });

      // temporarily put here
      var limit = 4;
      var urlSinger = baseUrl + 'singers' + '/' + vm.selectedSinger + "/" + limit;
      $http.get(urlSinger).success(function (chords) {
        vm.chordsBySinger = ChordService.processChords(chords);
      });


      vm.allChords = ChordService.findAllChords(chord.content);
      vm.allChordsWithClass = ChordService.findAllChordsWithClass(vm.allChords);
      vm.allChordsJoinedStrHtml = $sce.trustAsHtml(ChordService.join(vm.allChordsWithClass, true, ' '));

      //console.log('vm.allChordsJoinedStr: ' + vm.allChordsJoinedStrHtml);

      console.log('timeout to ensure event is loaded: refreshing...');
      $timeout(function() {
        refreshUsedChords();
      }, 50);
      console.log('refreshUsedChords: ending...');

    });



    vm.join = ChordService.join;
    vm.getStandardDescLength = ChordService.getStandardDescLength;
    vm.decorateContent = ChordService.decorateContent;
    vm.selectChordsByRhythm = ChordService.selectChordsByRhythm;
    vm.trustAsHtml = ChordService.trustAsHtml;
    
  });
