'use strict';

angular.module('guitariosApp')
  .controller('ChordDetailsCtrl', function ($http) {
    var vm = this;

    console.log('$stateParams: ' + $stateParams.id);
  });
