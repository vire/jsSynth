/**
* @class - responsible for iteration and sequence logic.
* Heavily inspired by the {@link https://github.com/michd/step-sequencer/blob/master/assets/js/tempo.js}
*/
Looper = (function() {
  'use strict';
  Looper._instance = null;

  /**
   * @constructor
   * @param {Object} options - diverse options passed via getInstance
   */
  function Looper(options) {
    this.cursor = -1;
    this.transitionTimeout = null;
    //  iterate over options and add them to the props?
    options = options || {};

    // aka tick interval === how long
    this.tickDuration = options.tickDuration || 1000;

    // abstraction of measures
    this.innerLoops = options.innerLoops || 1;
    
    // beats per loop
    this.loopSections = options.loopSections || 4;
    
    // notes per beat
    this.loopSectionLegnth = options.loopSectionLegnth || 4;

    // loopLenght consists of innerIterations, steps per innerIteration
    this.loopLength = 
      this.innerLoops * this.loopSections * this.loopSectionLegnth;

    this.em = options.em;

    try {
      this.em.register({
        'uiman:play' : this.start,
        'uiman:pause' : this.pause,
        'uiman:stop' : this.stop
      }, null, this)
    }
    catch (e) {
      console.error(e);
    }
  }

  /**
   * @method Looper.getInstance
   * @return {Object} - the Looper instance
   */
  Looper.getInstance = function() {
    return this._instance != null ? 
      this._instance : 
      this._instance = (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(this, arguments, function(){});
  };

  /**
   * Set looping to true. starts ticking and emits `start` event.
   * @method Looper#start
   */
  Looper.prototype.start = function() {
    if(this.looping) {
      this.resetCursor();
      return;
    }
    this.looping = true;
    this.tick();
    this.em.emit('looper:start');
  };
  
  /**
  * Iterates over the loop, update transitionTimeout, increment cursor;
  * @method Looper#tick
  */
  Looper.prototype.tick = function() {
    if(this.looping) {
      this.transitionTimeout = 
        setTimeout(this.tick.bind(this), this.tickDuration);
    }

    this.cursor++;

    /** reset the cursor to initial position if it reaches end of loop */
    if(this.cursor > (this.loopLength - 1)) {
      this.cursor = 0;
    }
    this.em.emit('looper:tick', this.cursor);
  };

  /**
   * Set looping prop to false, disarms the loop, resets cursor and emits.
   * @method Looper#stop
   */
  Looper.prototype.stop = function() {
    this.looping = false;
    if(this.transitionTimeout) {
      this.disarm();
    }
    this.resetCursor();
    this.em.emit('looper:stop');
  };

  /**
   * Clear timeout of the transition timout prop to stop immediately.
   * @method Looper#disarm
   */
  Looper.prototype.disarm = function() {
    clearTimeout(this.transitionTimeout);

  };

  /**
   * Puses the looper === set looping to false.
   * @method  Looper#pause
   * @return {[type]} [description]
   */
  Looper.prototype.pause = function() {
    this.looping = false;
    this.disarm();
    this.em.emit('looper:pause');
  }

  /**
   * Set the cursor to the initial position.
   * @method Looper#resetCursor
   */
  Looper.prototype.resetCursor = function() {
    this.cursor = -1;
  };

  return Looper;

})();