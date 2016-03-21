'use strict';

angular.module('guitariosApp')
  .controller('ChordDetailsCtrl', function ($http, $stateParams, $sce, ChordService) {
    var vm = this;

    console.log('$stateParams: ' + $stateParams.id);

    $http.get('/api/chords/'+$stateParams.id).success(function(chord) {
      vm.chord = chord;
      // console.log(chords);
      console.log('vm.chord: ' + vm.chord);
      vm.brokenContent = ChordService.breakContentIntoLines(vm.chord.content);
      console.log('vm.brokenContent: ' + vm.brokenContent);

      // convert html for content
      vm.trustedContentHtml = $sce.trustAsHtml(vm.brokenContent);

      // vm.brokenContent = vm.breakContentIntoLines(content);
    });

    vm.join = ChordService.join;
    vm.getStandardDescLength = ChordService.getStandardDescLength;
    vm.breakContentIntoLines = ChordService.breakContentIntoLines;
  });
