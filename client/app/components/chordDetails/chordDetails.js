'use strict';

angular.module('guitariosApp')
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider
      .state('chordDetails', {
        url: '/chordDetails/:id/',
        templateUrl: 'app/components/chordDetails/chordDetails.html',
        controller: 'ChordDetailsCtrl',
        controllerAs: 'vm'
      });
      .state('chordDetails2', {
        url: '/#/#chordDetails/:id/',
        templateUrl: 'app/components/chordDetails/chordDetails.html',
        controller: 'ChordDetailsCtrl',
        controllerAs: 'vm'
      });
  });