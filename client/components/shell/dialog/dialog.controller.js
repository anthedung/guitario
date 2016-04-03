'use strict';

angular.module('guitariosApp')
  .controller('DialogController', function ($mdDialog, $http) {
  var vm = this;
  
  vm.closeDialog = function() {
    $mdDialog.hide();
  };

  
  vm.addThing = function() {
    if(vm.newThing === '') {
      return;
    }
    $http.post('/api/things', { name: vm.newThing });
    vm.newThing = '';
    $mdDialog.hide();
  };
});
