EventManager = (function() {
  

  var instance = null;
  /**
  * @constructor EventManager.
  * TODO Singletonize per application.
  */
  function EventManager() {

  }

  // register a new listener ~ like listen too, 
  // but maybe more precise name
  EventManager.prototype.register = function(input, fn, ctx) {
    // determine the typeof - 
    // can be object hash, or single registrant:eventName, fn, context (this, that)
  };

  EventManager.prototype.deregister = function() {

  };


  // emit the registered event to all registrants
  // alternative name could be `fire`
  EventManager.prototype.emit = function() {

  };

  return EventManager;
})();