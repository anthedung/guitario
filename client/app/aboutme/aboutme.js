'use strict';

angular.module('guitariosApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('aboutme', {
        url: '/aboutme',
        templateUrl: 'app/aboutme/aboutme.html',
        controller: 'AboutmeCtrl'
      });
  });