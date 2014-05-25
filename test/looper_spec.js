/* globals Looper, describe, beforeEach, spyOn, afterEach, it, expect */
'use strict';
describe('Looper', function() {
  var looper;

  describe('core tests', function() {
    beforeEach(function() {
      looper = Looper.getInstance();
      spyOn(looper, 'start').and.callThrough();
      spyOn(looper, 'stop').and.callThrough();
      spyOn(looper, 'tick').and.callThrough();
      spyOn(looper, 'disarm').and.callThrough();
      spyOn(looper, 'resetCursor').and.callThrough();
      looper.start();
    });

    afterEach(function() {
      looper.stop();
      looper = null;
    });
    it('should be defined on global', function() {
      expect(Looper).toBeDefined();
    });
    it('start() the looper and set `looping` prop to true', function() {
      expect(looper.start).toHaveBeenCalled();
      expect(looper.looping).toBeTruthy();
    });
    it('start() must trigger tick()', function() {
      expect(looper.tick).toHaveBeenCalled();
    });

    it('stop() the Looper and triggers disarm() and resetCursor()', function() {
      expect(looper.looping).toBeTruthy();
      looper.stop();
      expect(looper.stop).toHaveBeenCalled();
      expect(looper.disarm).toHaveBeenCalled();
      expect(looper.resetCursor).toHaveBeenCalled();
      expect(looper.looping).toBeFalsy();
      expect(looper.cursor).toEqual(-1);
    });
  });

  describe('start - stop, ' ,function() {

    beforeEach(function() {
      looper = Looper.getInstance();
      looper.start();
    });

    afterEach(function() {
      looper.stop();
    })

    it('iterates the cursor', function(done) {
      setTimeout(function() {
        console.log('looper in test', looper)
        expect(looper.looping).toBeTruthy();
        
        // after 3 seconds cursor shoudl be 0..1..2
        expect(looper.cursor).toEqual(2);
        done();
      }, 3000);
    });

    it('calling start() twice doesn\'t break anything', function() {
      looper.start();
      expect(looper.looping).toBeTruthy();
    })
  })
});