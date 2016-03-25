'use strict';

describe('Controller: AboutmeCtrl', function () {

  // load the controller's module
  beforeEach(module('guitariosApp'));

  var AboutmeCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AboutmeCtrl = $controller('AboutmeCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
