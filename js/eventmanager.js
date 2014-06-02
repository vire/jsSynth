EventManager = (function() {
  
  EventManager.instance = null;
  /**
  * @constructor EventManager.
  */
  function EventManager(opts) {
    this.registeredSubs = {};
  }

  /**
   * @method EventManager.getInstance
   * @return {Object} - an EventManager instance - reused or newly created
   */
  EventManager.getInstance = function() {
    return this.instance != null ? this.instance 
      : this.instance = (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor,
        result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(this, this.arguments, function(){});
  }

  /**
   * @method EventManager#register
   * @param  {Object} eventOrEvents
   * @param  {Function} emitFn
   */
  EventManager.prototype.register = function(eventOrEvents, emitFn) {
    return 'object' === typeof eventOrEvents ? 
      this.registerEvents(eventOrEvents) : 
      this.registerEvent(eventOrEvents, emitFn);
  };

  /**
   * @method EventManager#registerEvents
   * @param  {Object} eventsObject
   */
  EventManager.prototype.registerEvents = function(eventsObject) {
    var that = this;

    for(var eventName in eventsObject) {
      if(eventsObject.hasOwnProperty(eventName)) {
        this.registerEvent(eventName, eventsObject[eventName]);
      }
    }
  };

  /**
   * @method EventManager#registerEvent
   * @param  {string } eventName
   * @param  {Function} emitFn
   * @return {[type]}
   */
  EventManager.prototype.registerEvent = function(eventName, emitFn) {
    if(!eventName && 'function' !== typeof emitFn) {
      throw 'You must pass eventName a emitFn to registerEvent()';
    };

    var subscribers = this.registeredSubs[eventName];

    if('undefined' === typeof subscribers) {
      subscribers = this.registeredSubs[eventName] = [];
    }

    subscribers.push({emitFn: emitFn});
  };

  EventManager.prototype.deregister = function() {

  };

  /**
   * @method EventManager#emit
   * @param  {string} eventName
   * @param  {Array | Object} data
   * @param  {Object} context - scope that needs the emitFn to be executed in.
   * @return {[type]}
   */
  EventManager.prototype.emit = function(eventName, data, context) {
    var i, iMax;
    var context = this; // todo add context passing
    var subscribers = this.registeredSubs[eventName];
    var data = "[object Array]" === Object.prototype.toString.call(data) ?
      data :
      [data]

    if(!subscribers) {
      return;
    };

    
    for(i = 0, iMax = subscribers.length; i < iMax; i += 1) {
      subscribers[i].emitFn.apply(context, data);
    }

  };

  return EventManager;
})();