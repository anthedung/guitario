'use strict';

angular.module('guitariosApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('chordsBySinger', {
        url: '/chordsBySinger/:singer',
        templateUrl: 'app/chordsBySinger/chordsBySinger.html',
        controller: 'ChordsBySingerCtrl',
        controllerAs: 'vm'
      });
  });

