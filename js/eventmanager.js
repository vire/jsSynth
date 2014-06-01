EventManager = (function() {
  
  EventManager.instance = null;
  /**
  * @constructor EventManager.
  * TODO Singletonize per application.
  */
  function EventManager(opts) {
    this.registeredSubs = {};
  }

  /**
  * @method EventManager#register
  */
  EventManager.prototype.register = function(eventOrEvents, emitFn) {
    return 'object' === typeof eventOrEvents ? 
      this.registerEvents(eventOrEvents) : 
      this.registerEvent(eventOrEvents, emitFn);
  };

  /**
   * @method EventManager#registerEvents
   * @param  {[type]} eventsObject
   * @return {[type]}
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
   * @param  {[type]} eventName
   * @param  {[type]} emitFn
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
   * @param  {String} eventName
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