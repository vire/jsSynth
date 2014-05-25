/**
* Looper class, responsible for iteration and sequence logic.
* Heavily inspired by the {@link https://github.com/michd/step-sequencer/blob/master/assets/js/tempo.js}
*/

Looper = (function() {
  Looper.instance = null;

  /**
  * @Constructor
  */
  function Looper(options) {
    this.cursor = -1;
    this.transitionTimeout = null;
    
    //  iterate over options and add them to the props?
    options = options || {};

    // aka tick interval === how long
    this.tickDuration = options.tickDuration || 1000;

    // abstraction of measures
    this.innerLoops = options.innerLoops || 1
    
    // beats per loop
    this.loopSections = options.loopSections || 4;
    
    // notes per beat
    this.loopSectionLegnth = options.loopSectionLegnth || 4;

    // loopLenght consists of innerIterations, steps per innerIteration
    this.loopLength = this.innerLoops * this.loopSections * this.loopSectionLegnth;

    this.addEmitter(options.e)

  }

  Looper.getInstance = function() {
    return this._instance != null ? this._instance : this._instance = (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(this, arguments, function(){});
  };

  Looper.prototype.validateEmitter = function(extEm) {
    console.log("EEE", extEm);
    if(!extEm) {
      this.eventEmitter = false;
      return {
        emit: function(event) {
          console.log('no subscriber for this event: %s', event);
        }
      };
    } else {
      this.eventEmitter = true;
      return extEm.e
    };
  };

  Looper.prototype.addEmitter = function(em) {
    console.log("ZZZ",this.validateEmitter(em))
    this.e = this.validateEmitter(em);
  }

  Looper.prototype.start = function() {
    console.debug('Looper:start()');
    this.looping = true;
    this.tick();
    this.e.emit('loop:start')
  };
  
  /**
  * @method Looper#tick
  * Iterates over the loop, update transitionTimeout , increment cursor;
  */
  Looper.prototype.tick = function() {
    if(this.looping) {
      this.transitionTimeout = setTimeout(this.tick.bind(this), this.tickDuration)
    };

    this.cursor++;

    // if the cursor reaches the end of the loop - reset to initial position
    if(this.cursor > (this.loopLength - 1)) {
      this.cursor = 0;
    };
    this.e.emit('loop:tick');
  };

  Looper.prototype.stop = function() {
    this.looping = false;
    if(this.transitionTimeout) {
      this.disarm();
    };
    this.resetCursor();
    this.e.emit('loop:stop');
  };

  Looper.prototype.disarm = function() {
    clearTimeout(this.transitionTimeout);

  };

  Looper.prototype.resetCursor = function() {
    this.cursor = -1;
  };

  return Looper;

})();