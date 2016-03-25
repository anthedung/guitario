'use strict';

angular.module('guitariosApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('mainsss', {
        url: '/sample',
        templateUrl: 'app/main/mainss.html',
        controller: 'MainCtrl'
      });
  });