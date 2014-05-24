Looper = (function() {
  Looper.instance = null;

  function Looper(options) {
    this.cursor = -1;
    this.transTimeout = null;
    this.options = options || {};
  }

  Looper.getInstance = function() {
    return this._instance != null ? this._instance : this._instance = (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(this, arguments, function(){});
  };

  Looper.prototype.start = function() {
    this.looping = true;
    this.tick();
  };
  
  Looper.prototype.tick = function() {
    'do some logic'
  };

  Looper.prototype.stop = function() {
    this.looping = false;
    if(this.transTimeout) this.disarm();
  };

  Looper.prototype.disarm = function() {
    clearTimeout(this.transTimeout);
  };

  Looper.prototype.resetCursor = function() {
    this.cursor  > 0 ? -1 : this.cursor;
  };

  return Looper;

})();