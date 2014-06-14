/**
* @class - responsible for iteration and sequence logic.
* Heavily inspired by the 
* {@link https://github.com/michd/step-sequencer/blob/master/assets/js/tempo.js}
*/
Looper = (function() {
  'use strict';
  Looper._instance = null;

  /**
   * @constructor
   * @param {Object} options - diverse options passed via getInstance
   */
  function Looper(options) {

    /** overwrite with an empty hash if no options are present */
    options = options || {};
    
    /** EventManager instance required! */
    this.em = options.em;

    /** cursor is by default on -1 offset */
    this.cursor = -1;
    
    /** this acts as calibration constant for the 4/4 verse */
    this.DEFAULT_NOTE_LENGHT = 16;
    
    /** this instance var stores the timer to be cleared */
    this.transitionTimeout = null;

    /** TODO: remove when not necesary anymore */
    this.tickDuration = options.tickDuration || 1000;

    /** 
    * InnerLoops prop defines how many measures are created by default
    * TODO: addMeasure || updateMeasures method needs to be implemented!
    */
    this.innerLoops = options.innerLoops || 1;
  
    /** 
     * beat per loop/bar/measure {loopSections}/x
     * See wiki time signature
     * {@link http://en.wikipedia.org/wiki/Time_signature}
     * @type {number}
     */
    this.loopSections = options.loopSections || 4;
    
    /** notes per beat x/{loopSectionLegnth}, note value 1/4 === quarter */
    this.loopSectionLegnth = options.loopSectionLegnth || 4;

    // loopLenght consists of innerIterations, steps per innerIteration
    this.loopLength = 
      this.innerLoops * this.loopSections * this.loopSectionLegnth;

    this.maxBpm = 600;
    this.minBpm = 60;
    this.defaultBpm = 140;

    this.tickDuration = (60000 / this.defaultBpm) / 
      (this.DEFAULT_NOTE_LENGHT / this.loopSectionLegnth )

    try {
      this.em.register({
        'uiman:play' : this.start,
        'uiman:pause' : this.pause,
        'uiman:stop' : this.stop,
        'uiman:tempochange': this.updateTickDuration
      }, null, this)
    }
    catch (e) {
      console.error(e);
    }
  }

  /**
   * Singleton instance obtain method.
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

  Looper.prototype.updateTickDuration = function(newBPM) {
    this.tickDuration = (60000 / newBPM) / 
      (this.DEFAULT_NOTE_LENGHT / this.loopSectionLegnth);
  };

  return Looper;

})();