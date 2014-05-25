/* globals Looper, describe, beforeEach, spyOn, afterEach, it, xit, expect */
'use strict';
describe('Looper', function() {
  var looper , mockEmitter =  {
      whoami: this.constructor.name,
      // subscriber needs an class:method to subscribe, its context, + opt args
      subscribers: {
        'start' : function() {
          // console.log("I am an start subscriber and this is value a: %o", this.whoami);
        },
        'stop' : function() {
          // console.log("I am an stop subscriber");
        },
        'tick' : function() {
          // console.log("I am an tick subscriber");
        },
      },

      emit: function(event) {
        var subscriber = event.substring(event.indexOf(':') + 1);

        var action = this.subscribers[subscriber];
        if('undefined' !== action ) {
          action.call(this);  
        }        
      }
    };

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
    it('without a proper emitter, the looper.emitter is falsy', function() {
      expect(looper.eventEmitter).toEqual(false);
    });
    it('Looper.loopength', function() {
      expect(looper.loopLength).toBeDefined();
      expect(looper.loopLength).toBe(16);

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
      looper.addEmitter({e:mockEmitter});
      spyOn(mockEmitter, 'emit').and.callThrough();
      looper.start();      
    });

    afterEach(function() {
      looper.stop();
    });

    it('addEmitter() passes an emitter instance to looper', function() {
      expect(looper.eventEmitter).toBeTruthy();
    });

    xit('iterates the cursor', function(done) {
      setTimeout(function() {
        expect(looper.looping).toBeTruthy();
        
        // after 3 seconds cursor shoudl be 0..1..2
        expect(looper.cursor).toEqual(2);
        done();
      }, 3000);
    });

    it('calling start() twice doesn\'t break anything', function() {
      looper.start();
      expect(looper.looping).toBeTruthy();
    });
    it('emit() should have ben triggerd' , function() {
      expect(mockEmitter.emit).toHaveBeenCalled();
    });
  });
});