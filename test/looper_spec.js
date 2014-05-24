/* globals describe, beforeEach, spyOn, afterEach, it, expect */
'use strict'
describe('Looper', function() {
  var looper;

  beforeEach(function() {
    looper = Looper.getInstance();
    spyOn(looper, 'start').and.callThrough();
    spyOn(looper, 'stop').and.callThrough();
    spyOn(looper, 'tick').and.callThrough();
    looper.start();
  });

  afterEach(function() {
    looper = null;
  })

  it('should be defined on global', function() {
    expect(Looper).toBeDefined();
  });
  it('start() the looper and set `looping` prop to true', function() {
    expect(looper.start).toHaveBeenCalled();
    expect(looper.looping).toBeTruthy();
  });
  it('start() must trigger tick()', function() {
    expect(looper.tick).toHaveBeenCalled();
  })

  it('stop() the looper and disarm any preparedAction', function() {
    looper.start();
    expect(looper.looping).toBeTruthy();
    looper.stop();
    expect(looper.stop).toHaveBeenCalled();
    expect(looper.looping).toBeFalsy();
  })
})