'use strict';

angular.module('guitariosApp')
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider
      .state('chordDetails', {
        url: '/chordDetails/:id',
        templateUrl: 'app/chordDetails/chordDetails.html',
        controller: 'ChordDetailsCtrl',
        controllerAs: 'vm'
      });
  });