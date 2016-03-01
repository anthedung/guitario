'use strict';

describe('Controller: ChordsBySingerCtrl', function () {

  // load the controller's module
  beforeEach(module('guitariosApp'));

  var ChordsBySingerCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ChordsBySingerCtrl = $controller('ChordsBySingerCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
