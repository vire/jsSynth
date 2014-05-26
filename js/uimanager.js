UIManager = (function() {
  'use strict';

  /**
  * @constructor UIManager
  * Stores list of elements, listens on their events, updates them, 
  * propagates events to other ui components.
  */
  function UIManager(options) {
    options = options || {};
    this.eventId = 'uiman';
    this.e = options.e || {
      emit: function() {
        throw new Error('no event emitter!');
      }
    };
  };

  UIManager.prototype.elementList = function(list) {
    return {
      'buttons': {},
      'tracks': {},
      'sliders': {}
    }
  };

  UIManager.prototype.drawElement = function() {};
  
  // 
  UIManager.prototype.updateElement = function() {};
  
  // reaction on the looper tick event
  UIManager.prototype.updateOnTick = function() {};

  return UIManager;
})();