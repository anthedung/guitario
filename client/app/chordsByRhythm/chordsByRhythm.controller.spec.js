'use strict';

describe('Controller: ChordsByRhythmCtrl', function () {

  // load the controller's module
  beforeEach(module('guitariosApp'));

  var ChordsByRhythmCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ChordsByRhythmCtrl = $controller('ChordsByRhythmCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
