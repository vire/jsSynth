/**
* Looper class, responsible for iteration and sequence logic.
* Heavily inspired by the {@link https://github.com/michd/step-sequencer/blob/master/assets/js/tempo.js}
*/

Looper = (function() {
  Looper.instance = null;

  function Looper(options) {
    this.cursor = -1;
    this.transitionTimeout = null;
    
    //  iterate over options and add them to the props?
    options = options || {};

    this.tickDuration = options.tickDuration || 1000;
    this.loopLength = options.loopLength || 10;
  }

  Looper.getInstance = function() {
    return this._instance != null ? this._instance : this._instance = (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(this, arguments, function(){});
  };

  Looper.prototype.start = function() {
    console.debug('Looper:start()');
    this.looping = true;
    this.tick();
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
  };

  Looper.prototype.stop = function() {
    this.looping = false;
    if(this.transitionTimeout) {
      this.disarm();
    };
    this.resetCursor();
  };

  Looper.prototype.disarm = function() {
    clearTimeout(this.transitionTimeout);
  };

  Looper.prototype.resetCursor = function() {
    this.cursor = -1;
  };

  return Looper;

})();