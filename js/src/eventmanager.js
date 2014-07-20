/**
 * @class
 */
var EventManager;
EventManager = (function() {
  'use strict';

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

  EventManager.instance = null;
  /**
   * @method EventManager.getInstance
   * @return {Object} - an EventManager instance - reused or newly created
   */
  EventManager.getInstance = function() {
    return this.instance != null ? this.instance :
      this.instance = (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var param = [{iw: true}].concat(Array.prototype.slice.call(args, 0));
        var child = new ctor, result = func.apply(child, param);
        return Object(result) === result ? result : child;
      })(this, arguments, function(){});
  };

  /**
   * Interface method for subscribers to register their methods, either
   * objectHash of multiple event:names with methods or single event + method.
   * Context is passed if the executor needs access to registrant properties.
   *
   * Ex:
   * function greetFn() {console.log('Hi from:' + this.name)};
   * function Person() {this.name = 'tom'}; var personTom = new Person();
   * registerEvent('person:greet', greetFn, personTom)
   * @method EventManager#register
   * @param  {Object} eventOrEvents
   * @param  {Function} emitFn
   * @param context {Object}
   */
  EventManager.prototype.register = function(eventOrEvents, emitFn, context) {
    return 'object' === typeof eventOrEvents ?
      this.registerEvents(eventOrEvents, context) :
      this.registerEvent(eventOrEvents, emitFn, context);
  };

  /**
   * Just an proxy for {@link EventManager#registerEvent}
   * @method EventManager#registerEvents
   * @param {Object} eventsObject
   * @param {Object} context
   */
  EventManager.prototype.registerEvents = function(eventsObject, context) {

    for(var eventName in eventsObject) {
      if(eventsObject.hasOwnProperty(eventName)) {
        this.registerEvent(eventName, eventsObject[eventName], context);
      }
    }
  };

  /**
   *
   * @method EventManager#registerEvent
   * @param  {string } eventName
   * @param  {Function} emitFn
   * @param context {Object} - represents the object that calls register
   */
  EventManager.prototype.registerEvent = function(eventName, emitFn, context) {
    var subscribers;
    if(!eventName && 'function' !== typeof emitFn) {
      throw 'You must pass eventName a emitFn to registerEvent()';
    }

    subscribers = this.registeredSubs[eventName];

    if('undefined' === typeof subscribers) {
      subscribers = this.registeredSubs[eventName] = [];
    }

    subscribers.push({emitFn: emitFn, context: context});
  };

  /**
   * If needed in the future removing/ de-registering events.
   */
  EventManager.prototype.deregister = function() {
    throw 'not yet implemented';
  };

  /**
   * Dispatcher fn. dispatches the eventName to all registered subscribers.
   * @method EventManager#emit
   * @param  {string} eventName
   * @param  {Array | Object} data
   */
  EventManager.prototype.emit = function(eventName, data) {
    var i, iMax, subscribers;

    subscribers = this.registeredSubs[eventName];

    /** convert data to the future arguments array */
    data = '[object Array]' === Object.prototype.toString.call(data) ?
      data : [data];
    if(!subscribers) {
      return;
    }

    for(i = 0, iMax = subscribers.length; i < iMax; i += 1) {
      subscribers[i].emitFn.apply(subscribers[i].context, data);
    }
  };

  return EventManager;
})();