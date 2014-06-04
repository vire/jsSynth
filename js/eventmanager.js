EventManager = (function() {
  
  EventManager.instance = null;

  /**
  * @constructor EventManager
  */
  function EventManager(opts) {
    if('undefined' === typeof opts || !opts.iw) {
        throw new Error('use the EventManager.getInstance() method');
      }    
    this.registeredSubs = {};
    this.opts = opts || {};
  }

  /**
   * @method EventManager.getInstance
   * @return {Object} - an EventManager instance - reused or newly created
   */
  EventManager.getInstance = function() {
    return this.instance != null ? this.instance 
      : this.instance = (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var param = [{iw: true}].concat(Array.prototype.slice.call(args, 0))
        var child = new ctor, result = func.apply(child, param);
        return Object(result) === result ? result : child;
      })(this, arguments, function(){});
  }

  /**
   * @method EventManager#register
   * @param  {Object} eventOrEvents
   * @param  {Function} emitFn
   */
  EventManager.prototype.register = function(eventOrEvents, emitFn, context) {
    return 'object' === typeof eventOrEvents ? 
      this.registerEvents(eventOrEvents, context) : 
      this.registerEvent(eventOrEvents, emitFn, context);
  };

  /**
   * @method EventManager#registerEvents
   * @param  {Object} eventsObject
   */
  EventManager.prototype.registerEvents = function(eventsObject, context) {
    var that = this;
    console.log('registerEvents', eventsObject, context)
    for(var eventName in eventsObject) {
      if(eventsObject.hasOwnProperty(eventName)) {
        this.registerEvent(eventName, eventsObject[eventName], context);
      }
    }
  };

  /**
   * @method EventManager#registerEvent
   * @param  {string } eventName
   * @param  {Function} emitFn
   */
  EventManager.prototype.registerEvent = function(eventName, emitFn, context) {
    if(!eventName && 'function' !== typeof emitFn) {
      throw 'You must pass eventName a emitFn to registerEvent()';
    };

    var subscribers = this.registeredSubs[eventName];

    if('undefined' === typeof subscribers) {
      subscribers = this.registeredSubs[eventName] = [];
    }

    subscribers.push({emitFn: emitFn, context: context});
  };

  EventManager.prototype.deregister = function() {

  };

  /**
   * @method EventManager#emit
   * @param  {string} eventName
   * @param  {Array | Object} data
   * @param  {Object} context - scope that needs the emitFn to be executed in.
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
      console.log('subscribers[i]', subscribers[i].context)
      subscribers[i].emitFn.apply(subscribers[i].context, data);
    }
  };

  return EventManager;
})();