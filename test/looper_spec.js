/* globals Looper, describe, beforeEach, spyOn, afterEach, it, xit, expect */
'use strict';

var looper;
var mockEmitter = {
  register: function() {},
  emit: function() {},
}

function destroyLooper() {
  Looper._instance = null;
};

describe('Looper', function() {

  describe('core', function() {
    
    beforeEach(function() {
      looper = Looper.getInstance({
        em: EventManager.getInstance()  
      });      

    });

    afterEach(function() {
      destroyLooper();
    });

    it('should be defined on global', function() {
      expect(Looper).toBeDefined();
    });

    it('must have an getInstance() method', function() {
      expect(typeof Looper.getInstance).toEqual('function');
    })
    
    it('must be instantiated with default properties', function() {
      expect(looper.cursor).toEqual(-1);
      expect(looper.measures).toEqual(1);
      expect(looper.totalSequenceLength).toEqual(16);
      expect(looper.signatureNoteLength).toEqual(4);
      expect(looper.signatureBeatCount).toEqual(4);
      expect(looper.tickDuration).not.toEqual(0);
    });

    it('must contain default methods' , function() {
      console.log(looper)
      expect(typeof looper.start).toEqual('function');
      expect(typeof looper.stop).toEqual('function');
      expect(typeof looper.tick).toEqual('function');
      expect(typeof looper.disarm).toEqual('function');
      expect(typeof looper.resetCursor).toEqual('function');
    });

    it('should be initialized with `EventManager` instance', function() {
      var emFromInstance = looper.em;
      expect(emFromInstance).toBeDefined();
      expect(emFromInstance instanceof EventManager).toBeTruthy();
    });
  });

  describe('method', function() {

    afterEach(function() {
      looper.stop();
    });

    it('before .start() is `looping` false', function() {
      expect(looper.looping).toBeFalsy();
    });

    it('.start() sets `looping` to true', function() {
      looper.start();
      expect(looper.looping).toBeTruthy();      
    });

    it('.stop() sets `looping` to false', function() {
      looper.start();
      looper.stop();
      expect(looper.looping).toBeFalsy();
    });

    it('.stop() inner calls .disarm()', function() {
      spyOn(looper, 'disarm').and.callThrough();
      looper.start();
      looper.stop();
      expect(looper.disarm).toHaveBeenCalled();
    });

    it('.stop() innerly calls .resetCursor()', function() {
      spyOn(looper, 'resetCursor').and.callThrough();
      looper.start();
      looper.stop();
      expect(looper.resetCursor).toHaveBeenCalled();
    });

    it('.tick() iterates cursor to -1..0', function() {
      spyOn(looper,'tick').and.callThrough();
      expect(looper.tick.calls.count()).toEqual(0)
      expect(looper.cursor).toEqual(-1);
      looper.start();
      expect(looper.tick.calls.count()).toEqual(1)
      expect(looper.cursor).toEqual(0);
    });
    it('.updateTickDuration() changes tempo', function() {
      var minuteMs = 60000,
        oldBPM = 140,
        newBPM = 176,
        initialTickDuration = (minuteMs / oldBPM) / (16 / 4),
        changedTickDuration = (minuteMs / newBPM) / (16 / 4);
      spyOn(looper, 'updateTickDuration').and.callThrough();
      expect(looper.tickDuration).toEqual(initialTickDuration);
      looper.updateTickDuration(176);
      expect(looper.updateTickDuration).toHaveBeenCalled();
      expect(looper.tickDuration).toEqual(changedTickDuration);
    });
  });
});