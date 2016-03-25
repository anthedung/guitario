'use strict';

angular.module('guitariosApp')
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider
      .state('chordsByRhythm', {
        url: '/chordsByRhythm/:rhythm',
        templateUrl: 'app/chordsByRhythm/chordsByRhythm.html',
        controller: 'ChordsByRhythmCtrl',
        controllerAs: 'vm'
      });
  });