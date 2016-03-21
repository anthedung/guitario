'use strict';

describe('Service: chordService', function () {

  // load the service's module
  beforeEach(module('guitariosApp'));

  // instantiate service
  var chordService;
  beforeEach(inject(function (_chordService_) {
    chordService = _chordService_;
  }));

  it('should do something', function () {
    expect(!!chordService).toBe(true);
  });

});
