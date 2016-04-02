'use strict';

angular.module('guitariosApp')
  .controller('LoginCtrl', function (Auth, $location, $window) {
    var vm = this;

    vm.user = {};
    vm.errors = {};

    vm.login = function(form) {
      console.log('vm.login()...')
      vm.submitted = true;

      if(form.$valid) {
        Auth.login({
          email: vm.user.email,
          password: vm.user.password
        })
        .then( function() {
          // Logged in, redirect to home
          $location.path('/');
        })
        .catch( function(err) {
          vm.errors.other = err.message;
        });
      }
    };

    vm.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  });
